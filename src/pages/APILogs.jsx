import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Search, FileText, ChevronDown, ChevronUp
} from 'lucide-react';

export default function APILogs() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLog, setExpandedLog] = useState(null);
    const [userPspCode, setUserPspCode] = useState(null);

    React.useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            setUserPspCode(session.psp_code);
        } else {
            window.location.href = '/PSPLogin';
        }
    }, []);

    const { data: logs = [] } = useQuery({
        queryKey: ['api-logs', userPspCode],
        queryFn: async () => {
            const response = await base44.functions.invoke('pspData', {
                action: 'listAPILogs',
                psp_code: userPspCode
            });
            return response.data.data || [];
        },
        enabled: !!userPspCode,
        refetchInterval: 10000
    });

    const filteredLogs = logs.filter(log => 
        log.endpoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status_code?.toString().includes(searchQuery)
    );

    const getStatusColor = (code) => {
        if (code >= 200 && code < 300) return 'bg-emerald-50 text-emerald-700';
        if (code >= 400 && code < 500) return 'bg-amber-50 text-amber-700';
        if (code >= 500) return 'bg-red-50 text-red-700';
        return 'bg-slate-50 text-slate-700';
    };

    const getMethodColor = (method) => {
        const colors = {
            GET: 'bg-blue-50 text-blue-700',
            POST: 'bg-green-50 text-green-700',
            PUT: 'bg-amber-50 text-amber-700',
            DELETE: 'bg-red-50 text-red-700'
        };
        return colors[method] || 'bg-slate-50 text-slate-700';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="APILogs" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">API Logs</h1>
                        <p className="text-slate-500">Monitor API requests and responses</p>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by endpoint, method, or status..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="pl-10" 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {filteredLogs.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No API Logs</h3>
                                <p className="text-slate-500">API request logs will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {filteredLogs.map((log) => (
                                <Card key={log.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <Badge variant="outline" className={getMethodColor(log.method)}>
                                                    {log.method}
                                                </Badge>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <code className="text-sm font-mono">{log.endpoint}</code>
                                                        <Badge variant="outline" className={getStatusColor(log.status_code)}>
                                                            {log.status_code}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500 space-x-4">
                                                        <span>{new Date(log.created_date).toLocaleString()}</span>
                                                        <span>{log.response_time}ms</span>
                                                        {log.api_key_id && <span>Key: {log.api_key_id}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                            >
                                                {expandedLog === log.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        
                                        {expandedLog === log.id && (
                                            <div className="mt-4 space-y-3 pt-3 border-t">
                                                {log.request_body && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-600 mb-1">Request Body:</p>
                                                        <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                                                            {typeof log.request_body === 'string' ? log.request_body : JSON.stringify(log.request_body, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {log.response_body && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-600 mb-1">Response Body:</p>
                                                        <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                                                            {typeof log.response_body === 'string' ? log.response_body : JSON.stringify(log.response_body, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {log.error_message && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-red-600 mb-1">Error:</p>
                                                        <p className="text-xs bg-red-50 p-2 rounded text-red-700">{log.error_message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}