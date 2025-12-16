import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Server, 
    Database,
    Activity,
    TrendingUp,
    AlertTriangle,
    Plus,
    Loader2,
    Zap,
    MapPin,
    Calendar,
    DollarSign,
    Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResourceOrchestration() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('pools');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [generating, setGenerating] = useState(false);

    // Fetch data
    const { data: pools = [] } = useQuery({
        queryKey: ['resource-pools'],
        queryFn: () => base44.entities.ResourcePool.list()
    });

    const { data: allocations = [] } = useQuery({
        queryKey: ['resource-allocations'],
        queryFn: () => base44.entities.ResourceAllocation.list()
    });

    const { data: capacityPlans = [] } = useQuery({
        queryKey: ['capacity-plans'],
        queryFn: () => base44.entities.CapacityPlan.list()
    });

    const { data: reservations = [] } = useQuery({
        queryKey: ['resource-reservations'],
        queryFn: () => base44.entities.ResourceReservation.list()
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: connectors = [] } = useQuery({
        queryKey: ['cloud-connectors'],
        queryFn: () => base44.entities.CloudConnector.list()
    });

    // Forms
    const [poolForm, setPoolForm] = useState({
        pool_name: '',
        region: 'us-east-1',
        resource_type: 'mixed'
    });

    const [allocationForm, setAllocationForm] = useState({
        psp_id: '',
        pool_id: '',
        allocated_resources: {}
    });

    const [reservationForm, setReservationForm] = useState({
        psp_name: '',
        pool_id: '',
        expected_launch_date: ''
    });

    const [connectorForm, setConnectorForm] = useState({
        provider_name: '',
        display_name: '',
        status: 'inactive'
    });

    // Mutations
    const createPoolMutation = useMutation({
        mutationFn: (data) => base44.entities.ResourcePool.create({
            ...data,
            pool_id: `POOL-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['resource-pools']);
            setShowDialog(false);
            toast.success('Resource pool created');
        }
    });

    const createAllocationMutation = useMutation({
        mutationFn: (data) => base44.entities.ResourceAllocation.create({
            ...data,
            allocation_id: `ALLOC-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['resource-allocations']);
            setShowDialog(false);
            toast.success('Resources allocated');
        }
    });

    const createReservationMutation = useMutation({
        mutationFn: (data) => base44.entities.ResourceReservation.create({
            ...data,
            reservation_id: `RSV-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['resource-reservations']);
            setShowDialog(false);
            toast.success('Resources reserved');
        }
    });

    const createConnectorMutation = useMutation({
        mutationFn: (data) => base44.entities.CloudConnector.create({
            ...data,
            connector_id: `CONN-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['cloud-connectors']);
            setShowDialog(false);
            toast.success('Connector created');
        }
    });

    const updateConnectorMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.CloudConnector.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cloud-connectors']);
            toast.success('Connector updated');
        }
    });

    const seedConnectorsMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('seedCloudConnectors', {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cloud-connectors']);
            toast.success('Cloud connectors seeded');
        }
    });

    // Generate capacity plan
    const handleGeneratePlan = async () => {
        setGenerating(true);
        try {
            const response = await base44.functions.invoke('capacityPlanner', {
                months_to_forecast: 6,
                growth_rate: 15
            });
            queryClient.invalidateQueries(['capacity-plans']);
            toast.success('Capacity plan generated');
        } catch (error) {
            toast.error('Failed to generate plan: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    // Trigger auto-scaling
    const handleAutoScale = async (allocationId) => {
        try {
            const response = await base44.functions.invoke('resourceAutoScaler', {
                allocation_id: allocationId,
                trigger_type: 'manual'
            });
            queryClient.invalidateQueries(['resource-allocations']);
            toast.success(response.data.message || 'Scaling completed');
        } catch (error) {
            toast.error('Auto-scaling failed: ' + error.message);
        }
    };

    // Calculate stats
    const totalCapacity = pools.reduce((sum, p) => sum + (p.total_capacity?.cpu_cores || 0), 0);
    const allocatedCapacity = pools.reduce((sum, p) => sum + (p.allocated_capacity?.cpu_cores || 0), 0);
    const utilization = totalCapacity > 0 ? (allocatedCapacity / totalCapacity) * 100 : 0;
    const highUtilizationPools = pools.filter(p => (p.utilization_percentage || 0) >= 80);

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ResourceOrchestration" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Resource Orchestration</h2>
                        <p className="text-xs text-slate-600">Infrastructure management & capacity planning</p>
                    </div>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Pools</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{pools.length}</p>
                                    </div>
                                    <Server className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Allocations</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{allocations.length}</p>
                                    </div>
                                    <Database className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">CPU Utilization</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{utilization.toFixed(1)}%</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">High Utilization</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{highUtilizationPools.length}</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Reservations</p>
                                        <p className="text-3xl font-bold text-indigo-600 mt-1">{reservations.length}</p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="pools">Resource Pools</TabsTrigger>
                            <TabsTrigger value="allocations">Allocations</TabsTrigger>
                            <TabsTrigger value="connectors">Cloud Connectors</TabsTrigger>
                            <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
                            <TabsTrigger value="reservations">Reservations</TabsTrigger>
                        </TabsList>

                        {/* Resource Pools */}
                        <TabsContent value="pools" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{pools.length} resource pools across regions</p>
                                <Button onClick={() => { setDialogType('pool'); setShowDialog(true); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Pool
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {pools.map(pool => (
                                    <Card key={pool.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">{pool.pool_name}</CardTitle>
                                                <Badge className={
                                                    pool.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                                    pool.status === 'high_utilization' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {pool.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-slate-600" />
                                                    <span>{pool.region}</span>
                                                    <Badge variant="outline" className="capitalize">{pool.resource_type}</Badge>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-slate-600">CPU Cores</span>
                                                            <span className="font-medium">
                                                                {pool.allocated_capacity?.cpu_cores || 0} / {pool.total_capacity?.cpu_cores || 0}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-500"
                                                                style={{ width: `${((pool.allocated_capacity?.cpu_cores || 0) / (pool.total_capacity?.cpu_cores || 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-slate-600">Memory (GB)</span>
                                                            <span className="font-medium">
                                                                {pool.allocated_capacity?.memory_gb || 0} / {pool.total_capacity?.memory_gb || 0}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-emerald-500"
                                                                style={{ width: `${((pool.allocated_capacity?.memory_gb || 0) / (pool.total_capacity?.memory_gb || 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {pool.auto_scaling_enabled && (
                                                    <Badge className="bg-blue-100 text-blue-700">
                                                        <Zap className="h-3 w-3 mr-1" />
                                                        Auto-scaling enabled
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Cloud Connectors */}
                        <TabsContent value="connectors" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-600">{connectors.length} cloud provider connectors configured</p>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => seedConnectorsMutation.mutate()}
                                        disabled={seedConnectorsMutation.isPending || connectors.length > 0}
                                        variant="outline"
                                    >
                                        <Database className="h-4 w-4 mr-2" />
                                        Seed All Providers
                                    </Button>
                                    <Button onClick={() => { setDialogType('connector'); setShowDialog(true); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Connector
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {connectors.map(connector => (
                                    <Card key={connector.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">{connector.display_name}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={
                                                        connector.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        connector.status === 'testing' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {connector.status}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">{connector.provider_type}</Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="text-sm">
                                                    <p className="text-slate-600 mb-2">
                                                        Function: <code className="bg-slate-100 px-2 py-1 rounded text-xs">{connector.connector_function}</code>
                                                    </p>
                                                    <p className="text-slate-600">Region: {connector.region}</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                    <div className="space-y-1 text-slate-600">
                                                        {connector.supported_operations?.map((op, idx) => (
                                                            <div key={idx}>• {op}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {connector.required_secrets?.map((secret, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">{secret}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => updateConnectorMutation.mutate({ 
                                                            id: connector.id, 
                                                            data: { status: connector.status === 'active' ? 'inactive' : 'active' }
                                                        })}
                                                    >
                                                        {connector.status === 'active' ? 'Disable' : 'Enable'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {connectors.length === 0 && (
                                    <div className="col-span-2 text-center py-12">
                                        <Server className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 mb-4">No cloud connectors configured</p>
                                        <Button onClick={() => seedConnectorsMutation.mutate()}>
                                            <Database className="h-4 w-4 mr-2" />
                                            Seed All Major Cloud Providers
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Legacy documentation cards - keeping for reference */}
                            <div className="hidden grid-cols-2 gap-4">
                                {/* AWS */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Amazon Web Services (AWS)</CardTitle>
                                            <Badge variant="outline">Global</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <p className="text-slate-600 mb-2">Connector: <code className="bg-slate-100 px-2 py-1 rounded text-xs">infrastructure/awsConnector</code></p>
                                                <p className="text-slate-600">Regions: us-east-1, us-west-2, eu-west-1, ap-southeast-1</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div>• provision_compute (EC2)</div>
                                                    <div>• provision_database (RDS)</div>
                                                    <div>• scale_compute</div>
                                                    <div>• terminate_resources</div>
                                                    <div>• get_metrics (CloudWatch)</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-xs">AWS_ACCESS_KEY_ID</Badge>
                                                    <Badge variant="outline" className="text-xs">AWS_SECRET_ACCESS_KEY</Badge>
                                                    <Badge variant="outline" className="text-xs">AWS_REGION</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Azure */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Microsoft Azure</CardTitle>
                                            <Badge variant="outline">Global</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <p className="text-slate-600 mb-2">Connector: <code className="bg-slate-100 px-2 py-1 rounded text-xs">infrastructure/azureConnector</code></p>
                                                <p className="text-slate-600">Regions: eastus, westus, westeurope, southeastasia</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div>• provision_compute (VM)</div>
                                                    <div>• provision_database (Azure SQL)</div>
                                                    <div>• scale_compute</div>
                                                    <div>• terminate_resources</div>
                                                    <div>• get_metrics (Azure Monitor)</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-xs">AZURE_SUBSCRIPTION_ID</Badge>
                                                    <Badge variant="outline" className="text-xs">AZURE_CLIENT_ID</Badge>
                                                    <Badge variant="outline" className="text-xs">AZURE_CLIENT_SECRET</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* PTCL */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">PTCL Cloud (Pakistan)</CardTitle>
                                            <Badge variant="outline">Pakistan</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <p className="text-slate-600 mb-2">Connector: <code className="bg-slate-100 px-2 py-1 rounded text-xs">infrastructure/localProviderConnector</code></p>
                                                <p className="text-slate-600">Datacenters: ISB-DC1 (Islamabad)</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div>• provision_compute</div>
                                                    <div>• get_metrics</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                <Badge variant="outline" className="text-xs">PTCL_API_KEY</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Alipay Cloud */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Alipay Cloud (China)</CardTitle>
                                            <Badge variant="outline">China</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <p className="text-slate-600 mb-2">Connector: <code className="bg-slate-100 px-2 py-1 rounded text-xs">infrastructure/localProviderConnector</code></p>
                                                <p className="text-slate-600">Regions: cn-hangzhou, cn-beijing, cn-shanghai</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div>• provision_compute (ECS)</div>
                                                    <div>• provision_database (RDS)</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-xs">ALIPAY_CLOUD_ACCESS_KEY</Badge>
                                                    <Badge variant="outline" className="text-xs">ALIPAY_CLOUD_SECRET_KEY</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tencent Cloud */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Tencent Cloud (腾讯云)</CardTitle>
                                            <Badge variant="outline">China</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <p className="text-slate-600 mb-2">Connector: <code className="bg-slate-100 px-2 py-1 rounded text-xs">infrastructure/localProviderConnector</code></p>
                                                <p className="text-slate-600">Regions: ap-guangzhou, ap-beijing, ap-shanghai</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div>• provision_compute (CVM)</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-xs">TENCENT_CLOUD_SECRET_ID</Badge>
                                                    <Badge variant="outline" className="text-xs">TENCENT_CLOUD_SECRET_KEY</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Huawei Cloud */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Huawei Cloud (华为云)</CardTitle>
                                            <Badge variant="outline">China</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <p className="text-slate-600 mb-2">Connector: <code className="bg-slate-100 px-2 py-1 rounded text-xs">infrastructure/localProviderConnector</code></p>
                                                <p className="text-slate-600">Regions: cn-north-1, cn-east-2, cn-south-1</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Operations:</p>
                                                <div className="space-y-1 text-slate-600">
                                                    <div>• provision_compute (ECS)</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-900 mb-1">Required Secrets:</p>
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-xs">HUAWEI_CLOUD_ACCESS_KEY</Badge>
                                                    <Badge variant="outline" className="text-xs">HUAWEI_CLOUD_SECRET_KEY</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Server className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-blue-900 mb-1">Resource Provisioner Orchestrator</p>
                                            <p className="text-sm text-blue-700 mb-2">Function: <code className="bg-blue-100 px-2 py-1 rounded text-xs">resourceProvisioner</code></p>
                                            <p className="text-sm text-blue-700">
                                                Automatically routes provisioning requests to the appropriate cloud provider based on region. 
                                                Handles AWS (us-*, eu-*, ap-*), Azure (standard regions), and local providers (PTCL, Alipay, Tencent, Huawei).
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Allocations */}
                        <TabsContent value="allocations" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{allocations.length} active allocations</p>
                                <Button onClick={() => { setDialogType('allocation'); setShowDialog(true); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Allocate Resources
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {allocations.map(allocation => (
                                    <Card key={allocation.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold">{allocation.psp_name}</h4>
                                                        <Badge variant="outline">{allocation.region}</Badge>
                                                        {allocation.quota_exceeded && (
                                                            <Badge className="bg-red-100 text-red-700">Quota Exceeded</Badge>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">CPU Cores</p>
                                                            <p className="font-medium">{allocation.allocated_resources?.cpu_cores || 0}</p>
                                                            {allocation.current_usage?.cpu_utilization && (
                                                                <p className="text-xs text-slate-500">{allocation.current_usage.cpu_utilization}% used</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Memory (GB)</p>
                                                            <p className="font-medium">{allocation.allocated_resources?.memory_gb || 0}</p>
                                                            {allocation.current_usage?.memory_utilization && (
                                                                <p className="text-xs text-slate-500">{allocation.current_usage.memory_utilization}% used</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Storage (GB)</p>
                                                            <p className="font-medium">{allocation.allocated_resources?.storage_gb || 0}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Monthly Cost</p>
                                                            <p className="font-medium">${allocation.monthly_cost || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {allocation.auto_scaling_policy?.enabled && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleAutoScale(allocation.id)}
                                                    >
                                                        <Zap className="h-3 w-3 mr-1" />
                                                        Trigger Scale
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Capacity Planning */}
                        <TabsContent value="capacity" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{capacityPlans.length} capacity plans</p>
                                <Button onClick={handleGeneratePlan} disabled={generating}>
                                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                                    Generate 6-Month Plan
                                </Button>
                            </div>

                            {capacityPlans.map(plan => (
                                <Card key={plan.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{plan.plan_name}</CardTitle>
                                            <Badge className={
                                                plan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                plan.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                'bg-blue-100 text-blue-700'
                                            }>
                                                {plan.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-6 mb-6">
                                            <div>
                                                <p className="text-sm text-slate-600 mb-2">Current Capacity</p>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>PSPs:</span>
                                                        <span className="font-medium">{plan.current_capacity?.total_psps || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>CPU:</span>
                                                        <span className="font-medium">{plan.current_capacity?.cpu_cores || 0} cores</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600 mb-2">Projected Demand</p>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>New PSPs:</span>
                                                        <span className="font-medium text-blue-600">+{plan.projected_demand?.new_psps || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Growth:</span>
                                                        <span className="font-medium text-blue-600">{plan.projected_demand?.growth_rate_percentage || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600 mb-2">Budget</p>
                                                <p className="text-2xl font-bold text-slate-900">${plan.budget_estimate?.toLocaleString() || 0}</p>
                                            </div>
                                        </div>

                                        {plan.recommended_actions && plan.recommended_actions.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 mb-2">Recommended Actions:</p>
                                                <div className="space-y-2">
                                                    {plan.recommended_actions.map((action, idx) => (
                                                        <div key={idx} className={`p-3 rounded-lg border ${
                                                            action.priority === 'high' ? 'bg-red-50 border-red-200' :
                                                            action.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                                                            'bg-blue-50 border-blue-200'
                                                        }`}>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge className={
                                                                            action.priority === 'high' ? 'bg-red-600' :
                                                                            action.priority === 'medium' ? 'bg-amber-600' :
                                                                            'bg-blue-600'
                                                                        }>
                                                                            {action.priority}
                                                                        </Badge>
                                                                        <span className="text-sm font-medium">{action.action}</span>
                                                                    </div>
                                                                    <div className="flex gap-4 text-xs text-slate-600">
                                                                        <span>Cost: ${action.estimated_cost?.toLocaleString()}</span>
                                                                        <span>By: {action.implementation_date}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        {/* Reservations */}
                        <TabsContent value="reservations" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{reservations.length} resource reservations</p>
                                <Button onClick={() => { setDialogType('reservation'); setShowDialog(true); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Reserve Resources
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {reservations.map(reservation => (
                                    <Card key={reservation.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold">{reservation.psp_name}</h4>
                                                        <Badge className={
                                                            reservation.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                            reservation.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {reservation.status}
                                                        </Badge>
                                                        <Badge variant="outline">{reservation.region}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">CPU Cores</p>
                                                            <p className="font-medium">{reservation.reserved_resources?.cpu_cores || 0}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Memory (GB)</p>
                                                            <p className="font-medium">{reservation.reserved_resources?.memory_gb || 0}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Storage (GB)</p>
                                                            <p className="font-medium">{reservation.reserved_resources?.storage_gb || 0}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Launch Date</p>
                                                            <p className="font-medium">{reservation.expected_launch_date}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Dialogs */}
            <Dialog open={showDialog && dialogType === 'connector'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Cloud Connector</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Provider</Label>
                            <Select value={connectorForm.provider_name} onValueChange={(v) => setConnectorForm({...connectorForm, provider_name: v})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aws">AWS</SelectItem>
                                    <SelectItem value="azure">Azure</SelectItem>
                                    <SelectItem value="gcp">Google Cloud</SelectItem>
                                    <SelectItem value="alibaba_cloud">Alibaba Cloud</SelectItem>
                                    <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                                    <SelectItem value="oracle_cloud">Oracle Cloud</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Display Name</Label>
                            <Input
                                value={connectorForm.display_name}
                                onChange={(e) => setConnectorForm({...connectorForm, display_name: e.target.value})}
                                placeholder="e.g., AWS Production"
                            />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select value={connectorForm.status} onValueChange={(v) => setConnectorForm({...connectorForm, status: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="testing">Testing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => createConnectorMutation.mutate(connectorForm)}>Create</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showDialog && dialogType === 'pool'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Resource Pool</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Pool Name</Label>
                            <Input
                                value={poolForm.pool_name}
                                onChange={(e) => setPoolForm({...poolForm, pool_name: e.target.value})}
                                placeholder="Production US-East"
                            />
                        </div>
                        <div>
                            <Label>Region</Label>
                            <Select value={poolForm.region} onValueChange={(v) => setPoolForm({...poolForm, region: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us-east-1">US East</SelectItem>
                                    <SelectItem value="us-west-2">US West</SelectItem>
                                    <SelectItem value="eu-west-1">EU West</SelectItem>
                                    <SelectItem value="ap-southeast-1">Asia Pacific</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Resource Type</Label>
                            <Select value={poolForm.resource_type} onValueChange={(v) => setPoolForm({...poolForm, resource_type: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="compute">Compute</SelectItem>
                                    <SelectItem value="storage">Storage</SelectItem>
                                    <SelectItem value="database">Database</SelectItem>
                                    <SelectItem value="mixed">Mixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => createPoolMutation.mutate(poolForm)}>Create Pool</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}