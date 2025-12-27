import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CryptoIBANs() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    const [showNewDialog, setShowNewDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!session) return null;

    const mockIBANs = [
        { 
            id: 1, 
            iban: 'LT12 3456 7890 1234 5678', 
            currency: 'EUR', 
            wallet: 'Main EUR Wallet',
            status: 'active',
            balance: 15000,
            bic: 'STRIGALT'
        },
        { 
            id: 2, 
            iban: 'LT98 7654 3210 9876 5432', 
            currency: 'GBP', 
            wallet: 'GBP Trading',
            status: 'active',
            balance: 8500,
            bic: 'STRIGALT'
        },
        { 
            id: 3, 
            iban: 'LT45 1111 2222 3333 4444', 
            currency: 'USD', 
            wallet: 'USD Operations',
            status: 'pending',
            balance: 0,
            bic: 'STRIGALT'
        }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('IBAN copied to clipboard');
    };

    const handleCreateIBAN = async () => {
        setLoading(true);
        // TODO: Integrate with Striga API
        setTimeout(() => {
            setLoading(false);
            setShowNewDialog(false);
            toast.success('Virtual IBAN request submitted - pending verification');
        }, 1500);
    };

    const getStatusBadge = (status) => {
        const configs = {
            active: { icon: CheckCircle, className: 'bg-green-100 text-green-700', label: 'Active' },
            pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
            suspended: { icon: AlertCircle, className: 'bg-red-100 text-red-700', label: 'Suspended' }
        };
        const config = configs[status] || configs.pending;
        const Icon = config.icon;
        return (
            <Badge className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoIBANs" userEmail={session.user.email} />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Virtual IBANs</h1>
                            <p className="text-slate-600 mt-1">Striga-powered European banking rails</p>
                        </div>
                        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Request New IBAN
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request Virtual IBAN</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Select Wallet</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose wallet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="eur">EUR Wallet</SelectItem>
                                                <SelectItem value="gbp">GBP Wallet</SelectItem>
                                                <SelectItem value="usd">USD Wallet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Currency</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Virtual IBANs are issued through Striga's Lithuanian banking license.
                                            Processing typically takes 24-48 hours after KYC verification.
                                        </p>
                                    </div>
                                    <Button 
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                                        onClick={handleCreateIBAN}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Request IBAN'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-6">
                        {mockIBANs.map((iban) => (
                            <Card key={iban.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{iban.wallet}</h3>
                                                <p className="text-sm text-slate-500">{iban.currency} Account</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(iban.status)}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-xs text-slate-500">IBAN</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(iban.iban.replace(/\s/g, ''))}
                                                    className="h-6 px-2"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <p className="font-mono font-semibold">{iban.iban}</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-xs text-slate-500">BIC/SWIFT</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(iban.bic)}
                                                    className="h-6 px-2"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <p className="font-mono font-semibold">{iban.bic}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-500">Current Balance</p>
                                                <p className="text-2xl font-bold">{iban.balance.toLocaleString()} {iban.currency}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">View Transactions</Button>
                                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                                    Send Payment
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-6 h-6 text-blue-600 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">About Virtual IBANs</h4>
                                    <p className="text-sm text-blue-700 mt-2">
                                        Virtual IBANs are issued through Striga's Lithuanian banking license, enabling you to:
                                    </p>
                                    <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
                                        <li>• Receive SEPA and SWIFT payments</li>
                                        <li>• Send payments to any European bank account</li>
                                        <li>• Hold multi-currency balances (EUR, GBP, USD)</li>
                                        <li>• Full regulatory compliance under EU banking rules</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}