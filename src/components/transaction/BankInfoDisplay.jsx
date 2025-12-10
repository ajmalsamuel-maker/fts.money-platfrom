import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Globe, Loader2 } from 'lucide-react';

export default function BankInfoDisplay({ cardNumber, bin }) {
    const [bankInfo, setBankInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBankInfo = async () => {
            if (!cardNumber && !bin) return;

            // Extract BIN from card number (first 6-8 digits)
            const binToLookup = bin || cardNumber?.replace(/\D/g, '').slice(0, 6);
            if (!binToLookup || binToLookup.length < 6) return;

            setLoading(true);
            try {
                const response = await base44.functions.invoke('binLookup', {
                    action: 'lookup',
                    bin: binToLookup
                });

                if (response.data?.success && response.data?.data) {
                    setBankInfo(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch bank info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBankInfo();
    }, [cardNumber, bin]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading bank info...</span>
            </div>
        );
    }

    if (!bankInfo) return null;

    return (
        <div className="space-y-2">
            {bankInfo.bank_name && (
                <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                        <div className="text-sm font-medium text-slate-900">{bankInfo.bank_name}</div>
                        {bankInfo.bank_city && (
                            <div className="text-xs text-slate-500">{bankInfo.bank_city}</div>
                        )}
                    </div>
                </div>
            )}
            {bankInfo.country_name && (
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{bankInfo.country_name}</span>
                </div>
            )}
            {bankInfo.type && (
                <div className="text-xs text-slate-500">
                    Card Type: <span className="capitalize font-medium">{bankInfo.type}</span>
                    {bankInfo.prepaid && <span className="ml-2 text-amber-600">(Prepaid)</span>}
                </div>
            )}
        </div>
    );
}