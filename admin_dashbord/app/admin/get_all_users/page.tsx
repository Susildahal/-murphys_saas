'use client'
import React from 'react'
import Header from '@/app/page/common/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchProfile, deleteProfile } from '@/lib/redux/slices/profileSlice';
import { useAppDispatch } from '@/lib/redux/hooks'
import { useAppSelector } from '@/lib/redux/hooks'
import { useEffect } from 'react';
import DeleteModel from '@/app/page/common/DeleteModel';
import Pagination from '@/app/page/common/Pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreVertical, Search, Mail, Phone, Calendar, Briefcase, User, MapPin, Clock, Send, User2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { showSuccessToast, showErrorToast } from '@/lib/toast-handler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
function Page() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const dispatch = useAppDispatch();
  const profileState = useAppSelector((state) => state.profile);
  const { profile, loading, error, total, page, limit, totalPages } = profileState;
  const [viewUser, setViewUser] = React.useState<any | null>(null);
  const [updatingUser, setUpdatingUser] = React.useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = React.useState(false);
  const [emailData, setEmailData] = React.useState({ userId: '', userName: '', userEmail: '', title: '', message: '' });

  const profiles = Array.isArray(profile) ? profile : (profile ? [profile] : []);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchProfile({ page: currentPage, limit: 10, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, currentPage, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };
  const openEmailModal = (user: any) => {
    setEmailData({
      userId: user._id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      userEmail: user.email,
      title: '',
      message: ''
    });
    setEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    try {
      const res = await axiosInstance.post('/send-email', {
        to: emailData.userEmail,
        subject: emailData.title,
        body: emailData.message,
      });
      console.log('Send email response:', res?.data);
      showSuccessToast(res?.data?.message || 'Email sent successfully.');
      setEmailModalOpen(false);
      setEmailData({ userId: '', userName: '', userEmail: '', title: '', message: '' });
    } catch (error: any) {
      console.error('Failed to send email:', error);
      showErrorToast(error?.response?.data?.message || error?.message || 'Failed to send email');
    }
  };
  const handelDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteProfile(deleteId)).unwrap();
      showSuccessToast('User deleted successfully');
      setDeleteId(null);
      dispatch(fetchProfile({ page: currentPage, limit: 10, search: searchTerm }));
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to delete user');
    }
  }
    
  return (
    <div className="space-y-3  overflow-x-hidden"> 
      <Header
        title="All Users"
        description="Manage and view all registered users"
        buttonText="Invite Users"
        link="/admin/invte_users"
        icon={null}
        onButtonClick={() => {
          window.location.href = '/admin/invte_users';
        }}
        total={total}
        extra={
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text" 
              className="pl-10" 
            />
          </div>
        }
      />

      <div className="space-y-4">
        <div className=" border-none verflow-hidden  lg:w-[calc(100vw-300px)] overflow-x-auto">  
          <Table className=" overflow-x-hidden   ">
            <TableHeader>
              <TableRow className=" border-b">
                <TableHead className="">Image</TableHead>
                <TableHead>   Name</TableHead>
                <TableHead> Contract</TableHead>
                <TableHead className=" w-[100px]">Role Type</TableHead>
                <TableHead className="">City</TableHead>
                <TableHead className="">Country</TableHead>
                <TableHead className="">Joined</TableHead>
                <TableHead className="text-right  font-medium text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-12 h-12 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((u: any, i: number) => (
                  <TableRow key={u._id || u.email || i} className="border-b hover:bg-muted/50 transition-colors">
                    <TableCell className="px-3 py-2 sm:p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.profile_image} alt={u.firstName || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(u.firstName, u.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className=" ">
                      <div className="flex flex-col">
                        <span className="font-medium">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '-'}</span>
                        <span className="text-xs text-muted-foreground">{u.email || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className=" ">
                      <div className="flex flex-col gap-1">
                        {u.email && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs">{u.email}</span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs">{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{u.role_type || '-'}</TableCell>
                    <TableCell className="">{u.city || '-'}</TableCell>
                    <TableCell className="">{u.country || '-'}</TableCell>
                 
                    <TableCell className=" ">
                      <span className="text-sm text-muted-foreground">
                        {u.createdAt ? new Date(String(u.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 cursor-pointer rotate-90" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewUser(u)}>
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        
                          <DropdownMenuItem onClick={() => openEmailModal(u)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/admin/assign_service/${u._id}`}>
                            <User2 className="mr-2 h-4 w-4" />
                            Assign Service to client
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setDeleteId(u._id)} className="text-red-600">
                            <User2 className="mr-2 h-4 w-4" />
                           Delete User
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
        
        <Pagination 
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Delete Modal */}
      <DeleteModel 
        deleteId={deleteId}
        onsuccess={handelDelete}
      />

      {/* Enhanced View Details Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => { if (!open) setViewUser(null); }}>
        <DialogContent className="w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={viewUser?.profile_image} alt={viewUser?.firstName || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                  {viewUser && getInitials(viewUser.firstName, viewUser.lastName)}
                </AvatarFallback>
              </Avatar>
                <div>
                <DialogTitle className="text-2xl">
                  {viewUser && `${viewUser.firstName || ''} ${viewUser.lastName || ''}`.trim()}
                </DialogTitle>
                <DialogDescription>
                  {viewUser?.role_type || viewUser?.role || 'User'} • {viewUser?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Contact Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{viewUser?.email || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{viewUser?.phone || '-'}</p>
                  </div>
                  {viewUser?.address && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Address
                      </p>
                      <p className="text-sm font-medium">{viewUser.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bio</p>
                    <p className="text-sm font-medium">{viewUser?.bio || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{viewUser?.department || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge variant="outline">{viewUser?.role || 'User'}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="text-sm font-medium break-words">{viewUser?.website ? (
                      <a href={viewUser.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">{viewUser.website}</a>
                    ) : ('-')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Important Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewUser?.dob && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-medium">
                        {new Date(viewUser.dob).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  {viewUser?.doj && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date of Joining</p>
                      <p className="text-sm font-medium">
                        {new Date(viewUser.doj).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  {viewUser?.createdAt && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Account Created
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(viewUser.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  {viewUser?.updatedAt && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium">
                        {new Date(viewUser.updatedAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {viewUser && Object.entries(viewUser)
              .filter(([k]) => !['_id', 'firstName', 'lastName', 'email', 'phone', 'profile_image', 
                'position', 'department', 'role', 'status', 'address', 'dob', 'doj', 
                'createdAt', 'updatedAt', 'invite_type', 'inviteStatus', 'invite_status', '__v'].includes(k))
              .length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(viewUser)
                      .filter(([k]) => !['_id', 'firstName', 'lastName', 'email', 'phone', 'profile_image', 
                        'position', 'department', 'role', 'status', 'address', 'dob', 'doj', 
                        'createdAt', 'updatedAt', 'invite_type', 'inviteStatus', 'invite_status', '__v'].includes(k))
                      .map(([key, val]) => (
                        <div key={key} className="space-y-1">
                          <p className="text-xs text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-medium">{String(val ?? '-')}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                  Compose an email to {emailData.userName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input 
                id="recipient"
                value={emailData.userEmail}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Email Subject</Label>
              <Input 
                id="title"
                placeholder="Enter email subject..."
                value={emailData.title}
                onChange={(e) => setEmailData({ ...emailData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message"
                placeholder="Type your message here..."
                rows={8}
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSendEmail}
              disabled={!emailData.title || !emailData.message}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Page