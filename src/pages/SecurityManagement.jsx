import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Shield, Key, FileCheck, Lock, CheckCircle, XCircle, Clock, 
    AlertTriangle, Download, RefreshCw
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

export default function SecurityManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}