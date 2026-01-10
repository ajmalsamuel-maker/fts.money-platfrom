import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceTemplateDesigner({ onSave }) {
    const [template, setTemplate] = useState({
        logo_url: '',
        company_name: 'FTS.Money',
        company_address: '',
        company_email: '',
        company_phone: '',
        terms_and_conditions: 'Payment is due within 30 days. Late payments may incur additional charges.',
        footer_text: 'Thank you for your business',
        primary_color: '#2563eb',
        show_logo: true,
        show_company_info: true,
        show_line_item_details: true
    });

    const [logoFile, setLogoFile] = useState(null);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            // In production, upload to storage
            const reader = new FileReader();
            reader.onloadend = () => {
                setTemplate({ ...template, logo_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(template);
        }
        toast.success('Template saved successfully');
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="design" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="design" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Company Logo</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="flex-1"
                                    />
                                    <Button variant="outline" size="sm">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                                {template.logo_url && (
                                    <img src={template.logo_url} alt="Logo" className="mt-2 h-16 object-contain" />
                                )}
                            </div>

                            <div>
                                <Label>Company Name</Label>
                                <Input
                                    value={template.company_name}
                                    onChange={(e) => setTemplate({ ...template, company_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Company Address</Label>
                                <Textarea
                                    value={template.company_address}
                                    onChange={(e) => setTemplate({ ...template, company_address: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={template.company_email}
                                        onChange={(e) => setTemplate({ ...template, company_email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={template.company_phone}
                                        onChange={(e) => setTemplate({ ...template, company_phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={template.terms_and_conditions}
                                onChange={(e) => setTemplate({ ...template, terms_and_conditions: e.target.value })}
                                rows={5}
                                placeholder="Enter payment terms, late fees, and other conditions..."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Footer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                value={template.footer_text}
                                onChange={(e) => setTemplate({ ...template, footer_text: e.target.value })}
                                placeholder="Footer message"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Styling</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label>Primary Color</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        type="color"
                                        value={template.primary_color}
                                        onChange={(e) => setTemplate({ ...template, primary_color: e.target.value })}
                                        className="w-20"
                                    />
                                    <Input
                                        value={template.primary_color}
                                        onChange={(e) => setTemplate({ ...template, primary_color: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={handleSave} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                    </Button>
                </TabsContent>

                <TabsContent value="preview">
                    <Card>
                        <CardContent className="p-8">
                            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    {template.logo_url && (
                                        <img src={template.logo_url} alt="Logo" className="h-16 object-contain" />
                                    )}
                                    <div className="text-right">
                                        <h1 className="text-3xl font-bold" style={{ color: template.primary_color }}>INVOICE</h1>
                                        <p className="text-slate-600">INV-2026-0001</p>
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-2">From:</h3>
                                        <p className="font-semibold">{template.company_name}</p>
                                        <p className="text-sm text-slate-600 whitespace-pre-line">{template.company_address}</p>
                                        <p className="text-sm text-slate-600">{template.company_email}</p>
                                        <p className="text-sm text-slate-600">{template.company_phone}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-2">Bill To:</h3>
                                        <p className="font-semibold">Customer Name</p>
                                        <p className="text-sm text-slate-600">customer@example.com</p>
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div className="mb-8">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-600">Invoice Date:</p>
                                            <p className="font-medium">Jan 10, 2026</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Due Date:</p>
                                            <p className="font-medium">Feb 9, 2026</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Period:</p>
                                            <p className="font-medium">Dec 2025</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2" style={{ borderColor: template.primary_color }}>
                                            <th className="text-left py-2">Description</th>
                                            <th className="text-right py-2">Quantity</th>
                                            <th className="text-right py-2">Rate</th>
                                            <th className="text-right py-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3">
                                                <p className="font-medium">PSP Payment Processing</p>
                                                <p className="text-sm text-slate-600">Monthly subscription</p>
                                            </td>
                                            <td className="text-right">1,250</td>
                                            <td className="text-right">$0.10</td>
                                            <td className="text-right font-medium">$125.00</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3">
                                                <p className="font-medium">ISO Gateway - Messages</p>
                                                <p className="text-sm text-slate-600">500 messages processed</p>
                                            </td>
                                            <td className="text-right">500</td>
                                            <td className="text-right">$0.05</td>
                                            <td className="text-right font-medium">$25.00</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="flex justify-end mb-8">
                                    <div className="w-64">
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-600">Subtotal:</span>
                                            <span className="font-medium">$150.00</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-600">Tax (10%):</span>
                                            <span className="font-medium">$15.00</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-t-2" style={{ borderColor: template.primary_color }}>
                                            <span className="font-bold text-lg">Total:</span>
                                            <span className="font-bold text-lg" style={{ color: template.primary_color }}>$165.00</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="border-t pt-6 mb-6">
                                    <h3 className="font-bold text-slate-900 mb-2">Terms & Conditions</h3>
                                    <p className="text-sm text-slate-600 whitespace-pre-line">{template.terms_and_conditions}</p>
                                </div>

                                {/* Footer */}
                                <div className="text-center text-sm text-slate-500 border-t pt-4">
                                    {template.footer_text}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}