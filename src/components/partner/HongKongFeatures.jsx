import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, CreditCard, Shield, QrCode } from 'lucide-react';

export default function HongKongFeatures({ partnerId }) {
    const [language, setLanguage] = useState('en');
    const [enabledPayments, setEnabledPayments] = useState({
        fps: true,
        payme: true,
        alipay: true,
        wechat: true,
        octopus: false
    });

    const paymentMethods = [
        { id: 'fps', name: 'FPS (Faster Payment System)', icon: '🏦', available: true },
        { id: 'payme', name: 'PayMe by HSBC', icon: '💳', available: true },
        { id: 'alipay', name: 'Alipay HK', icon: '💰', available: true },
        { id: 'wechat', name: 'WeChat Pay HK', icon: '💚', available: true },
        { id: 'octopus', name: 'Octopus Card', icon: '🐙', available: false }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Hong Kong Localization</h2>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Interface Language</p>
                                <p className="text-sm text-gray-600">Choose your preferred language</p>
                            </div>
                            <select 
                                className="border rounded-md px-3 py-2"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="zh-HK">繁體中文 (Traditional Chinese)</option>
                            </select>
                        </div>

                        <div className="pt-3 border-t">
                            <div className="flex items-center gap-2">
                                <Badge>Current: {language === 'en' ? 'English' : '繁體中文'}</Badge>
                                <Badge variant="outline">Hong Kong Region</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Hong Kong Payment Methods
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {paymentMethods.map(method => (
                            <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{method.icon}</span>
                                    <div>
                                        <p className="font-semibold">{method.name}</p>
                                        {!method.available && (
                                            <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    checked={enabledPayments[method.id]}
                                    onCheckedChange={(checked) => setEnabledPayments({...enabledPayments, [method.id]: checked})}
                                    disabled={!method.available}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        HKQR Standard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">HKQR Compliant QR Codes</p>
                                <p className="text-sm text-gray-600">Hong Kong standard for retail payments</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="w-32 h-32 mx-auto bg-white border-2 rounded-lg flex items-center justify-center">
                                <QrCode className="h-16 w-16 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">HKQR-compliant QR code</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Compliance & Privacy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">PDPO Compliance</p>
                            <p className="text-sm text-gray-600">Personal Data (Privacy) Ordinance</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Business Registration</p>
                            <p className="text-sm text-gray-600">HK BR Number verification</p>
                        </div>
                        <Badge variant="outline">Verified</Badge>
                    </div>

                    <div className="pt-3 border-t">
                        <Button variant="outline" className="w-full">
                            View Compliance Documentation
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Regional Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-semibold">HKD (Hong Kong Dollar)</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Timezone:</span>
                        <span className="font-semibold">GMT+8 (Hong Kong)</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Date Format:</span>
                        <span className="font-semibold">DD/MM/YYYY</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Number Format:</span>
                        <span className="font-semibold">1,234.56</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}