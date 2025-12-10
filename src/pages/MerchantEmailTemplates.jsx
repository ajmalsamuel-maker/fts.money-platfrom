import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, Plus, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantEmailTemplates() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = useState('');
    const queryClient = useQueryClient();

    const [emailTemplate, setEmailTemplate] = useState({
        template_type: 'transaction_receipt',
        template_name: 'Default Transaction Receipt',
        subject: 'Your Payment Receipt - {{transaction_id}}',
        html_body: '',
        primary_color: '#3b82f6',
        secondary_color: '#64748b',
        footer_text: 'Thank you for your business!',
        attach_receipt: true
    });

    const [receiptTemplate, setReceiptTemplate] = useState({
        template_name: 'Default Receipt',
        logo_url: '',
        header_text: 'Payment Receipt',
        show_merchant_details: true,
        merchant_address: '',
        merchant_phone: '',
        merchant_email: '',
        show_transaction_details: true,
        show_itemized_list: true,
        show_payment_method: true,
        footer_text: 'Thank you for your business!',
        primary_color: '#000000',
        font_family: 'Arial',
        font_size: 12
    });

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const { data: emailTemplates = [] } = useQuery({
        queryKey: ['email-templates', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.EmailTemplate.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const { data: receiptTemplates = [] } = useQuery({
        queryKey: ['receipt-templates', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.ReceiptTemplate.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    const saveEmailTemplateMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.EmailTemplate.create({
                ...data,
                merchant_id: user.merchant_id
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['email-templates']);
            toast.success('Email template saved successfully');
        },
        onError: (error) => {
            toast.error('Failed to save email template: ' + error.message);
        }
    });

    const saveReceiptTemplateMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.ReceiptTemplate.create({
                ...data,
                merchant_id: user.merchant_id
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['receipt-templates']);
            toast.success('Receipt template saved successfully');
        },
        onError: (error) => {
            toast.error('Failed to save receipt template: ' + error.message);
        }
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const defaultEmailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
    <div style="background-color: white; padding: 30px; border-radius: 8px;">
        <h2 style="color: {{primary_color}}; margin-bottom: 20px;">Payment Confirmation</h2>
        <p>Dear {{customer_name}},</p>
        <p>Your payment has been successfully processed.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Transaction Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0;"><strong>Transaction ID:</strong></td><td>{{transaction_id}}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Amount:</strong></td><td>{{currency}} {{amount}}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td>{{date}}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Status:</strong></td><td>{{status}}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Payment Method:</strong></td><td>{{payment_method}}</td></tr>
            </table>
        </div>
        
        <p>{{footer_text}}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply.
        </p>
    </div>
</div>`;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantEmailTemplates"
                user={user}
                merchant={merchant}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Email & Receipt Templates</h1>
                            <p className="text-slate-500">Customize email and receipt templates for your transactions</p>
                        </div>

                        <Tabs defaultValue="email" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="email" className="gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Templates
                                </TabsTrigger>
                                <TabsTrigger value="receipt" className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    Receipt Templates
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="email" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Email Template Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Template Type</Label>
                                                <Select 
                                                    value={emailTemplate.template_type} 
                                                    onValueChange={(v) => setEmailTemplate(p => ({...p, template_type: v}))}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="transaction_receipt">Transaction Receipt</SelectItem>
                                                        <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                                                        <SelectItem value="refund_notification">Refund Notification</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Template Name</Label>
                                                <Input 
                                                    value={emailTemplate.template_name}
                                                    onChange={(e) => setEmailTemplate(p => ({...p, template_name: e.target.value}))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Email Subject</Label>
                                            <Input 
                                                value={emailTemplate.subject}
                                                onChange={(e) => setEmailTemplate(p => ({...p, subject: e.target.value}))}
                                                placeholder="Use {{transaction_id}}, {{amount}}, etc."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Email Body (HTML)</Label>
                                            <Textarea 
                                                value={emailTemplate.html_body || defaultEmailBody}
                                                onChange={(e) => setEmailTemplate(p => ({...p, html_body: e.target.value}))}
                                                rows={12}
                                                className="font-mono text-xs"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Available variables: {`{{transaction_id}}, {{amount}}, {{currency}}, {{date}}, {{customer_name}}, {{payment_method}}, {{status}}`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Primary Color</Label>
                                                <Input 
                                                    type="color"
                                                    value={emailTemplate.primary_color}
                                                    onChange={(e) => setEmailTemplate(p => ({...p, primary_color: e.target.value}))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Secondary Color</Label>
                                                <Input 
                                                    type="color"
                                                    value={emailTemplate.secondary_color}
                                                    onChange={(e) => setEmailTemplate(p => ({...p, secondary_color: e.target.value}))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Footer Text</Label>
                                            <Input 
                                                value={emailTemplate.footer_text}
                                                onChange={(e) => setEmailTemplate(p => ({...p, footer_text: e.target.value}))}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch 
                                                checked={emailTemplate.attach_receipt}
                                                onCheckedChange={(c) => setEmailTemplate(p => ({...p, attach_receipt: c}))}
                                            />
                                            <Label>Attach PDF Receipt</Label>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={() => saveEmailTemplateMutation.mutate(emailTemplate)}
                                                className="gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Template
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="receipt" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Receipt Template Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Template Name</Label>
                                            <Input 
                                                value={receiptTemplate.template_name}
                                                onChange={(e) => setReceiptTemplate(p => ({...p, template_name: e.target.value}))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Logo URL</Label>
                                            <Input 
                                                value={receiptTemplate.logo_url}
                                                onChange={(e) => setReceiptTemplate(p => ({...p, logo_url: e.target.value}))}
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Header Text</Label>
                                            <Input 
                                                value={receiptTemplate.header_text}
                                                onChange={(e) => setReceiptTemplate(p => ({...p, header_text: e.target.value}))}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Display Options</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={receiptTemplate.show_merchant_details}
                                                    onCheckedChange={(c) => setReceiptTemplate(p => ({...p, show_merchant_details: c}))}
                                                />
                                                <Label>Show Merchant Details</Label>
                                            </div>
                                            {receiptTemplate.show_merchant_details && (
                                                <div className="ml-6 space-y-2">
                                                    <Input 
                                                        placeholder="Merchant Address"
                                                        value={receiptTemplate.merchant_address}
                                                        onChange={(e) => setReceiptTemplate(p => ({...p, merchant_address: e.target.value}))}
                                                    />
                                                    <Input 
                                                        placeholder="Merchant Phone"
                                                        value={receiptTemplate.merchant_phone}
                                                        onChange={(e) => setReceiptTemplate(p => ({...p, merchant_phone: e.target.value}))}
                                                    />
                                                    <Input 
                                                        placeholder="Merchant Email"
                                                        value={receiptTemplate.merchant_email}
                                                        onChange={(e) => setReceiptTemplate(p => ({...p, merchant_email: e.target.value}))}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={receiptTemplate.show_transaction_details}
                                                    onCheckedChange={(c) => setReceiptTemplate(p => ({...p, show_transaction_details: c}))}
                                                />
                                                <Label>Show Transaction Details</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={receiptTemplate.show_payment_method}
                                                    onCheckedChange={(c) => setReceiptTemplate(p => ({...p, show_payment_method: c}))}
                                                />
                                                <Label>Show Payment Method</Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Footer Text</Label>
                                            <Textarea 
                                                value={receiptTemplate.footer_text}
                                                onChange={(e) => setReceiptTemplate(p => ({...p, footer_text: e.target.value}))}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Primary Color</Label>
                                                <Input 
                                                    type="color"
                                                    value={receiptTemplate.primary_color}
                                                    onChange={(e) => setReceiptTemplate(p => ({...p, primary_color: e.target.value}))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Font Family</Label>
                                                <Select 
                                                    value={receiptTemplate.font_family}
                                                    onValueChange={(v) => setReceiptTemplate(p => ({...p, font_family: v}))}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Arial">Arial</SelectItem>
                                                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                                                        <SelectItem value="Times">Times</SelectItem>
                                                        <SelectItem value="Courier">Courier</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Font Size</Label>
                                                <Input 
                                                    type="number"
                                                    value={receiptTemplate.font_size}
                                                    onChange={(e) => setReceiptTemplate(p => ({...p, font_size: parseInt(e.target.value)}))}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={() => saveReceiptTemplateMutation.mutate(receiptTemplate)}
                                                className="gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Template
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}