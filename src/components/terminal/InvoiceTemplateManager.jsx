import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Copy, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import InvoicePreview from './InvoicePreview';

const layoutStyles = [
    { value: 'classic', label: 'Classic', description: 'Traditional invoice layout' },
    { value: 'modern', label: 'Modern', description: 'Clean and contemporary' },
    { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
    { value: 'professional', label: 'Professional', description: 'Corporate style' }
];

const fontFamilies = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Arial', 'Times New Roman'
];

export default function InvoiceTemplateManager({ merchantId }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [activeTab, setActiveTab] = useState('branding');
    
    const [templateData, setTemplateData] = useState({
        name: '',
        merchant_id: merchantId,
        is_default: false,
        layout_style: 'modern',
        branding: {
            logo_url: '',
            company_name: '',
            primary_color: '#2563eb',
            secondary_color: '#64748b',
            font_family: 'Inter'
        },
        header: {
            show_logo: true,
            show_company_name: true,
            custom_text: ''
        },
        fields: {
            show_invoice_number: true,
            show_issue_date: true,
            show_due_date: true,
            show_payment_terms: true,
            show_tax_id: false,
            show_po_number: false,
            custom_fields: []
        },
        footer: {
            payment_instructions: 'Payment is due within the specified terms.',
            terms_and_conditions: '',
            thank_you_message: 'Thank you for your business!',
            contact_info: ''
        },
        email_settings: {
            subject_template: 'Invoice [INVOICE_NUMBER] from [COMPANY_NAME]',
            body_template: 'Please find your invoice attached. Payment is due by [DUE_DATE].',
            send_copy_to_merchant: true
        }
    });

    const queryClient = useQueryClient();

    const { data: templates = [] } = useQuery({
        queryKey: ['invoice-templates', merchantId],
        queryFn: () => base44.entities.InvoiceTemplate.filter({ merchant_id: merchantId }),
    });

    const createTemplateMutation = useMutation({
        mutationFn: (data) => base44.entities.InvoiceTemplate.create({
            ...data,
            template_id: `TPL-${Date.now()}`
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
            toast.success('Template created successfully');
            setShowCreateDialog(false);
            resetForm();
        }
    });

    const updateTemplateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.InvoiceTemplate.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
            toast.success('Template updated successfully');
            setEditingTemplate(null);
            setShowCreateDialog(false);
        }
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: (id) => base44.entities.InvoiceTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
            toast.success('Template deleted');
        }
    });

    const resetForm = () => {
        setTemplateData({
            name: '',
            merchant_id: merchantId,
            is_default: false,
            layout_style: 'modern',
            branding: {
                logo_url: '',
                company_name: '',
                primary_color: '#2563eb',
                secondary_color: '#64748b',
                font_family: 'Inter'
            },
            header: { show_logo: true, show_company_name: true, custom_text: '' },
            fields: {
                show_invoice_number: true,
                show_issue_date: true,
                show_due_date: true,
                show_payment_terms: true,
                show_tax_id: false,
                show_po_number: false,
                custom_fields: []
            },
            footer: {
                payment_instructions: 'Payment is due within the specified terms.',
                terms_and_conditions: '',
                thank_you_message: 'Thank you for your business!',
                contact_info: ''
            },
            email_settings: {
                subject_template: 'Invoice [INVOICE_NUMBER] from [COMPANY_NAME]',
                body_template: 'Please find your invoice attached. Payment is due by [DUE_DATE].',
                send_copy_to_merchant: true
            }
        });
    };

    const handleSave = () => {
        if (!templateData.name) {
            toast.error('Please enter a template name');
            return;
        }

        if (editingTemplate) {
            updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateData });
        } else {
            createTemplateMutation.mutate(templateData);
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setTemplateData(template);
        setShowCreateDialog(true);
    };

    const handleUploadLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setTemplateData(prev => ({
                ...prev,
                branding: { ...prev.branding, logo_url: file_url }
            }));
            toast.success('Logo uploaded');
        } catch (error) {
            toast.error('Failed to upload logo');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Invoice Templates</h2>
                    <p className="text-sm text-slate-500">Customize your invoice appearance and content</p>
                </div>
                <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                    <p className="text-xs text-slate-500 mt-1">{template.layout_style}</p>
                                </div>
                                {template.is_default && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                                    <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setTemplateData(template);
                                    setShowPreview(true);
                                }}>
                                    <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                                    disabled={template.is_default}
                                >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Invoice Template</DialogTitle>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="branding">Branding</TabsTrigger>
                            <TabsTrigger value="fields">Fields</TabsTrigger>
                            <TabsTrigger value="footer">Footer</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                        </TabsList>

                        <TabsContent value="branding" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Template Name *</Label>
                                <Input
                                    value={templateData.name}
                                    onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Standard Invoice"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Layout Style</Label>
                                <Select 
                                    value={templateData.layout_style} 
                                    onValueChange={(val) => setTemplateData(prev => ({ ...prev, layout_style: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {layoutStyles.map(style => (
                                            <SelectItem key={style.value} value={style.value}>
                                                <div>
                                                    <div className="font-medium">{style.label}</div>
                                                    <div className="text-xs text-slate-500">{style.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Company Logo</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={templateData.branding.logo_url}
                                        onChange={(e) => setTemplateData(prev => ({
                                            ...prev,
                                            branding: { ...prev.branding, logo_url: e.target.value }
                                        }))}
                                        placeholder="Logo URL"
                                    />
                                    <Button variant="outline" onClick={() => document.getElementById('logo-upload').click()}>
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUploadLogo}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    value={templateData.branding.company_name}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        branding: { ...prev.branding, company_name: e.target.value }
                                    }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={templateData.branding.primary_color}
                                            onChange={(e) => setTemplateData(prev => ({
                                                ...prev,
                                                branding: { ...prev.branding, primary_color: e.target.value }
                                            }))}
                                            className="w-16 h-10"
                                        />
                                        <Input
                                            value={templateData.branding.primary_color}
                                            onChange={(e) => setTemplateData(prev => ({
                                                ...prev,
                                                branding: { ...prev.branding, primary_color: e.target.value }
                                            }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={templateData.branding.secondary_color}
                                            onChange={(e) => setTemplateData(prev => ({
                                                ...prev,
                                                branding: { ...prev.branding, secondary_color: e.target.value }
                                            }))}
                                            className="w-16 h-10"
                                        />
                                        <Input
                                            value={templateData.branding.secondary_color}
                                            onChange={(e) => setTemplateData(prev => ({
                                                ...prev,
                                                branding: { ...prev.branding, secondary_color: e.target.value }
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Font Family</Label>
                                <Select 
                                    value={templateData.branding.font_family}
                                    onValueChange={(val) => setTemplateData(prev => ({
                                        ...prev,
                                        branding: { ...prev.branding, font_family: val }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fontFamilies.map(font => (
                                            <SelectItem key={font} value={font}>{font}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Label>Set as Default Template</Label>
                                <Switch
                                    checked={templateData.is_default}
                                    onCheckedChange={(checked) => setTemplateData(prev => ({ ...prev, is_default: checked }))}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="fields" className="space-y-4 mt-4">
                            <div className="space-y-3">
                                {Object.entries({
                                    show_invoice_number: 'Invoice Number',
                                    show_issue_date: 'Issue Date',
                                    show_due_date: 'Due Date',
                                    show_payment_terms: 'Payment Terms',
                                    show_tax_id: 'Tax ID / VAT',
                                    show_po_number: 'PO Number'
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <Label>{label}</Label>
                                        <Switch
                                            checked={templateData.fields[key]}
                                            onCheckedChange={(checked) => setTemplateData(prev => ({
                                                ...prev,
                                                fields: { ...prev.fields, [key]: checked }
                                            }))}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t">
                                <Label className="mb-2 block">Header Custom Text</Label>
                                <Textarea
                                    value={templateData.header.custom_text}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        header: { ...prev.header, custom_text: e.target.value }
                                    }))}
                                    placeholder="Optional custom header text..."
                                    rows={2}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="footer" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Payment Instructions</Label>
                                <Textarea
                                    value={templateData.footer.payment_instructions}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        footer: { ...prev.footer, payment_instructions: e.target.value }
                                    }))}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Thank You Message</Label>
                                <Input
                                    value={templateData.footer.thank_you_message}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        footer: { ...prev.footer, thank_you_message: e.target.value }
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Terms & Conditions</Label>
                                <Textarea
                                    value={templateData.footer.terms_and_conditions}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        footer: { ...prev.footer, terms_and_conditions: e.target.value }
                                    }))}
                                    rows={4}
                                    placeholder="Enter terms and conditions..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Contact Information</Label>
                                <Textarea
                                    value={templateData.footer.contact_info}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        footer: { ...prev.footer, contact_info: e.target.value }
                                    }))}
                                    rows={2}
                                    placeholder="Phone, email, address..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="email" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Email Subject Template</Label>
                                <Input
                                    value={templateData.email_settings.subject_template}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        email_settings: { ...prev.email_settings, subject_template: e.target.value }
                                    }))}
                                />
                                <p className="text-xs text-slate-500">
                                    Variables: [INVOICE_NUMBER], [COMPANY_NAME], [AMOUNT], [DUE_DATE]
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Email Body Template</Label>
                                <Textarea
                                    value={templateData.email_settings.body_template}
                                    onChange={(e) => setTemplateData(prev => ({
                                        ...prev,
                                        email_settings: { ...prev.email_settings, body_template: e.target.value }
                                    }))}
                                    rows={5}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Send Copy to Merchant</Label>
                                <Switch
                                    checked={templateData.email_settings.send_copy_to_merchant}
                                    onCheckedChange={(checked) => setTemplateData(prev => ({
                                        ...prev,
                                        email_settings: { ...prev.email_settings, send_copy_to_merchant: checked }
                                    }))}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                        <Button onClick={() => setShowPreview(true)} variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <InvoicePreview
                open={showPreview}
                onOpenChange={setShowPreview}
                template={templateData}
            />
        </div>
    );
}