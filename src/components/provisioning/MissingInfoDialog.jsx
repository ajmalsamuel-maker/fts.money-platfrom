import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MissingInfoDialog({ open, onClose, onSubmit, psp, error, step }) {
    const [formData, setFormData] = useState({
        owner_email: psp?.owner_email || '',
        psp_name: psp?.psp_name || '',
        contact_email: psp?.contact_email || '',
        ...psp
    });
    
    const isDuplicateError = error?.includes('duplicate') || error?.includes('already exists');

    const handleSubmit = () => {
        onSubmit(formData);
    };

    const getStepRequirements = () => {
        switch(step) {
            case 'security':
                return [
                    { field: 'owner_email', label: 'Owner Email', type: 'email', required: true },
                    { field: 'psp_name', label: 'PSP Name', type: 'text', required: true }
                ];
            case 'domain':
                return [
                    { field: 'domain', label: 'Domain', type: 'text', required: false },
                    { field: 'subdomain', label: 'Subdomain', type: 'text', required: true }
                ];
            default:
                return [
                    { field: 'owner_email', label: 'Owner Email', type: 'email', required: true }
                ];
        }
    };

    const fields = getStepRequirements();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        {isDuplicateError ? 'User Already Exists' : 'Missing Information'}
                    </DialogTitle>
                    <DialogDescription>
                        {isDuplicateError 
                            ? 'This email is already registered. You can continue anyway (the existing user will be used) or change the email address.'
                            : 'Please provide the required information to complete this provisioning step.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-900 text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-4">
                    {fields.map(field => (
                        <div key={field.field} className="space-y-2">
                            <Label htmlFor={field.field}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                                id={field.field}
                                type={field.type}
                                value={formData[field.field] || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [field.field]: e.target.value
                                })}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {isDuplicateError && (
                        <Button 
                            onClick={() => {
                                // Submit with existing data - backend will return existing user
                                onSubmit(formData);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Continue with Existing User
                        </Button>
                    )}
                    <Button 
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isDuplicateError ? 'Update & Retry' : 'Continue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}