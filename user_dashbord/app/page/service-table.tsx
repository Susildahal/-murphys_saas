'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {  fetchServices } from '@/lib/redux/slices/serviceSlice';
import { addToCart, getCart } from '@/lib/redux/slices/cartSlice';
import { Service } from '@/types/service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MoreHorizontal, ChevronLeft, ChevronRight, Eye, CheckCircle2, Info, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SpinnerComponent from './common/Spinner';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface ServiceTableProps {
  categoryFilter?: string;
}

const ITEMS_PER_PAGE = 10;

export default function ServiceTable({ categoryFilter = 'all' }: ServiceTableProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { services, loading, page: storePage, limit: storeLimit, total, totalPages } = useAppSelector((state) => state.services);
  const {loading: cartLoading} = useAppSelector((state) => state.cart);

  const [currentPage, setCurrentPage] = useState(storePage || 1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewService, setSelectedViewService] = useState<Service | null>(null);
  const [clickImage, setClickImage] = useState<string>('');
  const meeState = useAppSelector((s) => s.mee);
  const userid = meeState.data?.uid || '';

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedServices = useMemo(() => {
    let items = [...services];
    if (sortConfig !== null) {
      items.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle specific fields
        if (sortConfig.key === 'price') {
          // numeric sort
          aValue = Number(a.price);
          bValue = Number(b.price);
        } else if (sortConfig.key === 'createdAt') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [services, sortConfig]);

  // Fetch services when page or category changes (server-driven pagination)
  useEffect(() => {
    dispatch(fetchServices({ page: currentPage, limit: storeLimit, category: categoryFilter === 'all' ? undefined : categoryFilter } as any));
  }, [dispatch, currentPage, storeLimit, categoryFilter]);

  // Fetch cart on component mount
  useEffect(() => {
    if (userid) {
      dispatch(getCart(userid));
    }
  }, [dispatch, userid]);

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



  const handleAddToCart = async (service: Service) => {
    if (!userid) {
      toast({ 
        title: 'Error', 
        description: 'Please log in to add items to cart', 
        variant: 'destructive' 
      });
      return;
    }
    
    const serviceId = (service as any)._id || (service as any).id;
    try {
      await dispatch(addToCart({ userid, serviceId })).unwrap();
      toast({ 
        title: 'Success', 
        description: `${service.name} added to cart!`,
      });
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: 'Failed to add to cart', 
        variant: 'destructive' 
      });
      console.error('add to cart error', err);
    }
  };



 

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
      loading && <SpinnerComponent />
    }

{
  cartLoading && <SpinnerComponent />
  
}
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
      
      {/* Card Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedServices.map((service, index) => (
          <Card key={(service as any)._id || (service as any).id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
            <CardHeader className="space-y-0 pb-3">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none mb-2">
                    {service.categoryName || 'Unknown'}
                  </Badge>
                  <CardTitle className="text-lg line-clamp-1">{service.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-[10px] mt-1 px-1 py-0 h-4 font-normal opacity-70">
                    ID: {((service as any)._id || (service as any).id).slice(-6)}
                  </Badge>
                </div>
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
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Service Image */}
              <div 
                onClick={() => {
                  const imgSrc = (service as any).image || (service as any).imageUrl || '';
                  if (imgSrc) setClickImage(imgSrc);
                }}
                className="cursor-pointer w-full aspect-video rounded-lg overflow-hidden bg-muted mb-3"
              >
                {((service as any).image || (service as any).imageUrl) ? (
                  <Image
                    src={(service as any).image || (service as any).imageUrl}
                    alt={service.name}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              <CardDescription className="line-clamp-2 text-sm">
                {service.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Price */}
              <div className="flex flex-col">
                {service.hasDiscount && service.discountValue ? (
                  <>
                    <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                      {formatPrice(service.price, service.billingType, service.currency)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-bold text-emerald-600">
                        {(() => {
                          const disc = service.discountType === 'percentage'
                            ? service.price - (service.price * (service.discountValue || 0) / 100)
                            : service.price - (service.discountValue || 0);
                          return formatPrice(disc, service.billingType, service.currency);
                        })()}
                      </span>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-4 px-1 border-none">
                        Sale
                      </Badge>
                    </div>
                  </>
                ) : (
                  <span className="text-2xl font-bold">
                    {formatPrice(service.price, service.billingType, service.currency)}
                  </span>
                )}
                <span className="text-xs font-medium text-muted-foreground mt-1">
                  {formatBillingType(service.billingType)}
                </span>
              </div>

              <Separator />

            

              {/* Actions */}
              <Button
                size="sm"
                onClick={() => handleAddToCart(service)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {effectiveTotalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-6 mt-6">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Service Details</DialogTitle>
            <DialogDescription>Full summary for {selectedViewService?.name}</DialogDescription>
          </DialogHeader>

          {selectedViewService && (
            <div className="space-y-6 py-4">
              <div className="flex gap-6 items-start">
                <div className="relative group shrink-0">
                  {((selectedViewService as any).image || (selectedViewService as any).imageUrl) ? (
                    <img
                      src={(selectedViewService as any).image || (selectedViewService as any).imageUrl}
                      alt=""
                      className="w-32 h-32 rounded-xl object-cover border-4 border-muted shadow-sm"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border-4 border-muted">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 uppercase tracking-wider text-[10px]">
                    {selectedViewService.categoryName}
                  </Badge>
                  <h3 className="text-2xl font-bold tracking-tight">{selectedViewService.name}</h3>
                  <div className="flex items-center gap-3">
                    {selectedViewService.hasDiscount && selectedViewService.discountValue ? (
                      <>
                        <span className="text-3xl font-extrabold text-emerald-600">
                          {(() => {
                            const disc = selectedViewService.discountType === 'percentage'
                              ? selectedViewService.price - (selectedViewService.price * (selectedViewService.discountValue || 0) / 100)
                              : selectedViewService.price - (selectedViewService.discountValue || 0);
                            return formatPrice(disc, selectedViewService.billingType, selectedViewService.currency);
                          })()}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground line-through decoration-destructive/40">
                            {formatPrice(selectedViewService.price, selectedViewService.billingType, selectedViewService.currency)}
                          </span>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[11px] h-5">
                            {selectedViewService.discountType === 'percentage'
                              ? `${selectedViewService.discountValue}% OFF`
                              : `Save ${formatPrice(selectedViewService.discountValue || 0, 'one_time', selectedViewService.currency)}`}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <span className="text-3xl font-extrabold">
                        {formatPrice(selectedViewService.price, selectedViewService.billingType, selectedViewService.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Billing Cycle</label>
                  <p className="text-sm font-medium capitalize">{formatBillingType(selectedViewService.billingType)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Status</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Description</label>
                <div className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
                  {selectedViewService.description}
                </div>
              </div>

              {selectedViewService.features && selectedViewService.features.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Included Features</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {selectedViewService.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedViewService.hasDiscount && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Info className="w-3 h-3" /> Promotion Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Promo Period</span>
                      <span className="font-semibold text-amber-900">
                        {selectedViewService.discountStartDate ? format(new Date(selectedViewService.discountStartDate), 'MMM dd, yyyy') : 'No start'}
                        {' → '}
                        {selectedViewService.discountEndDate ? format(new Date(selectedViewService.discountEndDate), 'MMM dd, yyyy') : 'No end'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Reason</span>
                      <span className="font-semibold text-amber-900">{selectedViewService.discountReason || 'Seasonal Offer'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>


    </>
  );
}
