import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';

export default function LoyaltyFAQManager() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_session') || '{}'));
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        target_audience: 'both',
        is_published: false,
        display_order: 0
    });
    const queryClient = useQueryClient();

    if (!session.program_id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: faqs = [], isLoading } = useQuery({
        queryKey: ['faqs', session.program_id],
        queryFn: () => base44.entities.FAQ.filter({ program_id: session.program_id })
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.FAQ.create({
            ...data,
            program_id: session.program_id
        }),
        onSuccess: () => {
            toast.success('FAQ created successfully');
            queryClient.invalidateQueries(['faqs']);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.FAQ.update(id, data),
        onSuccess: () => {
            toast.success('FAQ updated successfully');
            queryClient.invalidateQueries(['faqs']);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.FAQ.delete(id),
        onSuccess: () => {
            toast.success('FAQ deleted');
            queryClient.invalidateQueries(['faqs']);
        }
    });

    const resetForm = () => {
        setFormData({
            question: '',
            answer: '',
            category: 'general',
            target_audience: 'both',
            is_published: false,
            display_order: 0
        });
        setEditingFAQ(null);
        setDialogOpen(false);
    };

    const handleEdit = (faq) => {
        setEditingFAQ(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            target_audience: faq.target_audience,
            is_published: faq.is_published,
            display_order: faq.display_order
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingFAQ) {
            updateMutation.mutate({ id: editingFAQ.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const categoryLabels = {
        getting_started: 'Getting Started',
        earning_points: 'Earning Points',
        redeeming_rewards: 'Redeeming Rewards',
        account: 'Account',
        technical: 'Technical',
        general: 'General'
    };

    const audienceLabels = {
        participant: 'Participants',
        partner: 'Partners',
        both: 'Both'
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <CustomerPortalSidebar activePage="faq" />
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <HelpCircle className="h-8 w-8" />
                                FAQ Manager
                            </h1>
                            <p className="text-gray-600 mt-1">Manage help content for participants and partners</p>
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add FAQ
                        </Button>
                    </div>

                    {isLoading ? (
                        <p>Loading...</p>
                    ) : faqs.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No FAQs created yet</p>
                                <Button onClick={() => setDialogOpen(true)} className="mt-4">
                                    Create First FAQ
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {faqs.map(faq => (
                                <Card key={faq.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                                                        {faq.is_published ? (
                                                            <><Eye className="h-3 w-3 mr-1" />Published</>
                                                        ) : (
                                                            <><EyeOff className="h-3 w-3 mr-1" />Draft</>
                                                        )}
                                                    </Badge>
                                                    <Badge variant="outline">{categoryLabels[faq.category]}</Badge>
                                                    <Badge variant="outline">{audienceLabels[faq.target_audience]}</Badge>
                                                </div>
                                                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                                                <p className="text-gray-600 text-sm">{faq.answer}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => {
                                                        if (confirm('Delete this FAQ?')) {
                                                            deleteMutation.mutate(faq.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Question</Label>
                                    <Input
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                        placeholder="How do I earn points?"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Answer</Label>
                                    <Textarea
                                        value={formData.answer}
                                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                        placeholder="You can earn points by..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categoryLabels).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Target Audience</Label>
                                        <Select
                                            value={formData.target_audience}
                                            onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(audienceLabels).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.is_published}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                                    />
                                    <Label>Publish immediately</Label>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                                    <Button type="submit">
                                        {editingFAQ ? 'Update' : 'Create'} FAQ
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}