import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Lock, Unlock, Eye, EyeOff, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function CryptoCards() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    const [showNewDialog, setShowNewDialog] = useState(false);
    const [showDetails, setShowDetails] = useState({});

    if (!session) return null;

    const mockCards = [
        {
            id: 1,
            type: 'virtual',
            last4: '4532',
            currency: 'EUR',
            linkedWallet: 'Main EUR Wallet',
            status: 'active',
            balance: 2500,
            cardNumber: '4532 **** **** 4532',
            cvv: '123',
            expiry: '12/27',
            limit: 5000
        },
        {
            id: 2,
            type: 'physical',
            last4: '8921',
            currency: 'GBP',
            linkedWallet: 'GBP Trading',
            status: 'active',
            balance: 1800,
            cardNumber: '5412 **** **** 8921',
            cvv: '456',
            expiry: '03/28',
            limit: 10000
        }
    ];

    const toggleCardStatus = (cardId, currentStatus) => {
        const action = currentStatus === 'active' ? 'frozen' : 'activated';
        toast.success(`Card ${action} successfully`);
    };

    const toggleShowDetails = (cardId) => {
        setShowDetails(prev => ({...prev, [cardId]: !prev[cardId]}));
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoCards" userEmail={session.user.email} />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Payment Cards</h1>
                            <p className="text-slate-600 mt-1">Visa cards powered by Striga</p>
                        </div>
                        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Order New Card
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Order Payment Card</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Card Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select card type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="virtual">
                                                    <div>
                                                        <p className="font-medium">Virtual Card</p>
                                                        <p className="text-xs text-slate-500">Instant issuance • Free</p>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="physical">
                                                    <div>
                                                        <p className="font-medium">Physical Card</p>
                                                        <p className="text-xs text-slate-500">7-10 days delivery • €10 fee</p>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Link to Wallet</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose wallet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="eur">EUR Wallet (€15,000)</SelectItem>
                                                <SelectItem value="gbp">GBP Wallet (£8,500)</SelectItem>
                                                <SelectItem value="usd">USD Wallet ($12,300)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Monthly Spending Limit</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Set limit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5000">€5,000</SelectItem>
                                                <SelectItem value="10000">€10,000</SelectItem>
                                                <SelectItem value="25000">€25,000</SelectItem>
                                                <SelectItem value="50000">€50,000</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            <strong>Visa Debit Card:</strong> Accepted worldwide with real-time balance deduction from your linked wallet.
                                        </p>
                                    </div>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                                        Order Card
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-6">
                        {mockCards.map((card) => (
                            <Card key={card.id} className="overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center relative">
                                                <CreditCard className="w-8 h-8 text-white" />
                                                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-xs">
                                                    {card.type === 'virtual' ? 'Virtual' : 'Physical'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">Visa Card •••• {card.last4}</h3>
                                                <p className="text-sm text-slate-500">{card.linkedWallet}</p>
                                                <Badge className="mt-1 bg-green-100 text-green-700">Active</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Available Balance</p>
                                            <p className="text-2xl font-bold">{card.balance.toLocaleString()} {card.currency}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <Label className="text-xs text-slate-500">Card Number</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleShowDetails(card.id)}
                                                    className="h-6 px-2"
                                                >
                                                    {showDetails[card.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                </Button>
                                            </div>
                                            <p className="font-mono text-sm">
                                                {showDetails[card.id] ? card.cardNumber : `•••• •••• •••• ${card.last4}`}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <Label className="text-xs text-slate-500">CVV</Label>
                                            <p className="font-mono text-sm">
                                                {showDetails[card.id] ? card.cvv : '•••'}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <Label className="text-xs text-slate-500">Expiry</Label>
                                            <p className="font-mono text-sm">{card.expiry}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {card.status === 'active' ? 
                                                    <Unlock className="w-4 h-4 text-green-600" /> : 
                                                    <Lock className="w-4 h-4 text-red-600" />
                                                }
                                                <Label className="text-sm">Card {card.status === 'active' ? 'Active' : 'Frozen'}</Label>
                                                <Switch 
                                                    checked={card.status === 'active'}
                                                    onCheckedChange={() => toggleCardStatus(card.id, card.status)}
                                                />
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Limit: {card.limit.toLocaleString()} {card.currency}/month
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Transactions</Button>
                                            <Button variant="outline" size="sm">Settings</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Zap className="w-6 h-6 text-purple-600 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-purple-900">Instant Card Controls</h4>
                                    <p className="text-sm text-purple-700 mt-2">
                                        Freeze/unfreeze cards instantly, set spending limits, enable/disable contactless, online purchases, and ATM withdrawals in real-time.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}