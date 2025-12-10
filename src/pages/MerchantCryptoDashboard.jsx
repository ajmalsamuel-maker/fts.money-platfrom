import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import WalletMonitor from '@/components/crypto/WalletMonitor';
import CryptoAlertManager from '@/components/crypto/CryptoAlertManager';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function MerchantCryptoDashboard() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
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

    const { data: cryptoTransactions = [] } = useQuery({
        queryKey: ['crypto-transactions', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.Transaction.filter({ 
                merchant_id: user.merchant_id,
                payment_method: 'crypto_currency'
            }, '-created_date', 10);
        },
        enabled: !!user?.merchant_id
    });

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                currentPage="MerchantCryptoDashboard"
                user={user}
                merchant={merchant}
                mids={mids}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Bitcoin className="h-7 w-7 text-orange-600" />
                                Crypto Management
                            </h1>
                            <p className="text-slate-500">Monitor wallets, alerts, and crypto transactions</p>
                        </div>

                        <Tabs defaultValue="wallets" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="wallets">Wallet Balances</TabsTrigger>
                                <TabsTrigger value="alerts">Transaction Alerts</TabsTrigger>
                                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="wallets" className="space-y-4">
                                <WalletMonitor merchant_id={user?.merchant_id} />
                            </TabsContent>

                            <TabsContent value="alerts" className="space-y-4">
                                <CryptoAlertManager merchant_id={user?.merchant_id} />
                            </TabsContent>

                            <TabsContent value="transactions" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Crypto Transactions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {cryptoTransactions.length === 0 ? (
                                            <p className="text-center text-slate-500 py-8">No crypto transactions yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {cryptoTransactions.map(tx => (
                                                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {tx.type === 'sale' ? (
                                                                <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <ArrowUpRight className="h-5 w-5 text-blue-600" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium">{tx.crypto_asset || 'BTC'}</p>
                                                                <p className="text-sm text-slate-500">{tx.customer_email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-mono font-medium">{tx.amount}</p>
                                                            <p className="text-xs text-slate-500">{tx.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}