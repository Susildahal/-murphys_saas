'use client';
import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import SpinnerComponent from '@/app/page/common/Spinner'
import { fetchBillingInfo } from '@/lib/redux/slices/billingSlicer'
import Header from '@/app/page/common/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Receipt,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// --- CheckoutForm Component ---
function CheckoutForm({ 
  renewalId, 
  amount, 
  assignServiceId,
  onSuccess,
  onCancel
}: { 
  renewalId: string; 
  amount: number; 
  assignServiceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast({ title: 'Validation Error', description: submitError.message, variant: 'destructive' });
        setProcessing(false);
        return;
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({ elements });
      if (pmError) {
        toast({ title: 'Payment Method Error', description: pmError.message, variant: 'destructive' });
        setProcessing(false);
        return;
      }

      const axiosInstance = (await import('@/lib/axios')).default;
      await axiosInstance.post('/billing/process-payment', {
        paymentMethodId: paymentMethod.id,
        renewalId,
        amount,
        assignServiceId
      });

      toast({ title: 'Payment Successful', description: `Payment of $${amount} processed.` });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.response?.data?.message || error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={!stripe || processing} className="flex-1">
          {processing ? 'Processing...' : `Confirm Payment of $${amount}`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// --- StripePaymentModal Component ---
function StripePaymentModal({ 
  renewalId, amount, assignServiceId, serviceName, onClose, onSuccess 
}: { 
  renewalId: string; amount: number; assignServiceId: string; serviceName: string; onClose: () => void; onSuccess: () => void;
}) {
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(amount * 100),
    currency: 'aud',
    paymentMethodCreation: 'manual',
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            <div className="mt-4 flex justify-between items-center text-foreground">
              <span className="text-sm text-muted-foreground">Service: {serviceName}</span>
              <span className="font-bold text-lg">${amount} AUD</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              renewalId={renewalId}
              amount={amount}
              assignServiceId={assignServiceId}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page Component ---
function Page() {
  const dispatch = useAppDispatch();
  const { billingInfo, loading, error } = useAppSelector((state) => state.billing);
  const [selectedRenewal, setSelectedRenewal] = useState<{ 
    id: string; amount: number; assignServiceId: string; serviceName: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchBillingInfo());
  }, [dispatch]);

  const getAllUnpaidRenewals = () => {
    const unpaid: any[] = [];
    billingInfo.forEach(billing => {
      billing.renewal_dates.forEach(renewal => {
        if (!renewal.haspaid) {
          unpaid.push({
            ...renewal,
            serviceName: billing.service_name,
            assignServiceId: billing._id,
            invoiceId: billing.invoice_id
          });
        }
      });
    });
    return unpaid.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const unpaidRenewals = getAllUnpaidRenewals();
  const totalUnpaidAmount = unpaidRenewals.reduce((sum, r) => sum + Number(r.price), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent pb-12">
      {loading && <SpinnerComponent />}
      
      <Header
        title="Billing & Payments"
        description="View your active services and payment history"
        total={billingInfo.length} 
      />
      
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Simplified No Payment Status */}
        {unpaidRenewals.length === 0 && !loading && billingInfo.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium text-sm">Account up to date. No payment is required at this time.</p>
          </div>
        )}

        {error && (
          <div className="p-4 border border-destructive bg-destructive/5 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Pending Payments Section - Simple UI */}
        {unpaidRenewals.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-end border-b pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Outstanding Balance</h2>
                <p className="text-sm text-muted-foreground">You have {unpaidRenewals.length} pending payment(s).</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold tracking-tighter">${totalUnpaidAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unpaidRenewals.map((renewal) => (
                <Card key={renewal._id} className="border shadow-none">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-bold leading-none">{renewal.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{renewal.invoiceId}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase">Pending</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">${renewal.price}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(renewal.date), 'MMM dd')}
                      </span>
                    </div>

                    <Button 
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedRenewal({ 
                        id: renewal._id, 
                        amount: renewal.price,
                        assignServiceId: renewal.assignServiceId,
                        serviceName: renewal.serviceName
                      })}
                    >
                      Pay Now <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Services List - Simple UI */}
        <section className="space-y-4">
          {/* <h2 className="text-lg font-bold tracking-tight">Service History</h2> */}
          {billingInfo.length === 0 && !loading ? (
             <Card className="border-dashed shadow-none py-12 text-center">
                <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No billing records found.</p>
             </Card>
          ) : (
            <div className="space-y-6">
              {billingInfo.map((billing) => (
                <Card key={billing._id} className="shadow-none border overflow-hidden">
                  <CardHeader className="bg-slate-50/50 dark:bg-muted/20 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base font-bold">{billing.service_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">ID: {billing.invoice_id}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{billing.isaccepted}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Simplified Stat Line */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-b">
                       <div className="p-4 text-center">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Price</p>
                          <p className="font-bold">${billing.price}</p>
                       </div>
                       <div className="p-4 text-center">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Cycle</p>
                          <p className="font-bold capitalize">{billing.cycle}</p>
                       </div>
                       <div className="p-4 text-center">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Start</p>
                          <p className="font-bold">{format(new Date(billing.start_date), 'MMM dd, yyyy')}</p>
                       </div>
                       <div className="p-4 text-center">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">End</p>
                          <p className="font-bold">{format(new Date(billing.end_date), 'MMM dd, yyyy')}</p>
                       </div>
                    </div>

                    {/* Simple Payment Schedule List */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Installments</p>
                      {billing.renewal_dates.map((renewal) => (
                        <div key={renewal._id} className="flex items-center justify-between p-3 border rounded-md text-sm">
                          <div className="flex items-center gap-3">
                            {renewal.haspaid ? 
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : 
                              <Clock className="h-4 w-4 text-slate-400" />
                            }
                            <span className="font-medium">{format(new Date(renewal.date), 'MMM dd, yyyy')}</span>
                            <span className="text-muted-foreground capitalize text-xs">({renewal.label})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold">${renewal.price}</span>
                            {!renewal.haspaid ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => setSelectedRenewal({ 
                                  id: renewal._id, 
                                  amount: renewal.price,
                                  assignServiceId: billing._id,
                                  serviceName: billing.service_name
                                })}
                              >
                                Pay
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-[11px] uppercase">Paid</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {selectedRenewal && (
          <StripePaymentModal
            renewalId={selectedRenewal.id}
            amount={selectedRenewal.amount}
            assignServiceId={selectedRenewal.assignServiceId}
            serviceName={selectedRenewal.serviceName}
            onClose={() => setSelectedRenewal(null)}
            onSuccess={() => {
              setSelectedRenewal(null);
              dispatch(fetchBillingInfo());
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Page;