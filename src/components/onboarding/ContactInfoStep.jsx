import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, AlertCircle, Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const roles = [
    { value: 'owner', label: 'Owner / Director' },
    { value: 'ceo', label: 'CEO' },
    { value: 'cfo', label: 'CFO' },
    { value: 'operations', label: 'Operations Manager' },
    { value: 'technical', label: 'Technical Contact' },
    { value: 'finance', label: 'Finance Contact' },
    { value: 'compliance', label: 'Compliance Officer' },
];

export default function ContactInfoStep({ data, onChange, errors }) {
    const contacts = data.contacts || [{ id: 1, is_primary: true }];

    const handleContactChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        onChange({ ...data, contacts: newContacts });
    };

    const addContact = () => {
        const newContact = { id: Date.now(), is_primary: false };
        onChange({ ...data, contacts: [...contacts, newContact] });
    };

    const removeContact = (index) => {
        if (contacts.length > 1) {
            const newContacts = contacts.filter((_, i) => i !== index);
            onChange({ ...data, contacts: newContacts });
        }
    };

    const getContactErrors = (index) => {
        return errors?.contacts?.[index] || {};
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Contact Information</h2>
                    <p className="text-sm text-slate-500">Add your primary and additional contacts</p>
                </div>
            </div>

            <div className="space-y-4">
                {contacts.map((contact, index) => {
                    const contactErrors = getContactErrors(index);
                    return (
                        <Card key={contact.id} className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-slate-900">
                                        {contact.is_primary ? 'Primary Contact' : `Additional Contact ${index}`}
                                    </h3>
                                    {contact.is_primary && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            Required
                                        </span>
                                    )}
                                </div>
                                {!contact.is_primary && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeContact(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        value={contact.full_name || ''}
                                        onChange={(e) => handleContactChange(index, 'full_name', e.target.value)}
                                        placeholder="Enter full name"
                                        className={contactErrors.full_name ? 'border-red-500' : ''}
                                    />
                                    {contactErrors.full_name && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {contactErrors.full_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Role *</Label>
                                    <Select 
                                        value={contact.role || ''} 
                                        onValueChange={(val) => handleContactChange(index, 'role', val)}
                                    >
                                        <SelectTrigger className={contactErrors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {contactErrors.role && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {contactErrors.role}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address *</Label>
                                    <Input
                                        type="email"
                                        value={contact.email || ''}
                                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                        placeholder="email@company.com"
                                        className={contactErrors.email ? 'border-red-500' : ''}
                                    />
                                    {contactErrors.email && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {contactErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number *</Label>
                                    <Input
                                        value={contact.phone || ''}
                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                        placeholder="+1 234 567 8900"
                                        className={contactErrors.phone ? 'border-red-500' : ''}
                                    />
                                    {contactErrors.phone && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {contactErrors.phone}
                                        </p>
                                    )}
                                </div>

                                {contact.is_primary && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Date of Birth *</Label>
                                            <Input
                                                type="date"
                                                value={contact.date_of_birth || ''}
                                                onChange={(e) => handleContactChange(index, 'date_of_birth', e.target.value)}
                                                className={contactErrors.date_of_birth ? 'border-red-500' : ''}
                                            />
                                            {contactErrors.date_of_birth && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {contactErrors.date_of_birth}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nationality *</Label>
                                            <Input
                                                value={contact.nationality || ''}
                                                onChange={(e) => handleContactChange(index, 'nationality', e.target.value)}
                                                placeholder="Enter nationality"
                                                className={contactErrors.nationality ? 'border-red-500' : ''}
                                            />
                                            {contactErrors.nationality && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {contactErrors.nationality}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Button
                variant="outline"
                onClick={addContact}
                className="w-full gap-2"
            >
                <Plus className="h-4 w-4" />
                Add Another Contact
            </Button>
        </div>
    );
}