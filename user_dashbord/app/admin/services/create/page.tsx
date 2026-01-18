"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ServiceForm from '@/app/page/service-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/app/page/common/header';
import { ArrowLeft } from 'lucide-react';

export default function CreateServicePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/services');
  };

  return (
    <> 
     <Header 
      title="Create Service"
      description="Fill in the details to create a new service"
      link="/admin/services"
      linkText="View Services List"
      icon={<ArrowLeft />}
      onButtonClick={() => router.push('/admin/services')}
    />
    
      <div className="">
      <Card>
    
        <CardContent>
          <ServiceForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
    </>
  );
}
