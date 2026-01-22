'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/app/page/common/header'
import { getMee } from '@/lib/redux/slices/meeSlice'
import { fetchProfileByEmail } from "@/lib/redux/slices/profileSlice"
import { createNotice, fetchNotices } from "@/lib/redux/slices/noticSlicer"
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'

import { Calendar, User, Mail, Phone, Loader2, Eye } from 'lucide-react'
import { format } from 'date-fns'

function ContractManagementPage() {
  const dispatch = useAppDispatch()
  const { data: meeData } = useAppSelector((state) => state.mee)
  const { profile } = useAppSelector((state) => state.profile)
  const { notices, loading: noticesLoading ,total } = useAppSelector((state) => state.notices)

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<any>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    message: ''
  })

  // Prefill form when profile is available
  useEffect(() => {
    if (profile) {
      // profile might be an array or object based on slice logic
      const p = Array.isArray(profile) ? profile[0] : profile
      if (p) {
        setFormData(prev => ({
          ...prev,
          firstName: p.firstName || p.name?.split(' ')[0] || '',
          lastName: p.lastName || p.name?.split(' ')[1] || '',
          email: p.email || '',
          phone: p.phone || ''
        }))
      }
    }
  }, [profile])

  useEffect(() => {
    if (!meeData) {
      dispatch(getMee())
    }
    if (meeData?.email && !profile) {
      dispatch(fetchProfileByEmail(meeData.email))
    }
    dispatch(fetchNotices(meeData?.email))
  }, [dispatch, meeData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await dispatch(createNotice(formData)).unwrap()
      toast.success('Contract added successfully')
      setOpen(false)
      setFormData(prev => ({ ...prev, title: '', message: '' }))
    } catch (error: any) {
      toast.error(error || 'Failed to add contract')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="">
      <Header
        title="Contract Management"
        description="Manage your system contracts and notices."
        buttonText='Add Contract'
        onButtonClick={() => setOpen(true)}
        total={total}
      />

      <div className="mt-3">


        <div className="rounded-lg ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {noticesLoading && notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                notices?.filter(notice => notice !== null && notice !== undefined).map((notice) => (
                  <TableRow key={notice._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium uppercase">{notice?.firstName} {notice?.lastName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {notice?.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {notice?.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="space-y-1 max-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium truncate cursor-pointer hover:underline">{notice?.title}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{notice?.title}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground truncate cursor-pointer hover:underline">{notice?.message}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{notice?.message}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notice?.status ? "default" : "secondary"}>
                        {notice?.status ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {notice?.createdAt ? format(new Date(notice.createdAt), 'MMM d, yyyy') : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedNotice(notice)
                          setViewDetailsOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Contract</DialogTitle>
            <DialogDescription>
              Create a new contract notice. Some fields are pre-filled from your profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                disabled
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  required
                  className='cursor-not-allowed'

                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Contract Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ente contract title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message / Description</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your message here..."
                rows={4}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Contract
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              Full details of the selected contract notice.
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">User</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <p className="font-medium">{selectedNotice.firstName} {selectedNotice.lastName}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                  <div>
                    <Badge variant={selectedNotice.status ? "default" : "secondary"}>
                      {selectedNotice.status ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedNotice.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedNotice.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Title</Label>
                <p className="text-lg font-semibold">{selectedNotice.title}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Message</Label>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedNotice.message}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Created Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {selectedNotice.createdAt ? format(new Date(selectedNotice.createdAt), 'PPP p') : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContractManagementPage