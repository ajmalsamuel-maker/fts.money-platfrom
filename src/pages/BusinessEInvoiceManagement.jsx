import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Building2, Mail, Globe, Copy, Check, AlertCircle, ChevronRight, TrendingUp, FileText, CheckCircle, Clock, Search, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';
import OnboardingWizard from '@/components/einvoicing/BusinessEInvoiceOnboarding';
import { createPageUrl } from '@/utils';
import { GLOBAL_EINVOICING_STANDARDS } from '@/components/utils/globalEInvoicingRegistry';

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
        tax_submission_standards: '',
        status: 'active'
    });

    // Fetch organizations
    const { data: organizations = [], isLoading } = useQuery({
        queryKey: ['businessEInvoicingOrgs'],
        queryFn: () => base44.entities.BusinessEInvoicingOrganization.list('-created_date', 100),
    });

    // Create organization
    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.BusinessEInvoicingOrganization.create({
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
        mutationFn: (data) => base44.entities.BusinessEInvoicingOrganization.update(editingOrg.id, data),
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
        mutationFn: (id) => base44.entities.BusinessEInvoicingOrganization.delete(id),
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
            tax_submission_standards: '',
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
            tax_submission_standards: org.tax_submission_standards || '',
            status: org.status || 'active'
        });
        setOpenDialog(true);
    };

    const filtered = organizations.filter(org =>
        org.org_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.business_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.tax_id?.includes(searchTerm)
    );

    // Calculate stats
    const stats = {
        total: organizations.length,
        active: organizations.filter(o => o.status === 'active').length,
        onboarding: organizations.filter(o => o.status === 'onboarding').length,
        inactive: organizations.filter(o => o.status === 'inactive').length
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
                    <a href={createPageUrl('FTSMoneyPlatform')} className="hover:text-[#3B82F6] transition-colors">Platform</a>
                    <ChevronRight className="h-4 w-4" />
                    <a href={createPageUrl('FTSMoneyPlatform')} className="hover:text-[#3B82F6] transition-colors">Financial Operations</a>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-[#1F2937] font-medium">Business E-Invoicing</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[32px] font-bold text-[#1F2937] leading-tight">Business E-Invoicing</h1>
                        <p className="text-[#6B7280] mt-1">Manage white-label e-invoicing instances for organizations</p>
                    </div>
                    <OnboardingWizard 
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessEInvoicingOrgs'] })}
                    />
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[#6B7280] text-sm">Total Organizations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[32px] font-bold text-[#1F2937]">{stats.total}</div>
                                    <p className="text-xs text-[#10B981] flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        All instances
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-[#3B82F6]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[#6B7280] text-sm">Active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[32px] font-bold text-[#1F2937]">{stats.active}</div>
                                    <p className="text-xs text-[#10B981] flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Operational
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-[#10B981]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[#6B7280] text-sm">Onboarding</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[32px] font-bold text-[#1F2937]">{stats.onboarding}</div>
                                    <p className="text-xs text-[#F59E0B] flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3" />
                                        In progress
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-[#F59E0B]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[#6B7280] text-sm">Inactive</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[32px] font-bold text-[#1F2937]">{stats.inactive}</div>
                                    <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Not active
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-[#6B7280]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filters */}
                <Card className="mb-6 border-[#E5E7EB] shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                                <Input
                                    placeholder="Search organizations by name, email, or tax ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                />
                            </div>
                            <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="max-w-lg border-[#E5E7EB]">
                        <DialogHeader>
                            <DialogTitle className="text-[24px] font-bold text-[#1F2937]">
                                {editingOrg ? 'Edit Organization' : 'Add Organization'}
                            </DialogTitle>
                            <CardDescription className="text-[#6B7280]">
                                {editingOrg ? 'Update organization details' : 'Create a new e-invoicing organization'}
                            </CardDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label className="text-[#1F2937] font-medium">Organization Name *</Label>
                                <Input
                                    value={formData.org_name}
                                    onChange={(e) => setFormData({...formData, org_name: e.target.value})}
                                    disabled={editingOrg ? true : false}
                                    placeholder="Enter organization name"
                                    className="mt-1.5 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[#1F2937] font-medium">Business Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.business_email}
                                    onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                                    placeholder="business@example.com"
                                    className="mt-1.5 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[#1F2937] font-medium">Country *</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    placeholder="e.g., United States"
                                    className="mt-1.5 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[#1F2937] font-medium">Tax ID</Label>
                                <Input
                                    value={formData.tax_id}
                                    onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                                    placeholder="Enter tax identification number"
                                    className="mt-1.5 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                />
                            </div>
                            <div>
                                <Label className="text-[#1F2937] font-medium">E-Invoicing Standard</Label>
                                <Select value={formData.tax_submission_standards} onValueChange={(value) => setFormData({...formData, tax_submission_standards: value})}>
                                    <SelectTrigger className="mt-1.5 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]">
                                        <SelectValue placeholder="Select standard" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {Object.values(GLOBAL_EINVOICING_STANDARDS).map((standard) => (
                                            <SelectItem key={standard.code} value={standard.code}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{standard.name}</span>
                                                    <span className="text-xs text-[#6B7280]">{standard.format}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-[#1F2937] font-medium">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                                    <SelectTrigger className="mt-1.5 border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="onboarding">Onboarding</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setOpenDialog(false)}
                                    className="flex-1 border-[#E5E7EB] text-[#6B7280]"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1 bg-[#3B82F6] hover:bg-[#1E40AF] text-white"
                                >
                                    {editingOrg ? 'Update Organization' : 'Create Organization'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Organizations List */}
                {isLoading ? (
                    <Card className="border-[#E5E7EB]">
                        <CardContent className="py-12 text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-[#6B7280]">Loading organizations...</p>
                        </CardContent>
                    </Card>
                ) : filtered.length === 0 ? (
                    <Card className="border-[#E5E7EB] shadow-sm">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-[#6B7280]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">No organizations found</h3>
                            <p className="text-[#6B7280] mb-6">Get started by creating your first e-invoicing organization</p>
                            <OnboardingWizard 
                                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['businessEInvoicingOrgs'] })}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((org) => (
                            <Card key={org.id} className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Left: Org Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="h-5 w-5 text-[#3B82F6]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[20px] font-semibold text-[#1F2937] mb-1 truncate">{org.org_name}</h3>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge className={
                                                            org.status === 'active' ? 'bg-[#D1FAE5] text-[#10B981] border-[#10B981]' :
                                                            org.status === 'onboarding' ? 'bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]' :
                                                            'bg-[#F3F4F6] text-[#6B7280] border-[#6B7280]'
                                                        }>
                                                            {org.status}
                                                        </Badge>
                                                        {org.tax_submission_standards && (
                                                            <Badge variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
                                                                {org.tax_submission_standards}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-13">
                                                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                                    <Mail className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">{org.business_email}</span>
                                                </div>
                                                {org.country && (
                                                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                                        <Globe className="h-4 w-4 flex-shrink-0" />
                                                        <span>{org.country}</span>
                                                    </div>
                                                )}
                                                {org.tax_id && (
                                                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                                        <FileText className="h-4 w-4 flex-shrink-0" />
                                                        <span className="font-mono">{org.tax_id}</span>
                                                    </div>
                                                )}
                                                {org.portal_url && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(org.portal_url);
                                                            toast.success('Portal URL copied to clipboard');
                                                        }}
                                                        className="flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#1E40AF] transition-colors"
                                                    >
                                                        <Copy className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">Copy Portal URL</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {org.portal_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(org.portal_url, '_blank')}
                                                    className="border-[#E5E7EB] text-[#6B7280] hover:text-[#3B82F6] hover:border-[#3B82F6]"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Open Portal
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(org)}
                                                className="border-[#E5E7EB] text-[#6B7280] hover:text-[#3B82F6] hover:border-[#3B82F6]"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-[#E5E7EB] text-[#EF4444] hover:bg-[#FEE2E2] hover:border-[#EF4444]"
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to delete ${org.org_name}? This action cannot be undone.`)) {
                                                        deleteMutation.mutate(org.id);
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
                    </div>
                )}
            </div>
        </div>
    );
}