'use client'
import React from 'react'
import Header from '@/app/page/common/header'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MoreVertical, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { Select , SelectContent ,SelectGroup ,SelectTrigger ,SelectItem, SelectValue } from '@/components/ui/select';


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

    // Debounce search input to avoid excessive requests
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    React.useEffect(() => {
        dispatch(getAssignedServices({ page: pageNumber, limit: limitNumber, search: debouncedSearch }));
    }, [dispatch, pageNumber, limitNumber, debouncedSearch]);

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

    // Helper function to calculate days remaining and get color
    const getDaysRemainingInfo = (date: string | Date) => {
        if (!date) return { text: null, variant: 'secondary' as const };
        const renewalDate = new Date(String(date));
        const today = new Date();
        const diffTime = renewalDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let text = '';
        let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'secondary';

        if (diffDays < 0) {
            text = `Overdue ${Math.abs(diffDays)}d`;
            variant = 'destructive';
        } else if (diffDays === 0) {
            text = 'Today';
            variant = 'destructive';
        } else if (diffDays <= 7) {
            text = `${diffDays}d left`;
            variant = 'destructive';
        } else if (diffDays <= 30) {
            text = `${diffDays}d left`;
            variant = 'outline';
        } else {
            text = `${diffDays}d left`;
            variant = 'secondary';
        }
        return { text, variant };
    };

    const handelreset=()=>{
        setSearchTerm('');
        setPageNumber(1);
    }


    return (
        <>
            <Header
                title="Assigned Services"
                description="Manage and view assigned services"
                link="/admin/view_assign_service"
                linkText="Assign New Service"
                total={total}
                extraInfo={<div>
                    <Input
                        type='text'
                        placeholder='Search by service or client name'
                        className='max-w-sm'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPageNumber(1); // reset to first page on new search
                        }}
                    />
                </div>}
               
               
            />

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Assigned Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Renewal Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows && rows.length > 0 ? (
                            rows.map((service: any) => {
                                const assignedDate = service.start_date || service.assignedDate || service.createdAt;
                                const renewalDate = service.renewal_date;
                                const daysAgo = getDaysAgo(assignedDate);
                                const renewalInfo = getDaysRemainingInfo(renewalDate);

                                return (
                                    <TableRow key={service._id ?? service.id}>
                                        <TableCell>{service.client_name || (service.userProfile ? `${service.userProfile.firstName || ''} ${service.userProfile.lastName || ''}`.trim() : (service.userName || service.clientName || service.email || '-'))}</TableCell>
                                        <TableCell>{service.service_name || service.serviceName || service.service_catalog_id || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{assignedDate ? new Date(String(assignedDate)).toLocaleDateString() : '-'}</span>
                                                {daysAgo && <Badge variant="secondary" className="w-fit text-xs">{daysAgo}</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>{service.isaccepted ?? service.status ?? '-'}</TableCell>
                                        <TableCell>{service.price ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{renewalDate ? new Date(String(renewalDate)).toLocaleDateString() : '-'}</span>
                                                {renewalInfo.text && <Badge variant={renewalInfo.variant} className="w-fit text-xs">{renewalInfo.text}</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4 rotate-90" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        // Fetch and show details
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
                                                                    description: 'Failed to fetch assigned service details.',
                                                                    variant: 'destructive',
                                                                });
                                                            })
                                                        } }>
                                                        View Details
                                                    </DropdownMenuItem>
                                                       <DropdownMenuItem>View Invoice </DropdownMenuItem>

                                    

                                                    
                                                    
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No assigned services found  {searchTerm === '' ? '' : <span className='font-bold '>{`for "${searchTerm}"   `  }  <RefreshCcw className="inline-block ml-2 animate-spin"  onClick={ handelreset}/></span>}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div>
                    <Pagination page={pageNumber} totalPages={totalPages || 1} onPageChange={(p) => setPageNumber(p)} />
                </div>
                <div>
                                <Select value={String(limitNumber)} onValueChange={(value) => setLimitNumber(Number(value))}>
                                    <SelectTrigger className="w-[100px] border rounded p-1">
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

            {/* Details dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assigned Service Details</DialogTitle>
                        <DialogDescription>Details for the selected assigned service</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {detailsData ? (() => {
                            const payload = (detailsData as any).data ? (detailsData as any).data : detailsData;
                            const client = payload.clientProfile || payload.client || payload.clientProfile;
                            const service = payload.service || payload.service || payload.service;
                            // helper to safely parse tag/feature arrays that may be double-encoded
                            const parseArrayField = (val: any) => {
                                try {
                                    if (!val) return [];
                                    if (Array.isArray(val)) return val.flatMap((v) => {
                                        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; }
                                    });
                                    if (typeof val === 'string') {
                                        // attempt JSON.parse repeatedly
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Client Profile</h3>
                                            <div><strong>Name:</strong> {client ? `${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`.trim() : '-'}</div>
                                            <div><strong>Email:</strong> {client?.email ?? payload.email ?? '-'}</div>
                                            <div><strong>Location:</strong> {client ? `${client.city || ''}${client.state ? ', ' + client.state : ''}${client.country ? ', ' + client.country : ''}` : '-'}</div>
                                             {client?.image && (
                                                <div className="mt-2">
                                                    <Image src={client.image} alt={client.name || 'client image'} width={300} height={180} className="rounded-md object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Service</h3>
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
                                                        <span key={i} className="px-2 py-1 rounded bg-muted text-sm">{String(t)}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <strong>Features:</strong>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {parseArrayField(service?.features).map((f: any, i: number) => (
                                                        <span key={i} className="px-2 py-1 rounded bg-muted text-sm">{String(f)}</span>
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
                            )
                        })() : (
                            <div>No details available.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>

    )
}

export default page