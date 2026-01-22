'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchTickets, deleteTicket } from '@/lib/redux/slices/ticketSlice'
import { getMee } from '@/lib/redux/slices/meeSlice'
import Header from '@/app/page/common/header'
import { Button } from '@/components/ui/button'
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
import { Loader2, MoreVertical, Eye, Trash2, Edit, Plus } from 'lucide-react'
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
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-200'
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'in-progress': return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'resolved': return 'bg-green-500/10 text-green-600 border-green-200'
      case 'closed': return 'bg-gray-500/10 text-gray-600 border-gray-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  return (
    <div>
      <Header
        title="Support Tickets"
        description="Manage your service support tickets"
        buttonText="Create Ticket"
        onButtonClick={() => router.push('/admin/open_ticket/create')}
        total={total}
        icon={<Plus className="h-6 w-6" />}
      />

      <div className="mt-6">
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
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tickets found. Create your first ticket!
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell className="font-medium">
                    {ticket.assignedServiceName}
                  </TableCell>
                  <TableCell>{ticket.problemType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                          variant="destructive"
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
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {ticketToDelete && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Service: <span className="font-medium">{ticketToDelete.assignedServiceName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Problem: <span className="font-medium">{ticketToDelete.problemType}</span>
              </p>
            </div>
          )}
          <DialogFooter>
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
