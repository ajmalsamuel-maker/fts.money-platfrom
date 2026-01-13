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
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function OfferManagement({ partnerId, programId }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({
        reward_name: '',
        reward_type: 'discount',
        points_required: 0,
        monetary_value: 0,
        description: '',
        inventory_available: -1,
        tier_restricted: false,
        allowed_tiers: [],
        image_url: '',
        terms_conditions: '',
        expires_days: 30,
        max_per_user: 5,
        is_active: true
    });

    const queryClient = useQueryClient();

    const { data: offers = [] } = useQuery({
        queryKey: ['partner-offers', programId],
        queryFn: () => base44.entities.RedemptionOption.filter({ program_id: programId })
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.RedemptionOption.create({
            ...data,
            program_id: programId
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['partner-offers']);
            toast.success('Offer created successfully!');
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.RedemptionOption.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['partner-offers']);
            toast.success('Offer updated successfully!');
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.RedemptionOption.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['partner-offers']);
            toast.success('Offer deleted');
        }
    });

    const resetForm = () => {
        setFormData({
            reward_name: '',
            reward_type: 'discount',
            points_required: 0,
            monetary_value: 0,
            description: '',
            inventory_available: -1,
            tier_restricted: false,
            allowed_tiers: [],
            image_url: '',
            terms_conditions: '',
            expires_days: 30,
            max_per_user: 5,
            is_active: true
        });
        setEditingOffer(null);
        setDialogOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingOffer) {
            updateMutation.mutate({ id: editingOffer.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData(offer);
        setDialogOpen(true);
    };

    const rewardTypes = [
        'experience', 'merchandise', 'discount', 'donation', 'service', 
        'access', 'digital_goods', 'subscription', 'gift_card', 'cash_back'
    ];

    const tiers = ['bronze', 'silver', 'gold', 'platinum'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Offers</h2>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                    <Card key={offer.id} className={!offer.is_active ? 'opacity-60' : ''}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{offer.reward_name}</CardTitle>
                                <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                                    {offer.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {offer.image_url ? (
                                <img src={offer.image_url} alt={offer.reward_name} className="w-full h-40 object-cover rounded-lg mb-4" />
                            ) : (
                                <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                    <ImageIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                            
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">{offer.description?.slice(0, 100)}...</p>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="font-semibold text-blue-600">{offer.points_required} points</span>
                                    <span className="text-gray-600">HK${offer.monetary_value}</span>
                                </div>
                                {offer.inventory_available > 0 && (
                                    <p className="text-xs text-gray-500">Stock: {offer.inventory_available}</p>
                                )}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(offer)} className="flex-1">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => {
                                        if (confirm('Delete this offer?')) {
                                            deleteMutation.mutate(offer.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Offer Name *</Label>
                                <Input
                                    value={formData.reward_name}
                                    onChange={(e) => setFormData({...formData, reward_name: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <Label>Type *</Label>
                                <Select value={formData.reward_type} onValueChange={(value) => setFormData({...formData, reward_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rewardTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Points Required *</Label>
                                <Input
                                    type="number"
                                    value={formData.points_required}
                                    onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value)})}
                                    required
                                />
                            </div>

                            <div>
                                <Label>Monetary Value (HK$)</Label>
                                <Input
                                    type="number"
                                    value={formData.monetary_value}
                                    onChange={(e) => setFormData({...formData, monetary_value: parseFloat(e.target.value)})}
                                />
                            </div>

                            <div>
                                <Label>Inventory (-1 = unlimited)</Label>
                                <Input
                                    type="number"
                                    value={formData.inventory_available}
                                    onChange={(e) => setFormData({...formData, inventory_available: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>Image URL</Label>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>Terms & Conditions</Label>
                                <Textarea
                                    value={formData.terms_conditions}
                                    onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>Expires After (days)</Label>
                                <Input
                                    type="number"
                                    value={formData.expires_days}
                                    onChange={(e) => setFormData({...formData, expires_days: parseInt(e.target.value)})}
                                />
                            </div>

                            <div>
                                <Label>Max Per User</Label>
                                <Input
                                    type="number"
                                    value={formData.max_per_user}
                                    onChange={(e) => setFormData({...formData, max_per_user: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                                />
                                <Label>Active</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.tier_restricted}
                                    onCheckedChange={(checked) => setFormData({...formData, tier_restricted: checked})}
                                />
                                <Label>Tier Restricted</Label>
                            </div>

                            {formData.tier_restricted && (
                                <div className="col-span-2">
                                    <Label>Allowed Tiers</Label>
                                    <div className="flex gap-2 mt-2">
                                        {tiers.map(tier => (
                                            <Button
                                                key={tier}
                                                type="button"
                                                size="sm"
                                                variant={formData.allowed_tiers?.includes(tier) ? 'default' : 'outline'}
                                                onClick={() => {
                                                    const current = formData.allowed_tiers || [];
                                                    setFormData({
                                                        ...formData,
                                                        allowed_tiers: current.includes(tier) 
                                                            ? current.filter(t => t !== tier)
                                                            : [...current, tier]
                                                    });
                                                }}
                                            >
                                                {tier}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingOffer ? 'Update' : 'Create'} Offer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}