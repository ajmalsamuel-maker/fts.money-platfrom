import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Bitcoin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CryptoWallets() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    const mockWallets = [
        { id: 1, asset: 'BTC', balance: 0.5, usdValue: 21500, address: '1A1zP1...3DWyi' },
        { id: 2, asset: 'ETH', balance: 12.4, usdValue: 29800, address: '0x742d...4B0A' },
        { id: 3, asset: 'USDC', balance: 50000, usdValue: 50000, address: '0x8BA1...9F3C' }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoWallets" userEmail={session.user.email} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Crypto Wallets</h1>
                                <p className="text-slate-600">Manage your cryptocurrency wallets</p>
                            </div>
                            <Button 
                                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                                onClick={() => alert('Wallet creation feature coming soon - will integrate with Striga API')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Wallet
                            </Button>
                        </div>

                        <div className="grid gap-6">
                            {mockWallets.map((wallet) => (
                                <Card key={wallet.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                    <Bitcoin className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{wallet.asset}</h3>
                                                    <p className="text-sm text-slate-500">{wallet.address}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{wallet.balance} {wallet.asset}</div>
                                                <div className="text-sm text-slate-500">${wallet.usdValue.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}