import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, Lock, Globe, DollarSign } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ThreeDSecure() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [settings, setSettings] = useState({
        enabled: true,
        minAmount: 100,
        challengeRate: 15,
        exemptions: {
            lowValue: true,
            trustedMerchant: true,
            recurring: true
        },
        regions: ['EU', 'UK', 'US']
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['3ds-transactions'],
        queryFn: async () => {
            const txns = await base44.entities.Transaction.list('-created_date', 50);
            return txns.filter(t => t.requires_3ds || t.three_ds_status);
        }
    });

    const stats = {
        total3DS: transactions.length,
        frictionless: transactions.filter(t => t.three_ds_status === 'frictionless').length,
        challenged: transactions.filter(t => t.three_ds_status === 'challenged').length,
        failed: transactions.filter(t => t.three_ds_status === 'failed').length,
        successRate: transactions.length > 0 ? ((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100).toFixed(1) : 0
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="ThreeDSecure" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">3D Secure</h1>
                                <p className="text-slate-500">Manage authentication and fraud prevention</p>
                            </div>
                        </div>
                        <Badge className={settings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {settings.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total 3DS</p>
                                        <p className="text-2xl font-bold">{stats.total3DS}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Frictionless</p>
                                        <p className="text-2xl font-bold">{stats.frictionless}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Challenged</p>
                                        <p className="text-2xl font-bold">{stats.challenged}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Success Rate</p>
                                        <p className="text-2xl font-bold">{stats.successRate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>3DS Configuration</CardTitle>
                                <CardDescription>Configure authentication rules and thresholds</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Enable 3D Secure</p>
                                            <p className="text-sm text-slate-500">Require authentication for transactions</p>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={settings.enabled}
                                        onCheckedChange={(val) => setSettings({...settings, enabled: val})}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>Minimum Transaction Amount</Label>
                                    <div className="flex items-center gap-4">
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        <Input 
                                            type="number"
                                            value={settings.minAmount}
                                            onChange={(e) => setSettings({...settings, minAmount: parseFloat(e.target.value)})}
                                            className="flex-1"
                                        />
                                        <span className="text-sm text-slate-500">USD</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Transactions above this amount will require 3DS</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Challenge Rate</Label>
                                        <span className="text-sm font-medium">{settings.challengeRate}%</span>
                                    </div>
                                    <Slider
                                        value={[settings.challengeRate]}
                                        onValueChange={([val]) => setSettings({...settings, challengeRate: val})}
                                        max={100}
                                        step={5}
                                    />
                                    <p className="text-xs text-slate-500">Percentage of transactions to challenge</p>
                                </div>

                                <div className="space-y-3">
                                    <Label>Active Regions</Label>
                                    <Select 
                                        value={settings.regions[0]}
                                        onValueChange={(val) => {
                                            if (!settings.regions.includes(val)) {
                                                setSettings({...settings, regions: [...settings.regions, val]});
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Add region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EU">European Union</SelectItem>
                                            <SelectItem value="UK">United Kingdom</SelectItem>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="CA">Canada</SelectItem>
                                            <SelectItem value="AU">Australia</SelectItem>
                                            <SelectItem value="APAC">Asia Pacific</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        {settings.regions.map(region => (
                                            <Badge key={region} variant="secondary">{region}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Exemptions</CardTitle>
                                <CardDescription>Configure authentication exemptions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Low Value</p>
                                        <p className="text-xs text-slate-500">&lt; €30</p>
                                    </div>
                                    <Switch 
                                        checked={settings.exemptions.lowValue}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            exemptions: {...settings.exemptions, lowValue: val}
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Trusted Merchant</p>
                                        <p className="text-xs text-slate-500">Whitelist</p>
                                    </div>
                                    <Switch 
                                        checked={settings.exemptions.trustedMerchant}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            exemptions: {...settings.exemptions, trustedMerchant: val}
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Recurring</p>
                                        <p className="text-xs text-slate-500">Subscriptions</p>
                                    </div>
                                    <Switch 
                                        checked={settings.exemptions.recurring}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            exemptions: {...settings.exemptions, recurring: val}
                                        })}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-3">Authentication Flow</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
                                            <span className="text-sm text-slate-600">Risk Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</div>
                                            <span className="text-sm text-slate-600">Exemption Check</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</div>
                                            <span className="text-sm text-slate-600">Challenge/Frictionless</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Recent 3DS Authentications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {transactions.slice(0, 10).map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm">{txn.transaction_id}</span>
                                            <Badge variant="outline">{txn.payment_method}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">${txn.amount?.toFixed(2)}</span>
                                            <Badge className={
                                                txn.three_ds_status === 'frictionless' ? 'bg-emerald-100 text-emerald-700' :
                                                txn.three_ds_status === 'challenged' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }>
                                                {txn.three_ds_status || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}