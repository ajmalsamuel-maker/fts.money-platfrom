import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyEarningRules() {
    const sessionData = localStorage.getItem('loyalty_customer_session');
    const [session] = useState(() => sessionData ? JSON.parse(sessionData) : null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [ruleDialog, setRuleDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        rule_name: '',
        activity_type: 'distance',
        points_per_unit: 1,
        unit_type: 'km',
        verification_method: 'gps',
        is_active: true
    });
    const queryClient = useQueryClient();

    if (!session || !session.id || !session.admin_email) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const [selectedProgram, setSelectedProgram] = useState('');

    React.useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0].id);
        }
    }, [programs, selectedProgram]);

    const { data: rules = [] } = useQuery({
        queryKey: ['earning-rules', selectedProgram],
        queryFn: () => base44.entities.EarningRule.filter({ program_id: selectedProgram }),
        enabled: !!selectedProgram
    });

    const createRuleMutation = useMutation({
        mutationFn: (data) => base44.entities.EarningRule.create(data),
        onSuccess: () => {
            toast.success('Earning rule created!');
            queryClient.invalidateQueries(['earning-rules']);
            setRuleDialog(false);
            resetForm();
        }
    });

    const updateRuleMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.EarningRule.update(id, data),
        onSuccess: () => {
            toast.success('Earning rule updated!');
            queryClient.invalidateQueries(['earning-rules']);
            setRuleDialog(false);
            resetForm();
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (id) => base44.entities.EarningRule.delete(id),
        onSuccess: () => {
            toast.success('Earning rule deleted');
            queryClient.invalidateQueries(['earning-rules']);
        }
    });

    const resetForm = () => {
        setEditingRule(null);
        setFormData({
            rule_name: '',
            activity_type: 'distance',
            points_per_unit: 1,
            unit_type: 'km',
            verification_method: 'gps',
            is_active: true
        });
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            rule_name: rule.rule_name,
            activity_type: rule.activity_type,
            points_per_unit: rule.points_per_unit,
            unit_type: rule.unit_type,
            verification_method: rule.verification_method,
            is_active: rule.is_active
        });
        setRuleDialog(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, program_id: selectedProgram };
        
        if (editingRule) {
            updateRuleMutation.mutate({ id: editingRule.id, data });
        } else {
            createRuleMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyEarningRules"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="md:ml-64">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Earning Rules</h1>
                    </div>
                    <Button onClick={() => { resetForm(); setRuleDialog(true); }} className="bg-purple-600">
                        <Plus className="h-4 w-4 mr-2" />Add Rule
                    </Button>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {programs.length > 1 && (
                        <Card>
                            <CardContent className="pt-6">
                                <Label>Select Program</Label>
                                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Earning Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {rules.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Settings className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                    <p>No earning rules configured yet</p>
                                    <Button onClick={() => { resetForm(); setRuleDialog(true); }} className="mt-4" variant="outline">
                                        Create First Rule
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rules.map(rule => (
                                        <div key={rule.id} className="border rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{rule.rule_name}</h3>
                                                <p className="text-sm text-slate-600">
                                                    {rule.points_per_unit} points per {rule.unit_type} • {rule.activity_type}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline">{rule.verification_method}</Badge>
                                                    <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                                                        {rule.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(rule)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRule ? 'Edit' : 'Create'} Earning Rule</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Rule Name</Label>
                            <Input value={formData.rule_name} onChange={(e) => setFormData({...formData, rule_name: e.target.value})} placeholder="e.g., Distance Points" required />
                        </div>
                        <div>
                            <Label>Activity Type</Label>
                            <Select value={formData.activity_type} onValueChange={(v) => setFormData({...formData, activity_type: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="distance">Distance</SelectItem>
                                    <SelectItem value="time">Time</SelectItem>
                                    <SelectItem value="event_attendance">Event Attendance</SelectItem>
                                    <SelectItem value="volunteer">Volunteer</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Points per Unit</Label>
                                <Input type="number" value={formData.points_per_unit} onChange={(e) => setFormData({...formData, points_per_unit: Number(e.target.value)})} required />
                            </div>
                            <div>
                                <Label>Unit Type</Label>
                                <Input value={formData.unit_type} onChange={(e) => setFormData({...formData, unit_type: e.target.value})} placeholder="km, hour, task" required />
                            </div>
                        </div>
                        <div>
                            <Label>Verification Method</Label>
                            <Select value={formData.verification_method} onValueChange={(v) => setFormData({...formData, verification_method: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gps">GPS</SelectItem>
                                    <SelectItem value="photo">Photo</SelectItem>
                                    <SelectItem value="qr_code">QR Code</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setRuleDialog(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-purple-600">{editingRule ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}