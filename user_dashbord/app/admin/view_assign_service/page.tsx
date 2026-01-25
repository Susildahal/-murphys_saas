'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/app/page/common/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCcw, User, Briefcase, Search, Calendar, DollarSign, Clock, CheckCircle2, Eye } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { getAssignedServices, getAssignDetails } from '@/lib/redux/slices/assignSlice';
import SpinnerComponent from '@/app/page/common/Spinner'
import { Input } from '@/components/ui/input'
import Pagination from '@/app/page/common/Pagination'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectItem, SelectValue } from '@/components/ui/select';
import { fetchServices } from '@/lib/redux/slices/serviceSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import InvoiceView from '../../page/InvoiceView';
import { fetchInvoices } from "../../../lib/redux/slices/invoiceSlicer"



const page = () => {
    const dispatch = useAppDispatch();
    const { loading, total, limit, page } = useAppSelector((state) => state.assign);
    const data = useAppSelector((state) => state.assign.data);
    const totalPages = useAppSelector((state) => state.assign.totalPages || 0);
    const meeState = useAppSelector((s) => s.mee);
    const currentUserEmail = meeState.data?.email || '';
    const [id, setId] = useState<string | undefined>(undefined);

    // Data filtered by backend
    const rows = Array.isArray(data) ? data : (data ? [data] : []);

    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchTerm);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [limitNumber, setLimitNumber] = React.useState(10);
    const [detailsOpen, setDetailsOpen] = React.useState(false);
    const [detailsData, setDetailsData] = React.useState<any>(null);
    const [renewalsModalOpen, setRenewalsModalOpen] = useState(false);
    const [selectedRenewals, setSelectedRenewals] = useState<any[]>([]);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const invoiceData = useAppSelector((state) => state.invoices.invoice);
    const { toast } = useToast();

    // Filters state
    const [selectedService, setSelectedService] = React.useState<string>('all');
    const [servicesList, setServicesList] = React.useState<any[]>([]);

    // Fetch services for filters
    React.useEffect(() => {
        dispatch(fetchServices({ limit: 100 })).then((res: any) => {
            if (res.payload?.services) setServicesList(res.payload.services);
        });
    }, [dispatch]);

    // Debounce search input to avoid excessive requests
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    React.useEffect(() => {
        // Fetch assigned services filtered by current user email from backend
        if (currentUserEmail) {
            dispatch(getAssignedServices({
                page: pageNumber,
                limit: limitNumber,
                search: debouncedSearch,
                service_catalog_id: selectedService === 'all' ? undefined : selectedService,
                email: currentUserEmail
            }));
        }
    }, [dispatch, pageNumber, limitNumber, debouncedSearch, selectedService, currentUserEmail]);

    // Helper function to calculate days ago
    const getDaysAgo = (date: string | Date) => {
        if (!date) return null;
        const startDate = new Date(String(date));
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    };

    const handelreset = () => {
        setSearchTerm('');
        setPageNumber(1);
    }

    const viewInvoice = async (invoiceId: string) => {
        try {
            await dispatch(fetchInvoices(invoiceId)).unwrap();
            setInvoiceModalOpen(true);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch invoice data.',
                variant: 'destructive',
            });
        }
    }




    return (
        <div className="space-y-6">
            {loading && <SpinnerComponent />}
            <Header
                title="My Services"
                description="View your assigned services"

                total={total}
                extraInfo={
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type='text'
                                placeholder='Search...'
                                className='pl-9 w-[200px]'
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPageNumber(1);
                                }}
                            />
                        </div>

                        <Select value={selectedService} onValueChange={(val) => { setSelectedService(val); setPageNumber(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Services</SelectItem>
                                {servicesList.map((service) => (
                                    <SelectItem key={service.id || service._id} value={service.id || service._id}>
                                        {service.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

            <div className="border-none bg-none overflow-hidden">
                <div className="p-0">
                    {rows && rows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rows.map((service: any, index) => {
                                const assignedDate = service.start_date || service.assignedDate || service.createdAt;
                                const endDate = service.end_date;
                                const daysAgo = getDaysAgo(assignedDate);
                                const renewalDates = service.renewal_dates || [];
                                
                                // Calculate renewal statistics
                                const totalRenewalAmount = renewalDates.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
                                const paidCount = renewalDates.filter((r: any) => r.haspaid).length;
                                const unpaidCount = renewalDates.length - paidCount;
                                const paidAmount = renewalDates.filter((r: any) => r.haspaid).reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
                                const unpaidAmount = totalRenewalAmount - paidAmount;

                                return (
                                    <Card key={service._id ?? service.id} className="hover:shadow-lg transition-all duration-300 border-border/60 overflow-hidden">
                                        {/* Service Image */}
                                        {service.service_image && (
                                            <div className="relative w-full h-48 overflow-hidden">
                                                <Image
                                                    src={service.service_image}
                                                    alt={service.service_name || 'Service'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg line-clamp-1">
                                                        {service.service_name || service.serviceName || '-'}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Invoice: {service.invoice_id || 'N/A'}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={
                                                        service.isaccepted === 'accepted'
                                                            ? 'default'
                                                            : service.isaccepted === 'pending'
                                                                ? 'outline'
                                                                : 'destructive'
                                                    }
                                                    className="ml-2"
                                                >
                                                    {service.isaccepted ?? service.status ?? '-'}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Price & Cycle */}
                                            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-primary" />
                                                <div className="flex-1">
                                                    <div className="text-2xl font-bold text-primary">
                                                        ${service.price ?? '-'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground capitalize">
                                                        {service.cycle || 'one-time'}
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Dates */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Start:</span>
                                                    <span className="font-medium">
                                                        {assignedDate ? new Date(String(assignedDate)).toLocaleDateString() : '-'}
                                                    </span>
                                                    {daysAgo && (
                                                        <Badge variant="secondary" className="text-xs ml-auto">
                                                            {daysAgo}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {endDate && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">End:</span>
                                                        <span className="font-medium">
                                                            {new Date(String(endDate)).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Renewal Dates */}
                                            {renewalDates.length > 0 && (
                                                <>
                                                    <Separator />
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                            Renewal Schedule
                                                            <Badge variant="secondary" className="ml-auto">
                                                                {renewalDates.length} Total
                                                            </Badge>
                                                        </div>
                                                        
                                                        {/* Renewal Statistics Grid */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">Paid</div>
                                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{paidCount}</span>
                                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400">/ {renewalDates.length}</span>
                                                                </div>
                                                                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                                    ${paidAmount.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                                                                <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium uppercase">Unpaid</div>
                                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                                    <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{unpaidCount}</span>
                                                                    <span className="text-xs text-orange-600 dark:text-orange-400">/ {renewalDates.length}</span>
                                                                </div>
                                                                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mt-0.5">
                                                                    ${unpaidAmount.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Total Amount */}
                                                        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-muted-foreground">Total Renewal Value</span>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-2xl font-bold text-primary">${totalRenewalAmount.toFixed(2)}</span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {((paidCount / renewalDates.length) * 100).toFixed(0)}% Collected
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                                                                    style={{ width: `${(paidCount / renewalDates.length) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Renewal Items Preview */}
                                                        <div className="space-y-2">
                                                            {renewalDates.slice(0, 2).map((renewal: any, idx: number) => (
                                                                <div
                                                                    key={renewal._id || idx}
                                                                    className="flex items-center justify-between text-xs p-2.5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                                                                >
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-semibold capitalize text-foreground">
                                                                            {renewal.label || `Renewal ${idx + 1}`}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                            <Calendar className="h-2.5 w-2.5" />
                                                                            {renewal.date ? new Date(renewal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <span className="font-bold text-primary text-sm">
                                                                            ${renewal.price || 0}
                                                                        </span>
                                                                        <Badge
                                                                            variant={renewal.haspaid ? 'default' : 'destructive'}
                                                                            className="text-[9px] h-4 px-1.5"
                                                                        >
                                                                            {renewal.haspaid ? '✓ Paid' : '✗ Due'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {renewalDates.length > 2 && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full text-xs mt-2 border-dashed hover:border-solid hover:bg-primary/5"
                                                                    onClick={() => {
                                                                        setSelectedRenewals(renewalDates);
                                                                        setRenewalsModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1.5" />
                                                                    View All {renewalDates.length} Renewals
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Action Button */}
                                            <div className=' flex gap-2 '>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className=" w-[50%] "
                                                    onClick={() => {
                                                        dispatch(getAssignDetails({
                                                            client_id: service.client_id,
                                                            service_catalog_id: service.service_catalog_id
                                                        }))
                                                            .then((res: any) => {
                                                                if (res.payload) {
                                                                    setDetailsData(res.payload);
                                                                    setDetailsOpen(true);
                                                                }
                                                            })
                                                            .catch(() => {
                                                                toast({
                                                                    title: 'Error',
                                                                    description: 'Failed to fetch service details.',
                                                                    variant: 'destructive',
                                                                });
                                                            })
                                                    }}
                                                >
                                                    View Full Details
                                                </Button>


                                                <Button className=" w-[50%] " size="sm" onClick={() => viewInvoice(service._id)}> View Invoice  </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">No services assigned</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {searchTerm === ''
                                                ? 'You have no assigned services yet.'
                                                : (
                                                    <>
                                                        No services found for "<span className='font-bold'>{searchTerm}</span>"
                                                        <RefreshCcw
                                                            className="inline-block ml-2 cursor-pointer hover:animate-spin"
                                                            onClick={handelreset}
                                                        />
                                                    </>
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div>
                    <Pagination page={pageNumber} totalPages={totalPages || 1} onPageChange={(p) => setPageNumber(p)} />
                </div>
                <div>
                    <Select value={String(limitNumber)} onValueChange={(value) => setLimitNumber(Number(value))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={"5"}>5</SelectItem>
                                <SelectItem value={"10"}>10</SelectItem>
                                <SelectItem value={"25"}>25</SelectItem>
                                <SelectItem value={"50"}>50</SelectItem>
                                <SelectItem value={"100"}>100</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Assigned Service Details</DialogTitle>
                        <DialogDescription>Complete details for the selected assigned service</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {detailsData ? (() => {
                            const payload = (detailsData as any).data ? (detailsData as any).data : detailsData;
                            const client = payload.clientProfile || payload.client;
                            const service = payload.service;
                            const parseArrayField = (val: any) => {
                                try {
                                    if (!val) return [];
                                    if (Array.isArray(val)) return val.flatMap((v) => {
                                        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; }
                                    });
                                    if (typeof val === 'string') {
                                        let parsed: any = val;
                                        let attempts = 0;
                                        while (typeof parsed === 'string' && attempts < 3) {
                                            try { parsed = JSON.parse(parsed); } catch { break; }
                                            attempts++;
                                        }
                                        return Array.isArray(parsed) ? parsed : [parsed];
                                    }
                                    return [val];
                                } catch { return [] }
                            };

                            return (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="border rounded-lg p-4">
                                            <h3 className="text-lg font-semibold mb-3">Service Details</h3>
                                            <div className="space-y-2">
                                                <div><strong>Name:</strong> {service?.name || service?.service_name || service?.serviceName || '-'}</div>
                                                <div><strong>Description:</strong> {service?.description ?? '-'}</div>
                                                <div><strong>Category:</strong> {service?.categoryName ?? '-'}</div>
                                                <div><strong>Price:</strong> {service?.price ?? payload.price ?? '-'} {service?.currency ?? payload.currency ?? ''}</div>
                                                <div><strong>Billing:</strong> {service?.billingType ?? service?.cycle ?? payload.cycle ?? '-'}</div>
                                                <div><strong>Duration (days):</strong> {service?.durationInDays ?? '-'}</div>
                                                <div><strong>Featured:</strong> {service?.isFeatured ? 'Yes' : 'No'}</div>
                                                <div className="mt-2">
                                                    <strong>Tags:</strong>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {parseArrayField(service?.tags).map((t: any, i: number) => (
                                                            <Badge key={i} variant="secondary">{String(t)}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <strong>Features:</strong>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {parseArrayField(service?.features).map((f: any, i: number) => (
                                                            <Badge key={i} variant="outline">{String(f)}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                {service?.image && (
                                                    <div className="mt-2">
                                                        <Image src={service.image} alt={service.name || 'service image'} width={300} height={180} className="rounded-md object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })() : (
                            <div>No details available.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* All Renewals Modal */}
            <Dialog open={renewalsModalOpen} onOpenChange={setRenewalsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">All Renewal Schedules</DialogTitle>
                        <DialogDescription className="text-base">
                            Complete overview of {selectedRenewals.length} renewal payment{selectedRenewals.length !== 1 ? 's' : ''}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Summary Statistics */}
                    {selectedRenewals.length > 0 && (() => {
                        const totalAmount = selectedRenewals.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
                        const paidTotal = selectedRenewals.filter((r: any) => r.haspaid).length;
                        const unpaidTotal = selectedRenewals.length - paidTotal;
                        const paidValue = selectedRenewals.filter((r: any) => r.haspaid).reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
                        const unpaidValue = totalAmount - paidValue;

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b">
                                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Paid</p>
                                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{paidTotal}</p>
                                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1">${paidValue.toFixed(2)}</p>
                                            </div>
                                            <CheckCircle2 className="h-12 w-12 text-emerald-500 opacity-30" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide">Unpaid</p>
                                                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">{unpaidTotal}</p>
                                                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mt-1">${unpaidValue.toFixed(2)}</p>
                                            </div>
                                            <Clock className="h-12 w-12 text-orange-500 opacity-30" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</p>
                                                <p className="text-3xl font-bold text-primary mt-1">${totalAmount.toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{((paidTotal / selectedRenewals.length) * 100).toFixed(1)}% collected</p>
                                            </div>
                                            <DollarSign className="h-12 w-12 text-primary opacity-30" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })()}

                    {/* Scrollable Renewal List */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                        {selectedRenewals.map((renewal: any, idx: number) => {
                            const isPaid = renewal.haspaid;
                            const renewalDate = renewal.date ? new Date(renewal.date) : null;
                            const today = new Date();
                            const isOverdue = renewalDate && !isPaid && renewalDate < today;
                            
                            return (
                                <Card 
                                    key={renewal._id || idx}
                                    className={`transition-all hover:shadow-md ${
                                        isPaid 
                                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20' 
                                            : isOverdue 
                                                ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
                                                : 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20'
                                    }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        #{idx + 1}
                                                    </Badge>
                                                    <span className="font-bold capitalize text-base">
                                                        {renewal.label || `Renewal ${idx + 1}`}
                                                    </span>
                                                    {isOverdue && (
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            OVERDUE
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {renewalDate ? renewalDate.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : 'No date set'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-3xl font-bold text-primary">
                                                    ${(renewal.price || 0).toFixed(2)}
                                                </div>
                                                <Badge
                                                    variant={isPaid ? 'default' : 'destructive'}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    {isPaid ? '✓ Paid' : '✗ Unpaid'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {selectedRenewals.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground">
                                <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No renewal dates available</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invoice Modal */}
            <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-[900px] max-h-[95vh] p-0 gap-0 overflow-hidden">
                    {invoiceData && (
                        <InvoiceView
                            assignmentData={invoiceData}
                            onClose={() => setInvoiceModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default page