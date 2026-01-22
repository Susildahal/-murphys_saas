"use client"
import React, { useEffect, useState } from 'react'
import axiosInstance from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function ServiceDetailsPage() {
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      try {
        const path = typeof window !== 'undefined' ? window.location.pathname : ''
        const parts = path.split('/')
        const id = parts[parts.length - 1]
        if (!id) {
          setError('Invalid service id')
          setLoading(false)
          return
        }

        const res = await axiosInstance.get(`/services/${id}`)
        setService(res.data?.data || res.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load service')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Service not found</CardTitle>
            <CardDescription>{error || 'No service data available.'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            {service.image ? (
              <div className="w-16 h-16 rounded overflow-hidden">
                <Image src={service.image} alt={service.name} width={64} height={64} className="object-cover" />
              </div>
            ) : null}
            <span>{service.name}</span>
          </CardTitle>
          <CardDescription>{service.categoryName || ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">{service.description}</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{service.currency || 'USD'} {service.price}</div>
                {service.hasDiscount && service.discountValue ? (
                  <div className="text-sm text-muted-foreground">Discount: {service.discountType === 'percentage' ? `${service.discountValue}%` : `${service.discountValue}`}</div>
                ) : null}
              </div>
              <div>
                <Button asChild>
                  <a href={`/services/${service._id}`} target="_self">Open raw</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
