'use client'
import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { MoreHorizontal } from "lucide-react"
import { Button } from '@/components/ui/button'
import Header from '@/app/page/common/header'
import { getAllCarts } from "@/lib/redux/slices/cartSlicer"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { useEffect } from 'react'
import Link from 'next/link'


function page() {
    const dispatch = useAppDispatch();
    const { cart, loading, error, total } = useAppSelector((state) => state.cart);
    useEffect(() => {
        dispatch(getAllCarts());
    }, [dispatch]);

  return (
    <div>
      <Header title="Cart Management" description="Manage user carts and their services" />
      <div className="p-4">
        <Table>
            <TableCaption>List of user carts</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Number of Services</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cart ? (
                    <TableRow key={cart._id}>
                        <TableCell>{cart.userid}</TableCell>
                        <TableCell>{cart.Services.length}</TableCell>
                        <TableCell>${total.toFixed(2)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href={`/admin/cart/${cart.userid}`}>View Details</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                            No carts found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </div>
    </div>

  )
}

export default page