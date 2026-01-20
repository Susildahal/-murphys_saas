'use client';
import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import SpinnerComponent from '@/app/page/common/Spinner'
import { fetchBillingInfo } from '@/lib/redux/slices/billingSlicer'
import Header from '@/app/page/common/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Receipt,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast({
          title: 'Validation Error',
          description: submitError.message,
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      });

      if (pmError) {
        toast({
          title: 'Payment Method Error',
          description: pmError.message,
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }

      const axiosInstance = (await import('@/lib/axios')).default;
      const response = await axiosInstance.post('/billing/process-payment', {
        paymentMethodId: paymentMethod.id,
        renewalId,
        amount,
        assignServiceId
      });

      if (response.data) {
        toast({
          title: 'Payment Successful',
          description: `Payment of $${amount} processed successfully`,
        });
        onSuccess();
      }
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={!stripe || processing}
          className="flex-1 h-11"
        >
          {processing ? 'Processing...' : `Pay $${amount}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 h-11"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function StripePaymentModal({ 
  renewalId, 
  amount, 
  assignServiceId,
  serviceName,
  onClose,
  onSuccess 
}: { 
  renewalId: string; 
  amount: number; 
  assignServiceId: string;
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(amount * 100),
    currency: 'aud',
    paymentMethodCreation: 'manual',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="text-2xl">Complete Payment</CardTitle>
          <CardDescription>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-semibold text-foreground">{serviceName}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-2xl text-primary">${amount} AUD</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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

function Page() {
  const dispatch = useAppDispatch();
  const { billingInfo, loading, error } = useAppSelector((state) => state.billing);
  const [selectedRenewal, setSelectedRenewal] = useState<{ 
    id: string; 
    amount: number; 
    assignServiceId: string;
    serviceName: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchBillingInfo());
  }, [dispatch]);

  const getTotalPaid = (renewalDates: any[]) => {
    return renewalDates.filter(r => r.haspaid).reduce((sum, r) => sum + Number(r.price), 0);
  };

  const getTotalDue = (renewalDates: any[]) => {
    return renewalDates.filter(r => !r.haspaid).reduce((sum, r) => sum + Number(r.price), 0);
  };

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
    <>  
      {loading && <SpinnerComponent />}
      <Header
        title="Billing & Payments"
        description="Manage your subscriptions and payment history"
        total={billingInfo.length} 
      />
      
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Unpaid Items Section */}
        {unpaidRenewals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  Outstanding Payments
                </h2>
                <p className="text-muted-foreground mt-1">
                  {unpaidRenewals.length} payment{unpaidRenewals.length !== 1 ? 's' : ''} pending
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-3xl font-bold text-amber-600">${totalUnpaidAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unpaidRenewals.map((renewal) => (
                <Card 
                  key={renewal._id} 
                  className="border-2 border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-amber-900 dark:text-amber-100">
                          {renewal.serviceName}
                        </CardTitle>
                        <CardDescription className="mt-1 text-amber-700 dark:text-amber-300">
                          {renewal.invoiceId}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50">
                        <Clock className="h-3 w-3 mr-1" />
                        Unpaid
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200 capitalize">
                        {renewal.label}
                      </span>
                      <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        ${renewal.price}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(renewal.date), 'MMM dd, yyyy')}</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md h-10"
                      onClick={() => setSelectedRenewal({ 
                        id: renewal._id, 
                        amount: renewal.price,
                        assignServiceId: renewal.assignServiceId,
                        serviceName: renewal.serviceName
                      })}
                    >
                      Pay Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Services Section */}
        {billingInfo.length === 0 && !loading ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-10 w-10 text-primary/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Billing Information</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You don't have any active subscriptions yet. Start exploring our services to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
         

            <div className="grid gap-6">
              {billingInfo.map((billing) => {
                const totalPaid = getTotalPaid(billing.renewal_dates);
                const totalDue = getTotalDue(billing.renewal_dates);
                const totalPrice = Number(billing.price);
                const paidCount = billing.renewal_dates.filter(r => r.haspaid).length;
                const unpaidCount = billing.renewal_dates.filter(r => !r.haspaid).length;

                return (
                  <div key={billing._id} className="overflow-hidden   duration-300 ">
                    <CardHeader className="">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold">{billing.service_name}</CardTitle>
                          <CardDescription className="mt-2 flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Invoice: <span className="font-mono">{billing.invoice_id}</span>
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={billing.isaccepted === 'accepted' ? 'default' : 'outline'}
                          className="capitalize text-sm px-3 py-1"
                        >
                          {billing.isaccepted}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <DollarSign className="h-8 w-8 mb-2 opacity-90" />
                          <p className="text-sm opacity-90 font-medium">Total Amount</p>
                          <p className="text-3xl font-bold mt-1">${totalPrice}</p>
                          <p className="text-xs opacity-75 mt-1 capitalize">{billing.cycle}</p>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <CheckCircle2 className="h-8 w-8 mb-2 opacity-90" />
                          <p className="text-sm opacity-90 font-medium">Paid</p>
                          <p className="text-3xl font-bold mt-1">${totalPaid}</p>
                          <p className="text-xs opacity-75 mt-1">{paidCount} payment{paidCount !== 1 ? 's' : ''}</p>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-lg">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <Clock className="h-8 w-8 mb-2 opacity-90" />
                          <p className="text-sm opacity-90 font-medium">Outstanding</p>
                          <p className="text-3xl font-bold mt-1">${totalDue}</p>
                          <p className="text-xs opacity-75 mt-1">{unpaidCount} pending</p>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <Calendar className="h-8 w-8 mb-2 opacity-90" />
                          <p className="text-sm opacity-90 font-medium">Period</p>
                          <p className="text-sm font-semibold mt-1">
                            {format(new Date(billing.start_date), 'MMM dd')}
                          </p>
                          <p className="text-xs opacity-75">to {format(new Date(billing.end_date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>

                      {/* Payment Schedule */}
                      {billing.renewal_dates.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-primary" />
                              Payment Schedule
                            </h4>
                            <div className="space-y-3">
                              {[...billing.renewal_dates]
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((renewal) => (
                                <div 
                                  key={renewal._id}
                                  className={`group flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200 ${
                                    renewal.haspaid 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
                                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                                      renewal.haspaid 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-amber-500 text-white'
                                    }`}>
                                      {renewal.haspaid ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                      ) : (
                                        <Clock className="h-6 w-6" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-base capitalize">{renewal.label}</p>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(renewal.date), 'MMMM dd, yyyy')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="text-2xl font-bold">${renewal.price}</p>
                                      <Badge 
                                        variant={renewal.haspaid ? 'default' : 'outline'}
                                        className={`mt-1 ${
                                          renewal.haspaid 
                                            ? 'bg-emerald-500' 
                                            : 'border-amber-500 text-amber-700 dark:text-amber-300'
                                        }`}
                                      >
                                        {renewal.haspaid ? 'Paid' : 'Unpaid'}
                                      </Badge>
                                    </div>
                                    
                                    {!renewal.haspaid && (
                                      <Button
                                        onClick={() => setSelectedRenewal({ 
                                          id: renewal._id, 
                                          amount: renewal.price,
                                          assignServiceId: billing._id,
                                          serviceName: billing.service_name
                                        })}
                                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-md h-10 px-6"
                                      >
                                        Pay Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stripe Payment Modal */}
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
    </>
  )
}

export default Page;