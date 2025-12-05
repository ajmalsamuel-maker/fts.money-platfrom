import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import MCCSelector from './MCCSelector';
import { cn } from "@/lib/utils";

const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship', fields: ['owner_name', 'owner_id'] },
    { value: 'partnership', label: 'Partnership', fields: ['partner_names', 'partnership_agreement'] },
    { value: 'llc', label: 'Limited Liability Company (LLC)', fields: ['members', 'operating_agreement'] },
    { value: 'corporation', label: 'Corporation', fields: ['directors', 'articles_of_incorporation'] },
    { value: 'nonprofit', label: 'Non-Profit Organization', fields: ['ein', 'tax_exempt_status'] },
];

const industries = [
    { value: 'retail', label: 'Retail', riskLevel: 'low' },
    { value: 'ecommerce', label: 'E-Commerce', riskLevel: 'medium' },
    { value: 'hospitality', label: 'Hospitality & Food', riskLevel: 'low' },
    { value: 'travel', label: 'Travel & Tourism', riskLevel: 'medium' },
    { value: 'services', label: 'Professional Services', riskLevel: 'low' },
    { value: 'healthcare', label: 'Healthcare', riskLevel: 'medium' },
    { value: 'gaming', label: 'Gaming & Entertainment', riskLevel: 'high' },
    { value: 'crypto', label: 'Cryptocurrency', riskLevel: 'high' },
    { value: 'other', label: 'Other', riskLevel: 'medium' },
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
    const [touched, setTouched] = useState({});
    const [validations, setValidations] = useState({});

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
        validateField(field, value);
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, data[field]);
    };

    const validateField = (field, value) => {
        let isValid = true;
        let message = '';

        switch (field) {
            case 'legal_name':
                isValid = value && value.length >= 2;
                message = isValid ? '' : 'Business name must be at least 2 characters';
                break;
            case 'registration_number':
                isValid = value && /^[A-Z0-9]{5,20}$/i.test(value);
                message = isValid ? '' : 'Enter a valid registration number (5-20 alphanumeric characters)';
                break;
            case 'tax_id':
                isValid = value && value.length >= 5;
                message = isValid ? '' : 'Enter a valid tax ID';
                break;
            case 'website':
                if (value) {
                    isValid = /^https?:\/\/.+\..+/.test(value);
                    message = isValid ? '' : 'Enter a valid URL (e.g., https://example.com)';
                }
                break;
            case 'business_address':
                isValid = value && value.length >= 10;
                message = isValid ? '' : 'Please enter a complete address';
                break;
            case 'business_description':
                isValid = value && value.length >= 20;
                message = isValid ? '' : 'Description must be at least 20 characters';
                break;
        }

        setValidations(prev => ({ ...prev, [field]: { isValid, message } }));
    };

    const selectedBusinessType = businessTypes.find(t => t.value === data.business_type);
    const selectedIndustry = industries.find(i => i.value === data.industry);

    const getFieldStatus = (field) => {
        if (!touched[field]) return null;
        if (errors?.[field]) return 'error';
        if (validations[field]?.isValid) return 'valid';
        if (validations[field]?.message) return 'error';
        return null;
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
                    <div className="relative">
                        <Input
                            id="legal_name"
                            value={data.legal_name || ''}
                            onChange={(e) => handleChange('legal_name', e.target.value)}
                            onBlur={() => handleBlur('legal_name')}
                            placeholder="Enter registered business name"
                            className={cn(
                                getFieldStatus('legal_name') === 'error' && 'border-red-500 pr-10',
                                getFieldStatus('legal_name') === 'valid' && 'border-emerald-500 pr-10'
                            )}
                        />
                        {getFieldStatus('legal_name') === 'valid' && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                    </div>
                    {(errors?.legal_name || validations.legal_name?.message) && touched.legal_name && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors?.legal_name || validations.legal_name?.message}
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
                    <div className="relative">
                        <Input
                            id="registration_number"
                            value={data.registration_number || ''}
                            onChange={(e) => handleChange('registration_number', e.target.value.toUpperCase())}
                            onBlur={() => handleBlur('registration_number')}
                            placeholder="Company registration/EIN"
                            className={cn(
                                getFieldStatus('registration_number') === 'error' && 'border-red-500 pr-10',
                                getFieldStatus('registration_number') === 'valid' && 'border-emerald-500 pr-10'
                            )}
                        />
                        {getFieldStatus('registration_number') === 'valid' && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                    </div>
                    {(errors?.registration_number || validations.registration_number?.message) && touched.registration_number && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors?.registration_number || validations.registration_number?.message}
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
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span>{ind.label}</span>
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px]",
                                                ind.riskLevel === 'low' && 'border-emerald-300 text-emerald-700',
                                                ind.riskLevel === 'medium' && 'border-amber-300 text-amber-700',
                                                ind.riskLevel === 'high' && 'border-red-300 text-red-700'
                                            )}
                                        >
                                            {ind.riskLevel} risk
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedIndustry?.riskLevel === 'high' && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                            <Info className="h-3 w-3" /> High-risk industries require enhanced due diligence
                        </p>
                    )}
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

                <div className="md:col-span-2">
                    <MCCSelector 
                        value={data.mcc_code || ''} 
                        onChange={(val) => handleChange('mcc_code', val)}
                        error={errors?.mcc_code}
                    />
                </div>

                {/* Dynamic fields based on business type */}
                {selectedBusinessType && (
                    <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Additional Information for {selectedBusinessType.label}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.business_type === 'sole_proprietorship' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_name">Owner Full Name *</Label>
                                        <Input
                                            id="owner_name"
                                            value={data.owner_name || ''}
                                            onChange={(e) => handleChange('owner_name', e.target.value)}
                                            placeholder="Enter owner's full legal name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_ssn_last4">Owner SSN (Last 4 digits)</Label>
                                        <Input
                                            id="owner_ssn_last4"
                                            value={data.owner_ssn_last4 || ''}
                                            onChange={(e) => handleChange('owner_ssn_last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="XXXX"
                                            maxLength={4}
                                        />
                                    </div>
                                </>
                            )}
                            {data.business_type === 'corporation' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="incorporation_state">State of Incorporation *</Label>
                                        <Input
                                            id="incorporation_state"
                                            value={data.incorporation_state || ''}
                                            onChange={(e) => handleChange('incorporation_state', e.target.value)}
                                            placeholder="e.g., Delaware"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="incorporation_date">Date of Incorporation</Label>
                                        <Input
                                            id="incorporation_date"
                                            type="date"
                                            value={data.incorporation_date || ''}
                                            onChange={(e) => handleChange('incorporation_date', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            {data.business_type === 'nonprofit' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="ein">Employer Identification Number (EIN) *</Label>
                                        <Input
                                            id="ein"
                                            value={data.ein || ''}
                                            onChange={(e) => handleChange('ein', e.target.value)}
                                            placeholder="XX-XXXXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_exempt_number">501(c)(3) Status Number</Label>
                                        <Input
                                            id="tax_exempt_number"
                                            value={data.tax_exempt_number || ''}
                                            onChange={(e) => handleChange('tax_exempt_number', e.target.value)}
                                            placeholder="Enter tax exempt determination letter number"
                                        />
                                    </div>
                                </>
                            )}
                            {(data.business_type === 'llc' || data.business_type === 'partnership') && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="number_of_members">Number of Members/Partners *</Label>
                                        <Input
                                            id="number_of_members"
                                            type="number"
                                            min="1"
                                            value={data.number_of_members || ''}
                                            onChange={(e) => handleChange('number_of_members', e.target.value)}
                                            placeholder="Enter number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="formation_date">Formation Date</Label>
                                        <Input
                                            id="formation_date"
                                            type="date"
                                            value={data.formation_date || ''}
                                            onChange={(e) => handleChange('formation_date', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Expected Volume */}
                <div className="space-y-2">
                    <Label>Expected Monthly Volume *</Label>
                    <Select 
                        value={data.expected_volume || ''} 
                        onValueChange={(val) => handleChange('expected_volume', val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select expected volume" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0-10k">$0 - $10,000</SelectItem>
                            <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                            <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                            <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                            <SelectItem value="1m+">$1,000,000+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Average Ticket Size */}
                <div className="space-y-2">
                    <Label htmlFor="avg_ticket">Average Ticket Size</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <Input
                            id="avg_ticket"
                            type="number"
                            value={data.avg_ticket || ''}
                            onChange={(e) => handleChange('avg_ticket', e.target.value)}
                            placeholder="0.00"
                            className="pl-7"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}