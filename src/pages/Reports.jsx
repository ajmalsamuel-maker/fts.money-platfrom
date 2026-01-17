import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
    FileText, Download, Send, Settings, Plus, Play, Loader2, ChevronDown, ChevronRight, Building2, Store, CheckCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { toast } from "sonner";

const reportTypes = [
    { id: 'transaction_summary', name: 'Transaction Summary', description: 'Daily/weekly/monthly transaction totals' },
    { id: 'settlement_report', name: 'Settlement Report', description: 'Detailed settlement and payout information' },
    { id: 'chargeback_report', name: 'Chargeback Report', description: 'Chargeback and dispute analytics' },
    { id: 'fee_statement', name: 'Fee Statement', description: 'Processing fees and charges breakdown' },
    { id: 'merchant_statement', name: 'Merchant Statement', description: 'Complete monthly merchant statement' },
    { id: 'psp_reconciliation', name: 'PSP Reconciliation', description: 'PSP-level reconciliation report' },
];

export default function Reports() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showTermsDialog, setShowTermsDialog] = useState(false);
    const [generating, setGenerating] = useState(null);
    const [expandedPSPs, setExpandedPSPs] = useState({});
    const [activeView, setActiveView] = useState('psp');
    const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });
    const [selectedMerchant, setSelectedMerchant] = useState('all');
    const [selectedProvider, setSelectedProvider] = useState('all');

    const [scheduleConfig, setScheduleConfig] = useState({
        report_type: 'merchant_statement', frequency: 'monthly', psp_id: 'all', merchant_id: 'all',
        send_email: true, include_terms: true, auto_generate_name: true,
        custom_name_template: '{merchant_name} - {report_type} - {date}',
    });

    const [termsAndConditions, setTermsAndConditions] = useState({
        header: 'TERMS AND CONDITIONS',
        content: `1. PAYMENT TERMS: All settlements are processed according to the agreed settlement period.
2. FEES: Processing fees are deducted automatically from settlements as per the merchant agreement.
3. CHARGEBACKS: Merchants are liable for chargebacks and associated fees.
4. RESERVES: A rolling reserve may be held as collateral against potential chargebacks.
5. COMPLIANCE: Merchants must maintain PCI DSS compliance.
6. DISPUTES: Any disputes must be raised within 30 days of issuance.`,
        footer: 'For questions, contact: finance@paymenthub.com'
    });

    const { data: processors = [] } = useQuery({
        queryKey: ['payment-processors'],
        queryFn: () => base44.entities.PaymentProcessor.list(),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    // Mock PSP-level reports with merchant breakdown
    const pspReports = [];

    const togglePSP = (pspId) => setExpandedPSPs(prev => ({ ...prev, [pspId]: !prev[pspId] }));

    const generatePSPReport = (psp) => {
        const filename = `${psp.psp_name.replace(/\s+/g, '_')}_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        let csvContent = `PSP Report: ${psp.psp_name}\n`;
        csvContent += `Generated: ${format(new Date(), 'PPpp')}\n`;
        csvContent += `Period: ${psp.period}\n\n`;
        csvContent += `Summary\n`;
        csvContent += `Total Volume,$${psp.total_volume.toLocaleString()}\n`;
        csvContent += `Total Fees,$${psp.total_fees.toLocaleString()}\n`;
        csvContent += `Total Transactions,${psp.total_transactions.toLocaleString()}\n\n`;
        csvContent += `Merchant Breakdown\n`;
        csvContent += `Merchant,Volume,Fees,Transactions,Status\n`;
        psp.merchants.forEach(m => {
            csvContent += `${m.name},$${m.volume.toLocaleString()},$${m.fees.toLocaleString()},${m.transactions},${m.status}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}`);
    };

    const generateMerchantCombinedReport = (merchantName, merchantData) => {
        const filename = `${merchantName.replace(/\s+/g, '_')}_Combined_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        let csvContent = `Combined Merchant Report: ${merchantName}\n`;
        csvContent += `Generated: ${format(new Date(), 'PPpp')}\n\n`;
        csvContent += `PSP Breakdown\n`;
        csvContent += `PSP,Volume,Fees,Transactions\n`;
        merchantData.forEach(m => {
            csvContent += `${m.psp},$${m.volume.toLocaleString()},$${m.fees.toLocaleString()},${m.transactions}\n`;
        });
        csvContent += `\nTotals\n`;
        csvContent += `Total Volume,$${merchantData.reduce((s, m) => s + m.volume, 0).toLocaleString()}\n`;
        csvContent += `Total Fees,$${merchantData.reduce((s, m) => s + m.fees, 0).toLocaleString()}\n`;
        csvContent += `Total Transactions,${merchantData.reduce((s, m) => s + m.transactions, 0).toLocaleString()}\n`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}`);
    };

    const generateReport = async (type, pspId, merchantId) => {
        setGenerating(`${type}_${pspId}_${merchantId}`);
        
        // Find relevant data
        const pspData = pspReports.find(p => p.psp_id === pspId);
        const merchantData = pspData?.merchants.find(m => m.merchant_id === merchantId);
        
        // Generate CSV content
        let csvContent = '';
        let filename = '';
        
        if (type === 'statement' && merchantData) {
            filename = `${merchantData.name.replace(/\s+/g, '_')}_Statement_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            csvContent = `Merchant Statement\n`;
            csvContent += `Generated: ${format(new Date(), 'PPpp')}\n\n`;
            csvContent += `Merchant,${merchantData.name}\n`;
            csvContent += `PSP,${pspData.psp_name}\n`;
            csvContent += `Period,${pspData.period}\n\n`;
            csvContent += `Metric,Value\n`;
            csvContent += `Total Volume,$${merchantData.volume.toLocaleString()}\n`;
            csvContent += `Total Fees,$${merchantData.fees.toLocaleString()}\n`;
            csvContent += `Transaction Count,${merchantData.transactions.toLocaleString()}\n`;
            csvContent += `Net Amount,$${(merchantData.volume - merchantData.fees).toLocaleString()}\n`;
            if (scheduleConfig.include_terms) {
                csvContent += `\n\n${termsAndConditions.header}\n`;
                csvContent += `${termsAndConditions.content}\n`;
                csvContent += `${termsAndConditions.footer}\n`;
            }
        } else {
            const reportType = reportTypes.find(r => r.id === type);
            filename = `${reportType?.name.replace(/\s+/g, '_') || type}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            csvContent = `${reportType?.name || type}\n`;
            csvContent += `Generated: ${format(new Date(), 'PPpp')}\n\n`;
            csvContent += `PSP,Merchant,Volume,Fees,Transactions\n`;
            pspReports.forEach(psp => {
                psp.merchants.forEach(m => {
                    csvContent += `${psp.psp_name},${m.name},$${m.volume.toLocaleString()},$${m.fees.toLocaleString()},${m.transactions}\n`;
                });
            });
        }
        
        // Download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Report downloaded: ${filename}`);
        setGenerating(null);
    };

    const sendReport = async (pspId, merchantId) => {
        const pspData = pspReports.find(p => p.psp_id === pspId);
        const merchantData = pspData?.merchants.find(m => m.merchant_id === merchantId);
        const merchant = merchants.find(m => m.id === merchantId) || { 
            contact_email: 'merchant@example.com', 
            business_name: merchantData?.name || 'Merchant',
            contact_name: 'Merchant'
        };
        
        try {
            await base44.integrations.Core.SendEmail({
                to: merchant.contact_email || 'merchant@example.com',
                subject: `Monthly Statement - ${merchantData?.name || merchant.business_name} - PaymentHub`,
                body: `Dear ${merchant.contact_name || 'Merchant'},

Please find your monthly statement summary below:

Period: ${pspData?.period || 'Current Month'}
PSP: ${pspData?.psp_name || 'N/A'}

Total Volume: $${merchantData?.volume?.toLocaleString() || '0'}
Processing Fees: $${merchantData?.fees?.toLocaleString() || '0'}
Transaction Count: ${merchantData?.transactions?.toLocaleString() || '0'}
Net Amount: $${((merchantData?.volume || 0) - (merchantData?.fees || 0)).toLocaleString()}

${scheduleConfig.include_terms ? `\n---\n${termsAndConditions.header}\n${termsAndConditions.content}\n\n${termsAndConditions.footer}` : ''}

Best regards,
PaymentHub Finance Team`
            });
            toast.success(`Report sent to ${merchant.contact_email || merchantData?.name}`);
        } catch (e) {
            toast.error('Failed to send email');
        }
    };

    const statusColors = { sent: 'bg-emerald-100 text-emerald-700', generated: 'bg-blue-100 text-blue-700', pending: 'bg-amber-100 text-amber-700' };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Reports" />
            <div className={cn(
                "transition-all duration-300",
                "lg:ml-[25.75rem]",
                sidebarCollapsed && "ml-0"
            )}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div><h1 className="text-xl sm:text-2xl font-bold">Reports</h1><p className="text-sm sm:text-base text-slate-500">PSP and merchant-level reporting with contract terms</p></div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setShowTermsDialog(true)} className="gap-2"><Settings className="h-4 w-4" />Terms & Conditions</Button>
                            <Button onClick={() => setShowScheduleDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Schedule Report</Button>
                        </div>
                    </div>

                    <Tabs defaultValue="hierarchy">
                        <TabsList><TabsTrigger value="hierarchy">PSP & Merchant Reports</TabsTrigger><TabsTrigger value="generate">Generate</TabsTrigger><TabsTrigger value="scheduled">Scheduled</TabsTrigger></TabsList>

                        <TabsContent value="hierarchy" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Report Hierarchy</CardTitle>
                                        <Tabs value={activeView} onValueChange={setActiveView}>
                                            <TabsList><TabsTrigger value="psp">By PSP</TabsTrigger><TabsTrigger value="merchant">By Merchant</TabsTrigger></TabsList>
                                        </Tabs>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {activeView === 'psp' ? (
                                        <div className="divide-y">
                                            {pspReports.map((psp) => (
                                                <Collapsible key={psp.psp_id} open={expandedPSPs[psp.psp_id]} onOpenChange={() => togglePSP(psp.psp_id)}>
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                                                            <div className="flex items-center gap-3">
                                                                {expandedPSPs[psp.psp_id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-600" /></div>
                                                                <div className="text-left">
                                                                    <p className="font-semibold">{psp.psp_name}</p>
                                                                    <p className="text-xs text-slate-500">{psp.period} · {psp.merchants.length} merchants</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6 text-right">
                                                                <div><p className="text-xs text-slate-500">Volume</p><p className="font-semibold">${(psp.total_volume / 1000).toFixed(0)}K</p></div>
                                                                <div><p className="text-xs text-slate-500">Fees</p><p className="font-semibold text-blue-600">${psp.total_fees.toLocaleString()}</p></div>
                                                                <div><p className="text-xs text-slate-500">Transactions</p><p className="font-semibold">{psp.total_transactions.toLocaleString()}</p></div>
                                                                <Button variant="outline" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); generatePSPReport(psp); }}><Download className="h-3 w-3" />PSP Report</Button>
                                                            </div>
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="bg-slate-50 border-t">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="bg-slate-100"><TableHead>Merchant</TableHead><TableHead className="text-right">Volume</TableHead><TableHead className="text-right">Fees</TableHead><TableHead className="text-right">Transactions</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {psp.merchants.map((m) => (
                                                                        <TableRow key={m.merchant_id}>
                                                                            <TableCell><div className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /><span className="font-medium">{m.name}</span></div></TableCell>
                                                                            <TableCell className="text-right">${m.volume.toLocaleString()}</TableCell>
                                                                            <TableCell className="text-right text-blue-600">${m.fees.toLocaleString()}</TableCell>
                                                                            <TableCell className="text-right">{m.transactions.toLocaleString()}</TableCell>
                                                                            <TableCell><Badge className={statusColors[m.status]}>{m.status}</Badge></TableCell>
                                                                            <TableCell>
                                                                                <div className="flex gap-1">
                                                                                    <Button variant="ghost" size="icon" onClick={() => generateReport('statement', psp.psp_id, m.merchant_id)}><Download className="h-4 w-4" /></Button>
                                                                                    <Button variant="ghost" size="icon" onClick={() => sendReport(psp.psp_id, m.merchant_id)}><Send className="h-4 w-4" /></Button>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Merchant</TableHead><TableHead>PSPs</TableHead><TableHead className="text-right">Total Volume</TableHead><TableHead className="text-right">Total Fees</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {[...new Set(pspReports.flatMap(p => p.merchants.map(m => m.name)))].map((merchantName) => {
                                                    const merchantData = pspReports.flatMap(p => p.merchants.filter(m => m.name === merchantName).map(m => ({ ...m, psp: p.psp_name })));
                                                    return (
                                                        <TableRow key={merchantName}>
                                                            <TableCell><div className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /><span className="font-medium">{merchantName}</span></div></TableCell>
                                                            <TableCell><div className="flex gap-1">{merchantData.map(m => <Badge key={m.psp} variant="outline" className="text-xs">{m.psp}</Badge>)}</div></TableCell>
                                                            <TableCell className="text-right font-semibold">${merchantData.reduce((s, m) => s + m.volume, 0).toLocaleString()}</TableCell>
                                                            <TableCell className="text-right text-blue-600">${merchantData.reduce((s, m) => s + m.fees, 0).toLocaleString()}</TableCell>
                                                            <TableCell><Button variant="outline" size="sm" className="gap-1" onClick={() => generateMerchantCombinedReport(merchantName, merchantData)}><Download className="h-3 w-3" />Combined</Button></TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="generate" className="mt-4">
                            <ReportFilters
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                merchant={selectedMerchant}
                                onMerchantChange={setSelectedMerchant}
                                merchants={merchants}
                                provider={selectedProvider}
                                onProviderChange={setSelectedProvider}
                                providers={processors}
                                onReset={() => {
                                    setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                                    setSelectedMerchant('all');
                                    setSelectedProvider('all');
                                }}
                            />
                            <ReportGenerator 
                                dateRange={dateRange}
                                merchant={selectedMerchant}
                                provider={selectedProvider}
                            />
                        </TabsContent>

                        <TabsContent value="scheduled" className="mt-4">
                            <Card><CardContent className="p-6 text-center text-slate-500">Configure scheduled reports using the Schedule button above.</CardContent></Card>
                        </TabsContent>
                    </Tabs>

                    {/* Schedule Dialog */}
                    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Schedule Automated Report</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>PSP</Label>
                                        <Select value={scheduleConfig.psp_id} onValueChange={(v) => setScheduleConfig(p => ({ ...p, psp_id: v }))}>
                                            <SelectTrigger><SelectValue placeholder="All PSPs" /></SelectTrigger>
                                            <SelectContent><SelectItem value="all">All PSPs</SelectItem>{processors.map(p => <SelectItem key={p.id} value={p.processor_id}>{p.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Merchant</Label>
                                        <Select value={scheduleConfig.merchant_id} onValueChange={(v) => setScheduleConfig(p => ({ ...p, merchant_id: v }))}>
                                            <SelectTrigger><SelectValue placeholder="All Merchants" /></SelectTrigger>
                                            <SelectContent><SelectItem value="all">All Merchants</SelectItem>{merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
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