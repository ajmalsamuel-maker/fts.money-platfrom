import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { Settings, Building2, Palette, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function RWAProviderSettings() {
    const { provider } = useRWAProviderAuth();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        company_name: provider?.company_name || '',
        portal_url: provider?.portal_url || '',
        logo_url: provider?.logo_url || '',
        primary_color: provider?.primary_color || '#3b82f6'
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.RWAProvider.update(provider.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['rwa-provider']);
            toast.success('Settings updated successfully');
            
            // Update local storage
            const session = JSON.parse(localStorage.getItem('rwa_provider_session'));
            localStorage.setItem('rwa_provider_session', JSON.stringify({
                ...session,
                ...formData
            }));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderSettings"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>

                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Company Name</Label>
                                    <Input
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        placeholder="Your Company Name"
                                    />
                                </div>
                                <div>
                                    <Label>Provider Code</Label>
                                    <Input
                                        value={provider?.provider_code}
                                        disabled
                                        className="bg-slate-100"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Provider code cannot be changed</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Portal Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Portal URL</Label>
                                    <Input
                                        value={formData.portal_url}
                                        onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
                                        placeholder="https://tokenize.yourcompany.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Custom domain for your tokenization platform</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Branding
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Logo URL</Label>
                                    <Input
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div>
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            className="w-20 h-10"
                                        />
                                        <Input
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                </div>
                                {formData.logo_url && (
                                    <div>
                                        <Label>Logo Preview</Label>
                                        <div className="border rounded-lg p-4 bg-white">
                                            <img src={formData.logo_url} alt="Logo" className="h-12 object-contain" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}