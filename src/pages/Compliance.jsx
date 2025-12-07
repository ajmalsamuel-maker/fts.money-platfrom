import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Shield,
    Search,
    MoreHorizontal,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    FileText,
    Users,
    Building2,
    Globe,
    Calendar,
    Download,
    RefreshCw,
    UserCheck,
    Ban,
    Zap,
    Loader2
} from 'lucide-react';

const kycStatusConfig = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700', icon: Clock },
    in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700', icon: RefreshCw },
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: XCircle },
    expired: { label: 'Expired', className: 'bg-slate-100 text-slate-700', icon: AlertTriangle },
};

const riskLevelConfig = {
    low: { label: 'Low Risk', className: 'bg-emerald-100 text-emerald-700' },
    medium: { label: 'Medium Risk', className: 'bg-amber-100 text-amber-700' },
    high: { label: 'High Risk', className: 'bg-red-100 text-red-700' },
};

const complianceChecks = [
    { id: 'business_verification', name: 'Business Verification', description: 'Company registration and ownership verified' },
    { id: 'ubo_identification', name: 'UBO Identification', description: 'Ultimate beneficial owners identified (25%+ ownership)' },
    { id: 'director_verification', name: 'Director Verification', description: 'Directors identity and background verified' },
    { id: 'address_verification', name: 'Address Verification', description: 'Business address verified via utility bill/bank statement' },
    { id: 'sanctions_screening', name: 'Sanctions Screening', description: 'Screened against OFAC, EU, UN sanctions lists' },
    { id: 'pep_screening', name: 'PEP Screening', description: 'Politically Exposed Persons screening completed' },
    { id: 'adverse_media', name: 'Adverse Media', description: 'Negative news and media screening' },
    { id: 'aml_policy', name: 'AML Policy Review', description: 'Anti-Money Laundering policy reviewed' },
];

const monitoringPrograms = [
    { name: 'Visa VFMP', threshold: '0.90%', current: '0.45%', status: 'compliant' },
    { name: 'Visa VDMP', threshold: '0.90%', current: '0.12%', status: 'compliant' },
    { name: 'Mastercard ECP', threshold: '1.00%', current: '0.38%', status: 'compliant' },
    { name: 'Mastercard ECM', threshold: '1.50%', current: '0.52%', status: 'compliant' },
];

