'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchDashboardStats } from '@/lib/redux/slices/dashboardSlicer';
import { format } from 'date-fns';
import Link from 'next/link';
import Header from '@/app/page/common/header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import SpinnerComponent from '@/app/page/common/Spinner';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const profileState = useAppSelector((state) => state.profile) as { profile: any; loading: boolean; error: string | null };
  const { profile } = profileState;
  const dashboard = useAppSelector((state) => state.dashboard as any);
  const stats = dashboard?.stats || {};
  const recentServices = dashboard?.recentServices || [];
  const resentInvoices = dashboard?.resentInvoices || [];
  // Aggregate invoices by invoice_id so duplicates (same invoice_id) show a single consolidated status
  const processedInvoices = useMemo(() => {
    const map = new Map<string, any>();
    resentInvoices.forEach((inv: any) => {
      const key = inv.invoice_id || inv._id;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...inv });
        return;
      }

      const getTime = (i: any) => (i && i.payment_date ? new Date(i.payment_date).getTime() : 0);

      // Prefer the invoice with a payment_date (most recent)
      if (getTime(inv) > getTime(existing)) {
        map.set(key, { ...inv });
        return;
      }

      // Otherwise pick the highest-priority status: completed > pending > failed/other
      const priority = (s: string) => (s === 'completed' ? 3 : s === 'pending' ? 2 : s === 'failed' ? 1 : 0);
      const existingPriority = priority(existing.payment_status || '');
      const invPriority = priority(inv.payment_status || '');
      if (invPriority > existingPriority) {
        map.set(key, { ...inv });
      }
    });

    return Array.from(map.values());
  }, [resentInvoices]);
  const unpaidInvoices = dashboard?.unpaidInvoices ?? 0;
  const unpaidAmount = dashboard?.unpaidAmount ?? 0;
  const loading = dashboard?.loading;
  const error = dashboard?.error;

  useEffect(() => {
    // Fetch user-specific dashboard when profile email is available, otherwise fetch default stats
    if (profile?.email) {
      dispatch(fetchDashboardStats({ email: profile.email } as any));
    } else {
      // call with default 'all' filter to satisfy thunk signature
      dispatch(fetchDashboardStats('all'));
    }
  }, [dispatch, profile?.email]);

  if (loading) {
    return (
      <>
      <SpinnerComponent />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            Error loading dashboard: {error}
          </CardContent>
        </Card>
      </div>
    );
  } 

  const statsCards = [  
    {
      title: "Paid Balance ",
      value: `$${stats.totalSpent || 0}`,
      subtitle: stats.totalSpent > 0 ? 'Balance Paid' : 'No payments made',
      icon: Building2,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/admin/billing'
    },
    {
      title: "Next Due",
      value: `$${unpaidAmount || 0}`,
      subtitle: (() => {
        // Prefer earliest upcoming renewal from recent services if available
        const now = Date.now();
        const nextDates = recentServices
          .map((s: any) => s.renewal_date ? new Date(s.renewal_date).getTime() : null)
          .filter((d: any) => d !== null) as number[];
        if (nextDates.length === 0) return unpaidInvoices > 0 ? `You have unpaid invoices` : 'No due invoices';
        const next = Math.min(...nextDates);
        const days = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Overdue';
        return `Due in ${days} day${days !== 1 ? 's' : ''}`;
      })(),
      icon: Calendar,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/admin/billing'
    },
    {
      title: "Active Services",
      value: stats.activeServices ?? dashboard?.activeService ?? 0,
      subtitle: recentServices.length > 0 ? `Next Renewal: ${format(new Date(recentServices[0]?.renewal_date || new Date()), 'dd MMM')}` : 'No active services',
      icon: Clock,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/admin/view_assign_service'
    },
    {
      title: "Unpaid Invoices",
      value: unpaidInvoices || 0,
      subtitle: unpaidInvoices > 0 ? `$${unpaidAmount} total due` : 'No pending payments',
      icon: Clock,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/admin/billing'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Blue Gradient Header */}
      <Header 
    title='Dashboard'  
    />
      {/* User banner card */}
      {profile && (
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <div className="shadow-xl rounded-lg overflow-hidden border-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile.profile_image ? (
                  <AvatarImage src={profile.profile_image} alt={profile.name || profile.email} />
                ) : (
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {(profile.name?.charAt(0) ?? profile.email?.charAt(0) ?? 'U').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <p className="text-xl font-semibold">{profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'User'}</p>
                <p className="text-sm opacity-90">{profile.email}</p>
              </div>
              <div className="hidden md:block">
                <Link href="/admin/profile">
                  <Button variant="outline" className="border-white/30 text-white">View Profile</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className=" space-y-6 pt-5">
        {/* Payment Overdue Alert */}
        {unpaidInvoices > 0 && (
        
          <Alert className="bg-red-50 flex justify-between gap-3 items-center border-red-200 dark:bg-red-900/20 dark:border-red-700">
            <div className="flex items-center gap-5">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />

    <div className=' flex justify-start items-start flex-col'>

            <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Payment Overdue</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-200 ">
              <span>
                You have {unpaidInvoices} unpaid invoice{unpaidInvoices > 1 ? 's' : ''} totaling ${unpaidAmount}
              </span>
             </AlertDescription>
              </div>
              </div>
              <Link href="/admin/billing" className=' relative top-0 left-0'>
                <Button size="sm" className="bg-red-600 cursor-pointer hover:bg-red-700 text-white">
                  Pay Now
                </Button>
              </Link>
          </Alert>
         
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map((card, index) => (
            <Link href={card.link} key={index}>
              <Card className={`border-l-4 ${card.borderColor} hover:shadow-md transition-all cursor-pointer`}>
                <CardContent className="px-3 py-2.5 flex items-center gap-3">
                  <div className={`rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 shrink-0`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{card.title}</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{card.value}</h3>
                    {card.subtitle && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{card.subtitle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Invoices and Active Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardContent className="">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold ">Recent Invoices</h2>
                <Link href="/admin/billing-history">
                  <Button variant="link" className="text-blue-600 cursor-pointer text-sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {processedInvoices && processedInvoices.length > 0 ? (
                  processedInvoices.map((invoice: any) => (
                    <div key={invoice._id || invoice.invoice_id} className="flex items-center justify-between p-3 rounded-lg transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">#{invoice.invoice_id}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {invoice.payment_date ? format(new Date(invoice.payment_date), 'MMM dd, yyyy') : 'Pending'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">${invoice.amount}</span>
                        <Badge 
                          className={
                            invoice.payment_status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200' :
                            invoice.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200' :
                            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
                          }
                        >
                          {invoice.payment_status === 'completed' ? 'Paid' :
                           invoice.payment_status === 'pending' ? 'Sent' : 'Overdue'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Services */}
          <Card>
            <CardContent className="">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold ">Active Services</h2>
                <Link href="/admin/view_assign_service">
                  <Button variant="link" className="text-blue-600 cursor-pointer text-sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentServices && recentServices.length > 0 ? (
                  recentServices.map((service: any) => (
                    <div key={service._id} className="flex items-center justify-between p-3 rounded-lg transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{service.service_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Renewal: {service.renewal_date ? format(new Date(service.renewal_date), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">${service.price}/mo</p>
                        <Badge className="bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/20 dark:text-blue-200">
                          {service.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">No active services</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}