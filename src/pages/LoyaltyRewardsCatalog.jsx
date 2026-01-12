import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyRewardsCatalog() {
    const sessionData = localStorage.getItem('loyalty_customer_session');
    const [session] = useState(() => sessionData ? JSON.parse(sessionData) : null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [rewardDialog, setRewardDialog] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [formData, setFormData] = useState({
        reward_name: '',
        reward_type: 'experience',
        points_required: 100,
        monetary_value: 0,
        description: '',
        inventory_available: -1,
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

    const { data: rewards = [] } = useQuery({
        queryKey: ['rewards', selectedProgram],
        queryFn: () => base44.entities.RedemptionOption.filter({ program_id: selectedProgram }),
        enabled: !!selectedProgram
    });

    const createRewardMutation = useMutation({
        mutationFn: (data) => base44.entities.RedemptionOption.create(data),
        onSuccess: () => {
            toast.success('Reward created!');
            queryClient.invalidateQueries(['rewards']);
            setRewardDialog(false);
            resetForm();
        }
    });

    const updateRewardMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.RedemptionOption.update(id, data),
        onSuccess: () => {
            toast.success('Reward updated!');
            queryClient.invalidateQueries(['rewards']);
            setRewardDialog(false);
            resetForm();
        }
    });

    const deleteRewardMutation = useMutation({
        mutationFn: (id) => base44.entities.RedemptionOption.delete(id),
        onSuccess: () => {
            toast.success('Reward deleted');
            queryClient.invalidateQueries(['rewards']);
        }
    });

    const resetForm = () => {
        setEditingReward(null);
        setFormData({
            reward_name: '',
            reward_type: 'experience',
            points_required: 100,
            monetary_value: 0,
            description: '',
            inventory_available: -1,
            is_active: true
        });
    };

    const handleEdit = (reward) => {
        setEditingReward(reward);
        setFormData({
            reward_name: reward.reward_name,
            reward_type: reward.reward_type,
            points_required: reward.points_required,
            monetary_value: reward.monetary_value || 0,
            description: reward.description || '',
            inventory_available: reward.inventory_available,
            is_active: reward.is_active
        });
        setRewardDialog(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, program_id: selectedProgram };
        
        if (editingReward) {
            updateRewardMutation.mutate({ id: editingReward.id, data });
        } else {
            createRewardMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyRewardsCatalog"
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
                        <h1 className="text-lg font-semibold">Rewards Catalog Management</h1>
                    </div>
                    <Button onClick={() => { resetForm(); setRewardDialog(true); }} className="bg-purple-600">
                        <Plus className="h-4 w-4 mr-2" />Add Reward
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
                            <CardTitle>Available Rewards</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {rewards.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Package className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                    <p>No rewards in catalog yet</p>
                                    <Button onClick={() => { resetForm(); setRewardDialog(true); }} className="mt-4" variant="outline">
                                        Create First Reward
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rewards.map(reward => (
                                        <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <Package className="h-8 w-8 text-purple-600" />
                                                    <Badge>{reward.reward_type}</Badge>
                                                </div>
                                                <h3 className="font-semibold mb-1">{reward.reward_name}</h3>
                                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{reward.description}</p>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs text-slate-500">Cost</p>
                                                        <p className="font-bold text-purple-600">{reward.points_required.toLocaleString()} tokens</p>
                                                    </div>
                                                    {reward.inventory_available > 0 && (
                                                        <Badge variant="outline">{reward.inventory_available} left</Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(reward)} className="flex-1">
                                                        <Pencil className="h-3 w-3 mr-1" />Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteRewardMutation.mutate(reward.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={rewardDialog} onOpenChange={setRewardDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingReward ? 'Edit' : 'Create'} Reward</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Reward Name</Label>
                            <Input value={formData.reward_name} onChange={(e) => setFormData({...formData, reward_name: e.target.value})} placeholder="e.g., VIP Meet & Greet" required />
                        </div>
                        <div>
                            <Label>Reward Type</Label>
                            <Select value={formData.reward_type} onValueChange={(v) => setFormData({...formData, reward_type: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="experience">Experience</SelectItem>
                                    <SelectItem value="merchandise">Merchandise</SelectItem>
                                    <SelectItem value="discount">Discount</SelectItem>
                                    <SelectItem value="donation">Donation</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="access">Access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the reward..." rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tokens Required</Label>
                                <Input type="number" value={formData.points_required} onChange={(e) => setFormData({...formData, points_required: Number(e.target.value)})} required />
                            </div>
                            <div>
                                <Label>Value (optional)</Label>
                                <Input type="number" value={formData.monetary_value} onChange={(e) => setFormData({...formData, monetary_value: Number(e.target.value)})} placeholder="0" />
                            </div>
                        </div>
                        <div>
                            <Label>Inventory (-1 = unlimited)</Label>
                            <Input type="number" value={formData.inventory_available} onChange={(e) => setFormData({...formData, inventory_available: Number(e.target.value)})} />
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setRewardDialog(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-purple-600">{editingReward ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}