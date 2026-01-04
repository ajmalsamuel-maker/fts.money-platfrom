import React, { useState } from 'react';
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
    Clock
} from 'lucide-react';

export default function CryptoBankingVASPManagement() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newVASP, setNewVASP] = useState({
        name: '',
        company_name: '',
        jurisdiction: '',
        license_number: ''
    });

    // Fetch crypto gateway customers (VASPs)
    const { data: vasps = [], isLoading } = useQuery({
        queryKey: ['crypto-vasps'],
        queryFn: async () => {
            const result = await base44.entities.CryptoGatewayCustomer.list();
            return result || [];
        }
    });

    // Create VASP mutation
    const createVASPMutation = useMutation({
        mutationFn: async (vaspData) => {
            return await base44.entities.CryptoGatewayCustomer.create({
                ...vaspData,
                status: 'pending',
                striga_status: 'not_provisioned',
                created_at: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crypto-vasps'] });
            setShowCreateDialog(false);
            setNewVASP({ name: '', company_name: '', jurisdiction: '', license_number: '' });
        }
    });

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
                                            <div>
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
                                            {createVASPMutation.isPending ? 'Creating...' : 'Create VASP Instance'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
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

                    {/* VASP List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-12">Loading VASPs...</div>
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
                        ) : (
                            vasps.map((vasp) => (
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
                                            <Button variant="outline" size="sm">
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
                </div>
            </div>
        </div>
    );
}