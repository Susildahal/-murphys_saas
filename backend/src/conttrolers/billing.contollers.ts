import AssignService from "../models/assignService.routes";
import BillingHistory from "../models/billingHistory.model";
import { Request , Response} from "express"; 
import { AuthenticatedRequest } from "../middleware/auth";
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.error('⚠️ STRIPE_SECRET_KEY is not set in environment variables!');
    throw new Error('STRIPE_SECRET_KEY is required');
}

console.log('✅ Stripe initialized with key:', stripeSecretKey.substring(0, 12) + '...');

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
});

export const getBillingInfo = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
       const user = req.user;
       const status = req.query.status as string | undefined;
       if (!user) {
        return  res.status(401).json({ message: 'Unauthorized' });
       }
       const billingInfo = await AssignService.find({ email: user?.email });
       res.status(200).json({ data: billingInfo, message: 'Billing info retrieved successfully' });

       if (!billingInfo) {
        return res.status(404).json({ message: 'Billing info not found' });
       }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
    
};

export const processRenewalPayment = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { paymentMethodId, renewalId, amount, assignServiceId } = req.body;

        console.log('💳 Processing payment:', { 
            user: user.email, 
            renewalId, 
            amount, 
            assignServiceId 
        });

        if (!paymentMethodId || !renewalId || !amount || !assignServiceId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get the assign service to get invoice and service details
        const assignService = await AssignService.findById(assignServiceId);
        
        if (!assignService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        console.log('📦 Service found:', assignService.service_name);

        // Create initial billing history record as pending
        const billingHistory = new BillingHistory({
            user_email: user.email || '',
            user_id: user.uid,
            assign_service_id: assignServiceId,
            renewal_id: renewalId,
            invoice_id: assignService.invoice_id,
            service_name: assignService.service_name,
            amount: amount,
            currency: 'aud',
            payment_status: 'pending',
            payment_method: 'card',
            stripe_payment_method_id: paymentMethodId,
            metadata: {
                renewal_label: assignService.renewal_dates.find((r: any) => r._id.toString() === renewalId)?.label
            }
        });

        try {
            console.log('🔐 Creating Stripe payment intent...');
            
            // Create a payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'aud',
                payment_method: paymentMethodId,
                confirm: true,
                description: `Renewal payment for ${assignService.service_name} - ${assignService.invoice_id}`,
                metadata: {
                    userId: user.uid,
                    userEmail: user.email || '',
                    renewalId,
                    assignServiceId,
                    invoiceId: assignService.invoice_id
                },
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never',
                },
            });

            console.log('✅ Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);

            if (paymentIntent.status === 'succeeded') {
                // Update billing history to completed
                billingHistory.payment_status = 'completed';
                billingHistory.stripe_payment_intent_id = paymentIntent.id;
                billingHistory.payment_date = new Date();
                await billingHistory.save();

                console.log('💾 Billing history saved:', billingHistory._id);

                // Find and update the specific renewal date in assign service
                const renewalDate = assignService.renewal_dates.find(
                    (r: any) => r._id.toString() === renewalId
                );

                if (renewalDate) {
                    renewalDate.haspaid = true;
                    await assignService.save();
                    console.log('✅ Renewal marked as paid');
                }

                return res.status(200).json({ 
                    message: 'Payment processed successfully',
                    billingHistoryId: billingHistory._id,
                    paymentIntent: {
                        id: paymentIntent.id,
                        amount: paymentIntent.amount,
                        status: paymentIntent.status
                    }
                });
            } else {
                // Payment requires additional action or failed
                billingHistory.payment_status = 'failed';
                billingHistory.failure_reason = `Payment status: ${paymentIntent.status}`;
                await billingHistory.save();

                console.log('❌ Payment failed:', paymentIntent.status);

                return res.status(400).json({ 
                    message: 'Payment requires additional action or failed',
                    status: paymentIntent.status,
                    billingHistoryId: billingHistory._id
                });
            }

        } catch (stripeError: any) {
            // Save failed payment to billing history
            billingHistory.payment_status = 'failed';
            billingHistory.failure_reason = stripeError.message;
            await billingHistory.save();

            console.error('❌ Stripe payment error:', stripeError.message);
            
            return res.status(500).json({ 
                message: 'Payment processing failed',
                error: stripeError.message,
                billingHistoryId: billingHistory._id
            });
        }

    } catch (error: any) {
        console.error('❌ Payment processing error:', error);
        return res.status(500).json({ 
            message: 'Server error during payment processing',
            error: error.message 
        });
    }
};

