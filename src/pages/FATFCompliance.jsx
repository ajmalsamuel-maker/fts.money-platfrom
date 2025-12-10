import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, FileText, Globe, TrendingUp } from 'lucide-react';

export default function FATFCompliance() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { data: travelRuleData = [] } = useQuery({
        queryKey: ['travelRuleData'],
        queryFn: () => base44.entities.TravelRuleData.list('-created_date', 50),
    });

    const { data: sanctionsScreenings = [] } = useQuery({
        queryKey: ['sanctionsScreenings'],
        queryFn: () => base44.entities.SanctionsScreening.list('-created_date', 50),
    });

    const { data: sars = [] } = useQuery({
        queryKey: ['sars'],
        queryFn: () => base44.entities.SuspiciousActivityReport.list('-created_date', 50),
    });

    const pendingReviews = sanctionsScreenings.filter(s => s.manual_review_required && s.manual_review_status === 'pending');
    const activeSARs = sars.filter(s => ['draft', 'pending_review', 'reviewed'].includes(s.status));

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="FATFCompliance" />
            
            <div className={cn("transition-all duration-300 lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">FATF Compliance Center</h1>
                        <p className="text-slate-500">Travel Rule, Sanctions Screening & SAR Management</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-slate-500">Travel Rule</p>
                                        <p className="text-2xl font-bold">{travelRuleData.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="text-sm text-slate-500">Screenings</p>
                                        <p className="text-2xl font-bold">{sanctionsScreenings.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                                    <div>
                                        <p className="text-sm text-slate-500">Pending Reviews</p>
                                        <p className="text-2xl font-bold text-amber-600">{pendingReviews.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-sm text-slate-500">Active SARs</p>
                                        <p className="text-2xl font-bold text-red-600">{activeSARs.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="travel-rule" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="travel-rule">Travel Rule</TabsTrigger>
                            <TabsTrigger value="sanctions">Sanctions Screening</TabsTrigger>
                            <TabsTrigger value="sars">SARs</TabsTrigger>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="travel-rule">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Travel Rule Compliance (FATF Recommendation 16)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Transactions ≥ $1,000/€1,000 require originator and beneficiary information
                                    </p>
                                    <div className="space-y-2">
                                        {travelRuleData.slice(0, 10).map((item) => (
                                            <div key={item.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{item.transaction_id}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {item.originator_name} → {item.beneficiary_name}
                                                        </p>
                                                    </div>
                                                    <Badge variant={item.compliance_status === 'verified' ? 'default' : 'secondary'}>
                                                        {item.compliance_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sanctions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sanctions Screening (OFAC, UN, EU)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {sanctionsScreenings.slice(0, 10).map((screening) => (
                                            <div key={screening.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{screening.screened_entity}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {screening.screened_country} • {screening.screening_type}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={
                                                            screening.risk_level === 'critical' ? 'destructive' :
                                                            screening.risk_level === 'high' ? 'destructive' :
                                                            screening.risk_level === 'medium' ? 'secondary' : 'outline'
                                                        }>
                                                            {screening.risk_level}
                                                        </Badge>
                                                        {screening.manual_review_required && (
                                                            <Badge variant="outline" className="bg-amber-50">
                                                                Review Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sars">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Suspicious Activity Reports (SARs)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {sars.slice(0, 10).map((sar) => (
                                            <div key={sar.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium">{sar.sar_id}</p>
                                                        <p className="text-sm text-slate-500">
                                                            Risk Score: {sar.risk_score}/100
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={
                                                            sar.priority === 'critical' ? 'destructive' :
                                                            sar.priority === 'high' ? 'destructive' :
                                                            'secondary'
                                                        }>
                                                            {sar.priority}
                                                        </Badge>
                                                        <Badge variant="outline">{sar.status}</Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600">{sar.activity_description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Compliance Standards</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                            <span className="text-sm font-medium">FATF Travel Rule</span>
                                            <Badge className="bg-emerald-600">Implemented</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                            <span className="text-sm font-medium">Sanctions Screening</span>
                                            <Badge className="bg-emerald-600">Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                            <span className="text-sm font-medium">SAR Filing</span>
                                            <Badge className="bg-emerald-600">Enabled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium">Blockchain Forensics</span>
                                            <Badge className="bg-blue-600">Integrated</Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button className="w-full justify-start" variant="outline">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generate SAR Report
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Run Sanctions Check
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <Globe className="h-4 w-4 mr-2" />
                                            Review Travel Rule Data
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            View Risk Analytics
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}