'use client'
import React, { useEffect } from 'react'
import Header from '@/app/page/common/header'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { RefreshCcw, User, Briefcase, Search } from 'lucide-react'

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectItem, SelectValue } from '@/components/ui/select';
import { fetchServices } from '@/lib/redux/slices/serviceSlice';



const page = () => {
    const dispatch = useAppDispatch();
    const { loading, total, limit, page } = useAppSelector((state) => state.assign);
    const data = useAppSelector((state) => state.assign.data);
    const totalPages = useAppSelector((state) => state.assign.totalPages || 0);
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchTerm);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [limitNumber, setLimitNumber] = React.useState(10);
    const [detailsOpen, setDetailsOpen] = React.useState(false);
    const [detailsData, setDetailsData] = React.useState<any>(null);
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
        // Fetch assigned services whenever page, limit or debounced search changes
        dispatch(getAssignedServices({
            page: pageNumber,
            limit: limitNumber,
            search: debouncedSearch,
            service_catalog_id: selectedService === 'all' ? undefined : selectedService
        }));
    }, [dispatch, pageNumber, limitNumber, debouncedSearch, selectedService]);

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
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Service Name</TableHead>
                                    <TableHead>Assigned Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows && rows.length > 0 ? (
                                    rows.map((service: any, index) => {
                                        const assignedDate = service.start_date || service.assignedDate || service.createdAt;
                                        const daysAgo = getDaysAgo(assignedDate);

                                        return (
                                            <TableRow key={service._id ?? service.id}>
                                                <TableCell>{pageNumber + index}</TableCell>
                                                <TableCell>{service.service_name || service.serviceName || service.service_catalog_id || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span>{assignedDate ? new Date(String(assignedDate)).toLocaleDateString() : '-'}</span>
                                                        {daysAgo && <Badge variant="secondary" className="w-fit text-xs">{daysAgo}</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={service.isaccepted === 'accepted' ? 'default' : service.isaccepted === 'pending' ? 'outline' : 'destructive'}>
                                                        {service.isaccepted ?? service.status ?? '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold">${service.price ?? '-'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            dispatch(getAssignDetails({ client_id: service.client_id, service_catalog_id: service.service_catalog_id }))
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
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No assigned services found {searchTerm === '' ? '' : <span className='font-bold '>{`for "${searchTerm}"   `} <RefreshCcw className="inline-block ml-2 cursor-pointer hover:animate-spin" onClick={handelreset} /></span>}.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
        </div>
    )
}

export default page