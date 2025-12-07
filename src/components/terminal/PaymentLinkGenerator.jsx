import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link2, Copy, Mail, Loader2, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentLinkGenerator({ merchants }) {
    const [formData, setFormData] = useState({
        merchant_id: '',
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        expires_in_days: '30',
        max_uses: '1',
        customer_email: '',
        allow_custom_amount: false
    });

    const [generatedLink, setGeneratedLink] = useState(null);

    const queryClient = useQueryClient();

    const createLinkMutation = useMutation({
        mutationFn: async (data) => {
            const merchant = merchants.find(m => m.id === data.merchant_id);
            const shortCode = Math.random().toString(36).substr(2, 8).toUpperCase();
            const link_url = `${window.location.origin}/pay/${shortCode}`;
            const expires_at = new Date(Date.now() + parseInt(data.expires_in_days) * 24 * 60 * 60 * 1000);
            
            const paymentLink = await base44.entities.PaymentLink.create({
                link_id: `LINK-${Date.now()}`,
                merchant_id: data.merchant_id,
                merchant_name: merchant?.business_name,
                title: data.title,
                description: data.description,
                amount: parseFloat(data.amount),
                currency: data.currency,
                status: 'active',
                link_url,
                short_code: shortCode,
                expires_at: expires_at.toISOString(),
                max_uses: parseInt(data.max_uses),
                use_count: 0,
                customer_email: data.customer_email,
                allow_custom_amount: data.allow_custom_amount,
                metadata: {
                    created_via: 'virtual_terminal',
                    iso20022_compatible: true
                }
            });
            
            // Send email if customer email provided
            if (data.customer_email) {
                await base44.integrations.Core.SendEmail({
                    to: data.customer_email,
                    subject: `Payment Request: ${data.title}`,
                    body: `
                        <h2>Payment Request</h2>
                        <p>${data.description}</p>
                        <p>Amount: $${data.amount}</p>
                        <p><a href="${link_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pay Now</a></p>
                        <p>This link expires on ${expires_at.toLocaleDateString()}</p>
                    `
                });
            }
            
            return paymentLink;
        },
        onSuccess: (link) => {
            queryClient.invalidateQueries({ queryKey: ['payment-links'] });
            setGeneratedLink(link);
            toast.success('Payment link created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create payment link: ' + error.message);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.merchant_id || !formData.title || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        await createLinkMutation.mutate(formData);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink.link_url);
        toast.success('Link copied to clipboard');
    };

    const handleReset = () => {
        setFormData({
            merchant_id: '',
            title: '',
            description: '',
            amount: '',
            currency: 'USD',
            expires_in_days: '30',
            max_uses: '1',
            customer_email: '',
            allow_custom_amount: false
        });
        setGeneratedLink(null);
    };

    if (generatedLink) {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment Link Created!</h3>
                    <p className="text-slate-600">Share this link with your customer to collect payment</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                    <div>
                        <Label className="text-xs text-slate-500">Payment Link</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                value={generatedLink.link_url}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button onClick={handleCopyLink} variant="outline">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs text-slate-500">Short Code</Label>
                            <p className="font-mono font-semibold text-lg">{generatedLink.short_code}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-500">Amount</Label>
                            <p className="font-semibold text-lg">${generatedLink.amount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-slate-500">Expires</Label>
                        <p className="text-sm">{new Date(generatedLink.expires_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                        Create Another Link
                    </Button>
                    <Button onClick={handleCopyLink} className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Merchant *</Label>
                <Select value={formData.merchant_id} onValueChange={(val) => setFormData({...formData, merchant_id: val})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select merchant" />
                    </SelectTrigger>
                    <SelectContent>
                        {merchants.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Payment Title *</Label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Payment for services"
                />
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed description of what the payment is for..."
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                    <Label>Amount *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Expires In (Days)</Label>
                    <Select value={formData.expires_in_days} onValueChange={(val) => setFormData({...formData, expires_in_days: val})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Max Uses</Label>
                    <Input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Customer Email (Optional)</Label>
                <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    placeholder="customer@example.com"
                />
                <p className="text-xs text-slate-500">If provided, we'll email the link to the customer</p>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createLinkMutation.isPending}
            >
                {createLinkMutation.isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Link...
                    </>
                ) : (
                    <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Generate Payment Link
                    </>
                )}
            </Button>
        </form>
    );
}