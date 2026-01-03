import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { 
    Shield, 
    AlertTriangle, 
    TrendingUp, 
    Users, 
    Activity,
    Search,
    Filter,
    RefreshCw,
    BarChart3,
    Clock,
    MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function EnhancedAuditLogs() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('7days');
    const [anomalyThreshold, setAnomalyThreshold] = useState(70);

    const { data: logs = [], isLoading: logsLoading } = useQuery({
        queryKey: ['access-logs', actionFilter, dateFilter],
        queryFn: async () => {
            const logs = await base44.entities.AccessControlLog.list('-created_date', 500);
            
            let filtered = logs;
            
            // Date filter
            if (dateFilter !== 'all') {
                const daysAgo = {
                    '24hours': 1,
                    '7days': 7,
                    '30days': 30
                }[dateFilter] || 7;
                
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - daysAgo);
                filtered = filtered.filter(l => new Date(l.created_date) > cutoff);
            }
            
            // Action filter
            if (actionFilter !== 'all') {
                filtered = filtered.filter(l => l.action === actionFilter);
            }
            
            return filtered;
        }
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['audit-analytics'],
        queryFn: async () => {
            const response = await base44.functions.invoke('auditAnomalyDetection', {
                action: 'get_analytics'
            });
            return response.data.analytics;
        }
    });

    const { data: anomalies = [], isLoading: anomaliesLoading } = useQuery({
        queryKey: ['audit-anomalies', anomalyThreshold],
        queryFn: async () => {
            const response = await base44.functions.invoke('auditAnomalyDetection', {
                action: 'detect_anomalies',
                threshold: anomalyThreshold
            });
            return response.data.anomalies;
        }
    });

    const detectAnomaliesMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('auditAnomalyDetection', {
                action: 'detect_anomalies',
                threshold: anomalyThreshold
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(`Detected ${data.anomalies_detected} anomalies from ${data.total_logs_analyzed} logs`);
            queryClient.invalidateQueries(['audit-anomalies']);
            queryClient.invalidateQueries(['access-logs']);
        }
    });

    const filteredLogs = logs.filter(log => {
        if (searchQuery && !log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.action?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.resource_accessed?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (userFilter && log.user_email !== userFilter) {
            return false;
        }
        return true;
    });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PlatformAuditLogs" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('platform:subMenuItems.accessLogs')}</h1>
                        <p className="text-slate-600">{t('platform:subMenuItems.accessLogsDesc')}</p>
                    </div>

                    <Tabs defaultValue="dashboard" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                            <TabsTrigger value="logs">Access Logs</TabsTrigger>
                            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <CardContent className="p-6">
                                        <Activity className="h-8 w-8 mb-2 opacity-80" />
                                        <p className="text-xs text-blue-100 mb-1">Total Access Logs</p>
                                        <p className="text-2xl font-bold">{analytics?.total_logs || 0}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                                    <CardContent className="p-6">
                                        <AlertTriangle className="h-8 w-8 mb-2 opacity-80" />
                                        <p className="text-xs text-red-100 mb-1">Failed Logins</p>
                                        <p className="text-2xl font-bold">{analytics?.failed_logins_count || 0}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                                    <CardContent className="p-6">
                                        <Shield className="h-8 w-8 mb-2 opacity-80" />
                                        <p className="text-xs text-amber-100 mb-1">Anomalies Detected</p>
                                        <p className="text-2xl font-bold">{analytics?.anomalies_count || 0}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                    <CardContent className="p-6">
                                        <Users className="h-8 w-8 mb-2 opacity-80" />
                                        <p className="text-xs text-emerald-100 mb-1">Active Users</p>
                                        <p className="text-2xl font-bold">{analytics?.top_users?.length || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Access by Hour</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={analytics?.hourly_access || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="hour" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Actions Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(analytics?.actions_breakdown || {}).map(([name, value]) => ({ name, value }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {Object.keys(analytics?.actions_breakdown || {}).map((entry, index) => (
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
                                    <CardTitle className="text-sm">Top Active Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics?.top_users || []}>
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

                        <TabsContent value="logs">
                            {/* Filters */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <Input
                                                placeholder="Search by user, action, or resource..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <Select value={actionFilter} onValueChange={setActionFilter}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Actions</SelectItem>
                                                <SelectItem value="login">Login</SelectItem>
                                                <SelectItem value="logout">Logout</SelectItem>
                                                <SelectItem value="failed_login">Failed Login</SelectItem>
                                                <SelectItem value="password_change">Password Change</SelectItem>
                                                <SelectItem value="role_change">Role Change</SelectItem>
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
                                                <SelectItem value="all">All Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" onClick={() => queryClient.invalidateQueries(['access-logs'])}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logs Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                                                    <th className="text-left py-3 px-4 font-semibold">User</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Resource</th>
                                                    <th className="text-left py-3 px-4 font-semibold">IP Address</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Risk</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLogs.map((log) => (
                                                    <tr key={log.id} className="border-t hover:bg-slate-50">
                                                        <td className="py-3 px-4 text-xs">
                                                            {format(new Date(log.created_date), 'MMM dd, HH:mm:ss')}
                                                        </td>
                                                        <td className="py-3 px-4">{log.user_email}</td>
                                                        <td className="py-3 px-4">
                                                            <Badge variant="outline">{log.action}</Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-xs">{log.resource_accessed || '-'}</td>
                                                        <td className="py-3 px-4 text-xs font-mono">{log.ip_address}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {log.access_granted ? (
                                                                <Badge className="bg-emerald-100 text-emerald-700">Granted</Badge>
                                                            ) : (
                                                                <Badge className="bg-red-100 text-red-700">Denied</Badge>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {log.anomaly_detected ? (
                                                                <Badge className="bg-amber-100 text-amber-700">
                                                                    {log.risk_score}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="anomalies">
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
                                <Button 
                                    onClick={() => detectAnomaliesMutation.mutate()}
                                    disabled={detectAnomaliesMutation.isPending}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Run Detection
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {anomalies.map((anomaly) => (
                                    <Card key={anomaly.log_id} className="border-2 border-amber-200 bg-amber-50">
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
                                                        {anomaly.reasons.map((reason, idx) => (
                                                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
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
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Access Patterns by Resource Type</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600">Detailed analytics coming soon...</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}