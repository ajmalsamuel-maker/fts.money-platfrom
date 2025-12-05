import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Trash2, AlertCircle, CheckCircle, Building2, UserCheck, Briefcase } from 'lucide-react';
import { cn } from "@/lib/utils";

const ownershipRoles = [
    { value: 'ceo', label: 'CEO / President' },
    { value: 'cfo', label: 'CFO / Treasurer' },
    { value: 'coo', label: 'COO' },
    { value: 'director', label: 'Director' },
    { value: 'shareholder', label: 'Shareholder' },
    { value: 'partner', label: 'Partner' },
    { value: 'member', label: 'Member' },
    { value: 'trustee', label: 'Trustee' },
    { value: 'beneficiary', label: 'Beneficiary' },
];

export default function CompanyStructureStep({ data, onChange, errors, businessType }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const addOwner = () => {
        const owners = data.owners || [];
        handleChange('owners', [...owners, {
            id: Date.now(),
            full_name: '',
            role: '',
            ownership_percentage: '',
            date_of_birth: '',
            nationality: '',
            address: '',
            id_number: '',
            is_ubo: false,
            is_pep: false,
        }]);
    };

    const updateOwner = (id, field, value) => {
        const owners = (data.owners || []).map(o => 
            o.id === id ? { ...o, [field]: value } : o
        );
        handleChange('owners', owners);
    };

    const removeOwner = (id) => {
        const owners = (data.owners || []).filter(o => o.id !== id);
        handleChange('owners', owners);
    };

    const addDirector = () => {
        const directors = data.directors || [];
        handleChange('directors', [...directors, {
            id: Date.now(),
            full_name: '',
            position: '',
            date_appointed: '',
            nationality: '',
            address: '',
        }]);
    };

    const updateDirector = (id, field, value) => {
        const directors = (data.directors || []).map(d => 
            d.id === id ? { ...d, [field]: value } : d
        );
        handleChange('directors', directors);
    };

    const removeDirector = (id) => {
        const directors = (data.directors || []).filter(d => d.id !== id);
        handleChange('directors', directors);
    };

    const totalOwnership = (data.owners || []).reduce((sum, o) => sum + (parseFloat(o.ownership_percentage) || 0), 0);
    const hasUBO = (data.owners || []).some(o => o.is_ubo || parseFloat(o.ownership_percentage) >= 25);

    const renderSoleProprietorFields = () => (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Sole Proprietor Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Owner Full Legal Name *</Label>
                    <Input
                        value={data.owner_full_name || ''}
                        onChange={(e) => handleChange('owner_full_name', e.target.value)}
                        placeholder="Enter full legal name"
                        className={errors?.owner_full_name ? 'border-red-500' : ''}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                        type="date"
                        value={data.owner_dob || ''}
                        onChange={(e) => handleChange('owner_dob', e.target.value)}
                        className={errors?.owner_dob ? 'border-red-500' : ''}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Social Security Number (Last 4) *</Label>
                    <Input
                        value={data.owner_ssn_last4 || ''}
                        onChange={(e) => handleChange('owner_ssn_last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="XXXX"
                        maxLength={4}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nationality *</Label>
                    <Input
                        value={data.owner_nationality || ''}
                        onChange={(e) => handleChange('owner_nationality', e.target.value)}
                        placeholder="e.g., United States"
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label>Residential Address *</Label>
                    <Input
                        value={data.owner_address || ''}
                        onChange={(e) => handleChange('owner_address', e.target.value)}
                        placeholder="Enter full residential address"
                    />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                    <Checkbox
                        id="owner_is_pep"
                        checked={data.owner_is_pep || false}
                        onCheckedChange={(checked) => handleChange('owner_is_pep', checked)}
                    />
                    <Label htmlFor="owner_is_pep" className="text-sm">
                        Politically Exposed Person (PEP) or related to a PEP
                    </Label>
                </div>
            </div>
        </Card>
    );

    const renderPartnershipFields = () => (
        <div className="space-y-4">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Partnership Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Partnership Type *</Label>
                        <Select 
                            value={data.partnership_type || ''} 
                            onValueChange={(val) => handleChange('partnership_type', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select partnership type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General Partnership</SelectItem>
                                <SelectItem value="limited">Limited Partnership (LP)</SelectItem>
                                <SelectItem value="llp">Limited Liability Partnership (LLP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Number of Partners *</Label>
                        <Input
                            type="number"
                            min="2"
                            value={data.number_of_partners || ''}
                            onChange={(e) => handleChange('number_of_partners', e.target.value)}
                            placeholder="Enter number"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Partnership Agreement Date</Label>
                        <Input
                            type="date"
                            value={data.partnership_agreement_date || ''}
                            onChange={(e) => handleChange('partnership_agreement_date', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Managing Partner Name *</Label>
                        <Input
                            value={data.managing_partner || ''}
                            onChange={(e) => handleChange('managing_partner', e.target.value)}
                            placeholder="Name of managing partner"
                        />
                    </div>
                </div>
            </Card>
            {renderOwnersSection('Partners', 'partner')}
        </div>
    );

    const renderLLCFields = () => (
        <div className="space-y-4">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">LLC Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>LLC Type *</Label>
                        <Select 
                            value={data.llc_type || ''} 
                            onValueChange={(val) => handleChange('llc_type', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select LLC type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single_member">Single-Member LLC</SelectItem>
                                <SelectItem value="multi_member">Multi-Member LLC</SelectItem>
                                <SelectItem value="series">Series LLC</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Number of Members *</Label>
                        <Input
                            type="number"
                            min="1"
                            value={data.number_of_members || ''}
                            onChange={(e) => handleChange('number_of_members', e.target.value)}
                            placeholder="Enter number"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Operating Agreement Date</Label>
                        <Input
                            type="date"
                            value={data.operating_agreement_date || ''}
                            onChange={(e) => handleChange('operating_agreement_date', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Managing Member Name *</Label>
                        <Input
                            value={data.managing_member || ''}
                            onChange={(e) => handleChange('managing_member', e.target.value)}
                            placeholder="Name of managing member"
                        />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                        <Checkbox
                            id="has_operating_agreement"
                            checked={data.has_operating_agreement || false}
                            onCheckedChange={(checked) => handleChange('has_operating_agreement', checked)}
                        />
                        <Label htmlFor="has_operating_agreement" className="text-sm">
                            We have a formal Operating Agreement in place
                        </Label>
                    </div>
                </div>
            </Card>
            {renderOwnersSection('Members', 'member')}
        </div>
    );

    const renderCorporationFields = () => (
        <div className="space-y-4">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Corporation Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Corporation Type *</Label>
                        <Select 
                            value={data.corporation_type || ''} 
                            onValueChange={(val) => handleChange('corporation_type', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select corporation type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="c_corp">C Corporation</SelectItem>
                                <SelectItem value="s_corp">S Corporation</SelectItem>
                                <SelectItem value="b_corp">B Corporation</SelectItem>
                                <SelectItem value="nonprofit">Non-Profit Corporation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Stock Authorized</Label>
                        <Input
                            type="number"
                            value={data.stock_authorized || ''}
                            onChange={(e) => handleChange('stock_authorized', e.target.value)}
                            placeholder="Number of authorized shares"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Articles of Incorporation Date</Label>
                        <Input
                            type="date"
                            value={data.articles_date || ''}
                            onChange={(e) => handleChange('articles_date', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Fiscal Year End</Label>
                        <Select 
                            value={data.fiscal_year_end || ''} 
                            onValueChange={(val) => handleChange('fiscal_year_end', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                                    <SelectItem key={month} value={String(i + 1)}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>
            {renderDirectorsSection()}
            {renderOwnersSection('Shareholders (25%+ ownership)', 'shareholder')}
        </div>
    );

    const renderDirectorsSection = () => (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Board of Directors</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addDirector} className="gap-1">
                    <Plus className="h-4 w-4" /> Add Director
                </Button>
            </div>

            {(data.directors || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No directors added yet</p>
                    <p className="text-sm">Click "Add Director" to add board members</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(data.directors || []).map((director, idx) => (
                        <div key={director.id} className="p-4 border rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">Director {idx + 1}</span>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeDirector(director.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    value={director.full_name}
                                    onChange={(e) => updateDirector(director.id, 'full_name', e.target.value)}
                                    placeholder="Full legal name"
                                />
                                <Select 
                                    value={director.position} 
                                    onValueChange={(val) => updateDirector(director.id, 'position', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chairman">Chairman</SelectItem>
                                        <SelectItem value="vice_chairman">Vice Chairman</SelectItem>
                                        <SelectItem value="director">Director</SelectItem>
                                        <SelectItem value="independent">Independent Director</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    value={director.date_appointed}
                                    onChange={(e) => updateDirector(director.id, 'date_appointed', e.target.value)}
                                    placeholder="Date appointed"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );

    const renderOwnersSection = (title, defaultRole) => (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-slate-500">Add all individuals with 25%+ ownership (UBOs)</p>
                    </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addOwner} className="gap-1">
                    <Plus className="h-4 w-4" /> Add Owner
                </Button>
            </div>

            {/* Ownership Summary */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-slate-100 rounded-lg">
                <div className="flex-1">
                    <p className="text-sm text-slate-600">Total Ownership Documented</p>
                    <p className={cn("text-lg font-semibold", totalOwnership > 100 ? "text-red-600" : "text-slate-900")}>
                        {totalOwnership.toFixed(1)}%
                    </p>
                </div>
                {totalOwnership > 100 && (
                    <Badge className="bg-red-100 text-red-700">Exceeds 100%</Badge>
                )}
                {hasUBO && totalOwnership <= 100 && (
                    <Badge className="bg-emerald-100 text-emerald-700">UBO Identified</Badge>
                )}
            </div>

            {(data.owners || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No owners added yet</p>
                    <p className="text-sm">Click "Add Owner" to add beneficial owners</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(data.owners || []).map((owner, idx) => (
                        <div key={owner.id} className="p-4 border rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Owner {idx + 1}</span>
                                    {parseFloat(owner.ownership_percentage) >= 25 && (
                                        <Badge className="bg-purple-100 text-purple-700 text-xs">UBO</Badge>
                                    )}
                                    {owner.is_pep && (
                                        <Badge className="bg-amber-100 text-amber-700 text-xs">PEP</Badge>
                                    )}
                                </div>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeOwner(owner.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                <Input
                                    value={owner.full_name}
                                    onChange={(e) => updateOwner(owner.id, 'full_name', e.target.value)}
                                    placeholder="Full legal name *"
                                />
                                <Select 
                                    value={owner.role || defaultRole} 
                                    onValueChange={(val) => updateOwner(owner.id, 'role', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ownershipRoles.map(role => (
                                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={owner.ownership_percentage}
                                    onChange={(e) => updateOwner(owner.id, 'ownership_percentage', e.target.value)}
                                    placeholder="Ownership % *"
                                />
                                <Input
                                    type="date"
                                    value={owner.date_of_birth}
                                    onChange={(e) => updateOwner(owner.id, 'date_of_birth', e.target.value)}
                                    placeholder="Date of birth"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <Input
                                    value={owner.nationality}
                                    onChange={(e) => updateOwner(owner.id, 'nationality', e.target.value)}
                                    placeholder="Nationality"
                                />
                                <Input
                                    value={owner.id_number}
                                    onChange={(e) => updateOwner(owner.id, 'id_number', e.target.value)}
                                    placeholder="ID/Passport number"
                                />
                                <Input
                                    value={owner.address}
                                    onChange={(e) => updateOwner(owner.id, 'address', e.target.value)}
                                    placeholder="Residential address"
                                />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`pep_${owner.id}`}
                                        checked={owner.is_pep || false}
                                        onCheckedChange={(checked) => updateOwner(owner.id, 'is_pep', checked)}
                                    />
                                    <Label htmlFor={`pep_${owner.id}`} className="text-sm">Politically Exposed Person (PEP)</Label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {errors?.owners && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3 w-3" /> {errors.owners}
                </p>
            )}
        </Card>
    );

    const renderNonprofitFields = () => (
        <div className="space-y-4">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Non-Profit Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Non-Profit Type *</Label>
                        <Select 
                            value={data.nonprofit_type || ''} 
                            onValueChange={(val) => handleChange('nonprofit_type', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="501c3">501(c)(3) - Charitable</SelectItem>
                                <SelectItem value="501c4">501(c)(4) - Social Welfare</SelectItem>
                                <SelectItem value="501c6">501(c)(6) - Business League</SelectItem>
                                <SelectItem value="501c7">501(c)(7) - Social Club</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>EIN (Employer Identification Number) *</Label>
                        <Input
                            value={data.ein || ''}
                            onChange={(e) => handleChange('ein', e.target.value)}
                            placeholder="XX-XXXXXXX"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tax Exempt Status Date</Label>
                        <Input
                            type="date"
                            value={data.tax_exempt_date || ''}
                            onChange={(e) => handleChange('tax_exempt_date', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Annual Revenue Range</Label>
                        <Select 
                            value={data.annual_revenue || ''} 
                            onValueChange={(val) => handleChange('annual_revenue', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="under_100k">Under $100,000</SelectItem>
                                <SelectItem value="100k_500k">$100,000 - $500,000</SelectItem>
                                <SelectItem value="500k_1m">$500,000 - $1,000,000</SelectItem>
                                <SelectItem value="1m_5m">$1,000,000 - $5,000,000</SelectItem>
                                <SelectItem value="over_5m">Over $5,000,000</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>
            {renderDirectorsSection()}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Company Structure</h2>
                    <p className="text-sm text-slate-500">
                        {businessType === 'sole_proprietorship' && 'Sole proprietor information'}
                        {businessType === 'partnership' && 'Partnership and partner details'}
                        {businessType === 'llc' && 'LLC members and ownership structure'}
                        {businessType === 'corporation' && 'Corporate structure, directors, and shareholders'}
                        {businessType === 'nonprofit' && 'Non-profit organization structure'}
                        {!businessType && 'Please select a business type first'}
                    </p>
                </div>
            </div>

            {!businessType && (
                <Card className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                    <h3 className="font-semibold text-lg mb-2">Business Type Required</h3>
                    <p className="text-slate-500">Please go back and select a business type in the Business Details step.</p>
                </Card>
            )}

            {businessType === 'sole_proprietorship' && renderSoleProprietorFields()}
            {businessType === 'partnership' && renderPartnershipFields()}
            {businessType === 'llc' && renderLLCFields()}
            {businessType === 'corporation' && renderCorporationFields()}
            {businessType === 'nonprofit' && renderNonprofitFields()}
        </div>
    );
}