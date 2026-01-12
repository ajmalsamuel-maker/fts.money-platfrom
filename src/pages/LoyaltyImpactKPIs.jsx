import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Menu, X, Plus, TrendingUp, Target } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LoyaltyImpactKPIs() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [kpiDialog, setKpiDialog] = useState(false);
    const [newKPI, setNewKPI] = useState({ kpi_name: '', target_value: 0, current_value: 0, unit: '' });
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id || '');

    const { data: indices = [] } = useQuery({
        queryKey: ['impact-indices', selectedProgram],
        queryFn: async () => {
            const results = await base44.entities.ImpactIndex.filter({ program_id: selectedProgram });
            return results.sort((a, b) => b.reporting_period.localeCompare(a.reporting_period));
        },
        enabled: !!selectedProgram
    });

    const latestIndex = indices[0];
    const kpis = latestIndex?.raw_metrics?.custom_kpis || [];

    const updateKPIsMutation = useMutation({
        mutationFn: async ({ indexId, kpis }) => {
            const index = indices.find(i => i.id === indexId);
            return base44.entities.ImpactIndex.update(indexId, {
                raw_metrics: {
                    ...index.raw_metrics,
                    custom_kpis: kpis
                }
            });
        },
        onSuccess: () => {
            toast.success('KPIs updated!');
            queryClient.invalidateQueries(['impact-indices']);
            setKpiDialog(false);
            setNewKPI({ kpi_name: '', target_value: 0, current_value: 0, unit: '' });
        }
    });

    const handleAddKPI = () => {
        if (!latestIndex) {
            toast.error('Please create an Impact Index record first');
            return;
        }
        const updatedKPIs = [...kpis, newKPI];
        updateKPIsMutation.mutate({ indexId: latestIndex.id, kpis: updatedKPIs });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            <aside className={cn("fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                        <span className="font-bold">Loyalty Portal</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Organization</p>
                    <p className="font-semibold">{session.organization_name}</p>
                    <Badge className="mt-2 capitalize">{session.subscription_tier}</Badge>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/LoyaltyCustomerPortal" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Overview</a>
                    <a href="/LoyaltyImpactIndex" className="block px-3 py-2 rounded-lg hover:bg-slate-50">Impact Index</a>
                    <a href="/LoyaltyImpactKPIs" className="block px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <Target className="h-4 w-4 inline mr-2" />Impact KPIs
                    </a>
                </nav>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Impact KPIs</h1>
                    </div>
                    <Button onClick={() => setKpiDialog(true)} className="bg-purple-600" disabled={!latestIndex}>
                        <Plus className="h-4 w-4 mr-2" />Add KPI
                    </Button>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {!latestIndex ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Target className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                <p className="text-slate-600 mb-4">No Impact Index created yet</p>
                                <Button onClick={() => window.location.href = '/LoyaltyImpactIndex'}>
                                    Create Impact Index
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {kpis.map((kpi, idx) => {
                                    const progress = kpi.target_value > 0 ? (kpi.current_value / kpi.target_value) * 100 : 0;
                                    return (
                                        <Card key={idx}>
                                            <CardHeader>
                                                <CardTitle className="text-sm">{kpi.kpi_name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="mb-2">
                                                    <div className="text-3xl font-bold text-purple-600">
                                                        {kpi.current_value.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        of {kpi.target_value.toLocaleString()} {kpi.unit}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                                                </div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                    <span className="font-semibold">{progress.toFixed(1)}%</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Predefined KPI Templates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { name: 'Lives Impacted', unit: 'people', target: 1000 },
                                            { name: 'Carbon Offset', unit: 'kg CO2', target: 5000 },
                                            { name: 'Volunteer Hours', unit: 'hours', target: 500 },
                                            { name: 'Community Events', unit: 'events', target: 12 },
                                            { name: 'Youth Scholarships', unit: 'scholarships', target: 50 },
                                            { name: 'Health Checkups', unit: 'checkups', target: 200 }
                                        ].map((template, idx) => (
                                            <Button 
                                                key={idx} 
                                                variant="outline" 
                                                className="justify-start"
                                                onClick={() => {
                                                    setNewKPI({ kpi_name: template.name, target_value: template.target, current_value: 0, unit: template.unit });
                                                    setKpiDialog(true);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />{template.name}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={kpiDialog} onOpenChange={setKpiDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom KPI</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>KPI Name</Label>
                            <Input value={newKPI.kpi_name} onChange={(e) => setNewKPI({...newKPI, kpi_name: e.target.value})} placeholder="e.g., Lives Impacted" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Target Value</Label>
                                <Input type="number" value={newKPI.target_value} onChange={(e) => setNewKPI({...newKPI, target_value: Number(e.target.value)})} />
                            </div>
                            <div>
                                <Label>Current Value</Label>
                                <Input type="number" value={newKPI.current_value} onChange={(e) => setNewKPI({...newKPI, current_value: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div>
                            <Label>Unit</Label>
                            <Input value={newKPI.unit} onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})} placeholder="e.g., people, hours, kg CO2" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setKpiDialog(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleAddKPI} className="flex-1 bg-purple-600">Add KPI</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}