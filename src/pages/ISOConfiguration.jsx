import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ISO27001Checklist from '@/components/compliance/ISO27001Checklist';
import ISOStandardsReference from '@/components/compliance/ISOStandardsReference';
import { 
    Shield, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    Download,
    Settings,
    FileText,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

const ISO_STANDARDS_CONFIG = [
    { 
        id: 'iso20022', 
        name: 'ISO 20022', 
        version: '2024.1', 
        description: 'Financial Services Message Scheme',
        lastChecked: null,
        updateAvailable: false
    },
    { 
        id: 'iso8583', 
        name: 'ISO 8583', 
        version: '2003', 
        description: 'Financial Transaction Card Messages',
        lastChecked: null,
        updateAvailable: false
    },
    { 
        id: 'iso4217', 
        name: 'ISO 4217', 
        version: '2025-05', 
        description: 'Currency Codes',
        lastChecked: null,
        updateAvailable: false
    },
    { 
        id: 'iso3166', 
        name: 'ISO 3166-1', 
        version: '2025', 
        description: 'Country Codes',
        lastChecked: null,
        updateAvailable: false
    },
    { 
        id: 'iso9362', 
        name: 'ISO 9362', 
        version: '2022', 
        description: 'BIC Codes',
        lastChecked: null,
        updateAvailable: false
    },
    { 
        id: 'iso13616', 
        name: 'ISO 13616', 
        version: '2020', 
        description: 'IBAN Standard',
        lastChecked: null,
        updateAvailable: false
    },
    { 
        id: 'iso27001', 
        name: 'ISO 27001', 
        version: '2022', 
        description: 'Information Security',
        lastChecked: null,
        updateAvailable: false
    }
];

export default function ISOConfiguration() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [checking, setChecking] = useState(false);
    const [autoCheck, setAutoCheck] = useState(true);
    const [standards, setStandards] = useState(ISO_STANDARDS_CONFIG);

    const queryClient = useQueryClient();

    // Fetch settings
    const { data: settings } = useQuery({
        queryKey: ['psp-settings'],
        queryFn: async () => {
            const results = await base44.entities.PSPSettings.list();
            return results[0] || {};
        }
    });

    const checkForUpdates = async () => {
        setChecking(true);
        toast.info('Checking for ISO standard updates...');

        try {
            const response = await base44.functions.invoke('checkISOUpdates', {
                standards: standards.map(s => ({ id: s.id, version: s.version }))
            });

            if (response.data.updates) {
                const updated = standards.map(std => {
                    const update = response.data.updates.find(u => u.id === std.id);
                    return update ? {
                        ...std,
                        lastChecked: new Date().toISOString(),
                        updateAvailable: update.newVersion !== std.version,
                        newVersion: update.newVersion
                    } : {
                        ...std,
                        lastChecked: new Date().toISOString()
                    };
                });
                setStandards(updated);
                
                const updatesAvailable = updated.filter(s => s.updateAvailable).length;
                if (updatesAvailable > 0) {
                    toast.success(`${updatesAvailable} ISO standard update(s) available`);
                } else {
                    toast.success('All ISO standards are up to date');
                }
            }
        } catch (error) {
            toast.error('Failed to check for updates');
        } finally {
            setChecking(false);
        }
    };

    const applyUpdate = async (standardId) => {
        const standard = standards.find(s => s.id === standardId);
        if (!standard || !standard.updateAvailable) return;

        toast.info(`Updating ${standard.name}...`);
        
        try {
            await base44.functions.invoke('applyISOUpdate', {
                standardId,
                version: standard.newVersion
            });

            const updated = standards.map(s => 
                s.id === standardId ? {
                    ...s,
                    version: s.newVersion,
                    updateAvailable: false,
                    newVersion: undefined
                } : s
            );
            setStandards(updated);
            toast.success(`${standard.name} updated successfully`);
        } catch (error) {
            toast.error(`Failed to update ${standard.name}`);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} currentPage="ISOConfiguration" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                
                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">ISO Standards Configuration</h1>
                                <p className="text-slate-600 mt-1">Manage international standards implementation and updates</p>
                            </div>
                            <Button onClick={checkForUpdates} disabled={checking}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                                Check for Updates
                            </Button>
                        </div>

                        {/* Auto-Check Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Update Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="auto-check" className="text-base font-medium">
                                            Automatic Daily Updates Check
                                        </Label>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Automatically check for new versions of ISO standards every day at 00:00 UTC
                                        </p>
                                    </div>
                                    <Switch
                                        id="auto-check"
                                        checked={autoCheck}
                                        onCheckedChange={setAutoCheck}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ISO Standards Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    ISO Standards Versions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {standards.map((standard) => (
                                        <div
                                            key={standard.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold">{standard.name}</h3>
                                                    <Badge variant="outline" className="font-mono">
                                                        v{standard.version}
                                                    </Badge>
                                                    {standard.updateAvailable && (
                                                        <Badge className="bg-green-600">
                                                            Update to v{standard.newVersion}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{standard.description}</p>
                                                {standard.lastChecked && (
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        Last checked: {new Date(standard.lastChecked).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {standard.updateAvailable ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => applyUpdate(standard.id)}
                                                        className="gap-2"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Update
                                                    </Button>
                                                ) : (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* ISO Standards Reference */}
                        <ISOStandardsReference />

                        {/* ISO 27001 Compliance Checklist */}
                        <ISO27001Checklist />

                        {/* Implementation Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    Platform Integration Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { area: 'Transaction Processing', standards: ['ISO 8583', 'ISO 20022'], status: 'active' },
                                        { area: 'Currency Handling', standards: ['ISO 4217'], status: 'active' },
                                        { area: 'Country/Location', standards: ['ISO 3166-1'], status: 'active' },
                                        { area: 'Bank Identifiers', standards: ['ISO 9362', 'ISO 13616'], status: 'active' },
                                        { area: 'Security Framework', standards: ['ISO 27001'], status: 'compliance' },
                                        { area: 'Card Networks', standards: ['ISO 8583'], status: 'active' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-4 border rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium">{item.area}</h4>
                                                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {item.standards.map((std, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {std}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}