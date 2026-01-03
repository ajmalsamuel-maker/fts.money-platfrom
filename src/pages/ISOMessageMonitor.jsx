import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function ISOMessageMonitor() {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: messages = [] } = useQuery({
        queryKey: ['iso-message-logs'],
        queryFn: async () => {
            const result = await base44.entities.ISOMessageLog.list('-created_date', 50);
            return result || [];
        },
        refetchInterval: 5000 // Real-time updates every 5s
    });

    const { data: stats } = useQuery({
        queryKey: ['iso-gateway-stats'],
        queryFn: async () => {
            const allMessages = await base44.entities.ISOMessageLog.list();
            const total = allMessages?.length || 0;
            const success = allMessages?.filter(m => m.status === 'success').length || 0;
            const failed = allMessages?.filter(m => m.status === 'failed').length || 0;
            const pending = allMessages?.filter(m => m.status === 'pending').length || 0;
            
            return {
                total,
                success,
                failed,
                pending,
                successRate: total > 0 ? (success / total * 100).toFixed(1) : 0
            };
        },
        refetchInterval: 5000
    });

    const filteredMessages = messages.filter(m =>
        m.message_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.connection_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusIcons = {
        success: <CheckCircle className="h-4 w-4 text-green-600" />,
        failed: <XCircle className="h-4 w-4 text-red-600" />,
        pending: <Clock className="h-4 w-4 text-yellow-600" />,
        retrying: <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar currentPage="ISOMessageMonitor" />
            
            <div className="flex-1 overflow-auto p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{t('platform:subMenuItems.isoMessageMonitor')}</h1>
                    <p className="text-gray-600 mt-1">{t('platform:subMenuItems.isoMessageMonitorDesc')}</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Messages</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-600">Success</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-600">Failed</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-600">Success Rate</p>
                                        <p className="text-2xl font-bold">{stats.successRate}%</p>
                                    </div>
                                    <ArrowRight className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by message ID or connection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="space-y-3">
                    {filteredMessages.map((msg) => (
                        <Card key={msg.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {statusIcons[msg.status]}
                                            <span className="font-mono text-sm font-medium">{msg.message_id}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {msg.source_standard} → {msg.target_standard}
                                            </Badge>
                                            {msg.message_type && (
                                                <Badge variant="outline" className="text-xs">
                                                    {msg.message_type}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-6 text-sm text-gray-600">
                                            <span>
                                                Processing: {msg.processing_time_ms ? `${msg.processing_time_ms}ms` : 'N/A'}
                                            </span>
                                            <span>
                                                Delivery: {msg.delivery_status || 'pending'}
                                            </span>
                                            {msg.enrichment_applied?.length > 0 && (
                                                <span className="text-blue-600">
                                                    Enriched: {msg.enrichment_applied.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {msg.error_message && (
                                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                                                Error: {msg.error_message}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-right text-sm text-gray-500">
                                        {new Date(msg.created_date).toLocaleTimeString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {filteredMessages.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                                <p className="text-gray-600">Messages will appear here in real-time</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}