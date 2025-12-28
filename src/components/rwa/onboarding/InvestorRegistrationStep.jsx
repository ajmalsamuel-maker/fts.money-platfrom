import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, MapPin, Globe } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InvestorRegistrationStep({ data, onChange, errors }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                </h3>
                <p className="text-sm text-slate-600">Tell us about yourself to get started</p>
            </div>

            <Alert>
                <AlertDescription className="text-sm">
                    All information is encrypted and stored securely in compliance with data protection regulations.
                </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Full Legal Name *</Label>
                    <Input
                        placeholder="John Doe"
                        value={data.full_name || ''}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>}
                </div>

                <div>
                    <Label>Email Address *</Label>
                    <Input
                        type="email"
                        placeholder="john@example.com"
                        value={data.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <Label>Phone Number *</Label>
                    <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={data.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <Label>Date of Birth *</Label>
                    <Input
                        type="date"
                        value={data.date_of_birth || ''}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        className={errors.date_of_birth ? 'border-red-500' : ''}
                    />
                    {errors.date_of_birth && <p className="text-xs text-red-600 mt-1">{errors.date_of_birth}</p>}
                </div>
            </div>

            <div>
                <Label>Residential Address *</Label>
                <Input
                    placeholder="123 Main Street, Apt 4B"
                    value={data.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <Label>City *</Label>
                    <Input
                        placeholder="New York"
                        value={data.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>

                <div>
                    <Label>State/Province *</Label>
                    <Input
                        placeholder="NY"
                        value={data.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                </div>

                <div>
                    <Label>Postal Code *</Label>
                    <Input
                        placeholder="10001"
                        value={data.postal_code || ''}
                        onChange={(e) => handleChange('postal_code', e.target.value)}
                        className={errors.postal_code ? 'border-red-500' : ''}
                    />
                    {errors.postal_code && <p className="text-xs text-red-600 mt-1">{errors.postal_code}</p>}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Country/Jurisdiction *</Label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg"
                        value={data.jurisdiction || ''}
                        onChange={(e) => handleChange('jurisdiction', e.target.value)}
                    >
                        <option value="">Select country...</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="SG">Singapore</option>
                        <option value="HK">Hong Kong</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="CH">Switzerland</option>
                    </select>
                    {errors.jurisdiction && <p className="text-xs text-red-600 mt-1">{errors.jurisdiction}</p>}
                </div>

                <div>
                    <Label>Investor Type *</Label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg"
                        value={data.investor_type || ''}
                        onChange={(e) => handleChange('investor_type', e.target.value)}
                    >
                        <option value="">Select type...</option>
                        <option value="individual">Individual Investor</option>
                        <option value="institutional">Institutional Investor</option>
                        <option value="fund">Fund/Family Office</option>
                    </select>
                    {errors.investor_type && <p className="text-xs text-red-600 mt-1">{errors.investor_type}</p>}
                </div>
            </div>

            <div>
                <Label>Password *</Label>
                <Input
                    type="password"
                    placeholder="Create a secure password"
                    value={data.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 8 characters, include uppercase, lowercase, and numbers</p>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>
        </div>
    );
}