export default function Compliance() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('merchants');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isScanning, setIsScanning] = useState(false);

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list('-created_date'),
    });

    const filteredMerchants = merchants.filter(m => {
        const matchesSearch = !searchQuery || 
            m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.merchant_id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingKyc = merchants.filter(m => m.status === 'pending').length;
    const approvedMerchants = merchants.filter(m => m.status === 'active').length;
    const highRiskMerchants = merchants.filter(m => m.risk_level === 'high').length;

    const scanAllMerchantsMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('complianceMonitor', {
                action: 'scan_all'
            });
            return response.data;
        },
        onSuccess: (data) => {
            const alertCount = data.results?.length || 0;
            if (alertCount > 0) {
                toast.success(`Compliance scan complete: ${alertCount} alert(s) created`);
            } else {
                toast.success('Compliance scan complete: No issues detected');
            }
        },
        onError: (error) => {
            toast.error('Failed to run compliance scan');
            console.error('Scan error:', error);
        }
    });

    const checkMerchantMutation = useMutation({
        mutationFn: async (merchantId) => {
            const response = await base44.functions.invoke('complianceMonitor', {
                action: 'check_merchant',
                merchant_id: merchantId
            });
            return response.data;
        },
        onSuccess: (data, merchantId) => {
            if (data.issues?.length > 0) {
                toast.warning(`${data.issues.length} compliance issue(s) detected`);
            } else {
                toast.success('No compliance issues detected');
            }
        }
    });

    const handleScanAll = async () => {
        setIsScanning(true);
        try {
            await scanAllMerchantsMutation.mutateAsync();
        } finally {
            setIsScanning(false);
        }
    };

    const handleCheckMerchant = async (merchantId) => {
        await checkMerchantMutation.mutateAsync(merchantId);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Compliance" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">KYC / AML Compliance</h1>
                            <p className="text-slate-500">Merchant verification and regulatory compliance</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button 
                                onClick={handleScanAll}
                                disabled={isScanning || scanAllMerchantsMutation.isPending}
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                {isScanning || scanAllMerchantsMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4" />
                                        Auto-Scan All Merchants
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Merchants</p>
                                    <p className="text-xl font-bold">{merchants.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Pending KYC</p>
                                    <p className="text-xl font-bold text-amber-600">{pendingKyc}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Approved</p>
                                    <p className="text-xl font-bold text-emerald-600">{approvedMerchants}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">High Risk</p>
                                    <p className="text-xl font-bold text-red-600">{highRiskMerchants}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="merchants">Merchant KYC</TabsTrigger>
                            <TabsTrigger value="monitoring">Program Monitoring</TabsTrigger>
                            <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
                        </TabsList>

                        <TabsContent value="merchants">
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
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="active">Approved</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Merchant</TableHead>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Country</TableHead>
                                                <TableHead>KYC Status</TableHead>
                                                <TableHead>Risk Level</TableHead>
                                                <TableHead>Last Review</TableHead>
                                                <TableHead>Documents</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredMerchants.map((merchant) => {
                                                const kycStatus = merchant.status === 'active' ? 'approved' : merchant.status === 'pending' ? 'pending' : 'rejected';
                                                const StatusIcon = kycStatusConfig[kycStatus]?.icon || Clock;
                                                return (
                                                    <TableRow key={merchant.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                                    <Building2 className="h-4 w-4 text-slate-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{merchant.business_name}</p>
                                                                    <p className="text-sm text-slate-500">{merchant.contact_email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-blue-600">{merchant.merchant_id}</span>
                                                        </TableCell>
                                                        <TableCell>{merchant.country || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("gap-1", kycStatusConfig[kycStatus]?.className)}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {kycStatusConfig[kycStatus]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={riskLevelConfig[merchant.risk_level]?.className}>
                                                                {riskLevelConfig[merchant.risk_level]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {merchant.updated_date && format(new Date(merchant.updated_date), 'MMM dd, yyyy')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <FileText className="h-4 w-4 text-slate-400" />
                                                                <span className="text-sm">5/7</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Eye className="h-4 w-4 mr-2" />View Profile
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <FileText className="h-4 w-4 mr-2" />Documents
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleCheckMerchant(merchant.merchant_id)}>
                                                                        <Zap className="h-4 w-4 mr-2" />Check Compliance
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <RefreshCw className="h-4 w-4 mr-2" />Re-screen
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-emerald-600">
                                                                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <Ban className="h-4 w-4 mr-2" />Suspend
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="monitoring">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card Network Monitoring Programs</CardTitle>
                                        <CardDescription>Chargeback and fraud rate thresholds</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {monitoringPrograms.map((program, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{program.name}</span>
                                                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">Compliant</Badge>
                                                        </div>
                                                        <span className="text-sm text-slate-500">
                                                            {program.current} / {program.threshold}
                                                        </span>
                                                    </div>
                                                    <Progress 
                                                        value={(parseFloat(program.current) / parseFloat(program.threshold)) * 100} 
                                                        className="h-2"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Regulatory Requirements</CardTitle>
                                        <CardDescription>Compliance status by jurisdiction</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'PCI DSS Level 1', status: 'compliant', expires: 'Dec 2025' },
                                                { name: 'GDPR', status: 'compliant', region: 'EU' },
                                                { name: 'PSD2 / SCA', status: 'compliant', region: 'EU' },
                                                { name: 'CCPA', status: 'compliant', region: 'US-CA' },
                                                { name: 'AML/KYC', status: 'compliant', region: 'Global' },
                                            ].map((req, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                        <div>
                                                            <p className="font-medium">{req.name}</p>
                                                            <p className="text-xs text-slate-500">{req.region || `Expires: ${req.expires}`}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-emerald-100 text-emerald-700">Compliant</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="checklist">
                            <Card>
                                <CardHeader>
                                    <CardTitle>KYC Verification Checklist</CardTitle>
                                    <CardDescription>Standard compliance checks for merchant onboarding</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {complianceChecks.map((check) => (
                                            <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{check.name}</p>
                                                        <p className="text-sm text-slate-500">{check.description}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700">Required</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}