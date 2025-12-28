import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

const issuerTypes = [
    { value: 'fund_manager', label: 'Fund Manager', description: 'Asset management funds', riskLevel: 'medium' },
    { value: 'investment_bank', label: 'Investment Bank', description: 'Banking institutions', riskLevel: 'low' },
    { value: 'broker_dealer', label: 'Broker-Dealer', description: 'Securities firms', riskLevel: 'medium' },
    { value: 'real_estate_company', label: 'Real Estate Company', description: 'Property developers', riskLevel: 'low' },
    { value: 'corporation', label: 'Corporation', description: 'Corporate entities', riskLevel: 'low' },
    { value: 'government_entity', label: 'Government Entity', description: 'Government bodies', riskLevel: 'low' },
];

const assetTypesOptions = [
    { value: 'real_estate', label: 'Real Estate', regulatory: ['SEC Reg D', 'MiFID II'] },
    { value: 'private_equity', label: 'Private Equity', regulatory: ['SEC Reg D', 'AIFMD'] },
    { value: 'debt_securities', label: 'Debt Securities', regulatory: ['SEC Rule 144A', 'Prospectus Directive'] },
    { value: 'commodities', label: 'Commodities', regulatory: ['CFTC', 'MiFID II'] },
    { value: 'art_collectibles', label: 'Art & Collectibles', regulatory: ['AML 6AMLD'] },
    { value: 'carbon_credits', label: 'Carbon Credits', regulatory: ['EU ETS', 'VCS'] },
];

const jurisdictions = [
    { value: 'US', label: 'United States', regulations: ['SEC', 'FinCEN', 'CFTC'] },
    { value: 'GB', label: 'United Kingdom', regulations: ['FCA', 'PRA'] },
    { value: 'SG', label: 'Singapore', regulations: ['MAS'] },
    { value: 'CH', label: 'Switzerland', regulations: ['FINMA'] },
    { value: 'LU', label: 'Luxembourg', regulations: ['CSSF'] },
    { value: 'HK', label: 'Hong Kong', regulations: ['SFC'] },
    { value: 'AE', label: 'UAE', regulations: ['ADGM', 'DIFC'] },
    { value: 'DE', label: 'Germany', regulations: ['BaFin'] },
];

export default function AssetIssuerBusinessStep({ data, onChange, errors }) {
    const [touched, setTouched] = useState({});

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const toggleAssetType = (assetType) => {
        const current = data.asset_types_planned || [];
        const updated = current.includes(assetType)
            ? current.filter(t => t !== assetType)
            : [...current, assetType];
        handleChange('asset_types_planned', updated);
    };

    const selectedJurisdiction = jurisdictions.find(j => j.value === data.primary_jurisdiction);
    const selectedIssuerType = issuerTypes.find(t => t.value === data.issuer_type);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Issuer Information</h2>
                    <p className="text-sm text-slate-500">Tell us about your organization</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="company_name">Legal Company Name *</Label>
                    <div className="relative">
                        <Input
                            id="company_name"
                            value={data.company_name || ''}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                            onBlur={() => handleBlur('company_name')}
                            placeholder="Enter registered company name"
                            className={errors?.company_name ? 'border-red-500' : ''}
                        />
                        {data.company_name && data.company_name.length >= 3 && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                    </div>
                    {errors?.company_name && touched.company_name && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.company_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Issuer Type *</Label>
                    <Select 
                        value={data.issuer_type || ''} 
                        onValueChange={(val) => handleChange('issuer_type', val)}
                    >
                        <SelectTrigger className={errors?.issuer_type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select issuer type" />
                        </SelectTrigger>
                        <SelectContent>
                            {issuerTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        {type.label}
                                        <Badge variant="outline" className="text-[10px]">
                                            {type.riskLevel}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedIssuerType && (
                        <p className="text-xs text-slate-500">{selectedIssuerType.description}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Primary Jurisdiction *</Label>
                    <Select 
                        value={data.primary_jurisdiction || ''} 
                        onValueChange={(val) => handleChange('primary_jurisdiction', val)}
                    >
                        <SelectTrigger className={errors?.primary_jurisdiction ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                            {jurisdictions.map((j) => (
                                <SelectItem key={j.value} value={j.value}>
                                    {j.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedJurisdiction && (
                        <div className="text-xs text-slate-500">
                            Regulators: {selectedJurisdiction.regulations.join(', ')}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="registration_number">Company Registration Number *</Label>
                    <Input
                        id="registration_number"
                        value={data.registration_number || ''}
                        onChange={(e) => handleChange('registration_number', e.target.value.toUpperCase())}
                        placeholder="Company/EIN number"
                        className={errors?.registration_number ? 'border-red-500' : ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="incorporation_date">Date of Incorporation *</Label>
                    <Input
                        id="incorporation_date"
                        type="date"
                        value={data.incorporation_date || ''}
                        onChange={(e) => handleChange('incorporation_date', e.target.value)}
                        className={errors?.incorporation_date ? 'border-red-500' : ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="admin_email">Admin Email *</Label>
                    <Input
                        id="admin_email"
                        type="email"
                        value={data.admin_email || ''}
                        onChange={(e) => handleChange('admin_email', e.target.value)}
                        placeholder="admin@company.com"
                        className={errors?.admin_email ? 'border-red-500' : ''}
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="business_address">Registered Business Address *</Label>
                    <Textarea
                        id="business_address"
                        value={data.business_address || ''}
                        onChange={(e) => handleChange('business_address', e.target.value)}
                        placeholder="Full registered address"
                        rows={3}
                        className={errors?.business_address ? 'border-red-500' : ''}
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="business_description">Business Description *</Label>
                    <Textarea
                        id="business_description"
                        value={data.business_description || ''}
                        onChange={(e) => handleChange('business_description', e.target.value)}
                        placeholder="Describe your business activities and tokenization plans"
                        rows={4}
                        className={errors?.business_description ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-slate-500">Minimum 50 characters</p>
                </div>

                <div className="md:col-span-2">
                    <Label className="mb-3 block">Asset Types You Plan to Tokenize *</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                        {assetTypesOptions.map((asset) => (
                            <div 
                                key={asset.value}
                                className={cn(
                                    "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                                    (data.asset_types_planned || []).includes(asset.value) 
                                        ? "border-blue-500 bg-blue-50" 
                                        : "hover:border-slate-300"
                                )}
                                onClick={() => toggleAssetType(asset.value)}
                            >
                                <Checkbox
                                    id={asset.value}
                                    checked={(data.asset_types_planned || []).includes(asset.value)}
                                    onCheckedChange={() => toggleAssetType(asset.value)}
                                />
                                <div className="flex-1">
                                    <Label htmlFor={asset.value} className="cursor-pointer font-medium">
                                        {asset.label}
                                    </Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {asset.regulatory.map(reg => (
                                            <Badge key={reg} variant="outline" className="text-[9px]">
                                                {reg}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {errors?.asset_types_planned && (
                        <p className="text-xs text-red-500 mt-2">{errors.asset_types_planned}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expected_aum">Expected Assets Under Management (USD)</Label>
                    <Select 
                        value={data.expected_aum || ''} 
                        onValueChange={(val) => handleChange('expected_aum', val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0-10m">$0 - $10M</SelectItem>
                            <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                            <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                            <SelectItem value="100m-500m">$100M - $500M</SelectItem>
                            <SelectItem value="500m+">$500M+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        type="url"
                        value={data.website || ''}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://company.com"
                    />
                </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-2">Regulatory Requirements by Jurisdiction:</p>
                        <ul className="space-y-1 text-xs">
                            <li>🇺🇸 <strong>US:</strong> SEC registration (Reg D, Reg A, Reg S), FinCEN AML compliance</li>
                            <li>🇪🇺 <strong>EU:</strong> MiFID II, Prospectus Regulation, AIFMD for funds</li>
                            <li>🇸🇬 <strong>Singapore:</strong> MAS Digital Token Framework, VATP license</li>
                            <li>🇨🇭 <strong>Switzerland:</strong> FINMA DLT Act, FinIA for fund managers</li>
                            <li>🇦🇪 <strong>UAE:</strong> ADGM/DIFC regulations for tokenized securities</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}