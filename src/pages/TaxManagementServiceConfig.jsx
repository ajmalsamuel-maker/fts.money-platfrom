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

export default function TaxManagementServiceConfig() {
    const { platformUser } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('api');

    const [apiIntegration, setApiIntegration] = useState({
        primary_provider: 'avalara',
        avalara_api_key: 'sk_live_***********',
        avalara_configured: true,
        taxjar_api_key: '',
        taxjar_configured: false,
        fallback_enabled: true,
        cache_enabled: true,
        cache_ttl: 3600
    });

    const [jurisdictions, setJurisdictions] = useState([
        { id: 1, country: 'US', enabled: true, auto_updates: true, last_sync: '2026-01-08' },
        { id: 2, country: 'GB', enabled: true, auto_updates: true, last_sync: '2026-01-08' },
        { id: 3, country: 'DE', enabled: true, auto_updates: true, last_sync: '2026-01-07' },
        { id: 4, country: 'FR', enabled: true, auto_updates: false, last_sync: '2025-12-15' }
    ]);

    const [rateUpdates, setRateUpdates] = useState({
        auto_sync: true,
        sync_frequency: 'daily',
        sync_time: '02:00',
        notification_enabled: true,
        notification_email: 'admin@fts.money'
    });

    const [complianceReports, setComplianceReports] = useState({
        quarterly_vat: true,
        annual_tax_summary: true,
        jurisdiction_reports: true,
        auto_generation: true,
        retention_days: 2555
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TaxManagementServiceConfig"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            Tax Management Service Configuration
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure tax API integrations, jurisdiction rules, automatic rate updates, and compliance reporting
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="api">API Integration</TabsTrigger>
                            <TabsTrigger value="jurisdictions">Jurisdiction Rules</TabsTrigger>
                            <TabsTrigger value="updates">Rate Updates</TabsTrigger>
                            <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
                        </TabsList>

                        <TabsContent value="api" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tax Calculation API Integration</CardTitle>
                                    <CardDescription>
                                        Configure external tax calculation service providers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Primary Provider</Label>
                                        <select className="w-full mt-1 px-3 py-2 border rounded-md" value={apiIntegration.primary_provider}>
                                            <option value="avalara">Avalara</option>
                                            <option value="taxjar">TaxJar</option>
                                            <option value="vertex">Vertex</option>
                                            <option value="internal">Internal Engine</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            <div>
                                                <p className="font-medium text-emerald-900">Avalara Connected</p>
                                                <p className="text-sm text-emerald-700">API credentials configured and validated</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>TaxJar API Key</Label>
                                        <Input 
                                            type="password"
                                            placeholder="Enter TaxJar API key..."
                                            value={apiIntegration.taxjar_api_key}
                                            className="mt-1" 
                                        />
                                        {!apiIntegration.taxjar_configured && (
                                            <p className="text-xs text-amber-600 mt-1">Not configured (optional fallback)</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Fallback Provider</p>
                                            <p className="text-sm text-slate-600">Use secondary provider on failure</p>
                                        </div>
                                        <Switch checked={apiIntegration.fallback_enabled} onCheckedChange={(checked) => setApiIntegration({...apiIntegration, fallback_enabled: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Response Caching</p>
                                            <p className="text-sm text-slate-600">Cache tax calculations for performance</p>
                                        </div>
                                        <Switch checked={apiIntegration.cache_enabled} onCheckedChange={(checked) => setApiIntegration({...apiIntegration, cache_enabled: checked})} />
                                    </div>

                                    {apiIntegration.cache_enabled && (
                                        <div>
                                            <Label>Cache TTL (seconds)</Label>
                                            <Input 
                                                type="number" 
                                                value={apiIntegration.cache_ttl}
                                                className="mt-1" 
                                            />
                                        </div>
                                    )}

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save API Configuration
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="jurisdictions" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Jurisdiction Configuration</CardTitle>
                                    <CardDescription>
                                        Manage tax jurisdictions and their update settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {jurisdictions.map(jurisdiction => (
                                            <div key={jurisdiction.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{jurisdiction.country}</p>
                                                            <p className="text-sm text-slate-600">
                                                                Last sync: {jurisdiction.last_sync}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <Badge variant="outline" className="text-xs">
                                                                {jurisdiction.auto_updates ? 'Auto-sync' : 'Manual'}
                                                            </Badge>
                                                        </div>
                                                        <Switch 
                                                            checked={jurisdiction.enabled}
                                                            onCheckedChange={(checked) => {
                                                                setJurisdictions(jurisdictions.map(j => 
                                                                    j.id === jurisdiction.id ? {...j, enabled: checked} : j
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
                                        Add Jurisdiction
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="updates" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Automatic Rate Updates</CardTitle>
                                    <CardDescription>
                                        Configure automatic tax rate synchronization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Auto-Sync Enabled</p>
                                            <p className="text-sm text-slate-600">Automatically sync tax rates from providers</p>
                                        </div>
                                        <Switch checked={rateUpdates.auto_sync} onCheckedChange={(checked) => setRateUpdates({...rateUpdates, auto_sync: checked})} />
                                    </div>

                                    <div>
                                        <Label>Sync Frequency</Label>
                                        <select className="w-full mt-1 px-3 py-2 border rounded-md" value={rateUpdates.sync_frequency}>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Sync Time (UTC)</Label>
                                        <Input 
                                            type="time" 
                                            value={rateUpdates.sync_time}
                                            className="mt-1" 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Update Notifications</p>
                                            <p className="text-sm text-slate-600">Email alerts for rate changes</p>
                                        </div>
                                        <Switch checked={rateUpdates.notification_enabled} onCheckedChange={(checked) => setRateUpdates({...rateUpdates, notification_enabled: checked})} />
                                    </div>

                                    {rateUpdates.notification_enabled && (
                                        <div>
                                            <Label>Notification Email</Label>
                                            <Input 
                                                type="email" 
                                                value={rateUpdates.notification_email}
                                                className="mt-1" 
                                            />
                                        </div>
                                    )}

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Update Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reports" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compliance Reporting</CardTitle>
                                    <CardDescription>
                                        Configure automatic compliance report generation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Quarterly VAT Reports</p>
                                            <p className="text-sm text-slate-600">Generate EU VAT MOSS reports</p>
                                        </div>
                                        <Switch checked={complianceReports.quarterly_vat} onCheckedChange={(checked) => setComplianceReports({...complianceReports, quarterly_vat: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Annual Tax Summary</p>
                                            <p className="text-sm text-slate-600">Yearly tax collection summary</p>
                                        </div>
                                        <Switch checked={complianceReports.annual_tax_summary} onCheckedChange={(checked) => setComplianceReports({...complianceReports, annual_tax_summary: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Jurisdiction Reports</p>
                                            <p className="text-sm text-slate-600">Per-country tax reports</p>
                                        </div>
                                        <Switch checked={complianceReports.jurisdiction_reports} onCheckedChange={(checked) => setComplianceReports({...complianceReports, jurisdiction_reports: checked})} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">Auto-Generation</p>
                                            <p className="text-sm text-slate-600">Automatically generate reports on schedule</p>
                                        </div>
                                        <Switch checked={complianceReports.auto_generation} onCheckedChange={(checked) => setComplianceReports({...complianceReports, auto_generation: checked})} />
                                    </div>

                                    <div>
                                        <Label>Report Retention (days)</Label>
                                        <Input 
                                            type="number" 
                                            value={complianceReports.retention_days}
                                            className="mt-1" 
                                        />
                                        <p className="text-xs text-slate-600 mt-1">Recommended: 7 years (2555 days) for audit compliance</p>
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Report Settings
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