import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Landmark, TrendingUp, Activity, Bitcoin, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import BankMIDOnboardingWizard from '../components/bankmid/BankMIDOnboardingWizard';

const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
    inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700' },
    maintenance: { label: 'Maintenance', className: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700' },
};

export default function BankMIDs() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingBankMID, setEditingBankMID] = useState(null);
    const [showWizard, setShowWizard] = useState(false);

    const queryClient = useQueryClient();

    const { data: bankMIDs = [], isLoading } = useQuery({
        queryKey: ['bankMIDs'],
        queryFn: () => base44.entities.BankMID.list('-created_date'),
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['providers'],
        queryFn: () => base44.entities.PaymentProvider.list(),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.BankMID.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bankMIDs'] });
            setShowDialog(false);
            setShowWizard(false);
            toast.success('Bank MID created successfully and submitted for verification');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.BankMID.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bankMIDs'] });
            setShowDialog(false);
            setShowWizard(false);
            toast.success('Bank MID updated successfully');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.BankMID.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bankMIDs'] });
            toast.success('Bank MID deleted successfully');
        },
    });

    const handleEdit = (bankMID) => {
        setEditingBankMID(bankMID);
        setShowWizard(true);
    };

    const handleWizardSubmit = (data) => {
        if (editingBankMID) {
            updateMutation.mutate({ id: editingBankMID.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleWizardCancel = () => {
        setShowWizard(false);
        setEditingBankMID(null);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this Bank MID?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredBankMIDs = bankMIDs.filter(b => {
        const matchesSearch = !searchQuery || 
            b.bank_mid_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.bank_mid_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.acquirer_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="BankMIDs" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Bank MIDs</h1>
                            <p className="text-slate-500">Manage bank acquiring accounts</p>
                        </div>
                        <Button onClick={() => setShowWizard(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add Bank MID
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Landmark className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-sm text-slate-500">Total Bank MIDs</p>
                                    <p className="text-2xl font-bold text-slate-900">{bankMIDs.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Activity className="h-8 w-8 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-slate-500">Active</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {bankMIDs.filter(b => b.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-sm text-slate-500">Avg Success Rate</p>
                                    <p className="text-2xl font-bold text-purple-600">98.5%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search Bank MIDs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Bank MID Accounts
                                <Badge variant="secondary" className="ml-2">{filteredBankMIDs.length} accounts</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Bank MID</TableHead>
                                            <TableHead className="font-semibold">Institution</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Country</TableHead>
                                            <TableHead className="font-semibold">Currency</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBankMIDs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading Bank MIDs...' : 'No Bank MIDs found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredBankMIDs.map((bankMID) => (
                                                <TableRow key={bankMID.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{bankMID.bank_mid_name}</p>
                                                            <p className="text-sm text-slate-500 font-mono">{bankMID.bank_mid_id}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {bankMID.institution_type === 'crypto_exchange' ? (
                                                                <Bitcoin className="h-4 w-4 text-orange-600" />
                                                            ) : (
                                                                <Landmark className="h-4 w-4 text-blue-600" />
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium">{bankMID.acquirer_name || bankMID.legal_entity_name || 'N/A'}</p>
                                                                {bankMID.bic_swift && <p className="text-xs text-slate-500 font-mono">{bankMID.bic_swift}</p>}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {bankMID.institution_type?.replace('_', ' ') || 'Bank'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-sm">{bankMID.country || 'N/A'}</span>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{bankMID.currency}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn("text-xs", statusConfig[bankMID.status]?.className)}>
                                                            {statusConfig[bankMID.status]?.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(bankMID)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(bankMID.id)} className="text-red-600">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
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
                    </Card>
                </main>
            </div>

            <Dialog open={showWizard} onOpenChange={(open) => { setShowWizard(open); if (!open) handleWizardCancel(); }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {editingBankMID ? 'Edit' : 'Onboard'} Bank MID / Institution
                        </DialogTitle>
                    </DialogHeader>
                    <BankMIDOnboardingWizard
                        onSubmit={handleWizardSubmit}
                        onCancel={handleWizardCancel}
                        initialData={editingBankMID}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}