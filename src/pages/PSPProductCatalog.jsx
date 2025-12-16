import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useStaffAuth } from '@/components/auth/useStaffAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Copy, Trash2, Archive, CheckCircle, AlertCircle, Loader2, Star, Library } from 'lucide-react';
import { toast } from 'sonner';

export default function PSPProductCatalog() {
    const { user, loading, requireAuth } = useStaffAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('products');
    const [showDialog, setShowDialog] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    
    React.useEffect(() => {
        requireAuth();
    }, []);

    const pspCode = user?.psp_code;

    // Fetch PSP-specific products
    const { data: products = [] } = useQuery({
        queryKey: ['psp-products', pspCode],
        queryFn: async () => {
            if (!pspCode) return [];
            return await base44.entities.PSPProductTemplate.filter({ psp_code: pspCode });
        },
        enabled: !!pspCode
    });

    // Fetch platform templates for cloning
    const { data: platformTemplates = [] } = useQuery({
        queryKey: ['platform-product-templates'],
        queryFn: async () => {
            const all = await base44.entities.PSPProductTemplate.list();
            return all.filter(t => !t.psp_id || t.is_platform_template);
        }
    });

    const { data: pspData } = useQuery({
        queryKey: ['current-psp', pspCode],
        queryFn: async () => {
            if (!pspCode) return null;
            const psps = await base44.entities.ProvisionedPSP.filter({ psp_code: pspCode });
            return psps[0];
        },
        enabled: !!pspCode
    });

    const { data: components = [] } = useQuery({
        queryKey: ['psp-components'],
        queryFn: () => base44.entities.PSPProductComponent.list()
    });

    const { data: bundles = [] } = useQuery({
        queryKey: ['psp-bundles'],
        queryFn: () => base44.entities.PSPProductBundle.list()
    });

    // Product form
    const [productForm, setProductForm] = useState({
        product_name: '',
        product_description: '',
        product_category: 'payment_processing',
        version: '1.0.0',
        lifecycle_state: 'draft',
        is_bundle: false,
        base_price: 0,
        pricing_model: 'fixed',
        features: [],
        components: [],
        dependencies: []
    });

    // Mutations
    const createProductMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.PSPProductTemplate.create({
                ...data,
                product_id: `PRD-${Date.now()}`,
                psp_id: pspData?.id,
                psp_code: pspCode
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-products']);
            setShowDialog(false);
            resetForm();
            toast.success('Product created successfully');
        }
    });

    const cloneFromTemplateMutation = useMutation({
        mutationFn: async (template) => {
            return await base44.entities.PSPProductTemplate.create({
                ...template,
                id: undefined,
                product_id: `PRD-${Date.now()}`,
                psp_id: pspData?.id,
                psp_code: pspCode,
                is_platform_template: false,
                cloned_from_template: template.id,
                version: '1.0.0',
                lifecycle_state: 'draft',
                status: 'inactive',
                total_subscribers: 0
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-products']);
            setShowTemplateDialog(false);
            toast.success('Product cloned from template');
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PSPProductTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-products']);
            setShowDialog(false);
            setEditingProduct(null);
            resetForm();
            toast.success('Product updated successfully');
        }
    });

    const duplicateProductMutation = useMutation({
        mutationFn: async (product) => {
            return await base44.entities.PSPProductTemplate.create({
                ...product,
                id: undefined,
                product_id: `PRD-${Date.now()}`,
                product_name: `${product.product_name} (Copy)`,
                version: '1.0.0',
                lifecycle_state: 'draft',
                status: 'inactive',
                total_subscribers: 0
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-products']);
            toast.success('Product duplicated successfully');
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => base44.entities.PSPProductTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-products']);
            toast.success('Product deleted');
        }
    });

    const resetForm = () => {
        setProductForm({
            product_name: '',
            product_description: '',
            product_category: 'payment_processing',
            version: '1.0.0',
            lifecycle_state: 'draft',
            is_bundle: false,
            base_price: 0,
            pricing_model: 'fixed',
            features: [],
            components: [],
            dependencies: []
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setProductForm({
            product_name: product.product_name,
            product_description: product.product_description || '',
            product_category: product.product_category,
            version: product.version,
            lifecycle_state: product.lifecycle_state,
            is_bundle: product.is_bundle || false,
            base_price: product.base_price || 0,
            pricing_model: product.pricing_model,
            features: product.features || [],
            components: product.components || [],
            dependencies: product.dependencies || []
        });
        setDialogType('product');
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data: productForm });
        } else {
            createProductMutation.mutate(productForm);
        }
    };

    const addFeature = () => {
        const feature = prompt('Enter feature name:');
        if (feature) {
            setProductForm({
                ...productForm,
                features: [...(productForm.features || []), feature]
            });
        }
    };

    const removeFeature = (index) => {
        setProductForm({
            ...productForm,
            features: productForm.features.filter((_, i) => i !== index)
        });
    };

    if (loading) return null;

    const productsByCategory = products.reduce((acc, product) => {
        const cat = product.product_category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    const templatesByCategory = platformTemplates.reduce((acc, template) => {
        const cat = template.product_category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(template);
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="PSPProductCatalog" />

            <div className="flex-1 overflow-auto">
                <TopHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Product Catalog</h2>
                        <p className="text-xs text-slate-600">Manage your merchant-facing products and services</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline"
                            onClick={() => setShowTemplateDialog(true)}
                            className="gap-2"
                        >
                            <Library className="h-4 w-4" />
                            Clone from Template
                        </Button>
                        <Button 
                            onClick={() => { 
                                resetForm(); 
                                setEditingProduct(null); 
                                setDialogType('product'); 
                                setShowDialog(true); 
                            }}
                            className="bg-blue-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Custom Product
                        </Button>
                    </div>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Products</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{products.length}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Products</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">
                                            {products.filter(p => p.lifecycle_state === 'active').length}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Bundles</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">
                                            {products.filter(p => p.is_bundle).length}
                                        </p>
                                    </div>
                                    <Package className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Subscribers</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {products.reduce((sum, p) => sum + (p.total_subscribers || 0), 0)}
                                        </p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products by Category */}
                    <div className="space-y-6">
                        {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                            <Card key={category}>
                                <CardHeader>
                                    <CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle>
                                    <p className="text-sm text-slate-600">{categoryProducts.length} products</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {categoryProducts.map(product => (
                                            <Card key={product.id} className="hover:shadow-lg transition-shadow">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-base">{product.product_name}</CardTitle>
                                                            {product.cloned_from_template && (
                                                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                                                    <Star className="h-3 w-3" />
                                                                    From template
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge className={
                                                            product.lifecycle_state === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            product.lifecycle_state === 'beta' ? 'bg-blue-100 text-blue-700' :
                                                            product.lifecycle_state === 'deprecated' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {product.lifecycle_state}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                        {product.product_description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="outline" className="text-xs">v{product.version}</Badge>
                                                        {product.is_bundle && (
                                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                                Bundle
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-xs">
                                                            ${product.base_price}/mo
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mb-3">
                                                        {product.total_subscribers || 0} subscribers
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => duplicateProductMutation.mutate(product)}>
                                                            <Copy className="h-3 w-3 mr-1" />
                                                            Duplicate
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                if (confirm('Delete this product?')) {
                                                                    deleteProductMutation.mutate(product.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-4">No products created yet</p>
                            <Button onClick={() => { resetForm(); setDialogType('product'); setShowDialog(true); }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Product
                            </Button>
                        </div>
                    )}
                </main>
            </div>

            {/* Product Dialog */}
            <Dialog open={showDialog && dialogType === 'product'} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
                        <DialogDescription>
                            Define a merchant-facing product with features, pricing, and lifecycle management
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Product Name</Label>
                            <Input
                                value={productForm.product_name}
                                onChange={(e) => setProductForm({...productForm, product_name: e.target.value})}
                                placeholder="e.g., Basic Payment Gateway"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={productForm.product_description}
                                onChange={(e) => setProductForm({...productForm, product_description: e.target.value})}
                                placeholder="Describe your product..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Category</Label>
                                <Select 
                                    value={productForm.product_category} 
                                    onValueChange={(v) => setProductForm({...productForm, product_category: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="payment_processing">Payment Processing</SelectItem>
                                        <SelectItem value="fraud_detection">Fraud Detection</SelectItem>
                                        <SelectItem value="analytics">Analytics</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="api_services">API Services</SelectItem>
                                        <SelectItem value="merchant_tools">Merchant Tools</SelectItem>
                                        <SelectItem value="reporting">Reporting</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Lifecycle State</Label>
                                <Select 
                                    value={productForm.lifecycle_state} 
                                    onValueChange={(v) => setProductForm({...productForm, lifecycle_state: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="beta">Beta</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="deprecated">Deprecated</SelectItem>
                                        <SelectItem value="sunset">Sunset</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Version</Label>
                                <Input
                                    value={productForm.version}
                                    onChange={(e) => setProductForm({...productForm, version: e.target.value})}
                                    placeholder="1.0.0"
                                />
                            </div>

                            <div>
                                <Label>Base Price ($)</Label>
                                <Input
                                    type="number"
                                    value={productForm.base_price}
                                    onChange={(e) => setProductForm({...productForm, base_price: parseFloat(e.target.value) || 0})}
                                />
                            </div>

                            <div>
                                <Label>Pricing Model</Label>
                                <Select 
                                    value={productForm.pricing_model} 
                                    onValueChange={(v) => setProductForm({...productForm, pricing_model: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                        <SelectItem value="usage_based">Usage Based</SelectItem>
                                        <SelectItem value="tiered">Tiered</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Features</Label>
                                <Button size="sm" variant="outline" onClick={addFeature}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Feature
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(productForm.features || []).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input value={feature} disabled />
                                        <Button size="sm" variant="outline" onClick={() => removeFeature(idx)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            >
                                {(createProductMutation.isPending || updateProductMutation.isPending) && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                {editingProduct ? 'Update' : 'Create'} Product
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Template Library Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Clone from Template Library</DialogTitle>
                        <DialogDescription>
                            Select a platform template to clone and customize for your PSP
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        {Object.entries(templatesByCategory).map(([category, templates]) => (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 capitalize">
                                    {category.replace(/_/g, ' ')}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {templates.map(template => (
                                        <Card key={template.id} className="hover:shadow-md transition-shadow border-amber-200 bg-amber-50/30">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start gap-2">
                                                    <Star className="h-4 w-4 text-amber-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <CardTitle className="text-sm">{template.product_name}</CardTitle>
                                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                            {template.product_description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            ${template.base_price}/mo
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            v{template.version}
                                                        </Badge>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => cloneFromTemplateMutation.mutate(template)}
                                                        disabled={cloneFromTemplateMutation.isPending}
                                                    >
                                                        {cloneFromTemplateMutation.isPending ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3 w-3 mr-1" />
                                                                Clone
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {platformTemplates.length === 0 && (
                            <div className="text-center py-12">
                                <Star className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600">No platform templates available yet</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}