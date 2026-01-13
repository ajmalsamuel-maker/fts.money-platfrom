import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, Upload, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyPortalSettings() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('loyalty_customer_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [portalSettings, setPortalSettings] = useState({
        logo_url: '',
        primary_color: '#9333ea',
        secondary_color: '#3b82f6',
        portal_name: 'Impact Loyalty Cloud',
        welcome_message: 'Welcome to your loyalty program'
    });
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const saveSettingsMutation = useMutation({
        mutationFn: async (settings) => {
            // Save settings to the customer record
            await base44.entities.LoyaltyCustomer.update(session.id, {
                portal_settings: settings
            });
        },
        onSuccess: () => {
            toast.success('Portal settings saved successfully!');
            // Update local session
            const updatedSession = { ...session, portal_settings: portalSettings };
            localStorage.setItem('loyalty_customer_session', JSON.stringify(updatedSession));
            queryClient.invalidateQueries(['my-programs']);
        }
    });

    const handleSave = () => {
        saveSettingsMutation.mutate(portalSettings);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setPortalSettings({ ...portalSettings, logo_url: file_url });
            toast.success('Logo uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload logo');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyPortalSettings"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Portal Settings</h1>
                    </div>
                    <Button onClick={handleSave} className="bg-purple-600" disabled={saveSettingsMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />Save Changes
                    </Button>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Branding Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-purple-600" />
                                Branding & Logo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Portal Name</Label>
                                <Input 
                                    value={portalSettings.portal_name}
                                    onChange={(e) => setPortalSettings({...portalSettings, portal_name: e.target.value})}
                                    placeholder="Impact Loyalty Cloud"
                                />
                            </div>
                            
                            <div>
                                <Label>Logo Upload</Label>
                                <div className="flex items-center gap-4">
                                    {portalSettings.logo_url && (
                                        <img src={portalSettings.logo_url} alt="Logo" className="h-16 w-16 object-contain border rounded-lg" />
                                    )}
                                    <label className="cursor-pointer">
                                        <Button variant="outline" asChild>
                                            <span>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Logo
                                            </span>
                                        </Button>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Recommended: Square image, min 256x256px</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Color Customization */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Color Scheme</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="color" 
                                            value={portalSettings.primary_color}
                                            onChange={(e) => setPortalSettings({...portalSettings, primary_color: e.target.value})}
                                            className="w-16 h-10"
                                        />
                                        <Input 
                                            value={portalSettings.primary_color}
                                            onChange={(e) => setPortalSettings({...portalSettings, primary_color: e.target.value})}
                                            placeholder="#9333ea"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Secondary Color</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="color" 
                                            value={portalSettings.secondary_color}
                                            onChange={(e) => setPortalSettings({...portalSettings, secondary_color: e.target.value})}
                                            className="w-16 h-10"
                                        />
                                        <Input 
                                            value={portalSettings.secondary_color}
                                            onChange={(e) => setPortalSettings({...portalSettings, secondary_color: e.target.value})}
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r rounded-lg" style={{ 
                                backgroundImage: `linear-gradient(to right, ${portalSettings.primary_color}, ${portalSettings.secondary_color})` 
                            }}>
                                <p className="text-white font-semibold">Preview: Color Gradient</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Welcome Message */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label>Custom Message</Label>
                            <Input 
                                value={portalSettings.welcome_message}
                                onChange={(e) => setPortalSettings({...portalSettings, welcome_message: e.target.value})}
                                placeholder="Welcome to your loyalty program"
                            />
                            <p className="text-xs text-slate-500 mt-1">Displayed to participants when they log in</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}