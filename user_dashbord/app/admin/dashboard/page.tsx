'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle2,
  Bell,
  ArrowUpRight,
  PlusCircle,
  CreditCard,
  Ticket,
  Clock,
  Calendar,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchDashboardStats } from '@/lib/redux/slices/dashboardSlicer';
import { format } from 'date-fns';
import Link from 'next/link';
import Header from '@/app/page/common/header';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const { user } = useAppSelector((state) => state.auth);
  const profileState = useAppSelector((state) => state.profile);
  const { data: meeData } = useAppSelector((state) => state.mee);
  const profile = Array.isArray(profileState.profile) ? profileState.profile[0] : profileState.profile;

  const userEmail = user?.email || profile?.email || meeData?.email;

  const {
    activeService,
    openTickets,
    pendingInvoices,
    totalSpent,
    unreadNotices,
    recentAssign: recentServices,
    loading,
    error
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (userEmail) {
      dispatch(fetchDashboardStats({ filter: selectedFilter, email: userEmail }));
    }
  }, [dispatch, selectedFilter, userEmail]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
  ];

  const stats = [
    {
      title: "Active Services",
      value: activeService?.toString() || "0",
      icon: Package,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "Services currently running"
    },
    {
      title: "Open Tickets",
      value: openTickets?.toString() || "0",
      icon: Ticket,
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      description: "Pending support requests"
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices?.toString() || "0",
      icon: Clock,
      gradient: "from-rose-500/20 to-pink-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      description: "Invoices awaiting payment"
    },
    {
      title: "Unread Notices",
      value: unreadNotices?.toString() || "0",
      icon: Bell,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      description: "Important updates"
    }
  ];

  const quickActions = [
    {
      title: "New Service",
      desc: "Request a new service",
      icon: PlusCircle,
      href: "/admin/services/create",
      color: "text-emerald-500",
      bg: "hover:bg-emerald-500/10"
    },
    {
      title: "Support Ticket",
      desc: "Get help with an issue",
      icon: Ticket,
      href: "/admin/open_ticket",
      color: "text-blue-500",
      bg: "hover:bg-blue-500/10"
    },
    {
      title: "Billing History",
      desc: "View past payments",
      icon: CreditCard,
      href: "/admin/billing",
      color: "text-purple-500",
      bg: "hover:bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-8 min-h-screen bg-transparent p-6 pb-20">

      {/* Welcome & Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || profile?.firstName || meeData?.displayName?.split(' ')[0] || 'User'}. Here's what's happening.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border shadow-sm backdrop-blur-sm">
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[160px] border-none shadow-none bg-transparent focus:ring-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Select period" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Updating dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Unable to load data</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                  {/* Gradient Background Effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} blur-3xl rounded-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`} />

                  <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <h3 className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-xl bg-background shadow-sm ${stat.iconColor}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <span className="truncate">{stat.description}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Quick Actions Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <Card className="h-full border-none shadow-lg bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks & shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, i) => (
                    <Link href={action.href} key={i}>
                      <div className={`flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-border transition-all cursor-pointer group ${action.bg}`}>
                        <div className={`p-2.5 rounded-lg bg-background shadow-sm group-hover:scale-110 transition-transform ${action.color}`}>
                          <action.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{action.title}</h4>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    </Link>
                  ))}

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div>
                        <p className="text-sm font-medium text-foreground">Total Spent</p>
                        <p className="text-xs text-muted-foreground text-nowrap">Lifetime value</p>
                      </div>
                      <p className="text-xl font-bold text-primary">${totalSpent?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Services Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="h-full border-none shadow-lg overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
                  <div>
                    <CardTitle className="text-lg">Recent Services</CardTitle>
                    <CardDescription>Latest activity on your account</CardDescription>
                  </div>
                  <Link href="/admin/view_assign_service">
                    <Button variant="ghost" size="sm" className="gap-1 hover:bg-background hover:shadow-sm">
                      View All <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="pl-6 h-12">Service Name</TableHead>
                          <TableHead className="h-12">Status</TableHead>
                          <TableHead className="h-12">Date</TableHead>
                          <TableHead className="text-right pr-6 h-12">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentServices && recentServices.length > 0 ? (
                          recentServices.map((assign: any, index: number) => (
                            <motion.tr
                              key={assign._id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 + 0.5 }}
                              className="group hover:bg-muted/30 border-b border-border/40 last:border-0"
                            >
                              <TableCell className="pl-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                                {assign.service_name}
                              </TableCell>
                              <TableCell className="py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                  ${assign.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                    assign.status === 'expired' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                                      'bg-slate-500/15 text-slate-600 dark:text-slate-400'}`}>
                                  {assign.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />}
                                  {assign.status}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-muted-foreground text-sm">
                                {assign.createdAt ? format(new Date(assign.createdAt), 'MMM dd, yyyy') : '-'}
                              </TableCell>
                              <TableCell className="pr-6 py-4 text-right font-bold text-foreground">
                                ${assign.price || 0}
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-48 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <div className="p-4 rounded-full bg-muted/50 mb-2">
                                  <Package className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="font-medium">No services found</p>
                                <p className="text-sm max-w-xs mx-auto mb-4 opacity-70">You don't have any active services yet. Start by browsing our catalog.</p>
                                <Link href="/admin/services/create">
                                  <Button size="sm">Browse Services</Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}