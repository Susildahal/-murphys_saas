'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Send,
  UserPlus,
  BarChart3
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
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchServices } from '@/lib/redux/slices/serviceSlice';
import { getAssignedServices } from '@/lib/redux/slices/assignSlice';
import { getadminProfile } from '@/lib/redux/slices/profileSlice';
import { format } from 'date-fns';
import Link from 'next/link';
import Header from '@/app/page/common/header';

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  // Selectors
  const { total: totalServices, services } = useAppSelector((state) => state.services);
  const { total: totalAssigned, data: recentAssignments } = useAppSelector((state) => state.assign);
  const { total: totalProfiles } = useAppSelector((state) => state.profile);

  useEffect(() => {
    // Fetch initial data for dashboard metrics
    dispatch(fetchServices({ limit: 100 }));
    dispatch(getAssignedServices({ limit: 5 }));
    dispatch(getadminProfile({ role_type: 'client', limit: 1 }));
  }, [dispatch]);

  // Derived stats
  const activeServices = services.filter(s => s.status === 'active').length;
  const inactiveServices = services.filter(s => s.status === 'inactive').length;

  const stats = [
    {
      title: "Total Clients",
      value: totalProfiles.toString(),
      icon: Users,
      trend: "+12.5%",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Services",
      value: totalServices.toString(),
      icon: Package,
      trend: "+3.2%",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Assigned Services",
      value: totalAssigned.toString(),
      icon: CheckCircle2,
      trend: "+18%",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Pending Tasks",
      value: "4",
      icon: Clock,
      trend: "-2",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-10 min-h-screen bg-background transition-colors duration-200">

      {/* Header Section */}
      <Header
        title="Dashboard"
        description="Welcome back. Here's what's happening with your projects today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Recent Assignments Table */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Assignments</CardTitle>
              <CardDescription>Latest services assigned to clients</CardDescription>
            </div>
            <Link href="/admin/view_assign_service">
              <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Client</TableHead>
                    <TableHead className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Service</TableHead>
                    <TableHead className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Date</TableHead>
                    <TableHead className="pb-4 text-right font-semibold uppercase tracking-wider text-[11px]">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAssignments && recentAssignments.length > 0 ? (
                    recentAssignments.map((assign: any) => (
                      <TableRow key={assign._id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="font-medium text-foreground">{assign.client_name}</div>
                          <div className="text-xs text-muted-foreground">{assign.email}</div>
                        </TableCell>
                        <TableCell className="py-4 font-medium text-foreground">{assign.service_name}</TableCell>
                        <TableCell className="py-4 text-muted-foreground text-xs">
                          {assign.createdAt ? format(new Date(assign.createdAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="py-4 text-right font-semibold text-foreground">
                          ${assign.price || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No recent assignments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Performance Chart */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-[#480082] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Package size={120} />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/services/create" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <PlusCircle size={18} />
                  <span className="text-sm font-medium">Create New Service</span>
                </div>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/admin/invte_users" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Send size={18} />
                  <span className="text-sm font-medium">Invite User</span>
                </div>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/admin/clients_users" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <UserPlus size={18} />
                  <span className="text-sm font-medium">Add New Client</span>
                </div>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Service Performance
              </CardTitle>
              <CardDescription>Status breakdown from catalog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-3 h-32 px-2">
                {/* Dynamic representation based on active/inactive */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: totalServices > 0 ? `${(activeServices / totalServices) * 100}%` : '5%' }}
                    className="w-full bg-emerald-500 rounded-t-sm"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Active</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: totalServices > 0 ? `${(inactiveServices / totalServices) * 100}%` : '5%' }}
                    className="w-full bg-rose-500 rounded-t-sm"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Inactive</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Active</p>
                  <p className="text-xl font-bold text-emerald-500">{activeServices}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Inactive</p>
                  <p className="text-xl font-bold text-rose-500">{inactiveServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}