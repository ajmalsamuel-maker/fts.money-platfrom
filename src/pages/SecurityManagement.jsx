import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Shield, Key, FileCheck, Lock, CheckCircle, XCircle, Clock, 
    AlertTriangle, Download, RefreshCw, Upload, Trash2, Settings
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SecurityManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showProviderDialog, setShowProviderDialog] = useState(false);
    const [showCertDialog, setShowCertDialog] = useState(false);
    const [verifyingSignature, setVerifyingSignature] = useState(null);
    const [providerConfig, setProviderConfig] = useState({
        provider: 'spreedly',
        apiKey: '',
        environmentKey: ''
    });
    
    const queryClient = useQueryClient();

    const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
        queryKey: ['signed-audit-logs'],
        queryFn: async () => {
            const logs = await base44.entities.AuditLog.list('-created_date', 100);
            return logs.filter(log => log.signature);
        }
    });

    const { data: signatures = [], isLoading: sigsLoading } = useQuery({
        queryKey: ['transaction-signatures'],
        queryFn: () => base44.entities.TransactionSignature.list('-created_date', 100)
    });

    const { data: tokens = [], isLoading: tokensLoading } = useQuery({
        queryKey: ['tokenized-cards'],
        queryFn: () => base44.entities.TokenizedCard.list('-created_date', 100)
    });

    const signedLogsCount = auditLogs.length;
    const verifiedSigsCount = signatures.filter(s => s.is_verified && s.verification_status === 'valid').length;
    const activeTokensCount = tokens.filter(t => t.status === 'active').length;
    const criticalLogsCount = auditLogs.filter(l => l.severity === 'critical').length;

    // Verify signature mutation
    const verifySignatureMutation = useMutation({
        mutationFn: async (signatureId) => {
            const response = await base44.functions.invoke('verifySignature', { signature_id: signatureId });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['transaction-signatures'] });
            queryClient.invalidateQueries({ queryKey: ['signed-audit-logs'] });
            toast.success(`Signature ${data.verification.is_valid ? 'verified successfully' : 'verification failed'}`, {
                description: `Status: ${data.verification.status}`
            });
        },
        onError: (error) => {
            toast.error('Signature verification failed', {
                description: error.message
            });
        }
    });

    // Revoke token mutation
    const revokeTokenMutation = useMutation({
        mutationFn: async (tokenId) => {
            const token = tokens.find(t => t.id === tokenId);
            await base44.entities.TokenizedCard.update(tokenId, { ...token, status: 'revoked' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tokenized-cards'] });
            toast.success('Token revoked successfully');
        },
        onError: (error) => {
            toast.error('Failed to revoke token', {
                description: error.message
            });
        }
    });

    const handleVerifySignature = (signatureId) => {
        setVerifyingSignature(signatureId);
        verifySignatureMutation.mutate(signatureId);
    };

    const handleRevokeToken = (tokenId) => {
        if (confirm('Are you sure you want to revoke this token? This action cannot be undone.')) {
            revokeTokenMutation.mutate(tokenId);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="SecurityManagement" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="h-6 w-6 text-blue-600" />
                                Security & PKI Management
                            </h1>
                            <p className="text-slate-500">Manage digital signatures, tokenization, and audit trails</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowCertDialog(true)} className="gap-2">
                                <Upload className="h-4 w-4" />
                                Certificates
                            </Button>
                            <Button variant="outline" onClick={() => setShowProviderDialog(true)} className="gap-2">
                                <Settings className="h-4 w-4" />
                                Configure
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Signed Audit Logs</p>
                                        <p className="text-2xl font-bold">{signedLogsCount}</p>
                                    </div>
                                    <FileCheck className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Verified Signatures</p>
                                        <p className="text-2xl font-bold text-green-600">{verifiedSigsCount}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active Tokens</p>
                                        <p className="text-2xl font-bold text-indigo-600">{activeTokensCount}</p>
                                    </div>
                                    <Key className="h-8 w-8 text-indigo-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Critical Alerts</p>
                                        <p className="text-2xl font-bold text-red-600">{criticalLogsCount}</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="signatures" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="signatures">Transaction Signatures</TabsTrigger>
                            <TabsTrigger value="audit">Signed Audit Logs</TabsTrigger>
                            <TabsTrigger value="tokens">Payment Tokens</TabsTrigger>
                            <TabsTrigger value="config">Configuration</TabsTrigger>
                        </TabsList>

                        {/* Transaction Signatures */}
                        <TabsContent value="signatures">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-lg">Transaction Signatures</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Transaction ID</TableHead>
                                                <TableHead>Operation</TableHead>
                                                <TableHead>Signed By</TableHead>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Algorithm</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sigsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                                </TableRow>
                                            ) : signatures.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                        No transaction signatures found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                signatures.map(sig => (
                                                    <TableRow key={sig.id}>
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-blue-600">
                                                                {sig.transaction_id}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="uppercase">
                                                                {sig.operation_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">{sig.signed_by_email}</TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {sig.signature_timestamp ? format(new Date(sig.signature_timestamp), 'MMM dd, HH:mm:ss') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {sig.signature_algorithm}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {sig.is_verified ? (
                                                                sig.verification_status === 'valid' ? (
                                                                    <Badge className="bg-green-100 text-green-700">
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                        Verified
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-red-100 text-red-700">
                                                                        <XCircle className="h-3 w-3 mr-1" />
                                                                        Invalid
                                                                    </Badge>
                                                                )
                                                            ) : (
                                                                <Badge className="bg-amber-100 text-amber-700">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {sig.currency} {sig.amount?.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {!sig.is_verified && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleVerifySignature(sig.id)}
                                                                    disabled={verifyingSignature === sig.id}
                                                                >
                                                                    {verifyingSignature === sig.id ? 'Verifying...' : 'Verify'}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Signed Audit Logs */}
                        <TabsContent value="audit">
                            <Card>
                                <CardHeader className="border-b flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Signed Audit Logs</CardTitle>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Export
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>Event Type</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Severity</TableHead>
                                                <TableHead>Signature</TableHead>
                                                <TableHead>PCI</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                                </TableRow>
                                            ) : auditLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                        No signed audit logs found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                auditLogs.map(log => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="text-sm">
                                                            {log.created_date ? format(new Date(log.created_date), 'MMM dd, HH:mm:ss') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{log.event_type}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">{log.user_email || 'System'}</TableCell>
                                                        <TableCell className="text-sm">{log.action}</TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                                log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }>
                                                                {log.severity}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.signature_verified ? (
                                                                <Badge className="bg-green-100 text-green-700">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-blue-100 text-blue-700">
                                                                    <Lock className="h-3 w-3 mr-1" />
                                                                    Signed
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.pci_relevant && (
                                                                <Badge variant="outline" className="text-xs">PCI</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payment Tokens */}
                        <TabsContent value="tokens">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-lg">Tokenized Payment Methods</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Card</TableHead>
                                                <TableHead>Token</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tokensLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                                </TableRow>
                                            ) : tokens.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                        No tokenized cards found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                tokens.map(token => (
                                                    <TableRow key={token.id}>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium text-sm">{token.customer_name}</p>
                                                                <p className="text-xs text-slate-500">{token.customer_email}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="uppercase">
                                                                    {token.card_brand}
                                                                </Badge>
                                                                <span className="font-mono text-sm">•••• {token.card_last_four}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono text-xs text-slate-600">
                                                                {token.token?.substring(0, 16)}...
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="capitalize">
                                                                {token.token_provider}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm capitalize">
                                                            {token.token_type?.replace('_', ' ')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                token.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                token.status === 'expired' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {token.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {token.created_date ? format(new Date(token.created_date), 'MMM dd, yyyy') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {token.status === 'active' && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">Actions</Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleRevokeToken(token.id)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Revoke Token
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Configuration Tab */}
                        <TabsContent value="config">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tokenization Provider Config */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tokenization Provider</CardTitle>
                                        <CardDescription>Configure Spreedly or Basis Theory integration</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Provider</Label>
                                            <Select value={providerConfig.provider} onValueChange={(val) => setProviderConfig({...providerConfig, provider: val})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="spreedly">Spreedly</SelectItem>
                                                    <SelectItem value="basistheory">Basis Theory</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>API Key</Label>
                                            <Input 
                                                type="password"
                                                value={providerConfig.apiKey}
                                                onChange={(e) => setProviderConfig({...providerConfig, apiKey: e.target.value})}
                                                placeholder="Enter API key"
                                            />
                                        </div>
                                        {providerConfig.provider === 'spreedly' && (
                                            <div className="space-y-2">
                                                <Label>Environment Key</Label>
                                                <Input 
                                                    type="password"
                                                    value={providerConfig.environmentKey}
                                                    onChange={(e) => setProviderConfig({...providerConfig, environmentKey: e.target.value})}
                                                    placeholder="Enter environment key"
                                                />
                                            </div>
                                        )}
                                        <Button className="w-full">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Save Configuration
                                        </Button>
                                        <p className="text-xs text-slate-500">
                                            Note: Configuration is stored in environment variables for security
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Certificate Management */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Certificate Management</CardTitle>
                                        <CardDescription>Manage RSA/ECDSA signing certificates</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Public Key (PEM)</Label>
                                            <Textarea 
                                                placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                                                rows={5}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Private Key (PEM)</Label>
                                            <Textarea 
                                                placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                                                rows={5}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <Button className="w-full">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Certificates
                                        </Button>
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <p className="text-xs text-amber-800">
                                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                                Store private keys securely in environment variables. Never commit to version control.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Security Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Signature Algorithm</CardTitle>
                                        <CardDescription>Configure digital signature preferences</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Algorithm</Label>
                                            <Select defaultValue="RSA-PSS-SHA256">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="RSA-PSS-SHA256">RSA-PSS with SHA-256</SelectItem>
                                                    <SelectItem value="ECDSA-SHA256">ECDSA with SHA-256</SelectItem>
                                                    <SelectItem value="EdDSA">EdDSA (Ed25519)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Key Size</Label>
                                            <Select defaultValue="2048">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="2048">2048 bits</SelectItem>
                                                    <SelectItem value="3072">3072 bits</SelectItem>
                                                    <SelectItem value="4096">4096 bits</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Auto-sign transactions</Label>
                                            <input type="checkbox" className="h-4 w-4" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Require verification</Label>
                                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                                        </div>
                                        <Button className="w-full">
                                            Save Settings
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Audit Retention */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Audit Log Retention</CardTitle>
                                        <CardDescription>Configure PCI-DSS compliant retention policies</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Default Retention Period</Label>
                                            <Select defaultValue="1_year">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1_year">1 Year</SelectItem>
                                                    <SelectItem value="3_years">3 Years</SelectItem>
                                                    <SelectItem value="7_years">7 Years (PCI Compliant)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Auto-archive old logs</Label>
                                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Encrypt archived logs</Label>
                                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                                        </div>
                                        <Button className="w-full">
                                            Save Retention Policy
                                        </Button>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-xs text-blue-800">
                                                <FileCheck className="h-3 w-3 inline mr-1" />
                                                PCI-DSS requires 7-year retention for sensitive operations
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}