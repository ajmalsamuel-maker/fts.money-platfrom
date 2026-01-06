import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Shield, Building2, User, Briefcase, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CredentialCard({ credential, onClick, selectable, selected }) {
    const getCredentialIcon = (type) => {
        switch(type) {
            case 'lei': return Building2;
            case 'vlei': return Shield;
            case 'oor': return User;
            case 'ecr': return Briefcase;
            default: return Shield;
        }
    };

    const getCredentialColor = (type) => {
        switch(type) {
            case 'lei': return 'from-blue-500 to-blue-600';
            case 'vlei': return 'from-purple-500 to-purple-600';
            case 'oor': return 'from-emerald-500 to-emerald-600';
            case 'ecr': return 'from-amber-500 to-amber-600';
            default: return 'from-slate-500 to-slate-600';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'active': return CheckCircle2;
            case 'expired': return Clock;
            case 'revoked': return XCircle;
            case 'pending': return AlertCircle;
            default: return AlertCircle;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'expired': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'revoked': return 'bg-red-100 text-red-700 border-red-300';
            case 'pending': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const Icon = getCredentialIcon(credential.credential_type);
    const StatusIcon = getStatusIcon(credential.status);
    const colorGradient = getCredentialColor(credential.credential_type);

    const isExpiringSoon = credential.expiry_date && 
        (new Date(credential.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) <= 30 &&
        credential.status === 'active';

    return (
        <Card 
            className={cn(
                "cursor-pointer transition-all hover:shadow-lg border-2",
                credential.status === 'active' ? "border-slate-200 hover:border-blue-300" : "border-slate-100 opacity-60",
                selected && "border-blue-500 ring-2 ring-blue-200"
            )}
            onClick={onClick}
        >
            <CardContent className="p-5">
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center`}>
                        <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-right">
                        <Badge className={getStatusColor(credential.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {credential.status}
                        </Badge>
                        {isExpiringSoon && (
                            <Badge className="mt-1 bg-amber-100 text-amber-700 border-amber-300 block text-xs">
                                Expires Soon
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Credential Info */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900">{credential.credential_name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                        {credential.credential_type === 'lei' && 'Legal Entity Identifier'}
                        {credential.credential_type === 'vlei' && 'Verifiable LEI Credential'}
                        {credential.credential_type === 'oor' && 'Organizational Role'}
                        {credential.credential_type === 'ecr' && 'Engagement Context'}
                    </p>
                    
                    {credential.lei_number && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500">LEI Number</p>
                            <p className="font-mono text-sm text-slate-900">{credential.lei_number}</p>
                        </div>
                    )}

                    {credential.issuer_name && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500">Issued By</p>
                            <p className="text-sm text-slate-900">{credential.issuer_name}</p>
                        </div>
                    )}

                    {/* Trust Score */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Trust Score</span>
                            <span className="font-semibold text-slate-900">{credential.trust_score || 0}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                                className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    (credential.trust_score || 0) >= 80 ? "bg-emerald-500" :
                                    (credential.trust_score || 0) >= 50 ? "bg-blue-500" : "bg-amber-500"
                                )}
                                style={{ width: `${credential.trust_score || 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Services Using This Credential */}
                    {credential.used_for_services && credential.used_for_services.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Used For</p>
                            <div className="flex flex-wrap gap-1">
                                {credential.used_for_services.slice(0, 3).map((service, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {service}
                                    </Badge>
                                ))}
                                {credential.used_for_services.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{credential.used_for_services.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Last Used */}
                    {credential.last_used && (
                        <p className="text-xs text-slate-400 pt-2">
                            Last used {format(new Date(credential.last_used), 'MMM dd, yyyy')}
                        </p>
                    )}
                </div>

                {selectable && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <button className="w-full py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                            Select Credential
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}