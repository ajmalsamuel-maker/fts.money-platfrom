import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Clock, 
    User, 
    Shield, 
    Key, 
    Edit, 
    FileText,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const actionIcons = {
    issuer_created: Activity,
    issuer_updated: Edit,
    status_changed: Activity,
    kyb_status_changed: Shield,
    aml_status_changed: Shield,
    password_reset: Key,
    lei_verified: CheckCircle,
    tas_verified: CheckCircle,
    compliance_update: FileText,
    document_uploaded: FileText,
    license_updated: FileText,
    suspension: AlertTriangle,
    termination: XCircle,
    reactivation: CheckCircle
};

const severityColors = {
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    critical: 'bg-red-100 text-red-700 border-red-200'
};

export default function IssuerAuditTrail({ issuerId, issuerCode }) {
    const { data: auditLogs = [], isLoading } = useQuery({
        queryKey: ['issuer-audit', issuerId],
        queryFn: () => base44.entities.IssuerAuditLog.filter({ issuer_id: issuerId }, '-created_date', 100),
        enabled: !!issuerId
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-slate-500">Loading audit trail...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Audit Trail
                </CardTitle>
                <p className="text-sm text-slate-500">Complete history of all actions for {issuerCode}</p>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                    {auditLogs.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>No audit entries yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {auditLogs.map((log, index) => {
                                const Icon = actionIcons[log.action_type] || Activity;
                                const isFirst = index === 0;
                                
                                return (
                                    <div 
                                        key={log.id}
                                        className={cn(
                                            "relative pl-8 pb-4",
                                            !isFirst && "border-l-2 border-slate-200 ml-3"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center",
                                            log.severity === 'critical' ? 'bg-red-100' :
                                            log.severity === 'warning' ? 'bg-amber-100' :
                                            'bg-blue-100'
                                        )}>
                                            <Icon className={cn(
                                                "h-3 w-3",
                                                log.severity === 'critical' ? 'text-red-600' :
                                                log.severity === 'warning' ? 'text-amber-600' :
                                                'text-blue-600'
                                            )} />
                                        </div>

                                        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{log.action_description}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{format(new Date(log.created_date), 'PPpp')}</span>
                                                    </div>
                                                </div>
                                                <Badge className={severityColors[log.severity]}>
                                                    {log.severity}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2 text-sm">
                                                <User className="h-3 w-3 text-slate-400" />
                                                <span className="text-slate-600">
                                                    {log.performed_by_name || log.performed_by}
                                                </span>
                                            </div>

                                            {(log.old_values || log.new_values) && (
                                                <div className="mt-3 pt-3 border-t grid md:grid-cols-2 gap-3">
                                                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                                                        <div className="bg-red-50 rounded p-2">
                                                            <p className="text-xs font-medium text-red-700 mb-1">Previous:</p>
                                                            <div className="text-xs text-red-600 space-y-0.5">
                                                                {Object.entries(log.old_values).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <span className="font-medium">{key}:</span> {String(value)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                                                        <div className="bg-green-50 rounded p-2">
                                                            <p className="text-xs font-medium text-green-700 mb-1">Updated:</p>
                                                            <div className="text-xs text-green-600 space-y-0.5">
                                                                {Object.entries(log.new_values).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <span className="font-medium">{key}:</span> {String(value)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <p className="text-xs text-slate-500">
                                                        {log.metadata.ip_address && `IP: ${log.metadata.ip_address} • `}
                                                        {log.metadata.reason && `Reason: ${log.metadata.reason}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}