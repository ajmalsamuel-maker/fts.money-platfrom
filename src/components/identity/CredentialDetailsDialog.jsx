import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
    Shield, Copy, Trash2, CheckCircle2, AlertCircle, 
    Globe, Calendar, Key, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";

export default function CredentialDetailsDialog({ credential, open, onOpenChange }) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.UserCredential.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-credentials']);
            toast.success('Credential removed from wallet');
            onOpenChange(false);
        }
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const verifyCredential = async () => {
        if (!credential.lei_number) return;

        toast.loading('Verifying credential...');
        
        try {
            const response = await fetch(`https://api.gleif.org/api/v1/lei-records/${credential.lei_number}`);
            
            if (response.ok) {
                const data = await response.json();
                const registration = data.data.attributes.registration;
                
                if (registration.status === 'ISSUED') {
                    toast.success('✅ Credential verified and active');
                } else {
                    toast.warning(`⚠️ Status: ${registration.status}`);
                }
            } else {
                toast.error('Verification failed - LEI not found');
            }
        } catch (error) {
            toast.error('Verification error: ' + error.message);
        }
    };

    const daysUntilExpiry = credential.expiry_date 
        ? Math.floor((new Date(credential.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {credential.credential_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600 mb-1">Status</p>
                            <Badge className={cn(
                                credential.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                credential.status === 'expired' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            )}>
                                {credential.status}
                            </Badge>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600 mb-1">Trust Score</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{credential.trust_score || 0}</span>
                                <span className="text-sm text-slate-500">/ 100</span>
                            </div>
                        </div>
                    </div>

                    {/* Credential Details */}
                    <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-900">Credential Type</p>
                                <Badge variant="outline">
                                    {credential.credential_type.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-600">
                                {credential.credential_type === 'lei' && 'Legal Entity Identifier - Verified business identity'}
                                {credential.credential_type === 'vlei' && 'Verifiable LEI - Cryptographically signed credential'}
                                {credential.credential_type === 'oor' && 'Organizational Role - Authorized person credential'}
                                {credential.credential_type === 'ecr' && 'Engagement Context - Transaction-specific authorization'}
                            </p>
                        </div>

                        {credential.lei_number && (
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-900">LEI Number</p>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => copyToClipboard(credential.lei_number)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="font-mono text-sm text-slate-700">{credential.lei_number}</p>
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="mt-2 p-0 h-auto"
                                    onClick={verifyCredential}
                                >
                                    <Globe className="h-3 w-3 mr-1" />
                                    Verify on GLEIF
                                </Button>
                            </div>
                        )}

                        {credential.issuer_name && (
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm font-medium text-slate-900 mb-2">Issuer</p>
                                <p className="text-sm text-slate-700">{credential.issuer_name}</p>
                                {credential.issuer && (
                                    <p className="text-xs text-slate-500 mt-1 font-mono">{credential.issuer}</p>
                                )}
                            </div>
                        )}

                        {credential.issued_date && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <p className="text-sm font-medium text-slate-900 mb-1">Issued</p>
                                    <p className="text-sm text-slate-700">
                                        {format(new Date(credential.issued_date), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                {credential.expiry_date && (
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-sm font-medium text-slate-900 mb-1">Expires</p>
                                        <p className="text-sm text-slate-700">
                                            {format(new Date(credential.expiry_date), 'MMM dd, yyyy')}
                                        </p>
                                        {daysUntilExpiry !== null && (
                                            <p className={cn(
                                                "text-xs mt-1",
                                                daysUntilExpiry <= 30 ? "text-amber-600" : "text-slate-500"
                                            )}>
                                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {credential.credential_chain && credential.credential_chain.length > 0 && (
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Credential Chain ({credential.credential_chain.length})
                                </p>
                                <div className="space-y-1">
                                    {credential.credential_chain.map((parent, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-slate-600 font-mono">{parent}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {credential.used_for_services && credential.used_for_services.length > 0 && (
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm font-medium text-slate-900 mb-2">Services Using This Credential</p>
                                <div className="flex flex-wrap gap-2">
                                    {credential.used_for_services.map((service, idx) => (
                                        <Badge key={idx} variant="outline">{service}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {credential.vlei_credential && (
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-900">W3C Verifiable Credential</p>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => copyToClipboard(credential.vlei_credential)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded overflow-auto max-h-48">
                                    {JSON.stringify(JSON.parse(credential.vlei_credential), null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Close
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={() => {
                                if (confirm('Remove this credential from your wallet? This cannot be undone.')) {
                                    deleteMutation.mutate(credential.id);
                                }
                            }}
                            className="flex-1"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Credential
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}