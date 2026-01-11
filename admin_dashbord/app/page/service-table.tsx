'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { deleteService, toggleServiceStatus, setSelectedService, fetchServices, assignServiceToClient } from '@/lib/redux/slices/serviceSlice';
import { fetchProfile } from '@/lib/redux/slices/profileSlice';
import { Service } from '@/types/service';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2,  ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DateRangePicker from '@/components/ui/date-range-picker';
import SpinnerComponent from './common/Spinner';

interface ServiceTableProps {
  onEdit: (service: Service) => void;
  categoryFilter?: string;
}

const ITEMS_PER_PAGE = 10;

export default function ServiceTable({ onEdit, categoryFilter = 'all' }: ServiceTableProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { services, loading, page: storePage, limit: storeLimit, total, totalPages } = useAppSelector((state) => state.services);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(storePage || 1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewService, setSelectedViewService] = useState<Service | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningService, setAssigningService] = useState<Service | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [assignStatus, setAssignStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [assignStartDate, setAssignStartDate] = useState<string>('');
  const [assignRenewalDate, setAssignRenewalDate] = useState<string | null>(null);
  const [assignCycle, setAssignCycle] = useState<'monthly' | 'annual' | 'none'>('monthly');
  const [assignPrice, setAssignPrice] = useState<number | undefined>(undefined);
  const [assignAutoInvoice, setAssignAutoInvoice] = useState<boolean>(false);
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [clickImage ,setClickImage] = useState<string>('');
  const router = useRouter();
  const profileState = useAppSelector((s) => s.profile);
  const profiles = Array.isArray(profileState.profile) ? profileState.profile : profileState.profile ? [profileState.profile] : [];


  // Fetch services when page or category changes (server-driven pagination)
  useEffect(() => {
    dispatch(fetchServices({ page: currentPage, limit: storeLimit, category: categoryFilter === 'all' ? undefined : categoryFilter } as any));
  }, [dispatch, currentPage, storeLimit, categoryFilter]);

  // ensure user list is available
  useEffect(() => {
    dispatch(fetchProfile({}));
  }, [dispatch]);

  const formatBillingType = (type: string) => {
    const formats: Record<string, string> = {
      one_time: 'One Time',
      monthly: 'Monthly',
      yearly: 'Yearly',
      pay_as_you_go: 'Pay as you go',
    };
    return formats[type] || type;
  };

  const formatPrice = (price: number, billingType: string, currency?: string) => {
    const cur = currency || 'USD';
    const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(price);
    if (billingType === 'monthly') return `${formatted}/mo`;
    if (billingType === 'yearly') return `${formatted}/yr`;
    return formatted;
  };

  const handleToggleStatus = async (_id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await dispatch(toggleServiceStatus({ _id, status: newStatus })).unwrap();
      toast({
        title: 'Success',
        description: `Service ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle service status',
        variant: 'destructive',
      });
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteClick = (_id: string) => {
    setServiceToDelete(_id);
    setDeleteDialogOpen(true);
  };

  const openAssignDialog = (service: Service) => {
    setAssigningService(service);
    // prefill start date to today
    setAssignStartDate(new Date().toISOString().slice(0, 10));
    setAssignRenewalDate(null);
    setSelectedClient(null);
    setAssignPrice(service.price);
    setAssignNotes('');
    setAssignCycle(service.billingType === 'monthly' ? 'monthly' : 'none');
    setAssignAutoInvoice(false);
    setAssignStatus('active');
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!assigningService || !selectedClient) {
      toast({ title: 'Error', description: 'Please select a client' , variant: 'destructive'});
      return;
    }
    const payload = {
      id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`,
      client_id: selectedClient,
      service_catalog_id: (assigningService as any)._id || (assigningService as any).id,
      status: assignStatus,
      start_date: assignStartDate,
      renewal_date: assignRenewalDate || null,
      cycle: assignCycle,
      price: assignPrice,
      auto_invoice: assignAutoInvoice,
      notes: assignNotes,
    } as any;
    try {
      await dispatch(assignServiceToClient(payload)).unwrap();
      toast({ title: 'Success', description: 'Service assigned to client' });
      setAssignDialogOpen(false);
      setAssigningService(null);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to assign service', variant: 'destructive' });
      console.error('assign error', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      try {
        await dispatch(deleteService(serviceToDelete)).unwrap();
        toast({
          title: 'Success',
          description: 'Service deleted successfully',
        });
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete service',
          variant: 'destructive',
        });
        console.error('Failed to delete service:', error);
      }
    }
  };

  if (loading && services.length === 0) {
    return (
      <>
        <SpinnerComponent />
      </>
    
    );
  }

  const handleViewClick = (service: Service) => {
    setSelectedViewService(service);
    setViewDialogOpen(true);
  };


  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center ">
        <h3 className="text-lg font-semibold mb-2">No services found</h3>
        <p className="text-sm text-muted-foreground">
          {categoryFilter === 'all' ? 'Create your first service to get started' : 'No services in this category'}
        </p>
      </div>
    );
  }
  // Pagination indices (server-driven)
  const effectiveTotalPages = totalPages || Math.ceil((total || 0) / (storeLimit || ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * (storeLimit || ITEMS_PER_PAGE);
  const endIndex = startIndex + (storeLimit || ITEMS_PER_PAGE);
  const paginatedServices = services;





  return (
    <>
    {
      clickImage && (
        <Dialog open={Boolean(clickImage)} onOpenChange={() => setClickImage('')}>
          <DialogContent className="overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Service Image</DialogTitle>
              <DialogDescription>Full size view of the service image</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center ">
              <img src={clickImage} alt="Service Full Size" className="max-w-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      )

    }
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index</TableHead>
              <TableHead>       Image</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assign to Client</TableHead>
              <TableHead> Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((service , index) => (
              <TableRow key={(service as any)._id || (service as any).id}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell
                  onClick={() => {  
                    const imgSrc = (service as any).image || (service as any).imageUrl || '';
                    setClickImage(imgSrc);
                    }
                  }
                  className="cursor-pointer"
                >

                  {((service as any).image || (service as any).imageUrl) ? (
                    (() => {
                      const src = (service as any).image || (service as any).imageUrl || '';
                      return (
                        <Image
                          src={src}
                          alt={service.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      );
                    })()
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      N/A
                    </div>
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{service.name}</div>
                
                  </div>
                </TableCell>
                  <TableCell className="font-medium">
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="truncate max-w-xs block">{service.description.slice(0,40)} {service.description.length > 40 ? "..." : ""}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {service.description}
                      </TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{service.categoryName || 'Unknown'}</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatPrice(service.price, service.billingType, service.currency)}
                </TableCell>
                <TableCell>  <div>{  formatBillingType(service.billingType) }</div></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.status === 'active'}
                      onCheckedChange={() => handleToggleStatus((service as any)._id || (service as any).id, service.status)}
                      disabled={loading}
                    />
                    <Badge
                      variant={service.status === 'active' ? 'secondary' : 'default'}
                      className="capitalize"
                    >
                      {service.status}
                    </Badge>
                                      </div>
                                      
                </TableCell>
                <TableCell>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAssignDialog(service)}
                  >
                    Assign
                  </Button>
                </TableCell>
                <TableCell>
                  {new Date(service.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                     
                      <DropdownMenuItem
                        onClick={() => handleViewClick(service)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(service)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick((service as any)._id || (service as any).id)}
                        className="cursor-pointer text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {effectiveTotalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, total || 0)} of {total || 0} services
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, effectiveTotalPages))}
              disabled={currentPage === effectiveTotalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl  max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>View complete service information</DialogDescription>
          </DialogHeader>
          {selectedViewService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Name</label>
                  <p className="text-lg font-semibold">{selectedViewService.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-lg">
                    <Badge variant="outline">{selectedViewService.categoryName || 'Unknown'}</Badge>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base mt-1">{selectedViewService.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(selectedViewService.price, selectedViewService.billingType, selectedViewService.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Type</label>
                  <p className="text-lg">{formatBillingType(selectedViewService.billingType)}</p>
                </div>
              </div>
              {/* Additional details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>
                    <Badge variant={selectedViewService.status === 'active' ? 'default' : 'secondary'}>
                      {selectedViewService.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="text-lg">{selectedViewService.currency || 'AUD'}</p>
                </div>
              </div>

              {selectedViewService.hasDiscount && (
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Discount</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="text-sm text-muted-foreground">Type</label>
                      <p>{selectedViewService.discountType || 'percentage'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Value</label>
                      <p>{selectedViewService.discountValue ?? selectedViewService.discountPercentage ?? 0}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <p>{selectedViewService.discountStartDate || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <p>{selectedViewService.discountEndDate || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedViewService.tags && selectedViewService.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex gap-2 mt-2">
                    {selectedViewService.tags.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedViewService.features && selectedViewService.features.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Features</label>
                  <ul className="list-disc pl-5 mt-2">
                    {selectedViewService.features.map((f, i) => (
                      <li key={i} className="text-sm">{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Featured</label>
                  <p>{selectedViewService.isFeatured ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration (days)</label>
                  <p>{selectedViewService.durationInDays ?? '—'}</p>
                </div>
              </div>

              {selectedViewService.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Internal Notes</label>
                  <p className="mt-1">{selectedViewService.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>
                    <Badge variant={selectedViewService.status === 'active' ? 'default' : 'secondary'}>
                      {selectedViewService.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="text-lg">{selectedViewService.currency || 'AUD'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign to client dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Service to Client</DialogTitle>
            <DialogDescription>Fill details for assigning this service to a client</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className=' pb-2'>Client</Label>
              <Select value={selectedClient || ''} onValueChange={(v) => setSelectedClient(v || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select client " />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((u: any) => (
                    <SelectItem key={u._id || u.email} value={u._id}>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className=' pb-2'>Status</Label>
                <Select value={assignStatus} onValueChange={(v) => setAssignStatus(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className=' pb-2'>Cycle</Label>
                <Select value={assignCycle} onValueChange={(v) => setAssignCycle(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className=' pb-2'>Start / Complite  date</Label>
              <DateRangePicker
                value={{ from: assignStartDate || null, to: assignRenewalDate || null }}
                onChange={(v) => {
                  setAssignStartDate(v.from || '');
                  setAssignRenewalDate(v.to || null);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className=' pb-2'>Price (override)</Label>
                <Input type="number" value={assignPrice ?? ''} onChange={(e) => setAssignPrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div className="flex flex-col">
                <Label className=' pb-2'>Auto invoice</Label>
                <div className="mt-2">
                  <Switch checked={assignAutoInvoice} onCheckedChange={(v) => setAssignAutoInvoice(Boolean(v))} />
                </div>
              </div>
            </div>

            <div>
              <Label className=' pb-2'>Notes (internal)</Label>
              <Textarea value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignSubmit}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
