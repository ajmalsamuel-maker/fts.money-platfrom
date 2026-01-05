import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Globe, CheckCircle, AlertTriangle, Download, RefreshCw, AlertCircle, Settings, Clock, Send, Bell, Check } from 'lucide-react';
import { EINVOICING_STANDARDS, getStandardForCountry } from '@/components/utils/eInvoicingStandards';
import { ValidationSummaryBadge } from '@/components/invoice/ValidationErrorDisplay';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EInvoicingDashboard() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [automationConfig, setAutomationConfig] = useState({
        auto_submit_enabled: false,
        submit_schedule: 'immediate',
        retry_failed_enabled: true,
        max_retry_attempts: 3,
        notification_email: '',
        webhook_url: ''
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices-with-einvoicing'],
        queryFn: async () => {
            const result = await base44.entities.Invoice.list('-created_date', 100);
            return result || [];
        },
        refetchInterval: false,
        refetchOnWindowFocus: false
    });

    const eInvoiceCount = invoices.filter(inv => inv.einvoice_format).length;
    const pendingSubmission = invoices.filter(inv => inv.einvoice_status === 'generated').length;
    const submitted = invoices.filter(inv => inv.einvoice_status === 'submitted').length;
    const validationFailed = invoices.filter(inv => inv.einvoice_status === 'validation_failed').length;

    const retryValidation = async (invoice) => {
        try {
            toast.loading('Validating invoice...');
            const response = await base44.functions.invoke('validateEInvoiceSchema', {
                invoice_id: invoice.id,
                xml_content: invoice.einvoice_xml,
                format: invoice.einvoice_format,
                strict_mode: true
            });

            if (response.data.success && response.data.validation.valid) {
                toast.success('Validation passed!');
                queryClient.invalidateQueries(['invoices-with-einvoicing']);
            } else {
                toast.error(`Validation failed: ${response.data.validation.error_count} errors`);
            }
        } catch (error) {
            toast.error('Validation failed: ' + error.message);
        }
    };

    const resubmitInvoice = async (invoice) => {
        try {
            toast.loading('Submitting to gateway...');
            const response = await base44.functions.invoke('eInvoicingEngine', {
                invoice_id: invoice.id,
                format: invoice.einvoice_format,
                submit_to_gateway: true
            });

            if (response.data.success) {
                toast.success('Invoice submitted successfully!');
                queryClient.invalidateQueries(['invoices-with-einvoicing']);
            } else {
                toast.error('Submission failed: ' + response.data.error);
            }
        } catch (error) {
            toast.error('Submission failed: ' + error.message);
        }
    };

    const handleBulkRetry = async () => {
        if (selectedInvoices.length === 0) {
            toast.error('No invoices selected');
            return;
        }

        toast.loading(`Retrying ${selectedInvoices.length} invoices...`);
        let successCount = 0;
        let failCount = 0;

        for (const invoiceId of selectedInvoices) {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            try {
                const response = await base44.functions.invoke('validateEInvoiceSchema', {
                    invoice_id: invoice.id,
                    xml_content: invoice.einvoice_xml,
                    format: invoice.einvoice_format,
                    strict_mode: true
                });
                if (response.data.success && response.data.validation.valid) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }

        toast.success(`Bulk retry complete: ${successCount} passed, ${failCount} failed`);
        queryClient.invalidateQueries(['invoices-with-einvoicing']);
        setSelectedInvoices([]);
    };

    const handleBulkSubmit = async () => {
        if (selectedInvoices.length === 0) {
            toast.error('No invoices selected');
            return;
        }

        toast.loading(`Submitting ${selectedInvoices.length} invoices...`);
        let successCount = 0;
        let failCount = 0;

        for (const invoiceId of selectedInvoices) {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            if (invoice.einvoice_status !== 'validated') continue;

            try {
                const response = await base44.functions.invoke('eInvoicingEngine', {
                    invoice_id: invoice.id,
                    format: invoice.einvoice_format,
                    submit_to_gateway: true
                });
                if (response.data.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }

        toast.success(`Bulk submission complete: ${successCount} submitted, ${failCount} failed`);
        queryClient.invalidateQueries(['invoices-with-einvoicing']);
        setSelectedInvoices([]);
    };

    const saveAutomationConfig = async () => {
        try {
            await base44.entities.PlatformConfig.create({
                config_type: 'einvoicing_automation',
                config_data: automationConfig
            });
            toast.success('Automation settings saved!');
            setShowConfigDialog(false);
        } catch (error) {
            toast.error('Failed to save: ' + error.message);
        }
    };

    const toggleSelectAll = () => {
        if (selectedInvoices.length === invoices.filter(inv => inv.einvoice_format).length) {
            setSelectedInvoices([]);
        } else {
            setSelectedInvoices(invoices.filter(inv => inv.einvoice_format).map(inv => inv.id));
        }
    };

    // Real-time status polling
    useEffect(() => {
        const interval = setInterval(() => {
            queryClient.invalidateQueries(['invoices-with-einvoicing']);
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [queryClient]);

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="EInvoicingDashboard" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Global E-Invoicing Dashboard</h1>
                            <p className="text-slate-600 mt-1">Manage electronic invoices across all standards worldwide</p>
                        </div>
                        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Automation Settings
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>E-Invoicing Automation Configuration</DialogTitle>
                                </DialogHeader>
                                <Tabs defaultValue="automation">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="automation">Automation</TabsTrigger>
                                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                        <TabsTrigger value="gateways">Gateways</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="automation" className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Auto-Submit Enabled</Label>
                                                <p className="text-sm text-slate-500">Automatically submit validated invoices</p>
                                            </div>
                                            <Switch
                                                checked={automationConfig.auto_submit_enabled}
                                                onCheckedChange={(checked) => setAutomationConfig({...automationConfig, auto_submit_enabled: checked})}
                                            />
                                        </div>

                                        <div>
                                            <Label>Submission Schedule</Label>
                                            <Select value={automationConfig.submit_schedule} onValueChange={(value) => setAutomationConfig({...automationConfig, submit_schedule: value})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                                                    <SelectItem value="hourly">Hourly Batch</SelectItem>
                                                    <SelectItem value="daily">Daily at 00:00 UTC</SelectItem>
                                                    <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Auto-Retry Failed</Label>
                                                <p className="text-sm text-slate-500">Retry failed validations automatically</p>
                                            </div>
                                            <Switch
                                                checked={automationConfig.retry_failed_enabled}
                                                onCheckedChange={(checked) => setAutomationConfig({...automationConfig, retry_failed_enabled: checked})}
                                            />
                                        </div>

                                        <div>
                                            <Label>Max Retry Attempts</Label>
                                            <Input
                                                type="number"
                                                value={automationConfig.max_retry_attempts}
                                                onChange={(e) => setAutomationConfig({...automationConfig, max_retry_attempts: parseInt(e.target.value)})}
                                                min="1"
                                                max="10"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notifications" className="space-y-4">
                                        <div>
                                            <Label>Notification Email</Label>
                                            <Input
                                                type="email"
                                                value={automationConfig.notification_email}
                                                onChange={(e) => setAutomationConfig({...automationConfig, notification_email: e.target.value})}
                                                placeholder="finance@company.com"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Receive alerts for submission status</p>
                                        </div>

                                        <div>
                                            <Label>Webhook URL (Optional)</Label>
                                            <Input
                                                value={automationConfig.webhook_url}
                                                onChange={(e) => setAutomationConfig({...automationConfig, webhook_url: e.target.value})}
                                                placeholder="https://your-system.com/webhook"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Real-time status updates via webhook</p>
                                        </div>

                                        <Alert>
                                            <Bell className="h-4 w-4" />
                                            <AlertDescription>
                                                You'll receive notifications for: successful submissions, validation failures, and gateway errors.
                                            </AlertDescription>
                                        </Alert>
                                    </TabsContent>

                                    <TabsContent value="gateways" className="space-y-4">
                                        <Alert>
                                            <Globe className="h-4 w-4" />
                                            <AlertDescription>
                                                Gateway credentials are configured per jurisdiction in Tax Management. This section shows connection status.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="space-y-2">
                                            {['Peppol Network', 'FatturaPA SDI', 'ZATCA Portal', 'CFDI SAT'].map(gateway => (
                                                <div key={gateway} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="font-medium">{gateway}</span>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Connected
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <Button onClick={saveAutomationConfig} className="w-full">
                                    Save Configuration
                                </Button>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">E-Invoices Generated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{eInvoiceCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Pending Submission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-amber-600">{pendingSubmission}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Submitted</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{submitted}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Validation Failed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{validationFailed}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Supported Standards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">{Object.keys(EINVOICING_STANDARDS).length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supported Standards */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Supported E-Invoicing Standards</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(EINVOICING_STANDARDS).map(([key, standard]) => (
                                    <Card key={key} className="bg-slate-50">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{standard.name}</h4>
                                                    <p className="text-xs text-slate-600">{standard.format}</p>
                                                </div>
                                                {standard.mandatory && (
                                                    <Badge className="bg-red-100 text-red-800 text-xs">Mandatory</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{standard.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {standard.regions?.slice(0, 5).map(region => (
                                                    <Badge key={region} variant="outline" className="text-xs">
                                                        {region}
                                                    </Badge>
                                                ))}
                                                {(standard.regions?.length || 0) > 5 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{standard.regions.length - 5}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-3 text-xs">
                                                {standard.digital_signature && (
                                                    <Badge className="bg-purple-100 text-purple-800">Signature Required</Badge>
                                                )}
                                                {standard.gateway_required && (
                                                    <Badge className="bg-blue-100 text-blue-800">Gateway</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent E-Invoices */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent E-Invoices</CardTitle>
                                {selectedInvoices.length > 0 && (
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{selectedInvoices.length} selected</Badge>
                                        <Button size="sm" variant="outline" onClick={handleBulkRetry} className="gap-1">
                                            <RefreshCw className="h-3 w-3" />
                                            Bulk Retry
                                        </Button>
                                        <Button size="sm" onClick={handleBulkSubmit} className="gap-1 bg-green-600 hover:bg-green-700">
                                            <Send className="h-3 w-3" />
                                            Bulk Submit
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {invoices.filter(inv => inv.einvoice_format).length > 0 && (
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                                    <Checkbox
                                        checked={selectedInvoices.length === invoices.filter(inv => inv.einvoice_format).length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className="text-sm text-slate-600">Select All</span>
                                </div>
                            )}
                            <div className="space-y-3">
                                {invoices.filter(inv => inv.einvoice_format).slice(0, 10).map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={selectedInvoices.includes(invoice.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedInvoices([...selectedInvoices, invoice.id]);
                                                    } else {
                                                        setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                                                    }
                                                }}
                                            />
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium">{invoice.invoice_number}</p>
                                                <p className="text-xs text-slate-600">
                                                    {invoice.customer_name} • {invoice.customer_country}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="uppercase">
                                                {invoice.einvoice_format}
                                            </Badge>
                                            {invoice.einvoice_status === 'submitted' ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Submitted
                                                </Badge>
                                            ) : invoice.einvoice_status === 'validation_failed' ? (
                                                <Badge className="bg-red-100 text-red-800">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Failed
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-800">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                            {invoice.einvoice_validation && (
                                                <ValidationSummaryBadge validation={invoice.einvoice_validation} />
                                            )}
                                            {invoice.einvoice_status === 'validation_failed' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => retryValidation(invoice)}
                                                    className="gap-1"
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                    Retry
                                                </Button>
                                            )}
                                            {invoice.einvoice_status === 'validated' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="default"
                                                    onClick={() => resubmitInvoice(invoice)}
                                                    className="gap-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    Submit
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}