import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Building2, Mail, MapPin, Hash, Edit2, Trash2, Search } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import AuditLogger from '@/components/audit/AuditLogger';

export default function BusinessInvoiceCustomers() {
    const [businessSession, setBusinessSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        tax_id: '',
        country: '',
        address: '',
        postal_code: ''
    });

    React.useEffect(() => {
        const session = localStorage.getItem('business_einvoice_session');
        if (!session) {
            window.location.href = createPageUrl('BusinessEInvoiceLogin');
            return;
        }
        setBusinessSession(JSON.parse(session));
    }, []);

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['customers', businessSession?.id],
        queryFn: () => base44.entities.Customer.filter({ 
            created_by: businessSession?.business_email 
        }),
        enabled: !!businessSession
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Customer.create(data),
        onSuccess: (customer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            
            // Audit log customer creation
            AuditLogger.log({
                event_type: 'merchant_created',
                category: 'merchant',
                severity: 'info',
                user_email: businessSession?.business_email,
                user_role: 'business_admin',
                target_entity: 'Customer',
                target_id: customer.id,
                action: 'create_customer',
                description: `Customer ${customer.name} created`,
                new_value: customer,
                retention_period: '3_years'
            });
            
            setDialogOpen(false);
            resetForm();
            toast.success('Customer created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setDialogOpen(false);
            setEditingCustomer(null);
            resetForm();
            toast.success('Customer updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Customer.delete(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            
            // Audit log customer deletion
            const deletedCustomer = customers.find(c => c.id === deletedId);
            if (deletedCustomer) {
                AuditLogger.log({
                    event_type: 'merchant_deleted',
                    category: 'merchant',
                    severity: 'critical',
                    user_email: businessSession?.business_email,
                    user_role: 'business_admin',
                    target_entity: 'Customer',
                    target_id: deletedId,
                    action: 'delete_customer',
                    description: `Customer ${deletedCustomer.name} deleted`,
                    old_value: deletedCustomer,
                    retention_period: '7_years'
                });
            }
            
            toast.success('Customer deleted');
        }
    });

    const resetForm = () => {
        setFormData({ name: '', email: '', tax_id: '', country: '', address: '', postal_code: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const openEditDialog = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name || '',
            email: customer.email || '',
            tax_id: customer.tax_id || '',
            country: customer.country || '',
            address: customer.address || '',
            postal_code: customer.postal_code || ''
        });
        setDialogOpen(true);
    };

    const filtered = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tax_id?.includes(searchTerm)
    );

    if (!businessSession) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Customers</h1>
                                <p className="text-sm text-slate-600">{businessSession.company_name}</p>
                            </div>
                        </div>
                        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search customers by name, email, or tax ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Customer List */}
                <div className="space-y-3">
                    {filtered.map((customer) => (
                        <Card key={customer.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                                            <div className="space-y-1 mt-2">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.tax_id && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Hash className="h-3 w-3" />
                                                        {customer.tax_id}
                                                    </div>
                                                )}
                                                {customer.country && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <MapPin className="h-3 w-3" />
                                                        {customer.country}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm(`Delete ${customer.name}?`)) {
                                                    deleteMutation.mutate(customer.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filtered.length === 0 && !isLoading && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600 mb-4">No customers found</p>
                                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Customer
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Customer Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Company Name"
                                required
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div>
                            <Label>Tax ID *</Label>
                            <Input
                                value={formData.tax_id}
                                onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                                placeholder="VAT/Tax ID"
                                required
                            />
                        </div>
                        <div>
                            <Label>Country *</Label>
                            <Input
                                value={formData.country}
                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                placeholder="US"
                                maxLength={2}
                                required
                            />
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Street address"
                            />
                        </div>
                        <div>
                            <Label>Postal Code</Label>
                            <Input
                                value={formData.postal_code}
                                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                                placeholder="12345"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                {editingCustomer ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}