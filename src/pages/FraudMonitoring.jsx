import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
    Shield, 
    AlertTriangle, 
    Search,
    Activity,
    TrendingUp,
    Zap,
    Eye,
    RefreshCw,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { TransactionMonitoringService } from '@/components/fraud/TransactionMonitoringService';

const severityConfig = {
    critical: { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
    low: { label: 'Low', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Activity },
};

const statusConfig = {
    open: { label: 'Open', className: 'bg-red-100 text-red-700' },
    investigating: { label: 'Investigating', className: 'bg-amber-100 text-amber-700' },
    resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700' },
    false_positive: { label: 'False Positive', className: 'bg-slate-100 text-slate-700' },
};

export default function FraudMonitoring() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMerchantId, setSelectedMerchantId] = useState('');

    const queryClient = useQueryClient();

    const { data: alerts = [], isLoading } = useQuery({
        queryKey: ['risk-alerts'],
        queryFn: () => base44.entities.RiskAlert.list('-created_date', 100),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const updateAlertMutation = useMutation({
        mutationFn: async ({ alertId, status }) => {
            return await base44.entities.RiskAlert.update(alertId, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-alerts'] });
            toast.success('Alert status updated');
        },
    });

    const scanMerchantMutation = useMutation({
        mutationFn: async (merchantId) => {
            const results = await TransactionMonitoringService.scanMerchantTransactions(merchantId);
            return results;
        },
        onSuccess: (results) => {
            queryClient.invalidateQueries({ queryKey: ['risk-alerts'] });
            toast.success(`Scan complete: ${results.alerts.length} alerts generated from ${results.scanned} transactions`);
        },
        onError: (error) => {
            toast.error(`Scan failed: ${error.message}`);
        },
    });

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = !searchQuery || 
            alert.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.alert_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        open: alerts.filter(a => a.status === 'open').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="FraudMonitoring"
            />
            
            <div className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "ml-20" : "ml-64"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="h-7 w-7 text-blue-600" />
                                Real-Time Fraud Monitoring
                            </h1>
                            <p className="text-slate-500">Monitor transactions and detect suspicious activities</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Select merchant to scan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.business_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                onClick={() => selectedMerchantId && scanMerchantMutation.mutate(selectedMerchantId)}
                                disabled={!selectedMerchantId || scanMerchantMutation.isPending}
                                className="gap-2"
                            >
                                {scanMerchantMutation.isPending ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4" />
                                        Scan Merchant
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Alerts</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Critical</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">High Priority</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Open</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Resolved</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search alerts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Severity</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="false_positive">False Positive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Fraud Alerts
                                <Badge variant="secondary" className="ml-2">
                                    {filteredAlerts.length} alerts
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Alert ID</TableHead>
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Severity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    Loading alerts...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredAlerts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    No alerts found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAlerts.map((alert) => {
                                                const SeverityIcon = severityConfig[alert.severity]?.icon || Activity;
                                                return (
                                                    <TableRow key={alert.id}>
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-blue-600">
                                                                {alert.alert_id}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{alert.merchant_name}</p>
                                                                <p className="text-xs text-slate-500">{alert.merchant_id}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="capitalize text-sm">{alert.alert_type?.replace('_', ' ')}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("gap-1", severityConfig[alert.severity]?.className)}>
                                                                <SeverityIcon className="h-3 w-3" />
                                                                {severityConfig[alert.severity]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={statusConfig[alert.status]?.className}>
                                                                {statusConfig[alert.status]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            ${(alert.affected_amount || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {alert.created_date ? format(new Date(alert.created_date), 'MMM dd, HH:mm') : 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {alert.status === 'open' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateAlertMutation.mutate({ alertId: alert.id, status: 'investigating' })}
                                                                    >
                                                                        Investigate
                                                                    </Button>
                                                                )}
                                                                {alert.status === 'investigating' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateAlertMutation.mutate({ alertId: alert.id, status: 'resolved' })}
                                                                    >
                                                                        Resolve
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}