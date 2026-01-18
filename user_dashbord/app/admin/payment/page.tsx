'use client'
import React, { useState, useEffect } from 'react'
import axiosInstance from '@/lib/axios'
import Spinner from '@/app/page/common/Spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CreditCard, Key, MoreVertical, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, Save, Import } from 'lucide-react'
import Header from '@/app/page/common/header'
import {Table ,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table' 




interface PaymentGateway {
  _id: string
  name: string
  type: 'stripe' | 'paypal' | 'razorpay' | 'square'
  apiKey: string
  secretKey: string
  webhookSecret?: string
  isActive: boolean
  isTestMode: boolean
  createdAt: string
  updatedAt: string


}

const PaymentGatewayAdmin = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [showSecretKey, setShowSecretKey] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showEditSecretKey, setShowEditSecretKey] = useState(false);
  

  const [formData, setFormData] = useState({
    name: '',
    type: 'stripe' as 'stripe' | 'paypal' | 'razorpay' | 'square',
    apiKey: '',
    secretKey: '',
    webhookSecret: '',
    isActive: true,
    isTestMode: false
  })

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/payments')
      setGateways(response.data.data)
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to fetch gateways' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      name: '',
      type: 'stripe',
      apiKey: '',
      secretKey: '',
      webhookSecret: '',
      isActive: true,
      isTestMode: false
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway)
    setFormData({
      name: gateway.name,
      type: gateway.type,
      apiKey: gateway.apiKey,
      secretKey: gateway.secretKey,
      webhookSecret: gateway.webhookSecret || '',
      isActive: gateway.isActive,
      isTestMode: gateway.isTestMode
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitAdd = async () => {
    try {
      await axiosInstance.post('/payments', formData)
      setMessage({ type: 'success', text: 'Gateway added successfully' })
      setIsAddModalOpen(false)
      fetchGateways()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to add gateway' })
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedGateway) return
    try {
      await axiosInstance.put(`/payments/${selectedGateway._id}`, formData)
      setMessage({ type: 'success', text: 'Gateway updated successfully' })
      setIsEditModalOpen(false)
      fetchGateways()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to update gateway' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedGateway) return
    try {
      await axiosInstance.delete(`/payments/${selectedGateway._id}`)
      setMessage({ type: 'success', text: 'Gateway deleted successfully' })
      setIsDeleteModalOpen(false)
      fetchGateways()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to delete gateway' })
    }
  }

  const handleToggleActive = async (gatewayId: string, isActive: boolean) => {
    try {
      await axiosInstance.patch(`/payments/${gatewayId}/toggle`, { isActive })
      setMessage({ type: 'success', text: `Gateway ${isActive ? 'activated' : 'deactivated'}` })
      fetchGateways()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to toggle gateway' })
    }
  }

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'stripe': return '💳'
      case 'paypal': return '🅿️'
      case 'razorpay': return '💰'
      case 'square': return '⬛'
      default: return '💳'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
     <Header
  title="Payment Gateway Management"
  description="Manage your payment gateway API keys and configurations"
  buttonText="Add Gateway"
  onButtonClick={handleAdd}
  total={gateways.length }
></Header>
      
    
      <div>
      
      <CardContent>
  <div className="overflow-x-auto">
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="text-left p-4 font-medium">Gateway</TableHead>
          <TableHead className="text-left p-4 font-medium">Type</TableHead>
          <TableHead className="text-left p-4 font-medium">API Key</TableHead>
          <TableHead className="text-left p-4 font-medium">Secret Key</TableHead>
          <TableHead className="text-left p-4 font-medium">Mode</TableHead>
          <TableHead className="text-left p-4 font-medium">Status</TableHead>
          <TableHead className="text-right p-4 font-medium">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gateways.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No payment gateways configured yet
            </TableCell>
          </TableRow>
        ) : (
          gateways.map((gateway) => (
            <TableRow key={gateway._id} className="border-b hover:bg-muted/50 transition-colors">
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getGatewayIcon(gateway.type)}</span>
                  <span className="font-medium">{gateway.name}</span>
                </div>
              </TableCell>
              <TableCell className="p-4">
                <Badge variant="outline" className="capitalize">
                  {gateway.type}
                </Badge>
              </TableCell>
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {showApiKey === gateway._id ? gateway.apiKey : maskKey(gateway.apiKey)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(showApiKey === gateway._id ? null : gateway._id)}
                  >
                    {showApiKey === gateway._id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {showSecretKey === gateway._id ? gateway.secretKey : maskKey(gateway.secretKey)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecretKey(showSecretKey === gateway._id ? null : gateway._id)}
                  >
                    {showSecretKey === gateway._id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="p-4">
                <Badge variant={gateway.isTestMode ? 'secondary' : 'default'}>
                  {gateway.isTestMode ? 'Test' : 'Live'}
                </Badge>
              </TableCell>
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={gateway.isActive === true}
                    onCheckedChange={(checked) => handleToggleActive(gateway._id, checked)}
                  />
                  <span className={gateway.isActive ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {gateway.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="p-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className=' cursor-pointer'>
                      <MoreVertical className="w-4 h-4 rotate-90" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(gateway)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(gateway)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
</CardContent>
      </div>

      {/* Add Gateway Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Payment Gateway
            </DialogTitle>
            <DialogDescription>
              Configure a new payment gateway integration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Gateway Name</Label>
                <Input
                  id="add-name"
                  placeholder="e.g., My Stripe Account"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

            <div className="space-y-2">
  <Label htmlFor="add-type">Gateway Type</Label>
  <Select
    value={formData.type}
    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
  >
    <SelectTrigger id="add-type" className="w-full">
      <SelectValue placeholder="Select gateway type"   className='w-full'/>
    </SelectTrigger>
    <SelectContent className="w-full">
      <SelectItem value="stripe">Stripe</SelectItem>
      <SelectItem value="paypal">PayPal</SelectItem>
      <SelectItem value="razorpay">Razorpay</SelectItem>
      <SelectItem value="square">Square</SelectItem>
    </SelectContent>
  </Select>
</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-apiKey">API Key / Publishable Key</Label>
              <Input
                id="add-apiKey"
                placeholder="pk_test_..."
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-secretKey">Secret Key</Label>
              <Input
                id="add-secretKey"
                type="password"
                placeholder="sk_test_..."
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-webhookSecret">Webhook Secret (Optional)</Label>
              <Input
                id="add-webhookSecret"
                placeholder="whsec_..."
                value={formData.webhookSecret}
                onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Test Mode</Label>
                <p className="text-sm text-muted-foreground">Use test API keys</p>
              </div>
              <Switch
                checked={formData.isTestMode}
                onCheckedChange={(checked) => setFormData({ ...formData, isTestMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable this gateway</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={!formData.name || !formData.apiKey || !formData.secretKey}>
              <Save className="w-4 h-4 mr-2" />
              Save Gateway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Gateway Modal */}


{/* Edit Gateway Modal */}
<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Edit className="w-5 h-5" />
        Edit Payment Gateway
      </DialogTitle>
      <DialogDescription>
        Update payment gateway configuration
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Gateway Name</Label>
          <Input
            id="edit-name"
            placeholder="e.g., My Stripe Account"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-type">Gateway Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger id="edit-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-apiKey">API Key / Publishable Key</Label>
        <Input
          id="edit-apiKey"
          placeholder="pk_test_..."
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-secretKey">Secret Key</Label>
        <div className="relative">
          <Input
            id="edit-secretKey"
            type={showEditSecretKey ? "text" : "password"}
            placeholder="sk_test_..."
            value={formData.secretKey}
            onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2"
            onClick={() => setShowEditSecretKey((prev) => !prev)}
            tabIndex={-1}
          >
            {showEditSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-webhookSecret">Webhook Secret (Optional)</Label>
        <Input
          id="edit-webhookSecret"
          placeholder="whsec_..."
          value={formData.webhookSecret}
          onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="space-y-0.5">
          <Label>Test Mode</Label>
          <p className="text-sm text-muted-foreground">Use test API keys</p>
        </div>
        <Switch
          checked={formData.isTestMode}
          onCheckedChange={(checked) => setFormData({ ...formData, isTestMode: checked })}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="space-y-0.5">
          <Label>Active</Label>
          <p className="text-sm text-muted-foreground">Enable this gateway</p>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmitEdit} disabled={!formData.name || !formData.apiKey || !formData.secretKey}>
        <Save className="w-4 h-4 mr-2" />
        Update Gateway
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Gateway</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGateway?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PaymentGatewayAdmin