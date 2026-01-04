import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Tag, Trash2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function CategoryManager({ categories }) {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        category_code: '',
        category_name: '',
        description: '',
        default_rate_type: 'standard',
        is_digital_service: false,
        is_financial_service: false,
        status: 'active'
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            if (editingCategory) {
                return await base44.entities.TaxCategory.update(editingCategory.id, data);
            }
            return await base44.entities.TaxCategory.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-categories'] });
            setShowDialog(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await base44.entities.TaxCategory.update(id, { status: 'inactive' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-categories'] });
        }
    });

    const resetForm = () => {
        setFormData({
            category_code: '',
            category_name: '',
            description: '',
            default_rate_type: 'standard',
            is_digital_service: false,
            is_financial_service: false,
            status: 'active'
        });
        setEditingCategory(null);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData(category);
        setShowDialog(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tax Categories</h2>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Tax Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Category Code *</Label>
                                    <Input
                                        value={formData.category_code}
                                        onChange={(e) => setFormData({...formData, category_code: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                                        placeholder="DIGITAL_SERVICES"
                                    />
                                </div>
                                <div>
                                    <Label>Category Name *</Label>
                                    <Input
                                        value={formData.category_name}
                                        onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                                        placeholder="Digital Services"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Software, streaming, SaaS, etc."
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>Default Rate Type</Label>
                                <Select value={formData.default_rate_type} onValueChange={(value) => setFormData({...formData, default_rate_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard Rate</SelectItem>
                                        <SelectItem value="reduced">Reduced Rate</SelectItem>
                                        <SelectItem value="super_reduced">Super Reduced Rate</SelectItem>
                                        <SelectItem value="zero">Zero Rate (0%)</SelectItem>
                                        <SelectItem value="exempt">Exempt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData.is_digital_service}
                                        onCheckedChange={(checked) => setFormData({...formData, is_digital_service: checked})}
                                    />
                                    <Label>Digital Service</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData.is_financial_service}
                                        onCheckedChange={(checked) => setFormData({...formData, is_financial_service: checked})}
                                    />
                                    <Label>Financial Service</Label>
                                </div>
                            </div>

                            <Button 
                                onClick={() => createMutation.mutate(formData)} 
                                disabled={!formData.category_code || !formData.category_name || createMutation.isPending}
                                className="w-full"
                            >
                                {createMutation.isPending ? 'Saving...' : (editingCategory ? 'Update' : 'Create') + ' Category'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {categories.filter(c => c.status === 'active').map((category) => (
                    <Card key={category.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-lg">{category.category_name}</CardTitle>
                                        <p className="text-sm text-slate-600">{category.category_code}</p>
                                    </div>
                                </div>
                                <Badge variant="outline">{category.default_rate_type}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                            <div className="flex gap-2 mb-4">
                                {category.is_digital_service && (
                                    <Badge className="bg-blue-100 text-blue-800">Digital Service</Badge>
                                )}
                                {category.is_financial_service && (
                                    <Badge className="bg-green-100 text-green-800">Financial Service</Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteMutation.mutate(category.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Deactivate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}