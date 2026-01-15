import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Building2, Globe, Hash, FileText } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { GLOBAL_EINVOICING_STANDARDS } from '@/components/utils/globalEInvoicingRegistry';

export default function BusinessEInvoiceSettings() {
    const [businessSession, setBusinessSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        tax_id: '',
        country: '',
        tax_submission_standards: ''
    });

    React.useEffect(() => {
        const session = localStorage.getItem('business_einvoice_session');
        if (!session) {
            window.location.href = createPageUrl('BusinessEInvoiceLogin');
            return;
        }
        const parsed = JSON.parse(session);
        setBusinessSession(parsed);
        setFormData({
            company_name: parsed.company_name || '',
            tax_id: parsed.tax_id || '',
            country: parsed.country || '',
            tax_submission_standards: parsed.tax_submission_standards || ''
        });
    }, []);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            await base44.entities.BusinessEInvoicingOrganization.update(businessSession.id, data);
            // Update local session
            const updated = { ...businessSession, ...data };
            localStorage.setItem('business_einvoice_session', JSON.stringify(updated));
            return updated;
        },
        onSuccess: (updated) => {
            setBusinessSession(updated);
            toast.success('Settings saved successfully');
        },
        onError: (err) => {
            toast.error('Failed to save: ' + err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (!businessSession) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
                            <p className="text-sm text-slate-600">{businessSession.company_name}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                Organization Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Company Name</Label>
                                <Input
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                    disabled
                                    className="bg-slate-100"
                                />
                                <p className="text-xs text-slate-500 mt-1">Contact support to change company name</p>
                            </div>

                            <div>
                                <Label>Tax ID / VAT Number</Label>
                                <Input
                                    value={formData.tax_id}
                                    onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                                    placeholder="Enter tax identification number"
                                />
                            </div>

                            <div>
                                <Label>Country</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    placeholder="US"
                                    maxLength={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                E-Invoicing Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Default E-Invoicing Standard</Label>
                                <Select 
                                    value={formData.tax_submission_standards} 
                                    onValueChange={(value) => setFormData({...formData, tax_submission_standards: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select standard" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {Object.values(GLOBAL_EINVOICING_STANDARDS).map((standard) => (
                                            <SelectItem key={standard.code} value={standard.code}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{standard.name}</span>
                                                    <span className="text-xs text-slate-500">{standard.format}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500 mt-1">This will be pre-selected when creating new invoices</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={updateMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}