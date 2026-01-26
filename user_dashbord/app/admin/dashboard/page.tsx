'use client';

import React, { useEffect } from 'react';
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

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const profileState = useAppSelector((state) => state.profile) as { profile: any; loading: boolean; error: string | null };
  const { profile } = profileState;
  const dashboard = useAppSelector((state) => state.dashboard as any);
  const stats = dashboard?.stats || {};
  const recentServices = dashboard?.recentServices || [];
  const resentInvoices = dashboard?.resentInvoices || [];
  const unpaidInvoices = dashboard?.unpaidInvoices ?? 0;
  const unpaidAmount = dashboard?.unpaidAmount ?? 0;
  const loading = dashboard?.loading;
  const error = dashboard?.error;

  useEffect(() => {
  
    dispatch(fetchDashboardStats(null as any))

  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
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
      title: "Outstanding Balance",
      value: `$${stats.totalSpent || 0}`,
      icon: Building2,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/admin/billing'
    },
    {
      title: "Next Due",
      value: `$${unpaidAmount || 0}`,
      subtitle: unpaidInvoices > 0 ? `Due in ${Math.ceil((new Date().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` : 'No due invoices',
      icon: Calendar,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/admin/billing'
    },
    {
      title: "Active Services",
      value: stats.activeServices || 0,
      subtitle: recentServices.length > 0 ? `Next Renewal: ${format(new Date(recentServices[0]?.renewal_date || new Date()), 'dd MMM')}` : 'No active services',
      icon: Clock,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
      link: '/services/view_assign_service'
    },
    {
      title: "Unpaid Invoices",
      value: unpaidInvoices || 0,
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
      <div className="p-6 space-y-6">
        {/* Payment Overdue Alert */}
        {unpaidInvoices > 0 && (
          <Alert className="bg-red-50 border-red-200 ">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-semibold">Payment Overdue</AlertTitle>
            <AlertDescription className="text-red-700 flex items-center justify-between">
              <span>
                You have {unpaidInvoices} unpaid invoice{unpaidInvoices > 1 ? 's' : ''} totaling ${unpaidAmount}
              </span>
              <Link href="/admin/billing">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  Pay Now
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <Link href={card.link} key={index}>
              <Card className={`border-l-4 ${card.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className={`h-8 w-8 ${card.color}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                  {card.subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Invoices and Active Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
                <Link href="/admin/billing">
                  <Button variant="link" className="text-blue-600 text-sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {resentInvoices && resentInvoices.length > 0 ? (
                  resentInvoices.map((invoice: any) => (
                    <div key={invoice._id || invoice.invoice_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">#{invoice.invoice_id}</p>
                        <p className="text-xs text-slate-500">
                          {invoice.payment_date ? format(new Date(invoice.payment_date), 'MMM dd, yyyy') : 'Pending'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">${invoice.amount}</span>
                        <Badge 
                          className={
                            invoice.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                            invoice.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }
                        >
                          {invoice.payment_status === 'completed' ? 'Paid' :
                           invoice.payment_status === 'pending' ? 'Sent' : 'Overdue'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-8">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Services */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Active Services</h2>
                <Link href="/services/assigned-services">
                  <Button variant="link" className="text-blue-600 text-sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentServices && recentServices.length > 0 ? (
                  recentServices.map((service: any) => (
                    <div key={service._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{service.service_name}</p>
                        <p className="text-xs text-slate-500">
                          Renewal: {service.renewal_date ? format(new Date(service.renewal_date), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${service.price}/mo</p>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {service.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-8">No active services</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}