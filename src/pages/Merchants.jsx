import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { AuditLogger } from '@/components/audit/AuditLogger';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Eye, 
    Edit,
    Trash2,
    Store,
    Globe,
    Mail,
    Phone,
    Building2,
    Link2,
    Shield
} from 'lucide-react';
import SelfOnboardingUrlGenerator from '@/components/merchants/SelfOnboardingUrlGenerator';
import { usePermissions } from '@/components/auth/usePermissions';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { createMerchantUsers } from '@/components/merchants/MerchantUserProvisioning';
import { toast } from 'sonner';
import MerchantOnboardingDialog from '@/components/merchants/MerchantOnboardingDialog';
import MerchantDetailsView from '@/components/merchants/MerchantDetailsView';
import { generateUniqueMerchantCode } from '@/components/merchants/MerchantCodeGenerator';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700 border-red-200' },
    terminated: { label: 'Terminated', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const riskConfig = {
    low: { label: 'Low', className: 'bg-emerald-50 text-emerald-700' },
    medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700' },
    high: { label: 'High', className: 'bg-red-50 text-red-700' },
};

export default function Merchants() {
    const { t } = useI18n();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showOnboardingLinkDialog, setShowOnboardingLinkDialog] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [onboardingMode, setOnboardingMode] = useState('view'); // 'view' or 'edit'
    const [userPspCode, setUserPspCode] = useState(null);
    const [newMerchant, setNewMerchant] = useState({
        business_name: '',
        trading_name: '',
        contact_email: '',
        contact_phone: '',
        country: '',
        category: '',
        website: '',
    });

    const queryClient = useQueryClient();
    const { hasPermission } = usePermissions();

    // Get PSP code from staff session
    React.useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                console.log('Session found:', session);
                setUserPspCode(session.psp_code);
            } catch (error) {
                console.error('Failed to parse session:', error);
                window.location.href = '/PSPLogin';
            }
        } else {
            console.log('No staff session found, redirecting to login');
            window.location.href = '/PSPLogin';
        }
    }, []);

    const { data: merchants = [], isLoading, error } = useQuery({
        queryKey: ['merchants', userPspCode],
        queryFn: async () => {
            console.log('Fetching merchants for PSP:', userPspCode);
            const response = await base44.functions.invoke('pspData', {
                action: 'listMerchants',
                psp_code: userPspCode
            });
            console.log('Merchant data response:', response.data);
            return response.data.data || [];
        },
        enabled: !!userPspCode
    });

    React.useEffect(() => {
        if (error) console.error('Query error:', error);
        console.log('Merchants loaded:', merchants.length);
    }, [merchants, error]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ merchantId, newStatus, merchant }) => {
            const oldStatus = merchant.status;
            await base44.functions.invoke('pspData', {
                action: 'updateMerchant',
                psp_code: userPspCode,
                merchantId: merchantId,
                updates: { status: newStatus }
            });
            
            // Audit log
            await AuditLogger.logMerchantStatusChanged({ ...merchant, id: merchantId }, oldStatus, newStatus);
            
            // If approving merchant, provision users
            if (newStatus === 'active' && merchant.status !== 'active') {
                try {
                    // Get merchant contacts (assume primary contact from merchant data)
                    const contacts = [{
                        email: merchant.contact_email,
                        full_name: merchant.contact_name,
                        phone: merchant.contact_phone,
                        is_primary: true
                    }];
                    
                    await createMerchantUsers(merchant, contacts);
                    toast.success('Merchant activated and user credentials sent');
                } catch (error) {
                    console.error('Failed to provision users:', error);
                    toast.error('Merchant activated but user provisioning failed');
                }
            }
            
            return { merchantId, status: newStatus };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            // Generate unique merchant code
            const merchantCode = generateUniqueMerchantCode(data.business_name, merchants);
            
            const response = await base44.functions.invoke('pspData', {
                action: 'createMerchant',
                psp_code: userPspCode,
                merchantData: {
                    ...data,
                    merchant_id: `MID-${Date.now()}`,
                    merchant_code: merchantCode,
                    psp_code: userPspCode,
                    status: 'pending',
                    risk_level: 'medium',
                }
            });
            
            const merchant = response.data.merchant;
            
            // Audit log
            await AuditLogger.logMerchantCreated(merchant);
            
            return merchant;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            setShowAddDialog(false);
            setNewMerchant({
                business_name: '',
                trading_name: '',
                contact_email: '',
                contact_phone: '',
                country: '',
                category: '',
                website: '',
            });
        },
    });

    const updateMerchantMutation = useMutation({
        mutationFn: async ({ merchantId, data }) => {
            await base44.functions.invoke('pspData', {
                action: 'updateMerchant',
                psp_code: userPspCode,
                merchantId: merchantId,
                updates: data
            });
            await AuditLogger.logMerchantUpdated({ ...data, id: merchantId });
            return { merchantId, data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            setShowOnboardingDialog(false);
            setSelectedMerchant(null);
            toast.success('Merchant updated successfully');
        },
    });

    const handleViewDetails = (merchant) => {
        setSelectedMerchant(merchant);
        setShowDetailsDialog(true);
    };

    const handleEditMerchant = (merchant) => {
        setSelectedMerchant(merchant);
        setOnboardingMode('edit');
        setShowOnboardingDialog(true);
    };

    const handleSaveMerchant = (data) => {
        updateMerchantMutation.mutate({ merchantId: selectedMerchant.id, data });
    };

    const filteredMerchants = merchants.filter(m => {
        const matchesSearch = !searchQuery || 
            m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.merchant_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="Merchants"
            />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "lg:ml-64 ml-40")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Page Header */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                         <div>
                             <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Merchants</h1>
                             <p className="text-sm sm:text-base text-slate-500">Manage your merchant accounts</p>
                         </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <PermissionGate permission="CREATE_MERCHANTS">
                                <Button 
                                    variant="outline" 
                                    className="gap-2"
                                    onClick={() => setShowAddDialog(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Quick Add
                                </Button>
                            </PermissionGate>
                            <PermissionGate permission="CREATE_MERCHANTS">
                                <Button 
                                    variant="outline" 
                                    className="gap-2"
                                    onClick={() => setShowOnboardingLinkDialog(true)}
                                >
                                    <Link2 className="h-4 w-4" />
                                    Generate Onboarding Link
                                </Button>
                            </PermissionGate>
                            <PermissionGate permission="CREATE_MERCHANTS">
                                <Link to={createPageUrl('MerchantOnboarding')}>
                                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4" />
                                        Add Merchant
                                    </Button>
                                </Link>
                            </PermissionGate>
                        </div>
                    </div>
                    
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New Merchant</DialogTitle>
                                    <DialogDescription>
                                        Enter the merchant details to create a new account
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Business Name *</Label>
                                        <Input
                                            value={newMerchant.business_name}
                                            onChange={(e) => setNewMerchant({...newMerchant, business_name: e.target.value})}
                                            placeholder="Legal business name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Trading Name</Label>
                                        <Input
                                            value={newMerchant.trading_name}
                                            onChange={(e) => setNewMerchant({...newMerchant, trading_name: e.target.value})}
                                            placeholder="DBA / Trading name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={newMerchant.contact_email}
                                            onChange={(e) => setNewMerchant({...newMerchant, contact_email: e.target.value})}
                                            placeholder="contact@merchant.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            value={newMerchant.contact_phone}
                                            onChange={(e) => setNewMerchant({...newMerchant, contact_phone: e.target.value})}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Select 
                                            value={newMerchant.country}
                                            onValueChange={(val) => setNewMerchant({...newMerchant, country: val})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="US">United States</SelectItem>
                                                <SelectItem value="UK">United Kingdom</SelectItem>
                                                <SelectItem value="EU">European Union</SelectItem>
                                                <SelectItem value="SG">Singapore</SelectItem>
                                                <SelectItem value="HK">Hong Kong</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select 
                                            value={newMerchant.category}
                                            onValueChange={(val) => setNewMerchant({...newMerchant, category: val})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="retail">Retail</SelectItem>
                                                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                                                <SelectItem value="hospitality">Hospitality</SelectItem>
                                                <SelectItem value="services">Services</SelectItem>
                                                <SelectItem value="travel">Travel</SelectItem>
                                                <SelectItem value="gaming">Gaming</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Website</Label>
                                        <Input
                                            value={newMerchant.website}
                                            onChange={(e) => setNewMerchant({...newMerchant, website: e.target.value})}
                                            placeholder="https://merchant.com"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={() => createMutation.mutate(newMerchant)}
                                        disabled={!newMerchant.business_name || !newMerchant.contact_email}
                                    >
                                        Create Merchant
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Total Merchants</p>
                            <p className="text-2xl font-bold text-slate-900">{merchants.length}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Active</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {merchants.filter(m => m.status === 'active').length}
                            </p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {merchants.filter(m => m.status === 'pending').length}
                            </p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">High Risk</p>
                            <p className="text-2xl font-bold text-red-600">
                                {merchants.filter(m => m.risk_level === 'high').length}
                            </p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search merchants..."
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
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Merchants Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Merchant Accounts
                                <Badge variant="secondary" className="ml-2">
                                    {filteredMerchants.length} merchants
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Merchant</TableHead>
                                            <TableHead className="font-semibold">ID</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">Country</TableHead>
                                            <TableHead className="font-semibold">Risk Level</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Volume</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMerchants.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading merchants...' : 'No merchants found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMerchants.map((merchant) => (
                                                <TableRow key={merchant.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                                                <Store className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{merchant.business_name}</p>
                                                                <p className="text-sm text-slate-500">{merchant.contact_email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-mono text-sm font-bold text-blue-600">
                                                                {merchant.merchant_code || 'N/A'}
                                                            </div>
                                                            <div className="font-mono text-xs text-slate-500">
                                                                {merchant.merchant_id || `MID-${merchant.id?.slice(0, 8)}`}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 capitalize">
                                                        {merchant.category?.replace('_', ' ') || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {merchant.country || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn("text-xs", riskConfig[merchant.risk_level]?.className)}>
                                                            {riskConfig[merchant.risk_level]?.label || merchant.risk_level}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={cn("text-xs", statusConfig[merchant.status]?.className)}
                                                        >
                                                            {statusConfig[merchant.status]?.label || merchant.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        ${(merchant.total_volume || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleViewDetails(merchant)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                {hasPermission('EDIT_MERCHANTS') && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => handleEditMerchant(merchant)}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        {merchant.status === 'pending' && (
                                                                            <DropdownMenuItem
                                                                                onClick={() => updateStatusMutation.mutate({
                                                                                    merchantId: merchant.id,
                                                                                    newStatus: 'active',
                                                                                    merchant
                                                                                })}
                                                                            >
                                                                                <Shield className="h-4 w-4 mr-2" />
                                                                                Approve & Provision Users
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {hasPermission('DELETE_MERCHANTS') && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-red-600">
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
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

            <SelfOnboardingUrlGenerator 
                open={showOnboardingLinkDialog}
                onOpenChange={setShowOnboardingLinkDialog}
            />

            <MerchantDetailsView
                merchant={selectedMerchant}
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}
            />

            <MerchantOnboardingDialog
                merchant={selectedMerchant}
                open={showOnboardingDialog}
                onOpenChange={setShowOnboardingDialog}
                onSave={handleSaveMerchant}
                mode={onboardingMode}
            />
        </div>
    );
}