import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Tag, Settings, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// ISO 8583 Message Type Indicators (MTI)
const ISO8583_TRANSACTION_TYPES = [
    { code: 'ISO8583_0100', name: 'Authorization Request', applies_to: 'authorization' },
    { code: 'ISO8583_0200', name: 'Financial Transaction Request', applies_to: 'sale' },
    { code: 'ISO8583_0400', name: 'Reversal Request', applies_to: 'void' },
    { code: 'ISO8583_0420', name: 'Reversal Advice', applies_to: 'void' },
    { code: 'ISO8583_0800', name: 'Network Management Request', applies_to: 'other' },
];

// ISO 20022 Payment Message Types
const ISO20022_MESSAGE_TYPES = [
    { code: 'PAIN_001', name: 'Customer Credit Transfer Initiation (pain.001)', applies_to: 'payout' },
    { code: 'PAIN_002', name: 'Customer Payment Status Report (pain.002)', applies_to: 'settlement' },
    { code: 'PACS_008', name: 'Financial Institution Credit Transfer (pacs.008)', applies_to: 'payout' },
    { code: 'PACS_009', name: 'Financial Institution Credit Transfer (pacs.009)', applies_to: 'settlement' },
    { code: 'CAMT_053', name: 'Bank to Customer Statement (camt.053)', applies_to: 'settlement' },
    { code: 'CAMT_054', name: 'Bank to Customer Debit Credit Notification (camt.054)', applies_to: 'settlement' },
];

// EMV Transaction Types
const EMV_TRANSACTION_TYPES = [
    { code: 'EMV_PURCHASE', name: 'EMV Purchase', applies_to: 'sale' },
    { code: 'EMV_CASH_ADVANCE', name: 'EMV Cash Advance', applies_to: 'sale' },
    { code: 'EMV_REFUND', name: 'EMV Refund', applies_to: 'refund' },
    { code: 'EMV_CASHBACK', name: 'EMV Cashback', applies_to: 'sale' },
];

// Card Scheme Fee Types
const CARD_SCHEME_FEES = [
    { code: 'SCHEME_ASSESSMENT', name: 'Card Scheme Assessment Fee', applies_to: 'sale', category: 'payment_method' },
    { code: 'INTERCHANGE_FEE', name: 'Interchange Fee', applies_to: 'sale', category: 'payment_method' },
    { code: 'CROSSBORDER_FEE', name: 'Cross-Border Transaction Fee', applies_to: 'sale', category: 'payment_method' },
    { code: 'CURRENCY_CONV_FEE', name: 'Dynamic Currency Conversion Fee', applies_to: 'sale', category: 'payment_method' },
];

// Common Payment Gateway Operations
const GATEWAY_OPERATIONS = [
    { code: 'TOKENIZATION_FEE', name: 'Card Tokenization Fee', applies_to: 'tokenization', category: 'service' },
    { code: '3DS_AUTH_FEE', name: '3D Secure Authentication Fee', applies_to: '3ds', category: 'service' },
    { code: 'FRAUD_SCREEN_FEE', name: 'Fraud Screening Fee', applies_to: 'fraud_check', category: 'service' },
    { code: 'PCI_COMPLIANCE_FEE', name: 'PCI Compliance Fee', applies_to: 'other', category: 'recurring', billing_frequency: 'monthly' },
    { code: 'GATEWAY_FEE', name: 'Payment Gateway Transaction Fee', applies_to: 'sale', category: 'service' },
];

// Standard Transaction Fee Types
const STANDARD_TRANSACTION_FEES = [
    { code: 'SALE_TXN', name: 'Sale Transaction Fee', applies_to: 'sale', category: 'transaction' },
    { code: 'SALE_NET_TXN', name: 'Sale (Net) Transaction Fee', applies_to: 'sale', category: 'transaction' },
    { code: 'REFUND_TXN', name: 'Refund Transaction Fee', applies_to: 'refund', category: 'transaction' },
    { code: 'REFUND_NET_TXN', name: 'Refund (Net) Transaction Fee', applies_to: 'refund', category: 'transaction' },
    { code: 'AUTH_TXN', name: 'Authorization Fee', applies_to: 'authorization', category: 'transaction' },
    { code: 'AUTH_NET_TXN', name: 'Authorization (Net) Fee', applies_to: 'authorization', category: 'transaction' },
    { code: 'CAPTURE_TXN', name: 'Capture Fee', applies_to: 'capture', category: 'transaction' },
    { code: 'CAPTURE_NET_TXN', name: 'Capture (Net) Fee', applies_to: 'capture', category: 'transaction' },
    { code: 'VOID_SALE_TXN', name: 'Void Sale Fee', applies_to: 'void', category: 'transaction' },
    { code: 'VOID_REFUND_TXN', name: 'Void Refund Fee', applies_to: 'void', category: 'transaction' },
    { code: 'VOID_AUTH_TXN', name: 'Void Authorization Fee', applies_to: 'void', category: 'transaction' },
    { code: 'VOID_CAPTURE_TXN', name: 'Void Capture Fee', applies_to: 'void', category: 'transaction' },
    { code: 'CHARGEBACK_FEE', name: 'Chargeback Fee', applies_to: 'chargeback', category: 'penalty' },
    { code: 'FRAUD_CONTROL_FEE', name: 'Fraud Control Fee', applies_to: 'fraud_check', category: 'service' },
    { code: 'PAYOUT_FEE', name: 'Payout Fee', applies_to: 'payout', category: 'transaction' },
    { code: 'REDEEM_FEE', name: 'Redeem Fee', applies_to: 'other', category: 'transaction' },
];

