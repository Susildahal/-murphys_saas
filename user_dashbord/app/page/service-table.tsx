'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchServices } from '@/lib/redux/slices/serviceSlice';
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

import { MoreVertical, ChevronLeft, ChevronRight, Eye, CheckCircle2, Info, ShoppingCart, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card'; // We only need base Card and Content for custom layout
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
    const { loading: cartLoading } = useAppSelector((state) => state.cart);

    const [currentPage, setCurrentPage] = useState(storePage || 1);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedViewService, setSelectedViewService] = useState<Service | null>(null);
    const [clickImage, setClickImage] = useState<string>('');
    const meeState = useAppSelector((s) => s.mee);
    const userid = meeState.data?.uid || '';

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // ... (Keep existing sorting logic)
    const sortedServices = useMemo(() => {
        let items = [...services];
        if (sortConfig !== null) {
            items.sort((a: any, b: any) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (sortConfig.key === 'price') {
                    aValue = Number(a.price);
                    bValue = Number(b.price);
                } else if (sortConfig.key === 'createdAt') {
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = (bValue || '').toLowerCase();
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [services, sortConfig]);

    useEffect(() => {
        dispatch(fetchServices({ page: currentPage, limit: ITEMS_PER_PAGE, category: categoryFilter === 'all' ? undefined : categoryFilter } as any));
    }, [dispatch, currentPage, categoryFilter]);

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
            pay_as_you_go: 'PAYG',
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
            // Navigate to cart page
            window.location.href = '/admin/cart';
        } catch (err: any) {
            const errorMessage = err || 'Failed to add to cart';
            toast({
                title: errorMessage.includes('already in your cart') ? 'Already in Cart' : 'Error',
                description: errorMessage,
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
            <div className="">
                <SpinnerComponent />
               
            </div>
        );
    }

    const effectiveTotalPages = totalPages || Math.ceil((total || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return (
        <>
            {(loading || cartLoading) && <SpinnerComponent />}

            {clickImage && (
                <Dialog open={Boolean(clickImage)} onOpenChange={() => setClickImage('')}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                        <div className="relative w-full h-full flex justify-center items-center">
                            <img 
                                src={clickImage} 
                                alt="Service Full Size" 
                                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" 
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* NEW GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                {sortedServices.map((service) => {
                    const hasDiscount = service.hasDiscount && service.discountValue;
                    const finalPrice = hasDiscount
                        ? (service.discountType === 'percentage'
                            ? service.price - (service.price * (service.discountValue || 0) / 100)
                            : service.price - (service.discountValue || 0))
                        : service.price;

                    return (
                        <Card 
                            key={(service as any)._id || (service as any).id} 
                            className="group relative flex flex-col h-full overflow-hidden border-border/60 bg-card hover:shadow-xl hover:border-border/80 transition-all duration-300 rounded-xl"
                        >
                            {/* 1. Full Bleed Image Header */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                                {((service as any).image || (service as any).imageUrl) ? (
                                    <Image
                                        src={(service as any).image || (service as any).imageUrl}
                                        alt={service.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/30">
                                        <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                                        <span className="text-xs font-medium">No Preview</span>
                                    </div>
                                )}
                                
                                {/* Floating Badges */}
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                    <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm text-foreground/80 shadow-sm border font-medium">
                                        {service.categoryName || 'General'}
                                    </Badge>
                                </div>

                                {hasDiscount && (
                                     <div className="absolute top-3 right-3 z-10">
                                        <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none shadow-sm px-2">
                                            {service.discountType === 'percentage' ? `-${service.discountValue}%` : 'SALE'}
                                        </Badge>
                                    </div>
                                )}

                                {/* Hover Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                                        onClick={() => handleViewClick(service)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Quick View
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
                                        onClick={() => {
                                            const imgSrc = (service as any).image || (service as any).imageUrl || '';
                                            if (imgSrc) setClickImage(imgSrc);
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* 2. Content Body */}
                            <CardContent className="flex flex-col flex-1 p-5 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                            {service.name}
                                        </h3>
                                        
                                        {/* Dropdown for extra actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewClick(service)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-xs text-muted-foreground">
                                                    ID: {((service as any)._id || (service as any).id).slice(-6)}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-border/40" />

                                {/* 3. Footer (Price & Action) - Pushed to bottom */}
                                <div className="mt-auto flex flex-col gap-4">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                {formatBillingType(service.billingType)}
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-foreground">
                                                    {formatPrice(finalPrice, service.billingType, service.currency)}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                                                        {formatPrice(service.price, 'one_time', service.currency)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleAddToCart(service)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-blue-500/25 transition-all duration-300"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {effectiveTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-6 border-t mt-2">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{startIndex + 1}</span>-
                        <span className="font-medium text-foreground">{Math.min(endIndex, total || 0)}</span> of{' '}
                        <span className="font-medium text-foreground">{total || 0}</span> services
                    </p>
                    
                    <div className="flex items-center gap-1.5 p-1 bg-secondary/30 rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center px-2">
                            <span className="text-sm font-medium">Page {currentPage} of {effectiveTotalPages}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, effectiveTotalPages))}
                            disabled={currentPage === effectiveTotalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Detailed View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden">
                    {selectedViewService && (
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Sidebar / Image in Dialog */}
                            <div className="w-full md:w-2/5 bg-muted relative min-h-[200px] md:min-h-full">
                                {((selectedViewService as any).image || (selectedViewService as any).imageUrl) ? (
                                    <img
                                        src={(selectedViewService as any).image || (selectedViewService as any).imageUrl}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                     <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                                        {selectedViewService.categoryName}
                                     </Badge>
                                </div>
                            </div>
                            
                            {/* Content in Dialog */}
                            <div className="flex-1 p-6 md:p-8 space-y-6 bg-background">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">{selectedViewService.name}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-blue-600">
                                            {formatPrice(
                                                selectedViewService.hasDiscount && selectedViewService.discountValue 
                                                ? (selectedViewService.discountType === 'percentage' 
                                                    ? selectedViewService.price * (1 - (selectedViewService.discountValue/100)) 
                                                    : selectedViewService.price - selectedViewService.discountValue)
                                                : selectedViewService.price,
                                                selectedViewService.billingType,
                                                selectedViewService.currency
                                            )}
                                        </span>
                                        {selectedViewService.hasDiscount && (
                                            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">
                                                Save {selectedViewService.discountType === 'percentage' ? `${selectedViewService.discountValue}%` : 'Cash'}
                                            </Badge>
                                        )}
                                    </div>
                                    {selectedViewService.hasDiscount && (
                                        <div className="mt-2">
                                            <p className="text-sm text-muted-foreground">Discount period: {selectedViewService.discountStartDate ? format(new Date(selectedViewService.discountStartDate), 'MMM dd, yyyy') : 'N/A'} — {selectedViewService.discountEndDate ? format(new Date(selectedViewService.discountEndDate), 'MMM dd, yyyy') : 'N/A'}</p>
                                        </div>
                                    )}
                                </div>

                                <Separator />
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {selectedViewService.description}
                                        </p>
                                    </div>

                                    {selectedViewService.tags && selectedViewService.tags.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Tags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    // tags may be stored as JSON-stringified arrays or simple strings
                                                    try {
                                                        const parsed: string[] = selectedViewService.tags.flatMap((t: any) => {
                                                            if (typeof t === 'string') {
                                                                // attempt to parse JSON arrays stored as strings
                                                                if (/^\[.*\]$/.test(t.trim())) {
                                                                    try {
                                                                        const inner = JSON.parse(t);
                                                                        return Array.isArray(inner) ? inner : [String(t)];
                                                                    } catch (e) {
                                                                        return [t];
                                                                    }
                                                                }
                                                                return [t];
                                                            }
                                                            return [String(t)];
                                                        });

                                                        return parsed.map((tag, idx) => (
                                                            <Badge key={idx} className="  px-2 py-1">{tag}</Badge>
                                                        ));
                                                    } catch (e) {
                                                        return selectedViewService.tags.map((tag: any, idx: number) => (
                                                            <Badge key={idx} className="  px-2 py-1">{String(tag)}</Badge>
                                                        ));
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {selectedViewService.features && selectedViewService.features.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Features</h4>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {selectedViewService.features.map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 mt-auto">
                                    <Button 
                                        className="w-full md:w-auto min-w-[200px]" 
                                        size="lg"
                                        onClick={() => {
                                            handleAddToCart(selectedViewService);
                                            setViewDialogOpen(false);
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
