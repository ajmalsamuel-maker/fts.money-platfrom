import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import TimezoneSettings from '@/components/settings/TimezoneSettings';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function MerchantSettings() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedMID, setSelectedMID] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

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
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const updateMerchantMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.Merchant.update(merchant.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant'] });
            toast.success('Settings saved successfully!');
        },
        onError: (error) => {
            toast.error('Failed to save settings: ' + error.message);
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <Toaster position="top-right" />
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantSettings"
                user={user}
                merchant={merchant}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />

                <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                            <p className="text-sm text-slate-500 mt-1">Configure your merchant portal preferences</p>
                        </div>

                        <TimezoneSettings
                            currentCountry={merchant?.country || 'US'}
                            currentTimezone={merchant?.timezone || 'UTC'}
                            onSave={async ({ country, timezone }) => {
                                await updateMerchantMutation.mutateAsync({
                                    country,
                                    timezone
                                });
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}