export const getBillingHistory = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { 
            status, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 10 
        } = req.query;

        // Build query
        const query: any = { user_email: user.email };

        // Filter by payment status
        if (status && status !== 'all') {
            query.payment_status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate as string);
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [billingHistory, total] = await Promise.all([
            BillingHistory.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            BillingHistory.countDocuments(query)
        ]);

        res.status(200).json({ 
            data: billingHistory,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            },
            message: 'Billing history retrieved successfully' 
        });

    } catch (error) {
        console.error('Error fetching billing history:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getBillingStats = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const stats = await BillingHistory.aggregate([
            {
                $match: { user_email: user.email }
            },
            {
                $group: {
                    _id: '$payment_status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const totalPaid = await BillingHistory.aggregate([
            {
                $match: { 
                    user_email: user.email,
                    payment_status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({ 
            stats,
            totalPaid: totalPaid[0]?.total || 0,
            message: 'Billing stats retrieved successfully' 
        });

    } catch (error) {
        console.error('Error fetching billing stats:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
    





export const deleteBillingRecord = async ( req: AuthenticatedRequest, res: Response ) => {
    try {

        const { id } = req.params;
        console.log('Attempting to delete billing record with ID:', id);
        const billingRecord = await BillingHistory.findById(id);
        if (!billingRecord) {
            return res.status(404).json({ message: 'Billing record not found' });
        }
        await BillingHistory.findByIdAndDelete(id);
        res.status(200).json({ message: 'Billing record deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Admin endpoints - Get all billing history across all users
export const getAdminBillingHistory = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { 
            status,
            clientEmail, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 10 
        } = req.query;

        // Build query for all users
        const query: any = {};

        // Filter by specific client if provided
        if (clientEmail && clientEmail !== 'all') {
            query.user_email = clientEmail;
        }

        // Filter by payment status
        if (status && status !== 'all') {
            query.payment_status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate as string);
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [billingHistory, total] = await Promise.all([
            BillingHistory.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            BillingHistory.countDocuments(query)
        ]);

        res.status(200).json({ 
            data: billingHistory,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            },
            message: 'Admin billing history retrieved successfully' 
        });

    } catch (error) {
        console.error('Error fetching admin billing history:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Admin endpoints - Get stats for all users
export const getAdminBillingStats = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Aggregate stats across all users
        const stats = await BillingHistory.aggregate([
            {
                $group: {
                    _id: '$payment_status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const totalPaid = await BillingHistory.aggregate([
            {
                $match: { 
                    payment_status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({ 
            stats,
            totalPaid: totalPaid[0]?.total || 0,
            message: 'Admin billing stats retrieved successfully' 
        });

    } catch (error) {
        console.error('Error fetching admin billing stats:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Admin endpoint - Delete billing record (admin version)
export const deleteAdminBillingRecord = async ( req: AuthenticatedRequest, res: Response ) => {
    try {
        const { id } = req.params;
        console.log('Admin attempting to delete billing record with ID:', id);
        
        const billingRecord = await BillingHistory.findById(id);
        if (!billingRecord) {
            return res.status(404).json({ message: 'Billing record not found' });
        }
        
        await BillingHistory.findByIdAndDelete(id);
        res.status(200).json({ 
            message: 'Billing record deleted successfully',
            deletedRecord: {
                id: billingRecord._id,
                user_email: billingRecord.user_email,
                amount: billingRecord.amount,
                status: billingRecord.payment_status
            }
        });
    }
    catch (error) {
        console.error('Error deleting admin billing record:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
