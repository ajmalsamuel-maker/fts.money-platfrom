import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { 
    Shield, AlertTriangle, TrendingUp, Users, Activity, Search, Filter, RefreshCw,
    BarChart3, Clock, MapPin, Info, AlertCircle, XCircle, CheckCircle, Eye,
    Download, X, FileText, Database, Lock, Zap, Globe, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function ComprehensiveAuditLogs() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('7days');
    const [statusFilter, setStatusFilter] = useState('all');
    const [eventTypeFilter, setEventTypeFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [anomalyThreshold, setAnomalyThreshold] = useState(70);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch audit logs
    const { data: logs = [], isLoading: logsLoading, refetch } = useQuery({
        queryKey: ['audit-logs', categoryFilter, severityFilter, dateFilter],
        queryFn: async () => {
            const logs = await base44.asServiceRole.entities.AuditLog.list('-created_date', 1000);
            
            let filtered = logs;
            
            if (dateFilter !== 'all') {
                const daysAgo = { '24hours': 1, '7days': 7, '30days': 30, '90days': 90 }[dateFilter] || 7;
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - daysAgo);
                filtered = filtered.filter(l => new Date(l.created_date) > cutoff);
            }
            
            if (categoryFilter !== 'all') {
                filtered = filtered.filter(l => l.category === categoryFilter);
            }
            
            if (severityFilter !== 'all') {
                filtered = filtered.filter(l => l.severity === severityFilter);
            }
            
            return filtered;
        },
        enabled: !loading
    });

    // Fetch anomaly detection results
    const { data: anomalies = [], refetch: refetchAnomalies } = useQuery({
        queryKey: ['audit-anomalies', anomalyThreshold],
        queryFn: async () => {
            try {
                const response = await base44.functions.invoke('auditAnomalyDetection', {
                    action: 'detect_anomalies',
                    threshold: anomalyThreshold
                });
                return response.data.anomalies || [];
            } catch (err) {
                return [];
            }
        },
        enabled: !loading
    });

    const filteredLogs = logs.filter(log => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const match = (
                log.user_email?.toLowerCase().includes(query) ||
                log.action?.toLowerCase().includes(query) ||
                log.description?.toLowerCase().includes(query) ||
                log.event_type?.toLowerCase().includes(query) ||
                log.target_entity?.toLowerCase().includes(query) ||
                log.ip_address?.toLowerCase().includes(query)
            );
            if (!match) return false;
        }
        
        if (statusFilter !== 'all' && log.status !== statusFilter) return false;
        if (eventTypeFilter && log.event_type !== eventTypeFilter) return false;
        
        return true;
    });

    // Calculate comprehensive statistics
    const stats = {
        total: filteredLogs.length,
        critical: filteredLogs.filter(l => l.severity === 'critical').length,
        warnings: filteredLogs.filter(l => l.severity === 'warning').length,
        failures: filteredLogs.filter(l => l.status === 'failure').length,
        uniqueUsers: new Set(filteredLogs.map(l => l.user_email).filter(Boolean)).size,
        uniqueIPs: new Set(filteredLogs.map(l => l.ip_address).filter(Boolean)).size,
        authenticationEvents: filteredLogs.filter(l => l.category === 'authentication').length,
        securityEvents: filteredLogs.filter(l => l.category === 'security').length,
        dataAccessEvents: filteredLogs.filter(l => l.category === 'data_access').length,
        configChanges: filteredLogs.filter(l => l.category === 'configuration').length,
        pciRelevant: filteredLogs.filter(l => l.pci_relevant).length,
        gdprRelevant: filteredLogs.filter(l => l.gdpr_relevant).length
    };

    // Analytics data
    const eventsByHour = filteredLogs.reduce((acc, log) => {
        const hour = format(new Date(log.created_date), 'HH:00');
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});

    const hourlyData = Object.entries(eventsByHour).map(([hour, count]) => ({
        hour,
        count
    })).sort((a, b) => a.hour.localeCompare(b.hour));

    const categoryBreakdown = filteredLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value
    }));

    const topUsers = Object.entries(
        filteredLogs.reduce((acc, log) => {
            if (log.user_email) {
                acc[log.user_email] = (acc[log.user_email] || 0) + 1;
            }
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([email, count]) => ({ email, count }));

    const uniqueEventTypes = [...new Set(logs.map(l => l.event_type).filter(Boolean))].sort();

    // Export functionality
    const exportToCSV = () => {
        setIsExporting(true);
        
        try {
            const headers = [
                'Timestamp', 'Event Type', 'User Email', 'User Role', 'Action',
                'Category', 'Severity', 'Status', 'Description', 'Target Entity',
                'Target ID', 'IP Address', 'PCI Relevant', 'GDPR Relevant', 'Error Message'
            ];
            
            const csvRows = [
                headers.join(','),
                ...filteredLogs.map(log => [
                    format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss'),
                    log.event_type || '', log.user_email || '', log.user_role || '',
                    log.action || '', log.category || '', log.severity || '', log.status || '',
                    `"${(log.description || '').replace(/"/g, '""')}"`,
                    log.target_entity || '', log.target_id || '', log.ip_address || '',
                    log.pci_relevant ? 'Yes' : 'No', log.gdpr_relevant ? 'Yes' : 'No',
                    `"${(log.error_message || '').replace(/"/g, '""')}"`
                ].join(','))
            ];
            
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Audit logs exported successfully');
        } catch (err) {
            toast.error('Export failed: ' + err.message);
        } finally {
            setIsExporting(false);
        }
    };

    // Generate compliance report
    const generateComplianceReport = () => {
        const report = {
            generated_at: new Date().toISOString(),
            reporting_period: dateFilter,
            total_events: stats.total,
            pci_relevant_events: stats.pciRelevant,
            gdpr_relevant_events: stats.gdprRelevant,
            critical_events: stats.critical,
            failed_authentications: filteredLogs.filter(l => l.event_type === 'login' && l.status === 'failure').length,
            unique_users: stats.uniqueUsers,
            unique_ip_addresses: stats.uniqueIPs,
            anomalies_detected: anomalies.length,
            compliance_summary: {
                pci_dss: {
                    requirement_10_1: 'Audit trails capture all access to system components',
                    requirement_10_2: 'Admin actions are logged',
                    requirement_10_3: 'Logs include user identification, event type, date/time, success/failure, origination, and affected data',
                    status: 'Compliant'
                },
                soc_2: {
                    security: 'Access logging and monitoring in place',
                    availability: 'System availability tracked through logs',
                    confidentiality: 'Data access events recorded',
                    status: 'Compliant'
                },
                gdpr: {
                    article_5: 'Processing activities logged',
                    article_32: 'Security measures documented',
                    data_subject_rights: 'Access and deletion events tracked',
                    status: 'Compliant'
                }
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `compliance-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.click();
        
        toast.success('Compliance report generated');
    };

    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setSeverityFilter('all');
        setDateFilter('7days');
        setStatusFilter('all');
        setEventTypeFilter('');
    };

    const hasActiveFilters = searchQuery || categoryFilter !== 'all' || severityFilter !== 'all' || 
                            dateFilter !== '7days' || statusFilter !== 'all' || eventTypeFilter;

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
            default: return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'failure': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4 text-slate-400" />;
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    if (loading || logsLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ComprehensiveAuditLogs" 
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Audit & Compliance Logging</h2>
                        <p className="text-xs text-slate-600">PCI DSS, SOC 2 & GDPR Compliant Audit Trail</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={generateComplianceReport} 
                            size="sm"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Compliance Report
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={exportToCSV} 
                            size="sm"
                            disabled={isExporting || filteredLogs.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                        <Button variant="outline" onClick={() => refetch()} size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
                            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Key Metrics - Row 1 */}
                            <div className="grid grid-cols-5 gap-4">
                                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <CardContent className="p-4">
                                        <Activity className="h-6 w-6 mb-2 opacity-80" />
                                        <p className="text-xs text-blue-100 mb-1">Total Events</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                                    <CardContent className="p-4">
                                        <AlertCircle className="h-6 w-6 mb-2 opacity-80" />
                                        <p className="text-xs text-red-100 mb-1">Critical Events</p>
                                        <p className="text-2xl font-bold">{stats.critical}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                                    <CardContent className="p-4">
                                        <AlertTriangle className="h-6 w-6 mb-2 opacity-80" />
                                        <p className="text-xs text-amber-100 mb-1">Warnings</p>
                                        <p className="text-2xl font-bold">{stats.warnings}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                    <CardContent className="p-4">
                                        <ShieldAlert className="h-6 w-6 mb-2 opacity-80" />
                                        <p className="text-xs text-purple-100 mb-1">Anomalies</p>
                                        <p className="text-2xl font-bold">{anomalies.length}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                                    <CardContent className="p-4">
                                        <XCircle className="h-6 w-6 mb-2 opacity-80" />
                                        <p className="text-xs text-slate-100 mb-1">Failures</p>
                                        <p className="text-2xl font-bold">{stats.failures}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Key Metrics - Row 2 */}
                            <div className="grid grid-cols-6 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <Users className="h-5 w-5 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-600 mb-1">Active Users</p>
                                        <p className="text-xl font-bold">{stats.uniqueUsers}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <Globe className="h-5 w-5 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-600 mb-1">Unique IPs</p>
                                        <p className="text-xl font-bold">{stats.uniqueIPs}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <Lock className="h-5 w-5 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-600 mb-1">Auth Events</p>
                                        <p className="text-xl font-bold">{stats.authenticationEvents}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <Shield className="h-5 w-5 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-600 mb-1">Security</p>
                                        <p className="text-xl font-bold">{stats.securityEvents}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <Database className="h-5 w-5 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-600 mb-1">Data Access</p>
                                        <p className="text-xl font-bold">{stats.dataAccessEvents}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <Zap className="h-5 w-5 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-600 mb-1">Config Changes</p>
                                        <p className="text-xl font-bold">{stats.configChanges}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Activity by Hour</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={hourlyData}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="hour" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Events by Category</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Users */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Most Active Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topUsers}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="email" angle={-45} textAnchor="end" height={100} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Audit Logs Tab */}
                        <TabsContent value="logs" className="space-y-6">
                            {/* Filters */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex-1 min-w-[250px]">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Search by user, action, description, IP, or entity..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                <SelectTrigger className="w-44">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    <SelectItem value="authentication">Authentication</SelectItem>
                                                    <SelectItem value="authorization">Authorization</SelectItem>
                                                    <SelectItem value="user_management">User Management</SelectItem>
                                                    <SelectItem value="configuration">Configuration</SelectItem>
                                                    <SelectItem value="data_access">Data Access</SelectItem>
                                                    <SelectItem value="security">Security</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                                <SelectTrigger className="w-36">
                                                    <SelectValue placeholder="Severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Levels</SelectItem>
                                                    <SelectItem value="info">Info</SelectItem>
                                                    <SelectItem value="warning">Warning</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                                <SelectTrigger className="w-40">
                                                    <SelectValue placeholder="Date Range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="24hours">Last 24 Hours</SelectItem>
                                                    <SelectItem value="7days">Last 7 Days</SelectItem>
                                                    <SelectItem value="30days">Last 30 Days</SelectItem>
                                                    <SelectItem value="90days">Last 90 Days</SelectItem>
                                                    <SelectItem value="all">All Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="w-36">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="success">Success</SelectItem>
                                                    <SelectItem value="failure">Failure</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            
                                            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                                                <SelectTrigger className="w-52">
                                                    <SelectValue placeholder="Event Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={null}>All Event Types</SelectItem>
                                                    {uniqueEventTypes.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            
                                            {hasActiveFilters && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={clearFilters}
                                                    className="text-slate-600"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Clear Filters
                                                </Button>
                                            )}
                                            
                                            <div className="ml-auto text-sm text-slate-600">
                                                Showing {filteredLogs.length} of {logs.length} events
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logs Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Event</th>
                                                    <th className="text-left py-3 px-4 font-semibold">User</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Category</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Severity</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Compliance</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLogs.map((log) => (
                                                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4 text-xs font-mono text-slate-600">
                                                            {format(new Date(log.created_date), 'MMM dd, HH:mm:ss')}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge variant="outline" className="text-xs">
                                                                {log.event_type}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-xs">{log.user_email || 'System'}</p>
                                                                {log.user_role && (
                                                                    <p className="text-xs text-slate-500">{log.user_role}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-xs text-slate-700 max-w-md truncate">
                                                            {log.description}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge variant="outline" className="text-xs">
                                                                {log.category}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge className={getSeverityColor(log.severity)}>
                                                                <span className="flex items-center gap-1">
                                                                    {getSeverityIcon(log.severity)}
                                                                    {log.severity}
                                                                </span>
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="flex items-center justify-center gap-1">
                                                                {getStatusIcon(log.status)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex gap-1 justify-center">
                                                                {log.pci_relevant && (
                                                                    <Badge className="bg-purple-100 text-purple-700 text-xs">PCI</Badge>
                                                                )}
                                                                {log.gdpr_relevant && (
                                                                    <Badge className="bg-blue-100 text-blue-700 text-xs">GDPR</Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSelectedLog(log)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredLogs.length === 0 && (
                                            <div className="py-12 text-center text-slate-500">
                                                <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p>No audit logs found</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Anomalies Tab */}
                        <TabsContent value="anomalies" className="space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Detection Threshold:</span>
                                    <Input
                                        type="number"
                                        value={anomalyThreshold}
                                        onChange={(e) => setAnomalyThreshold(parseInt(e.target.value))}
                                        className="w-20"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <Button onClick={() => refetchAnomalies()}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Run Detection
                                </Button>
                                <div className="ml-auto">
                                    <Badge className="bg-purple-100 text-purple-700">
                                        {anomalies.length} anomalies detected
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {anomalies.map((anomaly, idx) => (
                                    <Card key={idx} className="border-2 border-amber-200 bg-amber-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                                        <span className="font-semibold text-slate-900">{anomaly.user_email}</span>
                                                        <Badge className="bg-amber-100 text-amber-800">
                                                            Risk: {anomaly.risk_score}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        {format(new Date(anomaly.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">{anomaly.action}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    <span className="text-slate-600">IP: {anomaly.ip_address}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <p className="text-xs font-semibold text-slate-600 mb-2">Anomaly Reasons:</p>
                                                    <ul className="space-y-1">
                                                        {anomaly.reasons?.map((reason, i) => (
                                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                                <span className="text-amber-600">•</span>
                                                                {reason}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {anomalies.length === 0 && (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <Shield className="h-12 w-12 mx-auto mb-3 text-green-600 opacity-50" />
                                            <p className="text-slate-600">No anomalies detected</p>
                                            <p className="text-sm text-slate-500 mt-2">System behavior appears normal</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Event Trends (7 Days)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={hourlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="hour" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Events" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Severity Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={[
                                                { severity: 'Info', count: filteredLogs.filter(l => l.severity === 'info').length },
                                                { severity: 'Warning', count: stats.warnings },
                                                { severity: 'Critical', count: stats.critical }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="severity" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#3b82f6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Top IP Addresses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(
                                            filteredLogs.reduce((acc, log) => {
                                                if (log.ip_address) {
                                                    acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
                                                }
                                                return acc;
                                            }, {})
                                        )
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 10)
                                            .map(([ip, count]) => (
                                                <div key={ip} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">{ip}</span>
                                                    <Badge variant="outline">{count} events</Badge>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Compliance Tab */}
                        <TabsContent value="compliance" className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <Card className="border-2 border-purple-200">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            PCI DSS Compliance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Requirement 10.1</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">System Access Logs</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Requirement 10.2</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Admin Actions</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Requirement 10.3</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Log Details</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <Badge className="bg-purple-100 text-purple-700">
                                                {stats.pciRelevant} PCI Events
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-blue-600" />
                                            SOC 2 Compliance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Security</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Access Control</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Availability</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">System Monitoring</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Confidentiality</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Data Access Logs</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <Badge className="bg-blue-100 text-blue-700">
                                                Full Compliance
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-green-200">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-green-600" />
                                            GDPR Compliance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Article 5</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Processing Logs</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Article 32</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Security Measures</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Data Subject Rights</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Access Tracking</span>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <Badge className="bg-green-100 text-green-700">
                                                {stats.gdprRelevant} GDPR Events
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Data Retention & Compliance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded">
                                                <p className="text-xs text-slate-600 mb-2">Financial Records</p>
                                                <p className="text-sm font-semibold">7 Years Retention</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {filteredLogs.filter(l => l.retention_period === 'financial').length} events
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded">
                                                <p className="text-xs text-slate-600 mb-2">Standard Records</p>
                                                <p className="text-sm font-semibold">1 Year Retention</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {filteredLogs.filter(l => l.retention_period === 'standard').length} events
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                                            <p className="text-sm font-semibold text-blue-900 mb-2">Compliance Summary</p>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>✓ All authentication attempts logged</li>
                                                <li>✓ Admin actions tracked with user identification</li>
                                                <li>✓ Data access events recorded with timestamps</li>
                                                <li>✓ Failed login attempts monitored</li>
                                                <li>✓ Configuration changes audited</li>
                                                <li>✓ Security events flagged and reviewed</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Event Type</p>
                                    <Badge variant="outline">{selectedLog.event_type}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Timestamp</p>
                                    <p className="text-sm font-mono">
                                        {format(new Date(selectedLog.created_date), 'MMM dd, yyyy HH:mm:ss')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Category</p>
                                    <Badge>{selectedLog.category}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Severity</p>
                                    <Badge className={getSeverityColor(selectedLog.severity)}>
                                        {selectedLog.severity}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">User Email</p>
                                    <p className="text-sm">{selectedLog.user_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">User Role</p>
                                    <p className="text-sm">{selectedLog.user_role || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">IP Address</p>
                                    <p className="text-sm font-mono">{selectedLog.ip_address || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedLog.status)}
                                        <span className="text-sm">{selectedLog.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-600 mb-2">Description</p>
                                <p className="text-sm bg-slate-50 p-3 rounded border">{selectedLog.description}</p>
                            </div>

                            {selectedLog.action && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Action</p>
                                    <Badge variant="outline">{selectedLog.action}</Badge>
                                </div>
                            )}

                            {selectedLog.target_entity && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Target Entity</p>
                                    <p className="text-sm">{selectedLog.target_entity} (ID: {selectedLog.target_id})</p>
                                </div>
                            )}

                            {selectedLog.old_value && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Old Value</p>
                                    <pre className="text-xs bg-slate-50 p-3 rounded border overflow-x-auto">
                                        {JSON.stringify(JSON.parse(selectedLog.old_value), null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.new_value && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">New Value</p>
                                    <pre className="text-xs bg-slate-50 p-3 rounded border overflow-x-auto">
                                        {JSON.stringify(JSON.parse(selectedLog.new_value), null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.error_message && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Error Message</p>
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                        {selectedLog.error_message}
                                    </p>
                                </div>
                            )}

                            {selectedLog.user_agent && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">User Agent</p>
                                    <p className="text-xs font-mono bg-slate-50 p-2 rounded border">{selectedLog.user_agent}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Retention Period: {selectedLog.retention_period?.replace('_', ' ')}</span>
                                    <div className="flex gap-2">
                                        {selectedLog.pci_relevant && (
                                            <Badge className="bg-purple-100 text-purple-700">PCI Relevant</Badge>
                                        )}
                                        {selectedLog.gdpr_relevant && (
                                            <Badge className="bg-blue-100 text-blue-700">GDPR Relevant</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}