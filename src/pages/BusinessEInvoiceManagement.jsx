import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Building2, Mail, Globe, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import OnboardingWizard from '@/components/einvoicing/BusinessEInvoiceOnboarding';

export default function BusinessEInvoiceManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        org_name: '',
        business_email: '',
        country: '',
        tax_id: '',
        status: 'active'
    });

    // Fetch organizations
    const { data: organizations = [], isLoading } = useQuery({
        queryKey: ['businessEInvoicingOrgs'],
        queryFn: () => base44.entities.CompanyAccount.list('-created_date', 100),
    });

    // Create organization
    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CompanyAccount.create({
            ...data,
            portal_url: `${window.location.origin}/BusinessEInvoicePortal?org=${data.org_name.toLowerCase().replace(/\s+/g, '-')}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEInvoicingOrgs'] });
            setOpenDialog(false);
            resetForm();
            toast.success('Organization created successfully');
        },
        onError: (err) => toast.error('Failed to create organization: ' + err.message)
    });

    // Update organization
    const updateMutation = useMutation({
        mutationFn: (data) => base44.entities.CompanyAccount.update(editingOrg.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEInvoicingOrgs'] });
            setOpenDialog(false);
            setEditingOrg(null);
            resetForm();
            toast.success('Organization updated successfully');
        },
        onError: (err) => toast.error('Failed to update organization: ' + err.message)
    });

    // Delete organization
    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.CompanyAccount.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEInvoicingOrgs'] });
            toast.success('Organization deleted');
        },
        onError: (err) => toast.error('Failed to delete organization: ' + err.message)
    });

    const resetForm = () => {
        setFormData({
            org_name: '',
            business_email: '',
            country: '',
            tax_id: '',
            status: 'active'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingOrg) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const openEditDialog = (org) => {
        setEditingOrg(org);
        setFormData({
            org_name: org.org_name || '',
            business_email: org.business_email || '',
            country: org.country || '',
            tax_id: org.tax_id || '',
            status: org.status || 'active'
        });
        setOpenDialog(true);
    };

    const filtered = organizations.filter(org =>
        org.org_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.business_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.tax_id?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Business E-Invoicing Organizations</h1>
                        <p className="text-slate-600 mt-1">Manage white-label instances for organizations</p>
                    </div>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => {
                                    setEditingOrg(null);
                                    resetForm();
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Organization
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingOrg ? 'Edit Organization' : 'Create Organization'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Organization Name *</Label>
                                    <Input
                                        value={formData.org_name}
                                        onChange={(e) => setFormData({...formData, org_name: e.target.value})}
                                        placeholder="ACME Corp"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Business Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.business_email}
                                        onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                                        placeholder="admin@acme.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Country *</Label>
                                    <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IT">Italy</SelectItem>
                                            <SelectItem value="DE">Germany</SelectItem>
                                            <SelectItem value="FR">France</SelectItem>
                                            <SelectItem value="ES">Spain</SelectItem>
                                            <SelectItem value="NL">Netherlands</SelectItem>
                                            <SelectItem value="BE">Belgium</SelectItem>
                                            <SelectItem value="AT">Austria</SelectItem>
                                            <SelectItem value="PL">Poland</SelectItem>
                                            <SelectItem value="PT">Portugal</SelectItem>
                                            <SelectItem value="GB">United Kingdom</SelectItem>
                                            <SelectItem value="SE">Sweden</SelectItem>
                                            <SelectItem value="DK">Denmark</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Tax ID</Label>
                                    <Input
                                        value={formData.tax_id}
                                        onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                                        placeholder="VAT/Tax ID"
                                    />
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                    <Button 
                                        type="submit" 
                                        className="bg-blue-600"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {editingOrg ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <Input
                        placeholder="Search by name, email, or tax ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Organizations Grid */}
                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : filtered.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">No organizations yet. Create one to get started.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((org) => (
                            <Card key={org.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{org.org_name}</CardTitle>
                                            <Badge className={org.status === 'active' ? 'bg-green-100 text-green-800 mt-2' : 'bg-yellow-100 text-yellow-800 mt-2'}>
                                                {org.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <p className="text-slate-500 flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {org.business_email}
                                        </p>
                                    </div>
                                    {org.country && (
                                        <div className="text-sm">
                                            <p className="text-slate-500 flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                {org.country}
                                            </p>
                                        </div>
                                    )}
                                    {org.tax_id && (
                                        <div className="text-sm text-slate-600">
                                            Tax ID: <span className="font-mono">{org.tax_id}</span>
                                        </div>
                                    )}
                                    {org.portal_url && (
                                        <div className="text-sm">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(org.portal_url);
                                                    toast.success('Portal URL copied');
                                                }}
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                <Copy className="h-3 w-3" />
                                                Copy Portal URL
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(org)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => {
                                                if (confirm('Delete this organization?')) {
                                                    deleteMutation.mutate(org.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}