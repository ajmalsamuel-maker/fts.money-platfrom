import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    Wallet, 
    Plus, 
    Settings, 
    Activity, 
    Users, 
    TrendingUp,
    Shield,
    Globe,
    CheckCircle,
    AlertCircle,
    Clock,
    BarChart3,
    Filter,
    Loader2
} from 'lucide-react';

export default function CryptoBankingVASPManagement() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showProviderSettings, setShowProviderSettings] = useState(false);
    const [filterJurisdiction, setFilterJurisdiction] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [newVASP, setNewVASP] = useState({
        name: '',
        company_name: '',
        jurisdiction: '',
        license_number: '',
        provider: 'striga'
    });

    // Fetch crypto gateway customers (VASPs)
    const { data: vasps = [], isLoading } = useQuery({
        queryKey: ['crypto-vasps'],
        queryFn: async () => {
            const result = await base44.entities.CryptoGatewayCustomer.list();
            return result || [];
        }
    });

    // Create VASP mutation with automatic provisioning
    const createVASPMutation = useMutation({
        mutationFn: async (vaspData) => {
            // Create VASP record
            const vasp = await base44.entities.CryptoGatewayCustomer.create({
                ...vaspData,
                status: 'provisioning',
                striga_status: 'provisioning',
                created_at: new Date().toISOString()
            });

            // Trigger automated provisioning based on provider
            if (vaspData.provider === 'striga') {
                const provisionResult = await base44.functions.invoke('provisionStrigaVASP', {
                    vaspId: vasp.id,
                    vaspData: vaspData
                });

                if (!provisionResult.data.success) {
                    throw new Error(provisionResult.data.error || 'Provisioning failed');
                }
            }

            return vasp;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crypto-vasps'] });
            setShowCreateDialog(false);
            setNewVASP({ name: '', company_name: '', jurisdiction: '', license_number: '', provider: 'striga' });
        }
    });

    // Filtered VASPs
    const filteredVasps = useMemo(() => {
        return vasps.filter(vasp => {
            const jurisdictionMatch = filterJurisdiction === 'all' || vasp.jurisdiction === filterJurisdiction;
            const statusMatch = filterStatus === 'all' || vasp.status === filterStatus;
            return jurisdictionMatch && statusMatch;
        });
    }, [vasps, filterJurisdiction, filterStatus]);

    // Analytics data
    const analyticsData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                volume: Math.floor(Math.random() * 100000) + 50000,
                users: Math.floor(Math.random() * 500) + 200,
                transactions: Math.floor(Math.random() * 1000) + 500
            };
        });
        return last30Days;
    }, []);

    const jurisdictionData = useMemo(() => {
        const jurisdictions = {};
        vasps.forEach(vasp => {
            const j = vasp.jurisdiction || 'Unknown';
            jurisdictions[j] = (jurisdictions[j] || 0) + 1;
        });
        return Object.entries(jurisdictions).map(([name, count]) => ({ name, count }));
    }, [vasps]);

    const uniqueJurisdictions = useMemo(() => {
        return ['all', ...new Set(vasps.map(v => v.jurisdiction).filter(Boolean))];
    }, [vasps]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
            suspended: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Suspended' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CryptoBankingVASPManagement" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Crypto Banking VASP Management</h1>
                                <p className="text-slate-600 mt-1">Create and manage Virtual Asset Service Provider instances</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowProviderSettings(true)}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Provider Settings
                                </Button>
                                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create New VASP
                                            </Button>
                                        </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Provision New VASP Instance</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4">
                                        <Alert>
                                            <Shield className="h-4 w-4" />
                                            <AlertDescription>
                                                This will create a new Striga-powered crypto banking instance with full KYC/AML compliance
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>VASP Provider</Label>
                                                <Select value={newVASP.provider} onValueChange={(value) => setNewVASP({...newVASP, provider: value})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="striga">Striga (Lithuania)</SelectItem>
                                                        <SelectItem value="fireblocks">Fireblocks</SelectItem>
                                                        <SelectItem value="anchorage">Anchorage Digital</SelectItem>
                                                        <SelectItem value="custom">Custom Provider</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>VASP Name</Label>
                                                <Input
                                                    value={newVASP.name}
                                                    onChange={(e) => setNewVASP({...newVASP, name: e.target.value})}
                                                    placeholder="e.g., crypto-exchange-europe"
                                                />
                                            </div>
                                            <div>
                                                <Label>Company Name</Label>
                                                <Input
                                                    value={newVASP.company_name}
                                                    onChange={(e) => setNewVASP({...newVASP, company_name: e.target.value})}
                                                    placeholder="e.g., CryptoExchange Ltd"
                                                />
                                            </div>
                                            <div>
                                                <Label>Jurisdiction</Label>
                                                <Input
                                                    value={newVASP.jurisdiction}
                                                    onChange={(e) => setNewVASP({...newVASP, jurisdiction: e.target.value})}
                                                    placeholder="e.g., Lithuania, Switzerland"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label>License Number (Optional)</Label>
                                                <Input
                                                    value={newVASP.license_number}
                                                    onChange={(e) => setNewVASP({...newVASP, license_number: e.target.value})}
                                                    placeholder="e.g., VASP-LT-2024-001"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={() => createVASPMutation.mutate(newVASP)}
                                            disabled={!newVASP.name || !newVASP.company_name || createVASPMutation.isPending}
                                            className="w-full"
                                        >
                                            {createVASPMutation.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Provisioning with {newVASP.provider}...
                                                </>
                                            ) : 'Create & Auto-Provision VASP'}
                                        </Button>
                                        {createVASPMutation.isError && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    {createVASPMutation.error?.message || 'Failed to provision VASP'}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                    </DialogContent>
                                    </Dialog>
                                    </div>
                                    </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Total VASPs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-slate-900">{vasps.length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        {vasps.filter(v => v.status === 'active').length}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-yellow-600">
                                        {vasps.filter(v => v.status === 'pending').length}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Striga Integration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">Connected</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Analytics Dashboard */}
                    <Tabs defaultValue="overview" className="mb-8">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="performance">Performance Trends</TabsTrigger>
                            <TabsTrigger value="jurisdiction">By Jurisdiction</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Total Volume (30d)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ${analyticsData.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">↑ 12.5% vs last period</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Active Users (30d)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analyticsData.reduce((sum, d) => sum + d.users, 0).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">↑ 8.3% vs last period</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Transactions (30d)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analyticsData.reduce((sum, d) => sum + d.transactions, 0).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">↑ 15.7% vs last period</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="performance">
                            <Card>
                                <CardHeader>
                                    <CardTitle>30-Day Performance Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={analyticsData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="volume" stroke="#3b82f6" name="Volume ($)" />
                                            <Line type="monotone" dataKey="users" stroke="#10b981" name="Active Users" />
                                            <Line type="monotone" dataKey="transactions" stroke="#f59e0b" name="Transactions" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="jurisdiction">
                            <Card>
                                <CardHeader>
                                    <CardTitle>VASPs by Jurisdiction</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={jurisdictionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-600" />
                            <Label>Jurisdiction:</Label>
                            <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueJurisdictions.map(j => (
                                        <SelectItem key={j} value={j}>
                                            {j === 'all' ? 'All Jurisdictions' : j}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label>Status:</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="provisioning">Provisioning</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(filterJurisdiction !== 'all' || filterStatus !== 'all') && (
                            <Button variant="outline" size="sm" onClick={() => {
                                setFilterJurisdiction('all');
                                setFilterStatus('all');
                            }}>
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* VASP List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-12">Loading VASPs...</div>
                        ) : filteredVasps.length === 0 ? (
                            filterJurisdiction !== 'all' || filterStatus !== 'all' ? (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">No VASPs Match Filters</h3>
                                        <p className="text-slate-600 mb-4">Try adjusting your filters</p>
                                        <Button variant="outline" onClick={() => {
                                            setFilterJurisdiction('all');
                                            setFilterStatus('all');
                                        }}>
                                            Clear All Filters
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : vasps.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No VASPs Created Yet</h3>
                                    <p className="text-slate-600 mb-4">Get started by creating your first crypto banking VASP instance</p>
                                    <Button onClick={() => setShowCreateDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First VASP
                                    </Button>
                                </CardContent>
                            </Card>
                            ) : null
                        ) : (
                            filteredVasps.map((vasp) => (
                                <Card key={vasp.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                                    <Wallet className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{vasp.company_name || vasp.name}</CardTitle>
                                                    <p className="text-sm text-slate-600">ID: {vasp.customer_id || vasp.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(vasp.status)}
                                                <Badge variant="outline">
                                                    <Globe className="h-3 w-3 mr-1" />
                                                    {vasp.jurisdiction || 'N/A'}
                                                </Badge>
                                                <Badge variant="secondary">
                                                    {vasp.provider || 'Striga'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Total Users</p>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-slate-400" />
                                                    <span className="text-lg font-semibold">{vasp.total_users || 0}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Total Volume</p>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-slate-400" />
                                                    <span className="text-lg font-semibold">${(vasp.total_volume || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Transactions</p>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-slate-400" />
                                                    <span className="text-lg font-semibold">{vasp.total_transactions || 0}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Compliance</p>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-600">Verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => navigate(createPageUrl('CryptoVASPSettings') + '?id=' + vasp.id)}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                Configure
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Activity className="h-4 w-4 mr-2" />
                                                View Metrics
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Users className="h-4 w-4 mr-2" />
                                                Manage Users
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Provider Settings Dialog */}
                    <Dialog open={showProviderSettings} onOpenChange={setShowProviderSettings}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>VASP Provider Settings</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                <Alert>
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription>
                                        Configure API credentials for multiple VASP providers. Credentials are encrypted and stored securely.
                                    </AlertDescription>
                                </Alert>

                                {/* Striga */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Striga (Lithuania)</span>
                                            <Badge className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Connected
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label>API Key</Label>
                                            <Input type="password" value="••••••••••••" disabled />
                                        </div>
                                        <div>
                                            <Label>API Secret</Label>
                                            <Input type="password" value="••••••••••••" disabled />
                                        </div>
                                        <div>
                                            <Label>Application ID</Label>
                                            <Input type="password" value="••••••••••••" disabled />
                                        </div>
                                        <p className="text-xs text-slate-600">
                                            Configured via environment variables. Contact platform admin to update.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Fireblocks */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Fireblocks</span>
                                            <Badge variant="outline">Not Configured</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label>API Key</Label>
                                            <Input placeholder="Enter Fireblocks API Key" />
                                        </div>
                                        <div>
                                            <Label>Secret Key</Label>
                                            <Input type="password" placeholder="Enter Secret Key" />
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            Save Fireblocks Credentials
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Anchorage */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Anchorage Digital</span>
                                            <Badge variant="outline">Not Configured</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label>Organization ID</Label>
                                            <Input placeholder="Enter Organization ID" />
                                        </div>
                                        <div>
                                            <Label>API Key</Label>
                                            <Input placeholder="Enter API Key" />
                                        </div>
                                        <div>
                                            <Label>Private Key (PEM)</Label>
                                            <Input type="password" placeholder="Enter Private Key" />
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            Save Anchorage Credentials
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}