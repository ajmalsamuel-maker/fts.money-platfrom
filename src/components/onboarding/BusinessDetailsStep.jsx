import React from 'react';
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
import { Building2, AlertCircle } from 'lucide-react';

const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'nonprofit', label: 'Non-Profit Organization' },
];

const industries = [
    { value: 'retail', label: 'Retail' },
    { value: 'ecommerce', label: 'E-Commerce' },
    { value: 'hospitality', label: 'Hospitality & Food' },
    { value: 'travel', label: 'Travel & Tourism' },
    { value: 'services', label: 'Professional Services' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'gaming', label: 'Gaming & Entertainment' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' },
];

const countries = [
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'EU', label: 'European Union' },
    { value: 'SG', label: 'Singapore' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'AU', label: 'Australia' },
    { value: 'CA', label: 'Canada' },
];

export default function BusinessDetailsStep({ data, onChange, errors }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Business Details</h2>
                    <p className="text-sm text-slate-500">Tell us about your company</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="legal_name">Legal Business Name *</Label>
                    <Input
                        id="legal_name"
                        value={data.legal_name || ''}
                        onChange={(e) => handleChange('legal_name', e.target.value)}
                        placeholder="Enter registered business name"
                        className={errors?.legal_name ? 'border-red-500' : ''}
                    />
                    {errors?.legal_name && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.legal_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="trading_name">Trading Name (DBA)</Label>
                    <Input
                        id="trading_name"
                        value={data.trading_name || ''}
                        onChange={(e) => handleChange('trading_name', e.target.value)}
                        placeholder="Doing business as"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="registration_number">Business Registration Number *</Label>
                    <Input
                        id="registration_number"
                        value={data.registration_number || ''}
                        onChange={(e) => handleChange('registration_number', e.target.value)}
                        placeholder="Company registration/EIN"
                        className={errors?.registration_number ? 'border-red-500' : ''}
                    />
                    {errors?.registration_number && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.registration_number}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tax_id">Tax ID / VAT Number *</Label>
                    <Input
                        id="tax_id"
                        value={data.tax_id || ''}
                        onChange={(e) => handleChange('tax_id', e.target.value)}
                        placeholder="Tax identification number"
                        className={errors?.tax_id ? 'border-red-500' : ''}
                    />
                    {errors?.tax_id && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.tax_id}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Business Type *</Label>
                    <Select 
                        value={data.business_type || ''} 
                        onValueChange={(val) => handleChange('business_type', val)}
                    >
                        <SelectTrigger className={errors?.business_type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                            {businessTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.business_type && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.business_type}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Industry *</Label>
                    <Select 
                        value={data.industry || ''} 
                        onValueChange={(val) => handleChange('industry', val)}
                    >
                        <SelectTrigger className={errors?.industry ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                            {industries.map((ind) => (
                                <SelectItem key={ind.value} value={ind.value}>
                                    {ind.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.industry && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.industry}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Country of Registration *</Label>
                    <Select 
                        value={data.country || ''} 
                        onValueChange={(val) => handleChange('country', val)}
                    >
                        <SelectTrigger className={errors?.country ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.country && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.country}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        value={data.website || ''}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="business_address">Business Address *</Label>
                    <Textarea
                        id="business_address"
                        value={data.business_address || ''}
                        onChange={(e) => handleChange('business_address', e.target.value)}
                        placeholder="Enter full business address"
                        rows={3}
                        className={errors?.business_address ? 'border-red-500' : ''}
                    />
                    {errors?.business_address && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.business_address}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="business_description">Business Description *</Label>
                    <Textarea
                        id="business_description"
                        value={data.business_description || ''}
                        onChange={(e) => handleChange('business_description', e.target.value)}
                        placeholder="Describe your products/services and business model"
                        rows={4}
                        className={errors?.business_description ? 'border-red-500' : ''}
                    />
                    {errors?.business_description && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.business_description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}