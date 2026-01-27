'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Header from '@/app/page/common/header'
import axiosInstance from '@/lib/axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, Download, CreditCard, Search } from 'lucide-react'
import InvoiceView from '@/app/page/InvoiceView'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import SpinnerComponent from '@/app/page/common/Spinner'
import Link from 'next/link'

const InvoicesPage = () => {
  const [loading, setLoading] = useState(false)
  const [assigned, setAssigned] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all'|'unpaid'|'overdue'|'paid'>('all')
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [viewInvoiceData, setViewInvoiceData] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const assignRes = await axiosInstance.get('/billing/info')
        setAssigned(assignRes.data?.data || [])
      } catch (err) {
        console.error('Error fetching billing data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Flatten renewals: one row per renewal
  const rows = useMemo(() => {
    const r: any[] = []
    const today = new Date()

    assigned.forEach((svc: any) => {
      const renewals = Array.isArray(svc.renewal_dates) ? svc.renewal_dates : []
      
      if (renewals.length === 0) {
        // if no renewals, still add one row representing service invoice
        r.push({
          source: 'service',
          serviceId: svc._id,
          invoiceId: svc.invoice_id,
          serviceName: svc.service_name,
          issueDate: svc.createdAt || svc.start_date,
          dueDate: svc.end_date || null,
          amount: Number(svc.price || 0),
          paid: svc.isaccepted === 'accepted',
          isOverdue: false,
          raw: svc,
        })
      } else {
        renewals.forEach((ren: any) => {
          const hasPaid = ren.haspaid
          const dueDate = ren.date ? new Date(ren.date) : null
          const isOverdue = !!(dueDate && !hasPaid && dueDate < today)

          r.push({
            source: 'renewal',
            serviceId: svc._id,
            invoiceId: svc.invoice_id,
            renewalId: ren._id,
            serviceName: svc.service_name,
            issueDate: svc.createdAt || svc.start_date,
            dueDate: ren.date || null,
            amount: Number(ren.price || svc.price || 0),
            paid: hasPaid,
            isOverdue,
            raw: svc
          })
        })
      }
    })

    return r
  }, [assigned])

  // Filtering & search
  const filtered = useMemo(() => {
    const filteredRows = rows.filter((row) => {
      const q = search.trim().toLowerCase()
      if (q) {
        const match = String(row.invoiceId || row.serviceId || row.serviceName || '').toLowerCase()
        if (!match.includes(q)) return false
      }

      if (status === 'paid') return !!row.paid
      if (status === 'unpaid') return !row.paid && !row.isOverdue
      if (status === 'overdue') return !!row.isOverdue
      return true
    })

    // Sort to show unpaid at the top
    return filteredRows.sort((a, b) => {
      // Priority: overdue > unpaid > paid
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      if (!a.paid && b.paid) return -1
      if (a.paid && !b.paid) return 1
      return 0
    })
  }, [rows, search, status])

  const openInvoice = (row: any) => {
    setViewInvoiceData(row.raw)
    setInvoiceOpen(true)
  }

  return (
    <div className="space-y-6">
      {loading && <SpinnerComponent />}
      <Header title="Invoices" description="View and pay your invoice" />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search invoices..." 
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={status === 'all' ? 'default' : 'outline'}
            className={status === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            onClick={() => setStatus('all')}
          >
            All
          </Button>
          <Button 
            variant={status === 'unpaid' ? 'default' : 'outline'}
            className={status === 'unpaid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            onClick={() => setStatus('unpaid')}
          >
            Unpaid
          </Button>
          <Button 
            variant={status === 'overdue' ? 'default' : 'outline'}
            className={status === 'overdue' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            onClick={() => setStatus('overdue')}
          >
            Overdue
          </Button>
          <Button 
            variant={status === 'paid' ? 'default' : 'outline'}
            className={status === 'paid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            onClick={() => setStatus('paid')}
          >
            Paid
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr className="text-sm text-gray-500 dark:text-gray-400">
              <th className="p-4 font-medium">Invoice</th>
               <th className="p-4 font-medium">Service Name</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Issue Date</th>
              <th className="p-4 font-medium">Due Date</th>
              <th className="p-4 font-medium text-right">Amount</th>
              <th className="p-4 font-medium text-right">Amount</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr 
                key={idx} 
                className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {row.invoiceId || `INV-${String(row.serviceId).slice(-6)}`}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {row.serviceName || '-'}
                  </div>
                </td>

                <td className="p-4">
                  <Badge 
                    variant={row.paid ? 'default' : row.isOverdue ? 'destructive' : 'secondary'}
                    className={
                      row.paid 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300' 
                        : row.isOverdue 
                          ? 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
                    }
                  >
                    {row.paid ? 'Paid' : row.isOverdue ? 'Overdue' : 'Sent'}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                  {row.issueDate ? new Date(row.issueDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '-'}
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                  {row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '-'}
                </td>
                <td className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  {row.amount > 0 ? `$${row.amount.toLocaleString()}` : '-'}
                </td>
                <td className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  {row.amount > 0 ? `$${row.amount.toLocaleString()}` : '-'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                 
                    <button 
                      title="View" 
                      onClick={() => openInvoice(row)} 
                      className="inline-flex items-center justify-center p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Eye className="h-4 w-4"/>
                    </button>
                    {!row.paid && (
                        <Link href='/admin/billing'>
                      <Button 

                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        Pay Now
                      </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-500 dark:text-gray-400">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    
     

      {/* Invoice Modal */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[900px] max-h-[95vh] p-0 gap-0 overflow-hidden">
          {viewInvoiceData && (
            <InvoiceView assignmentData={viewInvoiceData} onClose={() => setInvoiceOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InvoicesPage