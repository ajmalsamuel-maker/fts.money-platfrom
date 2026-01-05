import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { GripVertical, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_SECTIONS = [
    { id: 'header', label: 'Header', description: 'Company logo and title' },
    { id: 'customer_info', label: 'Customer Information', description: 'Bill to details' },
    { id: 'invoice_details', label: 'Invoice Details', description: 'Number, date, due date' },
    { id: 'line_items', label: 'Line Items', description: 'Products/services table' },
    { id: 'totals', label: 'Totals', description: 'Subtotal, VAT, total' },
    { id: 'tax_info', label: 'Tax Information', description: 'VAT breakdown' },
    { id: 'payment_terms', label: 'Payment Terms', description: 'Payment conditions' },
    { id: 'notes', label: 'Notes', description: 'Additional information' },
    { id: 'footer', label: 'Footer', description: 'Contact details' }
];

export default function InvoiceTemplateBuilder({ template: initialTemplate, onSave }) {
    const [template, setTemplate] = useState(initialTemplate || {
        template_name: '',
        template_type: 'b2c',
        customer_segment: 'all',
        service_type: 'all',
        primary_color: '#3b82f6',
        secondary_color: '#06b6d4',
        accent_color: '#8b5cf6',
        section_order: JSON.stringify(['header', 'customer_info', 'invoice_details', 'line_items', 'totals', 'tax_info', 'footer']),
        visible_sections: JSON.stringify({
            header: true,
            customer_info: true,
            invoice_details: true,
            line_items: true,
            totals: true,
            tax_info: true,
            footer: true,
            payment_terms: false,
            notes: false
        }),
        status: 'draft'
    });

    const [uploading, setUploading] = useState(false);
    const sectionOrder = JSON.parse(template.section_order || '[]');
    const visibleSections = JSON.parse(template.visible_sections || '{}');

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(sectionOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setTemplate({ ...template, section_order: JSON.stringify(items) });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setTemplate({ ...template, logo_url: file_url });
            toast.success('Logo uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload logo: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const toggleSection = (sectionId) => {
        const updatedSections = { ...visibleSections, [sectionId]: !visibleSections[sectionId] };
        setTemplate({ ...template, visible_sections: JSON.stringify(updatedSections) });
    };

    const handleSave = async () => {
        try {
            if (!template.template_name) {
                toast.error('Please enter a template name');
                return;
            }

            const savedTemplate = template.id
                ? await base44.entities.InvoiceTemplate.update(template.id, template)
                : await base44.entities.InvoiceTemplate.create(template);

            toast.success('Template saved successfully!');
            if (onSave) onSave(savedTemplate);
        } catch (error) {
            toast.error('Failed to save template: ' + error.message);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Settings */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Template Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Template Name *</Label>
                            <Input
                                value={template.template_name}
                                onChange={(e) => setTemplate({ ...template, template_name: e.target.value })}
                                placeholder="e.g., Enterprise Invoice"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Type</Label>
                                <Select value={template.template_type} onValueChange={(value) => setTemplate({ ...template, template_type: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="b2c">B2C Invoice</SelectItem>
                                        <SelectItem value="b2b">B2B Invoice</SelectItem>
                                        <SelectItem value="reverse_charge">Reverse Charge</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Segment</Label>
                                <Select value={template.customer_segment} onValueChange={(value) => setTemplate({ ...template, customer_segment: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                        <SelectItem value="sme">SME</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Logo</Label>
                            <div className="flex items-center gap-4 mt-2">
                                {template.logo_url && <img src={template.logo_url} alt="Logo" className="h-12 w-auto border rounded" />}
                                <Button onClick={() => document.getElementById('logo-upload').click()} disabled={uploading} variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Primary</Label>
                                <Input type="color" value={template.primary_color} onChange={(e) => setTemplate({ ...template, primary_color: e.target.value })} />
                            </div>
                            <div>
                                <Label>Secondary</Label>
                                <Input type="color" value={template.secondary_color} onChange={(e) => setTemplate({ ...template, secondary_color: e.target.value })} />
                            </div>
                            <div>
                                <Label>Accent</Label>
                                <Input type="color" value={template.accent_color} onChange={(e) => setTemplate({ ...template, accent_color: e.target.value })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Text</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Payment Terms</Label>
                            <Textarea value={template.payment_terms || ''} onChange={(e) => setTemplate({ ...template, payment_terms: e.target.value })} placeholder="Net 30 days" rows={2} />
                        </div>
                        <div>
                            <Label>Footer Notes</Label>
                            <Textarea value={template.notes || ''} onChange={(e) => setTemplate({ ...template, notes: e.target.value })} placeholder="Thank you!" rows={2} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section Layout */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Section Layout (Drag to Reorder)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                        {sectionOrder.map((sectionId, index) => {
                                            const section = AVAILABLE_SECTIONS.find(s => s.id === sectionId);
                                            if (!section) return null;

                                            return (
                                                <Draggable key={sectionId} draggableId={sectionId} index={index}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                                                            <div {...provided.dragHandleProps}>
                                                                <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{section.label}</div>
                                                                <div className="text-xs text-slate-500">{section.description}</div>
                                                            </div>
                                                            <Switch checked={visibleSections[sectionId]} onCheckedChange={() => toggleSection(sectionId)} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </CardContent>
                </Card>

                <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                </Button>
            </div>
        </div>
    );
}