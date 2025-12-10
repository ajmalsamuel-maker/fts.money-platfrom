import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Palette, Save, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantAppearance() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');
    const queryClient = useQueryClient();
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    const [colors, setColors] = useState({
        primary: '#3b82f6',
        secondary: '#06b6d4',
        accent: '#8b5cf6',
        sidebar: '#1e293b'
    });

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id,
        onSuccess: (data) => {
            if (data?.logo_url) {
                setLogoUrl(data.logo_url);
            }
        }
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setLogoUrl(file_url);
            
            // Update merchant entity with new logo
            await base44.entities.Merchant.update(merchant.id, { logo_url: file_url });
            queryClient.invalidateQueries(['merchant', user?.merchant_id]);
            
            toast.success('Logo uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const saveAppearance = useMutation({
        mutationFn: async () => {
            // Update merchant entity with theme colors
            await base44.entities.Merchant.update(merchant.id, {
                metadata: {
                    ...merchant.metadata,
                    theme: colors
                }
            });
            // Also save to localStorage for immediate effect
            localStorage.setItem('merchantTheme', JSON.stringify(colors));
            return colors;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['merchant']);
            toast.success('Appearance settings saved');
        },
        onError: () => {
            toast.error('Failed to save appearance settings');
        }
    });

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantAppearance" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Appearance Settings</h1>
                            <p className="text-slate-500">Customize your portal's look and feel</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    Merchant Logo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {logoUrl ? (
                                        <div className="w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                            <img src={logoUrl} alt="Merchant Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                                            <Image className="h-8 w-8 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Label htmlFor="logo-upload" className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit">
                                                <Upload className="h-4 w-4" />
                                                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                            </div>
                                        </Label>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploadingLogo}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            Recommended size: 200x200px. Max 2MB.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Color Scheme
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={colors.primary}
                                                onChange={(e) => setColors({...colors, primary: e.target.value})}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={colors.primary}
                                                onChange={(e) => setColors({...colors, primary: e.target.value})}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={colors.secondary}
                                                onChange={(e) => setColors({...colors, secondary: e.target.value})}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={colors.secondary}
                                                onChange={(e) => setColors({...colors, secondary: e.target.value})}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Accent Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={colors.accent}
                                                onChange={(e) => setColors({...colors, accent: e.target.value})}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={colors.accent}
                                                onChange={(e) => setColors({...colors, accent: e.target.value})}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sidebar Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={colors.sidebar}
                                                onChange={(e) => setColors({...colors, sidebar: e.target.value})}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={colors.sidebar}
                                                onChange={(e) => setColors({...colors, sidebar: e.target.value})}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t flex justify-end">
                                    <Button onClick={() => saveAppearance.mutate()}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-6 bg-white" style={{ borderColor: colors.primary }}>
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-20 h-10 rounded" style={{ backgroundColor: colors.primary }}></div>
                                        <div className="w-20 h-10 rounded" style={{ backgroundColor: colors.secondary }}></div>
                                        <div className="w-20 h-10 rounded" style={{ backgroundColor: colors.accent }}></div>
                                        <div className="w-20 h-10 rounded" style={{ backgroundColor: colors.sidebar }}></div>
                                    </div>
                                    <p className="text-sm text-slate-500">Color palette preview</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}