const STANDARD_FEE_TEMPLATES = [
    ...STANDARD_TRANSACTION_FEES.map(t => ({ ...t, standard: 'Standard' })),
    ...ISO8583_TRANSACTION_TYPES.map(t => ({ ...t, category: 'transaction', standard: 'ISO 8583' })),
    ...ISO20022_MESSAGE_TYPES.map(t => ({ ...t, category: 'transaction', standard: 'ISO 20022' })),
    ...EMV_TRANSACTION_TYPES.map(t => ({ ...t, category: 'transaction', standard: 'EMV' })),
    ...CARD_SCHEME_FEES.map(t => ({ ...t, standard: 'Card Schemes' })),
    ...GATEWAY_OPERATIONS.map(t => ({ ...t, standard: 'Gateway' })),
];

export default function FeeTypeManagement() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const queryClient = useQueryClient();

    const { data: feeTypes = [] } = useQuery({
        queryKey: ['feeTypes'],
        queryFn: () => base44.entities.FeeType.list()
    });

    const [formData, setFormData] = useState({
        fee_code: '',
        fee_name: '',
        category: 'transaction',
        applies_to: 'sale',
        billing_frequency: 'per_transaction',
        supports_fixed: true,
        supports_percentage: true,
        supports_tiered: false,
        offset_from_settlement: true,
        status: 'active',
        description: ''
    });

    const createFeeMutation = useMutation({
        mutationFn: (data) => base44.entities.FeeType.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['feeTypes']);
            toast.success('Fee type created');
            setDialogOpen(false);
            resetForm();
        }
    });

    const updateFeeMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.FeeType.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['feeTypes']);
            toast.success('Fee type updated');
            setDialogOpen(false);
            resetForm();
        }
    });

    const handleSubmit = () => {
        if (editingFee) {
            updateFeeMutation.mutate({ id: editingFee.id, data: formData });
        } else {
            createFeeMutation.mutate(formData);
        }
    };

    const handleEdit = (fee) => {
        setEditingFee(fee);
        setFormData(fee);
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingFee(null);
        setFormData({
            fee_code: '',
            fee_name: '',
            category: 'transaction',
            applies_to: 'sale',
            billing_frequency: 'per_transaction',
            supports_fixed: true,
            supports_percentage: true,
            supports_tiered: false,
            offset_from_settlement: true,
            status: 'active',
            description: ''
        });
    };

    const useTemplate = (template) => {
        setFormData({
            fee_code: template.code,
            fee_name: template.name,
            category: template.category || 'transaction',
            applies_to: template.applies_to,
            billing_frequency: template.billing_frequency || 'per_transaction',
            supports_fixed: true,
            supports_percentage: true,
            supports_tiered: false,
            offset_from_settlement: true,
            status: 'active',
            description: `${template.standard} standard fee type`
        });
        setShowTemplates(false);
    };

    const getCategoryBadge = (category) => {
        const colors = {
            transaction: 'bg-blue-100 text-blue-700',
            payment_method: 'bg-purple-100 text-purple-700',
            service: 'bg-green-100 text-green-700',
            operational: 'bg-amber-100 text-amber-700',
            recurring: 'bg-cyan-100 text-cyan-700',
            penalty: 'bg-red-100 text-red-700',
            custom: 'bg-slate-100 text-slate-700'
        };
        return <Badge className={colors[category] || ''}>{category}</Badge>;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Settings" />
            <div className={cn("transition-all duration-300", "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Tag className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Fee Type Management</h1>
                                    <p className="text-slate-500">Define and manage billable fee types</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)} className="gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    {showTemplates ? 'Hide' : 'Show'} Templates
                                </Button>
                                <Dialog open={dialogOpen} onOpenChange={(open) => {
                                    setDialogOpen(open);
                                    if (!open) resetForm();
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Fee Type
                                        </Button>
                                    </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingFee ? 'Edit' : 'Create'} Fee Type</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Fee Code *</Label>
                                                <Input
                                                    value={formData.fee_code}
                                                    onChange={(e) => setFormData({...formData, fee_code: e.target.value.toUpperCase()})}
                                                    placeholder="e.g., SALE_TXN_FEE"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fee Name *</Label>
                                                <Input
                                                    value={formData.fee_name}
                                                    onChange={(e) => setFormData({...formData, fee_name: e.target.value})}
                                                    placeholder="e.g., Sale Transaction Fee"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="transaction">Transaction</SelectItem>
                                                        <SelectItem value="payment_method">Payment Method</SelectItem>
                                                        <SelectItem value="service">Service</SelectItem>
                                                        <SelectItem value="operational">Operational</SelectItem>
                                                        <SelectItem value="recurring">Recurring</SelectItem>
                                                        <SelectItem value="penalty">Penalty</SelectItem>
                                                        <SelectItem value="custom">Custom</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Applies To</Label>
                                                <Select value={formData.applies_to} onValueChange={(val) => setFormData({...formData, applies_to: val})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sale">Sale</SelectItem>
                                                        <SelectItem value="refund">Refund</SelectItem>
                                                        <SelectItem value="authorization">Authorization</SelectItem>
                                                        <SelectItem value="capture">Capture</SelectItem>
                                                        <SelectItem value="void">Void</SelectItem>
                                                        <SelectItem value="chargeback">Chargeback</SelectItem>
                                                        <SelectItem value="payout">Payout</SelectItem>
                                                        <SelectItem value="tokenization">Tokenization</SelectItem>
                                                        <SelectItem value="fraud_check">Fraud Check</SelectItem>
                                                        <SelectItem value="3ds">3D Secure</SelectItem>
                                                        <SelectItem value="settlement">Settlement</SelectItem>
                                                        <SelectItem value="recurring">Recurring</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Billing Frequency</Label>
                                            <Select value={formData.billing_frequency} onValueChange={(val) => setFormData({...formData, billing_frequency: val})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="per_transaction">Per Transaction</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="annual">Annual</SelectItem>
                                                    <SelectItem value="one_time">One Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                                            <Label>Pricing Support</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Supports Fixed Amount</span>
                                                <Switch checked={formData.supports_fixed} onCheckedChange={(val) => setFormData({...formData, supports_fixed: val})} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Supports Percentage</span>
                                                <Switch checked={formData.supports_percentage} onCheckedChange={(val) => setFormData({...formData, supports_percentage: val})} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Supports Volume Tiers</span>
                                                <Switch checked={formData.supports_tiered} onCheckedChange={(val) => setFormData({...formData, supports_tiered: val})} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Offset from Settlement</span>
                                                <Switch checked={formData.offset_from_settlement} onCheckedChange={(val) => setFormData({...formData, offset_from_settlement: val})} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                placeholder="Fee type description"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="deprecated">Deprecated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleSubmit}>
                                                {editingFee ? 'Update' : 'Create'} Fee Type
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            </div>
                        </div>
                    </div>

                    {showTemplates && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Standard Fee Type Templates</CardTitle>
                                <p className="text-sm text-slate-500">Based on ISO 8583, ISO 20022, EMV, and industry standards</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {STANDARD_FEE_TEMPLATES.map((template) => (
                                        <Button
                                            key={template.code}
                                            variant="outline"
                                            className="h-auto p-4 justify-start items-start flex-col text-left"
                                            onClick={() => {
                                                useTemplate(template);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="text-xs">{template.standard}</Badge>
                                                {getCategoryBadge(template.category || 'transaction')}
                                            </div>
                                            <div className="font-medium text-sm mb-1">{template.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{template.code}</div>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Types ({feeTypes.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Applies To</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Pricing</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeTypes.map((fee) => (
                                        <TableRow key={fee.id}>
                                            <TableCell className="font-mono text-xs">{fee.fee_code}</TableCell>
                                            <TableCell className="font-medium">{fee.fee_name}</TableCell>
                                            <TableCell>{getCategoryBadge(fee.category)}</TableCell>
                                            <TableCell className="capitalize">{fee.applies_to?.replace('_', ' ')}</TableCell>
                                            <TableCell className="text-xs">{fee.billing_frequency?.replace('_', ' ')}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {fee.supports_fixed && <Badge variant="outline" className="text-xs">Fixed</Badge>}
                                                    {fee.supports_percentage && <Badge variant="outline" className="text-xs">%</Badge>}
                                                    {fee.supports_tiered && <Badge variant="outline" className="text-xs">Tiered</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={fee.status === 'active' ? 'default' : 'outline'}>
                                                    {fee.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(fee)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}