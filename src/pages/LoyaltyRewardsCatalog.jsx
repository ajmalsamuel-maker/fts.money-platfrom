import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, Plus, Pencil, Trash2, Package, Gift, Zap, CreditCard, Image } from 'lucide-react';
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
        fulfillment_method: 'manual',
        fulfillment_config: {},
        tier_restricted: false,
        allowed_tiers: [],
        image_url: '',
        terms_conditions: '',
        expires_days: null,
        max_per_user: null,
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
            fulfillment_method: 'manual',
            fulfillment_config: {},
            tier_restricted: false,
            allowed_tiers: [],
            image_url: '',
            terms_conditions: '',
            expires_days: null,
            max_per_user: null,
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
            fulfillment_method: reward.fulfillment_method || 'manual',
            fulfillment_config: reward.fulfillment_config || {},
            tier_restricted: reward.tier_restricted || false,
            allowed_tiers: reward.allowed_tiers || [],
            image_url: reward.image_url || '',
            terms_conditions: reward.terms_conditions || '',
            expires_days: reward.expires_days || null,
            max_per_user: reward.max_per_user || null,
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyRewardsCatalog"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingReward ? 'Edit' : 'Create'} Reward</DialogTitle>
                        <CardDescription>Configure reward details and fulfillment automation</CardDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
                                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                                <TabsTrigger value="display">Display</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-4">
                                <div>
                                    <Label>Reward Name</Label>
                                    <Input value={formData.reward_name} onChange={(e) => setFormData({...formData, reward_name: e.target.value})} placeholder="$50 Amazon Gift Card" required />
                                </div>
                                <div>
                                    <Label>Reward Type</Label>
                                    <Select value={formData.reward_type} onValueChange={(v) => setFormData({...formData, reward_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            <SelectItem value="experience">Experience</SelectItem>
                                            <SelectItem value="merchandise">Merchandise</SelectItem>
                                            <SelectItem value="discount">Discount Code</SelectItem>
                                            <SelectItem value="donation">Charity Donation</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="access">VIP Access</SelectItem>
                                            <SelectItem value="digital_goods">Digital Goods</SelectItem>
                                            <SelectItem value="subscription">Subscription</SelectItem>
                                            <SelectItem value="gift_card">Gift Card</SelectItem>
                                            <SelectItem value="cash_back">Cash Back</SelectItem>
                                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                            <SelectItem value="nft">NFT</SelectItem>
                                            <SelectItem value="travel">Travel & Hotels</SelectItem>
                                            <SelectItem value="wellness">Wellness & Spa</SelectItem>
                                            <SelectItem value="training">Training & Courses</SelectItem>
                                            <SelectItem value="consultation">1-on-1 Consultation</SelectItem>
                                            <SelectItem value="membership">Premium Membership</SelectItem>
                                            <SelectItem value="event_ticket">Event Tickets</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed reward description..." rows={4} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label>Tokens Required</Label>
                                        <Input type="number" value={formData.points_required} onChange={(e) => setFormData({...formData, points_required: Number(e.target.value)})} required />
                                    </div>
                                    <div>
                                        <Label>USD Value</Label>
                                        <Input type="number" value={formData.monetary_value} onChange={(e) => setFormData({...formData, monetary_value: Number(e.target.value)})} placeholder="0" />
                                    </div>
                                    <div>
                                        <Label>Inventory</Label>
                                        <Input type="number" value={formData.inventory_available} onChange={(e) => setFormData({...formData, inventory_available: Number(e.target.value)})} placeholder="-1 = unlimited" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="fulfillment" className="space-y-4 mt-4">
                                <div>
                                    <Label>Fulfillment Method</Label>
                                    <Select value={formData.fulfillment_method} onValueChange={(v) => setFormData({...formData, fulfillment_method: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            <SelectItem value="manual">Manual Processing</SelectItem>
                                            <SelectItem value="email_delivery">Email Delivery</SelectItem>
                                            <SelectItem value="api_integration">API Integration</SelectItem>
                                            <SelectItem value="physical_shipping">Physical Shipping</SelectItem>
                                            <SelectItem value="digital_download">Digital Download</SelectItem>
                                            <SelectItem value="blockchain_transfer">Blockchain Transfer</SelectItem>
                                            <SelectItem value="instant_discount_code">Instant Discount Code</SelectItem>
                                            <SelectItem value="stripe_payout">Stripe Payout</SelectItem>
                                            <SelectItem value="paypal_payout">PayPal Payout</SelectItem>
                                            <SelectItem value="gift_card_api">Gift Card API</SelectItem>
                                            <SelectItem value="nft_mint">NFT Mint</SelectItem>
                                            <SelectItem value="webhook">Custom Webhook</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formData.fulfillment_method === 'stripe_payout' && '💳 Automatically send cash via Stripe'}
                                        {formData.fulfillment_method === 'gift_card_api' && '🎁 Integrated with Tango Card, Tremendous, etc.'}
                                        {formData.fulfillment_method === 'nft_mint' && '🎨 Mint NFT on redemption'}
                                        {formData.fulfillment_method === 'blockchain_transfer' && '⛓️ Transfer tokens on-chain'}
                                    </p>
                                </div>

                                {['api_integration', 'webhook', 'gift_card_api', 'stripe_payout', 'blockchain_transfer'].includes(formData.fulfillment_method) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <Label className="text-sm font-semibold mb-2 block">Integration Config</Label>
                                        <Textarea 
                                            placeholder='{"api_key": "...", "endpoint": "...", "contract_address": "..."}'
                                            value={JSON.stringify(formData.fulfillment_config, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    setFormData({...formData, fulfillment_config: JSON.parse(e.target.value)});
                                                } catch {}
                                            }}
                                            rows={4}
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="restrictions" className="space-y-4 mt-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <Label>Tier Restricted</Label>
                                        <p className="text-xs text-slate-500">Limit to specific membership tiers</p>
                                    </div>
                                    <Switch 
                                        checked={formData.tier_restricted}
                                        onCheckedChange={(checked) => setFormData({...formData, tier_restricted: checked})}
                                    />
                                </div>

                                {formData.tier_restricted && (
                                    <div>
                                        <Label>Allowed Tiers (select multiple)</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {['bronze', 'silver', 'gold', 'platinum'].map(tier => (
                                                <Button
                                                    key={tier}
                                                    type="button"
                                                    variant={formData.allowed_tiers.includes(tier) ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => {
                                                        const tiers = formData.allowed_tiers.includes(tier)
                                                            ? formData.allowed_tiers.filter(t => t !== tier)
                                                            : [...formData.allowed_tiers, tier];
                                                        setFormData({...formData, allowed_tiers: tiers});
                                                    }}
                                                    className="capitalize"
                                                >
                                                    {tier}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Expiry (days)</Label>
                                        <Input type="number" value={formData.expires_days || ''} onChange={(e) => setFormData({...formData, expires_days: e.target.value ? Number(e.target.value) : null})} placeholder="Never expires" />
                                    </div>
                                    <div>
                                        <Label>Max Per User</Label>
                                        <Input type="number" value={formData.max_per_user || ''} onChange={(e) => setFormData({...formData, max_per_user: e.target.value ? Number(e.target.value) : null})} placeholder="Unlimited" />
                                    </div>
                                </div>

                                <div>
                                    <Label>Terms & Conditions</Label>
                                    <Textarea value={formData.terms_conditions} onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})} placeholder="Terms and conditions..." rows={3} />
                                </div>
                            </TabsContent>

                            <TabsContent value="display" className="space-y-4 mt-4">
                                <div>
                                    <Label>Reward Image URL</Label>
                                    <Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                                </div>
                                {formData.image_url && (
                                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="flex gap-3 mt-6">
                            <Button type="button" variant="outline" onClick={() => setRewardDialog(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">{editingReward ? 'Update' : 'Create'} Reward</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}