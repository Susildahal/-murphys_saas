'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchTickets, deleteTicket } from '@/lib/redux/slices/ticketSlice'
import { getMee } from '@/lib/redux/slices/meeSlice'
import Header from '@/app/page/common/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, MoreVertical, Eye, Trash2, Edit, Plus, TicketIcon, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function OpenTicketPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { tickets, loading, total } = useAppSelector((state) => state.tickets)
  const { data: meeData } = useAppSelector((state) => state.mee)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!meeData) {
      dispatch(getMee())
    }
  }, [dispatch, meeData])

  useEffect(() => {
    if (meeData?.uid) {
      dispatch(fetchTickets({ userId: meeData.uid }))
    }
  }, [dispatch, meeData])

  const handleDelete = async () => {
    if (!ticketToDelete) return
    setDeleting(true)
    try {
      await dispatch(deleteTicket(ticketToDelete._id)).unwrap()
      toast.success('Ticket deleted successfully')
      setDeleteDialogOpen(false)
      setTicketToDelete(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete ticket')
    } finally {
      setDeleting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400'
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400'
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400'
      case 'in-progress': return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400'
      case 'resolved': return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400'
      case 'closed': return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400'
    }
  }

  // Calculate stats
  const stats = React.useMemo(() => {
    const open = tickets.filter(t => t.status === 'open').length
    const inProgress = tickets.filter(t => t.status === 'in-progress').length
    const resolved = tickets.filter(t => t.status === 'resolved').length
    const urgent = tickets.filter(t => t.priority === 'urgent').length
    return { open, inProgress, resolved, urgent }
  }, [tickets])

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent ">
      <Header
        title="Support Tickets"
        description="Manage your service support tickets"
        buttonText="Create Ticket"
        onButtonClick={() => router.push('/admin/open_ticket/create')}
        total={total}
        icon={<Plus className="h-6 w-6" />}
      />

      <div className="max-w-7xl mx-auto  space-y-8">
        {/* Stats Overview */}
        {tickets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
                <TicketIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.open}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Urgent</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.urgent}</div>
                <p className="text-xs text-muted-foreground mt-1">High priority items</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tickets Table */}
        <div className="">
          <CardHeader className="">
          
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Problem Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading tickets...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <TicketIcon className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No tickets found</p>
                        <p className="text-xs text-muted-foreground">Create your first ticket to get started</p>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => router.push('/admin/open_ticket/create')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Ticket
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <TicketIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="truncate max-w-[200px]">{ticket.assignedServiceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{ticket.problemType}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getStatusColor(ticket.status)}`}>
                          {ticket.status === 'in-progress' ? 'In Progress' : ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                              <MoreVertical className="h-4 w-4 rotate-90" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/open_ticket/${ticket._id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/open_ticket/${ticket._id}?edit=true`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setTicketToDelete(ticket)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Ticket
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {ticketToDelete && (
            <div className="py-4 space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TicketIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Service</p>
                    <p className="text-sm font-medium">{ticketToDelete.assignedServiceName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Problem Type</p>
                    <p className="text-sm font-medium">{ticketToDelete.problemType}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`capitalize ${getPriorityColor(ticketToDelete.priority)}`}>
                      {ticketToDelete.priority}
                    </Badge>
                    <Badge variant="outline" className={`capitalize ${getStatusColor(ticketToDelete.status)}`}>
                      {ticketToDelete.status === 'in-progress' ? 'In Progress' : ticketToDelete.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setTicketToDelete(null)
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleting ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
