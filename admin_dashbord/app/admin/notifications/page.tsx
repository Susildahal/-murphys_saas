import React from 'react'
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
const notifications: Notification[] = [
    {
        id: 1,
        title: 'New User Registered',
        message: 'A new user has registered on the platform.',
        date: '2024-06-01',
        isRead: false,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',

    },
    {
        id: 2,
        title: 'Server Downtime',
        message: 'Scheduled maintenance will occur at midnight.',
        date: '2024-05-30',
        isRead: true,
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
    }
];

const page = () => {
    return (
        <div>
            <Header
                title="Notifications"
                description="Manage and view all system notifications."
                total={notifications.length}

            />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Email</TableHead>

                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {notifications.map((notification) => (
                        <TableRow key={notification.id} className={notification.isRead ? '' : 'bg-blue-50'}>
                            <TableCell>{notification.fullName}</TableCell>
                            <TableCell>{notification.title}</TableCell>
                            <TableCell>{notification.title}</TableCell>
                            <TableCell>{notification.email}</TableCell>
                            <TableCell>{notification.phone}</TableCell>
<TableCell> <Tooltip> <TooltipTrigger>{notification.message.slice(0, 40)} ....</TooltipTrigger> <TooltipContent>{notification.message}</TooltipContent> </Tooltip> </TableCell>
                            <TableCell>{notification.date}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className=' cursor-pointer '>
                                            <MoreVertical className=' rotate-90' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
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
        </div>
    )
}

export default page