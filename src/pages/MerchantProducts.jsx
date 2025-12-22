import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, Plus, DollarSign, Edit } from 'lucide-react';

export default function MerchantProducts() {
    const { user } = useMerchantAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedMID, setSelectedMID] = useState('');
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        sku: '',
        status: 'active',
        merchant_id: ''
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return [];
            return await base44.entities.Product.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Product.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setDialogOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setDialogOpen(false);
            resetForm();
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            merchant_id: user.merchant_id,
            price: parseFloat(formData.price) || 0
        };

        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            currency: 'USD',
            sku: '',
            status: 'active',
            merchant_id: ''
        });
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            currency: product.currency || 'USD',
            sku: product.sku || '',
            status: product.status || 'active',
            merchant_id: product.merchant_id
        });
        setDialogOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantProducts"
                user={user}
            />
            
            <div className="flex-1 flex flex-col">
                <MerchantTopBar user={user} />
                
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
                            <p className="text-slate-500">Manage your product catalog</p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label>Product Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Price *</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            <Input
                                                value={formData.currency}
                                                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>SKU</Label>
                                        <Input
                                            value={formData.sku}
                                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingProduct ? 'Update' : 'Create'} Product
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search products by name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            <div className="col-span-full text-center py-12 text-slate-500">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No products found</p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{product.name}</CardTitle>
                                                {product.sku && (
                                                    <p className="text-sm text-slate-500 mt-1">SKU: {product.sku}</p>
                                                )}
                                            </div>
                                            <Badge className={
                                                product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }>
                                                {product.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                            {product.description || 'No description'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                                <span className="text-xl font-bold text-slate-900">
                                                    {product.price?.toFixed(2) || '0.00'}
                                                </span>
                                                <span className="text-sm text-slate-500">{product.currency || 'USD'}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}