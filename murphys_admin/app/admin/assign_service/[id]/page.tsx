'use client';
import React from 'react'
import { useParams } from 'next/navigation';
import Header from '@/app/page/common/header';
import axiosInstance from '@/lib/axios';
import { useState } from 'react';
import { Formik ,Field , Form ,ErrorMessage  } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AppDispatch  } from '@/lib/redux/store';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {fetchServices} from "@/lib//redux/slices/serviceSlice";
import { fetchCategories } from '@/lib/redux/slices/categorySlice';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DateRangePicker from '@/components/ui/date-range-picker';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';


interface PageProps {
    _id?: string;
     id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    service_catalog_id?: string;
    total?: number;
    page?: number;
    limit?: number;
    

}

function page() {
  const params = useParams();
    const { id } = params;
    const [data, setData] = React.useState<any>(null);
    const dispatch = useAppDispatch();
    const services = useAppSelector((state) => state.services);
    
    const clientId = Array.isArray(id) ? id[0] : id ?? null;

    // client id comes from route params (prefill)
    const [selectedClient, setSelectedClient] = React.useState<string | null>(clientId);
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [assignStatus, setAssignStatus] = React.useState<'active' | 'paused' | 'cancelled'>('active');
    const [assignCycle, setAssignCycle] = React.useState<'monthly' | 'annual' | 'none'>('monthly');
    const [assignStartDate, setAssignStartDate] = React.useState<string>('');
    const [assignRenewalDate, setAssignRenewalDate] = React.useState<string | null>(null);
    const [assignPrice, setAssignPrice] = React.useState<number | undefined>(undefined);
    const [assignAutoInvoice, setAssignAutoInvoice] = React.useState<boolean>(false);
    const [assignNotes, setAssignNotes] = React.useState<string>('');
    const handleAssignSubmit = async () => {
      if (!selectedClient) {
        alert('Client id missing');
        return;
      }
      if (!selectedCategory) {
        alert('Please select a category');
        return;
      }
        try {
            const payload = {
          clientId: selectedClient,
          service_catalog_id: id,
          categoryId: selectedCategory,
                status: assignStatus,
                cycle: assignCycle,
                start_date: assignStartDate,
                renewal_date: assignRenewalDate,
                price: assignPrice,
                auto_invoice: assignAutoInvoice,
                notes: assignNotes,
            };
            const response = await axiosInstance.post('/assignments', payload);
            alert('Service assigned successfully');
        }
        catch (error) {
            console.error('Error assigning service:', error);
            alert('Failed to assign service');
        }
        };

  


    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`/profiles/${id}`);
                setData(response.data.data);
                console.log( "response.data.data.data", response.data.data.data)
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [id]);

    const categories = useAppSelector((s) => s.categories.categories);

    React.useEffect(() => {
        dispatch(fetchServices( { page: 1, limit: 100 } ));
        // load categories for dropdown
        dispatch(fetchCategories({ page: 1, limit: 100 }));
    }, [dispatch]);


  return (
   <>
        <Header
        title="Assign Service"
        description="Assign services to clients"
        link="/admin/get_all_users"
        linkText="Go to users list"
      />

        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Assign Service to Client</h2>
            <p className="text-muted-foreground">Fill details for assigning this service to a client</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className=' pb-2'>Client</Label>
              <div className="p-2 bg-muted rounded">{   data  ? `${data.firstName || ''} ${data.lastName || ''}` : 'Client'}</div>
            </div>

            <div className="mt-3">
              <Label className=' pb-2'>Category</Label>
              <Select value={selectedCategory || ''} onValueChange={(v) => setSelectedCategory(v || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c: any) => c.status === 'active').map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
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
              <Label className=' pb-2'>Start / Renewal date</Label>
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
              <Button onClick={handleAssignSubmit}>Assign</Button>
            </div>
          </div>
        </div>
     
       
            
   
   </>
  )
}

export default page