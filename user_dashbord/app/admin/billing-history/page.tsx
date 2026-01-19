'use client';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Receipt, 
  CheckCircle2, 
  XCircle,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  Filter,
  Download,
  FileText,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import SpinnerComponent from '@/app/page/common/Spinner'
import Header from '@/app/page/common/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import Pagination from "@/app/page/common/Pagination"
import jsPDF from 'jspdf';

interface BillingHistoryItem {
  _id: string;
  invoice_id: string;
  service_name: string;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  stripe_payment_intent_id?: string;
  payment_date?: string;
  failure_reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingStats {
  _id: string;
  count: number;
  totalAmount: number;
}

function BillingHistoryPage() {
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [stats, setStats] = useState<BillingStats[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<string | null>(null);
  const [calendarStartDate, setCalendarStartDate] = useState<Date | undefined>();
  const [calendarEndDate, setCalendarEndDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const fetchBillingHistory = async () => {
    setLoading(true);
    try {
      const axiosInstance = (await import('@/lib/axios')).default;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const [historyRes, statsRes] = await Promise.all([
        axiosInstance.get(`/billing/history?${params.toString()}`),
        axiosInstance.get('/billing/stats')
      ]);

      if (historyRes.data) {
        setBillingHistory(historyRes.data.data);
        setTotalPages(historyRes.data.pagination.pages);
      }

      if (statsRes.data) {
        setStats(statsRes.data.stats);
        setTotalPaid(statsRes.data.totalPaid);
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch billing history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingHistory();
  }, [filter, page, startDate, endDate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'refunded':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      failed: 'destructive',
      pending: 'outline',
      refunded: 'secondary'
    };
    return <Badge variant={variants[status]} className="capitalize">{status}</Badge>;
  };

  const getStatByStatus = (status: string) => {
    return stats.find(s => s._id === status);
  };
  const exportToPDF = async () => {
    try {
      setLoading(true);
      const axiosInstance = (await import('@/lib/axios')).default;
      
      // Fetch all data with high limit for export
      const params = new URLSearchParams({
        page: '1',
        limit: '1000' // Higher limit to get all data
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await axiosInstance.get(`/billing/history?${params.toString()}`);
      const allBillingData = response.data.data || [];

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Billing History Report', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, margin, yPos);
      yPos += 5;
      
      if (filter !== 'all') {
        doc.text(`Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`, margin, yPos);
        yPos += 5;
      }
      if (startDate || endDate) {
        doc.text(`Date Range: ${startDate || 'Any'} to ${endDate || 'Any'}`, margin, yPos);
        yPos += 5;
      }
      
      yPos += 5;
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Summary Statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Paid: $${totalPaid}`, margin, yPos);
      yPos += 5;
      doc.text(`Completed: ${getStatByStatus('completed')?.count || 0} payments`, margin, yPos);
      yPos += 5;
      doc.text(`Failed: ${getStatByStatus('failed')?.count || 0} attempts`, margin, yPos);
      yPos += 5;
      doc.text(`Pending: ${getStatByStatus('pending')?.count || 0} payments`, margin, yPos);
      yPos += 5;
      doc.text(`Refunded: ${getStatByStatus('refunded')?.count || 0} refunds`, margin, yPos);
      yPos += 10;

      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Transactions Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transactions', margin, yPos);
      yPos += 8;

      // Transaction table headers
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice', margin, yPos);
      doc.text('Service', margin + 35, yPos);
      doc.text('Amount', margin + 90, yPos);
      doc.text('Status', margin + 120, yPos);
      doc.text('Date', margin + 150, yPos);
      yPos += 5;
      
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // Transaction rows - using fetched data
      doc.setFont('helvetica', 'normal');
      allBillingData.forEach((item: BillingHistoryItem, index: number) => {
        // Check if we need a new page
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }

        // Truncate text if too long
        const invoiceId = item.invoice_id.length > 15 ? item.invoice_id.substring(0, 12) + '...' : item.invoice_id;
        const serviceName = item.service_name.length > 25 ? item.service_name.substring(0, 22) + '...' : item.service_name;
        
        doc.text(invoiceId, margin, yPos);
        doc.text(serviceName, margin + 35, yPos);
        doc.text(`$${item.amount}`, margin + 90, yPos);
        doc.text(item.payment_status, margin + 120, yPos);
        doc.text(format(new Date(item.createdAt), 'MM/dd/yyyy'), margin + 150, yPos);
        yPos += 6;

        // Add subtle separator line
        if (index < allBillingData.length - 1) {
          doc.setDrawColor(230);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 2;
        }
      });

      // Footer on last page
      yPos = pageHeight - 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Total transactions shown: ${allBillingData.length}`, margin, yPos);

      // Save the PDF
      const filename = `billing-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(filename);

      toast({
        title: 'Success',
        description: `PDF exported successfully with ${allBillingData.length} transactions`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      // CSV headers
      const headers = ['Invoice ID', 'Service Name', 'Amount', 'Currency', 'Status', 'Payment Method', 'Created Date', 'Payment Date'];
      
      // CSV rows
      const rows = billingHistory.map(item => [
        item.invoice_id,
        item.service_name,
        item.amount,
        item.currency,
        item.payment_status,
        item.payment_method,
        format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        item.payment_date ? format(new Date(item.payment_date), 'yyyy-MM-dd HH:mm:ss') : 'N/A'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `billing-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'CSV exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePayment = async () => {
    if (!selectedItemForDelete) return;

    try {
      setLoading(true);
      const axiosInstance = (await import('@/lib/axios')).default;
      
      await axiosInstance.delete(`/billing/history/${selectedItemForDelete}`);
      
      toast({
        title: 'Success',
        description: 'Payment record deleted successfully',
      });

      // Refresh the data
      await fetchBillingHistory();
      setDeleteDialogOpen(false);
      setSelectedItemForDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete payment record',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (itemId: string) => {
    setSelectedItemForDelete(itemId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {loading && <SpinnerComponent />}
      <Header
        title="Billing History"
        description="View and manage all your payment transactions"
        total={billingHistory.length}
      />

      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-emerald-600">${totalPaid}</p>
                  <p className="text-xs text-muted-foreground">
                    {getStatByStatus('completed')?.count || 0} payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${getStatByStatus('failed')?.totalAmount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getStatByStatus('failed')?.count || 0} attempts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ${getStatByStatus('pending')?.totalAmount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getStatByStatus('pending')?.count || 0} payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refunded</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${getStatByStatus('refunded')?.totalAmount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getStatByStatus('refunded')?.count || 0} refunds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!calendarStartDate && 'text-muted-foreground'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {calendarStartDate ? format(calendarStartDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={calendarStartDate}
                      onSelect={(date) => {
                        setCalendarStartDate(date);
                        setStartDate(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!calendarEndDate && 'text-muted-foreground'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {calendarEndDate ? format(calendarEndDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={calendarEndDate}
                      onSelect={(date) => {
                        setCalendarEndDate(date);
                        setEndDate(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      initialFocus
                      disabled={(date) => calendarStartDate ? date < calendarStartDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilter('all');
                    setStartDate('');
                    setEndDate('');
                    setCalendarStartDate(undefined);
                    setCalendarEndDate(undefined);
                    setPage(1);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                  <p className="text-muted-foreground">
                    {filter !== 'all' ? 'Try changing your filters' : 'No payment history available'}
                  </p>
                </div>
              ) : (
                billingHistory.map((item) => (
                  <div 
                    key={item._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                        {getStatusIcon(item.payment_status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.service_name}</p>
                          {getStatusBadge(item.payment_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invoice: {item.invoice_id}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                          {item.payment_date && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Paid: {format(new Date(item.payment_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                        {item.failure_reason && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {item.failure_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${item.amount}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {item.currency}
                      </p>
                      {item.stripe_payment_intent_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.stripe_payment_intent_id.substring(0, 20)}...
                        </p>
                      )}
                      {item.payment_status === 'failed' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={() => openDeleteDialog(item._id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <Pagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this failed payment record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedItemForDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePayment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BillingHistoryPage;
