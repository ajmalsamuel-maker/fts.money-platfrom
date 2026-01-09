import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Code, Save, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ISOGatewayServiceConfig() {
    const { platformUser } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('formats');

    // Mock configuration state
    const [messageFormats, setMessageFormats] = useState([
        { id: 1, name: 'ISO 20022 pacs.008', enabled: true, validation: 'strict' },
        { id: 2, name: 'ISO 8583 v1987', enabled: true, validation: 'lenient' },
        { id: 3, name: 'ISO 8583 v1993', enabled: true, validation: 'strict' },
        { id: 4, name: 'ISO 8583 v2003', enabled: false, validation: 'strict' }
    ]);

    const [endpoints, setEndpoints] = useState([
        { id: 1, name: 'Primary Gateway', url: 'https://iso-gateway.fts.money', port: 8443, protocol: 'HTTPS', status: 'active' },
        { id: 2, name: 'Backup Gateway', url: 'https://iso-gateway-backup.fts.money', port: 8443, protocol: 'HTTPS', status: 'standby' }
    ]);

    const [securitySettings, setSecuritySettings] = useState({
        tls_version: '1.3',
        certificate_validation: true,
        ip_whitelist_enabled: true,
        api_key_rotation_days: 90,
        message_encryption: true,
        audit_logging: true
    });

    const [routingRules, setRoutingRules] = useState([
        { id: 1, name: 'SWIFT MT to ISO 20022', source: 'SWIFT MT', target: 'ISO 20022', priority: 1 },
        { id: 2, name: 'ISO 8583 to ISO 20022', source: 'ISO 8583', target: 'ISO 20022', priority: 2 }
    ]);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ISOGatewayServiceConfig"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Code className="h-8 w-8 text-blue-600" />
                            ISO Gateway Service Configuration
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure message formats, network endpoints, security settings, and routing rules
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="formats">Message Formats</TabsTrigger>
                            <TabsTrigger value="endpoints">Network Endpoints</TabsTrigger>
                            <TabsTrigger value="security">Security Settings</TabsTrigger>
                            <TabsTrigger value="routing">Routing Rules</TabsTrigger>
                        </TabsList>

                        <TabsContent value="formats" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Supported Message Formats</CardTitle>
                                    <CardDescription>
                                        Enable and configure ISO message format support
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {messageFormats.map(format => (
                                            <div key={format.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <Switch 
                                                        checked={format.enabled}
                                                        onCheckedChange={(checked) => {
                                                            setMessageFormats(messageFormats.map(f => 
                                                                f.id === format.id ? {...f, enabled: checked} : f
                                                            ));
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900">{format.name}</p>
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

                        <TabsContent value="endpoints" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gateway Endpoints</CardTitle>
                                    <CardDescription>
                                        Configure network endpoints for ISO message processing
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {endpoints.map(endpoint => (
                                            <div key={endpoint.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {endpoint.status === 'active' ? (
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900">{endpoint.name}</p>
                                                            <p className="text-sm text-slate-600">{endpoint.url}:{endpoint.port}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={endpoint.status === 'active' ? "default" : "secondary"}>
                                                        {endpoint.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-600">Protocol:</span>
                                                        <span className="ml-2 font-medium">{endpoint.protocol}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600">Port:</span>
                                                        <span className="ml-2 font-medium">{endpoint.port}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Endpoint
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Configuration</CardTitle>
                                    <CardDescription>
                                        Configure security protocols and encryption settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>TLS Version</Label>
                                            <Input 
                                                value={securitySettings.tls_version} 
                                                onChange={(e) => setSecuritySettings({...securitySettings, tls_version: e.target.value})}
                                                className="mt-1"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900">Certificate Validation</p>
                                                <p className="text-sm text-slate-600">Verify SSL/TLS certificates</p>
                                            </div>
                                            <Switch 
                                                checked={securitySettings.certificate_validation}
                                                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, certificate_validation: checked})}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900">IP Whitelist</p>
                                                <p className="text-sm text-slate-600">Restrict access by IP address</p>
                                            </div>
                                            <Switch 
                                                checked={securitySettings.ip_whitelist_enabled}
                                                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ip_whitelist_enabled: checked})}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900">Message Encryption</p>
                                                <p className="text-sm text-slate-600">Encrypt message payloads</p>
                                            </div>
                                            <Switch 
                                                checked={securitySettings.message_encryption}
                                                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, message_encryption: checked})}
                                            />
                                        </div>

                                        <div>
                                            <Label>API Key Rotation (days)</Label>
                                            <Input 
                                                type="number"
                                                value={securitySettings.api_key_rotation_days} 
                                                onChange={(e) => setSecuritySettings({...securitySettings, api_key_rotation_days: parseInt(e.target.value)})}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    
                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Security Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="routing" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Message Routing Rules</CardTitle>
                                    <CardDescription>
                                        Configure automatic message translation and routing
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {routingRules.map((rule, index) => (
                                            <div key={rule.id} className="p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{rule.name}</p>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {rule.source} → {rule.target} (Priority: {rule.priority})
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Routing Rule
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