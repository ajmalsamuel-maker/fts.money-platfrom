import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FileText, Save, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export default function EInvoicingServiceConfig() {
    const { platformUser } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('peppol');

    const [peppolSettings, setPeppolSettings] = useState({
        access_point_enabled: true,
        participant_id: '0192:FTS001',
        endpoint_url: 'https://peppol.fts.money/as4',
        certificate_valid_until: '2027-06-15',
        test_mode: false
    });

    const [countryMandates, setCountryMandates] = useState([
        { id: 1, country: 'Italy', mandate: 'FatturaPA', enabled: true, deadline: '2019-01-01', status: 'active' },
        { id: 2, country: 'France', mandate: 'Chorus Pro', enabled: true, deadline: '2024-09-01', status: 'active' },
        { id: 3, country: 'Germany', mandate: 'XRechnung', enabled: true, deadline: '2025-01-01', status: 'active' },
        { id: 4, country: 'Spain', mandate: 'FacturaE', enabled: false, deadline: '2025-07-01', status: 'upcoming' }
    ]);

    const [formatSupport, setFormatSupport] = useState([
        { id: 1, format: 'UBL 2.1', enabled: true, validation: 'strict' },
        { id: 2, format: 'FatturaPA', enabled: true, validation: 'strict' },
        { id: 3, format: 'XRechnung', enabled: true, validation: 'strict' },
        { id: 4, format: 'Factur-X', enabled: true, validation: 'lenient' }
    ]);

    const [complianceMonitoring, setComplianceMonitoring] = useState({
        auto_alerts: true,
        deadline_reminders: true,
        mandate_updates: true,
        alert_email: 'compliance@fts.money',
        reminder_days: 30
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="EInvoicingServiceConfig"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            E-Invoicing Service Configuration
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure Peppol access point, country mandates, format support, and compliance monitoring
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="peppol">Peppol Access Point</TabsTrigger>
                            <TabsTrigger value="mandates">Country Mandates</TabsTrigger>
                            <TabsTrigger value="formats">Format Support</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance Monitoring</TabsTrigger>
                        </TabsList>

                        <TabsContent value="peppol" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Peppol Access Point Configuration</CardTitle>
                                    <CardDescription>
                                        Configure Peppol network connectivity and certificates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Peppol Access Point</p>
                                            <p className="text-sm text-slate-600">Enable Peppol network integration</p>
                                        </div>
                                        <Switch checked={peppolSettings.access_point_enabled} onCheckedChange={(checked) => setPeppolSettings({...peppolSettings, access_point_enabled: checked})} />
                                    </div>

                                    {peppolSettings.access_point_enabled && (
                                        <>
                                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                    <div>
                                                        <p className="font-medium text-emerald-900">Peppol Access Point Active</p>
                                                        <p className="text-sm text-emerald-700">Connected to Peppol network</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Participant ID</Label>
                                                <Input value={peppolSettings.participant_id} className="mt-1" />
                                            </div>

                                            <div>
                                                <Label>AS4 Endpoint URL</Label>
                                                <Input value={peppolSettings.endpoint_url} className="mt-1" />
                                            </div>

                                            <div>
                                                <Label>Certificate Expiry</Label>
                                                <Input type="date" value={peppolSettings.certificate_valid_until} className="mt-1" />
                                                <p className="text-xs text-slate-600 mt-1">Renew certificate before expiry</p>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-slate-900">Test Mode</p>
                                                    <p className="text-sm text-slate-600">Connect to Peppol test network</p>
                                                </div>
                                                <Switch checked={peppolSettings.test_mode} onCheckedChange={(checked) => setPeppolSettings({...peppolSettings, test_mode: checked})} />
                                            </div>
                                        </>
                                    )}

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Peppol Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="mandates" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Country E-Invoicing Mandates</CardTitle>
                                    <CardDescription>
                                        Track and manage country-specific e-invoicing requirements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {countryMandates.map(mandate => (
                                            <div key={mandate.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {mandate.status === 'active' ? (
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">{mandate.country} - {mandate.mandate}</p>
                                                            <p className="text-sm text-slate-600">
                                                                Deadline: {mandate.deadline}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={mandate.status === 'active' ? 'default' : 'secondary'}>
                                                            {mandate.status}
                                                        </Badge>
                                                        <Switch 
                                                            checked={mandate.enabled}
                                                            onCheckedChange={(checked) => {
                                                                setCountryMandates(countryMandates.map(m => 
                                                                    m.id === mandate.id ? {...m, enabled: checked} : m
                                                                ));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Country Mandate
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="formats" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice Format Support</CardTitle>
                                    <CardDescription>
                                        Configure supported e-invoice formats and validation rules
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {formatSupport.map(format => (
                                            <div key={format.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <Switch 
                                                        checked={format.enabled}
                                                        onCheckedChange={(checked) => {
                                                            setFormatSupport(formatSupport.map(f => 
                                                                f.id === format.id ? {...f, enabled: checked} : f
                                                            ));
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900">{format.format}</p>
                                                        <p className="text-sm text-slate-600">
                                                            Validation: <span className="font-medium">{format.validation}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={format.enabled ? "default" : "secondary"}>
                                                    {format.enabled ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Custom Format
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="compliance" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compliance Monitoring</CardTitle>
                                    <CardDescription>
                                        Configure automatic alerts for mandate deadlines and updates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Automatic Alerts</p>
                                            <p className="text-sm text-slate-600">Email alerts for compliance issues</p>
                                        </div>
                                        <Switch checked={complianceMonitoring.auto_alerts} onCheckedChange={(checked) => setComplianceMonitoring({...complianceMonitoring, auto_alerts: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Deadline Reminders</p>
                                            <p className="text-sm text-slate-600">Alerts before mandate deadlines</p>
                                        </div>
                                        <Switch checked={complianceMonitoring.deadline_reminders} onCheckedChange={(checked) => setComplianceMonitoring({...complianceMonitoring, deadline_reminders: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Mandate Updates</p>
                                            <p className="text-sm text-slate-600">Notify on new country mandates</p>
                                        </div>
                                        <Switch checked={complianceMonitoring.mandate_updates} onCheckedChange={(checked) => setComplianceMonitoring({...complianceMonitoring, mandate_updates: checked})} />
                                    </div>

                                    {complianceMonitoring.auto_alerts && (
                                        <>
                                            <div>
                                                <Label>Alert Email</Label>
                                                <Input 
                                                    type="email" 
                                                    value={complianceMonitoring.alert_email}
                                                    className="mt-1" 
                                                />
                                            </div>

                                            <div>
                                                <Label>Reminder Days Before Deadline</Label>
                                                <Input 
                                                    type="number" 
                                                    value={complianceMonitoring.reminder_days}
                                                    className="mt-1" 
                                                />
                                            </div>
                                        </>
                                    )}

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Compliance Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}