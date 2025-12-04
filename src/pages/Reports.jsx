import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
    FileText, Download, Send, Calendar, Clock, Settings, Plus, Play, Loader2, CheckCircle, Mail, FileDown
} from 'lucide-react';
import { format } from 'date-fns';

const reportTypes = [
    { id: 'transaction_summary', name: 'Transaction Summary', description: 'Daily/weekly/monthly transaction totals' },
    { id: 'settlement_report', name: 'Settlement Report', description: 'Detailed settlement and payout information' },
    { id: 'chargeback_report', name: 'Chargeback Report', description: 'Chargeback and dispute analytics' },
    { id: 'fee_statement', name: 'Fee Statement', description: 'Processing fees and charges breakdown' },
    { id: 'merchant_statement', name: 'Merchant Statement', description: 'Complete monthly merchant statement' },
    { id: 'compliance_report', name: 'Compliance Report', description: 'KYC/AML compliance summary' },
];

export default function Reports() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showTermsDialog, setShowTermsDialog] = useState(false);
    const [generating, setGenerating] = useState(null);
    const queryClient = useQueryClient();

    const [scheduleConfig, setScheduleConfig] = useState({
        report_type: 'merchant_statement',
        frequency: 'monthly',
        merchants: [],
        send_email: true,
        include_terms: true,
        auto_generate_name: true,
        custom_name_template: '{merchant_name} - {report_type} - {date}',
    });

    const [termsAndConditions, setTermsAndConditions] = useState({
        header: 'TERMS AND CONDITIONS',
        content: `1. PAYMENT TERMS: All settlements are processed according to the agreed settlement period (T+1, T+2, etc.).

2. FEES: Processing fees are deducted automatically from settlements as per the merchant agreement.

3. CHARGEBACKS: Merchants are liable for chargebacks and associated fees as outlined in the merchant agreement.

4. RESERVES: A rolling reserve may be held as collateral against potential chargebacks and fraud.

5. COMPLIANCE: Merchants must maintain PCI DSS compliance and adhere to card network rules.

6. DISPUTES: Any disputes regarding this statement must be raised within 30 days of issuance.

7. GOVERNING LAW: This statement is governed by the laws of the jurisdiction specified in your merchant agreement.`,
        footer: 'For questions, contact: finance@paymenthub.com'
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const scheduledReports = [
        { id: 1, type: 'merchant_statement', merchant: 'All Merchants', frequency: 'Monthly', next_run: '2024-02-01', status: 'active' },
        { id: 2, type: 'transaction_summary', merchant: 'TechCorp Solutions', frequency: 'Weekly', next_run: '2024-01-22', status: 'active' },
        { id: 3, type: 'fee_statement', merchant: 'Global Retail Inc', frequency: 'Monthly', next_run: '2024-02-01', status: 'paused' },
    ];

    const recentReports = [
        { id: 'RPT001', type: 'Merchant Statement', merchant: 'TechCorp Solutions', date: new Date(), status: 'sent', file_size: '245 KB' },
        { id: 'RPT002', type: 'Transaction Summary', merchant: 'Global Retail Inc', date: new Date(Date.now() - 86400000), status: 'generated', file_size: '128 KB' },
        { id: 'RPT003', type: 'Fee Statement', merchant: 'GameZone Entertainment', date: new Date(Date.now() - 172800000), status: 'sent', file_size: '89 KB' },
    ];

    const generateReport = async (type, merchantId) => {
        setGenerating(type);
        const merchant = merchants.find(m => m.id === merchantId) || { business_name: 'All Merchants' };
        
        try {
            const reportContent = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a professional ${type.replace('_', ' ')} for merchant: ${merchant.business_name}. Include sample data with realistic figures.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        summary: { type: "string" },
                        period: { type: "string" },
                        total_transactions: { type: "number" },
                        total_volume: { type: "number" },
                        total_fees: { type: "number" },
                        net_settlement: { type: "number" }
                    }
                }
            });
            console.log('Report generated:', reportContent);
        } catch (e) {}
        
        setTimeout(() => setGenerating(null), 2000);
    };

    const sendReportEmail = async (merchantId) => {
        const merchant = merchants.find(m => m.id === merchantId);
        if (!merchant) return;

        const reportName = scheduleConfig.auto_generate_name 
            ? `${merchant.business_name} - Monthly Statement - ${format(new Date(), 'MMMM yyyy')}`
            : scheduleConfig.custom_name_template
                .replace('{merchant_name}', merchant.business_name)
                .replace('{report_type}', 'Monthly Statement')
                .replace('{date}', format(new Date(), 'yyyy-MM-dd'));

        try {
            await base44.integrations.Core.SendEmail({
                to: merchant.contact_email,
                subject: `${reportName} - PaymentHub`,
                body: `Dear ${merchant.contact_name || 'Merchant'},

Please find attached your ${reportName}.

Summary:
- Period: ${format(new Date(Date.now() - 30 * 86400000), 'MMM d')} - ${format(new Date(), 'MMM d, yyyy')}
- Total Transactions: ${Math.floor(Math.random() * 10000)}
- Total Volume: $${(Math.random() * 500000).toFixed(2)}
- Net Settlement: $${(Math.random() * 450000).toFixed(2)}

${scheduleConfig.include_terms ? `\n---\n${termsAndConditions.header}\n\n${termsAndConditions.content}\n\n${termsAndConditions.footer}` : ''}

Best regards,
PaymentHub Finance Team`
            });
        } catch (e) {}
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Reports" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-slate-500">Generate and schedule merchant reports</p></div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowTermsDialog(true)} className="gap-2"><Settings className="h-4 w-4" />Terms & Conditions</Button>
                            <Button onClick={() => setShowScheduleDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Schedule Report</Button>
                        </div>
                    </div>

                    <Tabs defaultValue="generate">
                        <TabsList><TabsTrigger value="generate">Generate Report</TabsTrigger><TabsTrigger value="scheduled">Scheduled</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>

                        <TabsContent value="generate" className="mt-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reportTypes.map((report) => (
                                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold mb-1">{report.name}</h3>
                                            <p className="text-sm text-slate-500 mb-4">{report.description}</p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => generateReport(report.id, null)} disabled={generating === report.id}>
                                                    {generating === report.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}Generate
                                                </Button>
                                                <Button size="sm" variant="outline"><Download className="h-3 w-3" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="scheduled" className="mt-4">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Report Type</TableHead><TableHead>Merchant</TableHead><TableHead>Frequency</TableHead><TableHead>Next Run</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {scheduledReports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="font-medium">{report.type.replace('_', ' ')}</TableCell>
                                                    <TableCell>{report.merchant}</TableCell>
                                                    <TableCell><Badge variant="outline">{report.frequency}</Badge></TableCell>
                                                    <TableCell>{report.next_run}</TableCell>
                                                    <TableCell><Badge className={report.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>{report.status}</Badge></TableCell>
                                                    <TableCell><Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Report ID</TableHead><TableHead>Type</TableHead><TableHead>Merchant</TableHead><TableHead>Generated</TableHead><TableHead>Status</TableHead><TableHead>Size</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {recentReports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="font-mono text-sm">{report.id}</TableCell>
                                                    <TableCell>{report.type}</TableCell>
                                                    <TableCell>{report.merchant}</TableCell>
                                                    <TableCell>{format(report.date, 'MMM d, yyyy HH:mm')}</TableCell>
                                                    <TableCell><Badge className={report.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>{report.status}</Badge></TableCell>
                                                    <TableCell className="text-slate-500">{report.file_size}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon"><Send className="h-4 w-4" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Schedule Dialog */}
                    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Schedule Automated Report</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Report Type</Label>
                                    <Select value={scheduleConfig.report_type} onValueChange={(v) => setScheduleConfig(p => ({ ...p, report_type: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{reportTypes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select value={scheduleConfig.frequency} onValueChange={(v) => setScheduleConfig(p => ({ ...p, frequency: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Merchants</Label>
                                    <Select><SelectTrigger><SelectValue placeholder="All Merchants" /></SelectTrigger>
                                        <SelectContent><SelectItem value="all">All Merchants</SelectItem>{merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between"><span className="text-sm">Auto-generate report name</span><Switch checked={scheduleConfig.auto_generate_name} onCheckedChange={(c) => setScheduleConfig(p => ({ ...p, auto_generate_name: c }))} /></div>
                                    <div className="flex items-center justify-between"><span className="text-sm">Send email to merchant</span><Switch checked={scheduleConfig.send_email} onCheckedChange={(c) => setScheduleConfig(p => ({ ...p, send_email: c }))} /></div>
                                    <div className="flex items-center justify-between"><span className="text-sm">Include Terms & Conditions</span><Switch checked={scheduleConfig.include_terms} onCheckedChange={(c) => setScheduleConfig(p => ({ ...p, include_terms: c }))} /></div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                                <Button onClick={() => setShowScheduleDialog(false)}>Schedule Report</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Terms Dialog */}
                    <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Report Terms & Conditions</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Header</Label><Input value={termsAndConditions.header} onChange={(e) => setTermsAndConditions(p => ({ ...p, header: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Content</Label><Textarea value={termsAndConditions.content} onChange={(e) => setTermsAndConditions(p => ({ ...p, content: e.target.value }))} className="min-h-[200px] font-mono text-sm" /></div>
                                <div className="space-y-2"><Label>Footer</Label><Input value={termsAndConditions.footer} onChange={(e) => setTermsAndConditions(p => ({ ...p, footer: e.target.value }))} /></div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowTermsDialog(false)}>Cancel</Button>
                                <Button onClick={() => setShowTermsDialog(false)}>Save Terms</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}