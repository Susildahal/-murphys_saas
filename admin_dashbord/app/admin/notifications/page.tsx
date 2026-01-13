"use client"

import React, { useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Header from '@/app/page/common/header'
import  { fetchNotices ,toggleNoticeStatus } from "@/lib/redux/slices/noticSlicer"
import { useAppDispatch ,useAppSelector } from '@/lib/redux/hooks'
import SpinnerComponent from '@/app/page/common/Spinner'
import Pagination from '@/app/page/common/Pagination'
import DeleteModel from '@/app/page/common/DeleteModel'
interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    isRead: boolean;
    fullName: string;
    email: string;
    phone: string;
}

import { Checkbox } from '@/components/ui/checkbox'



const NotificationsPage = () => {

    const dispatch = useAppDispatch();
    const { notices, loading, error, total, page, limit, totalPages } = useAppSelector((state) => state.notices);

    useEffect(() => {
        if (!notices || notices.length === 0) {
            dispatch(fetchNotices({ page: 1, limit: 10 }));
        } else {
            dispatch(fetchNotices());
        }
    }, [dispatch]);

    if (!notices || notices.length === 0) {
        return (
            <div>
                {loading && <SpinnerComponent />}
                <div>No notifications found.</div>
            </div>
        );
    }
    const handletogglestatus=(id:string, status:boolean)=>{
        dispatch(toggleNoticeStatus({ noticeId: id, status: status }));
    }

    return (
        <div>
            {loading && <SpinnerComponent />}

            <Header
                title="Notifications"
                description="Manage and view all system notifications."
                total={total}
            />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                         <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                       
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {notices.map((notification) => (
                        <TableRow key={notification._id} className={notification.status === true ? '' : 'bg-blue-50'}>
                            <TableCell>{notification.firstName} {notification.lastName}</TableCell>
                            <TableCell>{notification.title}</TableCell>
                            <TableCell>{notification.email}</TableCell>
                            <TableCell>{notification.phone}</TableCell>
                            <TableCell>
                                <Tooltip>
                                    <TooltipTrigger>{notification.message?.slice(0, 40)} ....</TooltipTrigger>
                                    <TooltipContent>{notification.message}</TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <Checkbox checked={notification.status === true} onCheckedChange={(val) => handletogglestatus(notification._id, !notification.status)} />
                            </TableCell>
                            <TableCell>{ new Date(notification.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className=' cursor-pointer '>
                                            <MoreVertical className=' rotate-90' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            {notification ? 'Mark as Unread' : 'Mark as Read'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => {
                dispatch(fetchNotices({ page: newPage, limit }));
            }} />
            <DeleteModel />
        </div>
    )
}

export default NotificationsPage