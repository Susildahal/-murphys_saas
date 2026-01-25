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
  Activity
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

  // Robust way to get email
  const userEmail = user?.email || profile?.email || meeData?.email;

  // Selectors from Redux
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
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Services currently running"
    },
    {
      title: "Open Tickets",
      value: openTickets?.toString() || "0",
      icon: Ticket,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      description: "Pending support requests"
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices?.toString() || "0",
      icon: Clock,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      description: "Invoices awaiting payment"
    },
    {
      title: "Unread Notices",
      value: unreadNotices?.toString() || "0",
      icon: Bell,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      description: "Important updates"
    }
  ];

  return (
    <div className="space-y-10 min-h-screen bg-background transition-colors duration-200">
      <Header
        title={`Hello, ${user?.firstName || profile?.firstName || profile?.name?.split(' ')[0] || meeData?.displayName?.split(' ')[0] || 'User'}`}
        description="Welcome back. Here's an overview of your account."
        extra={
          <div className="flex gap-2">
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px] border-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
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
        }
      />

      {/* Current Filter Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Showing data for: <span className="font-bold">{filterOptions.find(f => f.value === selectedFilter)?.label}</span>
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Total Spent: <span className="font-bold text-lg">${totalSpent?.toLocaleString() || 0}</span>
          </span>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading specific stats...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 relative group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${stat.bg} transition-transform group-hover:scale-110`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={120} />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription className="text-indigo-100">Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/services/create" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <PlusCircle size={18} />
                    <span className="text-sm font-medium">New Service Request</span>
                  </div>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/admin/open_ticket" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Ticket size={18} />
                    <span className="text-sm font-medium">Create Support Ticket</span>
                  </div>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/admin/billing" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    <span className="text-sm font-medium">View Billing History</span>
                  </div>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </CardContent>
            </Card>

            {/* Recent Services Table */}
            <Card className="border shadow-sm lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Your Recent Services</CardTitle>
                  <CardDescription>Latest services assigned to you</CardDescription>
                </div>
                <Link href="/admin/view_assign_service">
                  <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View All <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Service Name</TableHead>
                        <TableHead className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Status</TableHead>
                        <TableHead className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Start Date</TableHead>
                        <TableHead className="pb-4 text-right font-semibold uppercase tracking-wider text-[11px]">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentServices && recentServices.length > 0 ? (
                        recentServices.map((assign: any, index: number) => (
                          <motion.tr
                            key={assign._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group hover:bg-muted/50 transition-colors border-b"
                          >
                            <TableCell className="py-4">
                              <div className="font-medium text-foreground">{assign.service_name}</div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${assign.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  assign.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {assign.status}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 text-muted-foreground text-xs">
                              {assign.createdAt ? format(new Date(assign.createdAt), 'MMM dd, yyyy') : '-'}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <span className="font-bold text-foreground">${assign.price || 0}</span>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="w-12 h-12 text-muted-foreground/50" />
                              <p>No active services found.</p>
                              <Link href="/admin/services/create">
                                <Button variant="outline" size="sm" className="mt-2">
                                  Browse Services
                                </Button>
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
          </div>
        </>
      )}
    </div>
  );
}