import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function PCICompliance() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: complianceRecords = [] } = useQuery({
        queryKey: ['pci-compliance'],
        queryFn: () => base44.entities.PCICompliance.list()
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const compliantCount = complianceRecords.filter(r => r.certification_status === 'compliant').length;
    const pendingCount = complianceRecords.filter(r => r.certification_status === 'pending').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="PCICompliance" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">PCI DSS Compliance</h1>
                                <p className="text-slate-500">Payment Card Industry Data Security Standards</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Merchants</p>
                                        <p className="text-2xl font-bold">{complianceRecords.length}</p>
                                    </div>
                                    <Shield className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Compliant</p>
                                        <p className="text-2xl font-bold text-emerald-600">{compliantCount}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Pending Review</p>
                                        <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Non-Compliant</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {complianceRecords.filter(r => r.certification_status === 'non_compliant').length}
                                        </p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>PCI DSS Levels</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <h4 className="font-semibold text-red-900 mb-2">Level 1</h4>
                                    <p className="text-xs text-red-700">6M+ transactions/year</p>
                                    <p className="text-xs text-red-600 mt-1">Annual ROC required</p>
                                </div>
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <h4 className="font-semibold text-orange-900 mb-2">Level 2</h4>
                                    <p className="text-xs text-orange-700">1M-6M transactions/year</p>
                                    <p className="text-xs text-orange-600 mt-1">Annual SAQ required</p>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <h4 className="font-semibold text-amber-900 mb-2">Level 3</h4>
                                    <p className="text-xs text-amber-700">20K-1M transactions/year</p>
                                    <p className="text-xs text-amber-600 mt-1">Annual SAQ required</p>
                                </div>
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-semibold text-yellow-900 mb-2">Level 4</h4>
                                    <p className="text-xs text-yellow-700">&lt;20K transactions/year</p>
                                    <p className="text-xs text-yellow-600 mt-1">Annual SAQ required</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Merchant Compliance Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>PCI Level</TableHead>
                                        <TableHead>SAQ Type</TableHead>
                                        <TableHead>AOC Status</TableHead>
                                        <TableHead>Last Assessment</TableHead>
                                        <TableHead>Next Due</TableHead>
                                        <TableHead>Scan Status</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {complianceRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                                No PCI compliance records yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        complianceRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {merchants.find(m => m.id === record.merchant_id)?.business_name || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="uppercase">
                                                        {record.pci_level?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono">{record.saq_type}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        record.aoc_status === 'valid' ? 'bg-emerald-100 text-emerald-700' :
                                                        record.aoc_status === 'expired' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {record.aoc_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {record.last_assessment_date ? new Date(record.last_assessment_date).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {record.next_assessment_due ? new Date(record.next_assessment_due).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        record.vulnerability_scan_status === 'passing' ? 'bg-emerald-100 text-emerald-700' :
                                                        record.vulnerability_scan_status === 'failing' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }>
                                                        {record.vulnerability_scan_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        record.certification_status === 'compliant' ? 'bg-emerald-100 text-emerald-700' :
                                                        record.certification_status === 'non_compliant' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }>
                                                        {record.certification_status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}