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
import { Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantAppearance() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');
    const queryClient = useQueryClient();

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
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const saveAppearance = useMutation({
        mutationFn: async () => {
            // Save to localStorage for now
            localStorage.setItem('merchantTheme', JSON.stringify(colors));
            return colors;
        },
        onSuccess: () => {
            toast.success('Appearance settings saved');
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