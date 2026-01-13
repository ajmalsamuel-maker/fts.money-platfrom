import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Code, Key, Webhook, FileText, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function POSIntegration({ partnerId }) {
    const [apiKey] = useState('pk_live_' + Math.random().toString(36).substring(2, 15));
    const [secretKey] = useState('sk_live_' + Math.random().toString(36).substring(2, 15));
    const [showSecret, setShowSecret] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">POS Integration & API</h2>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Keys
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Public API Key</Label>
                        <div className="flex gap-2 mt-1">
                            <Input value={apiKey} readOnly className="font-mono text-sm" />
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey, 'API Key')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Use this for client-side integrations</p>
                    </div>

                    <div>
                        <Label>Secret Key</Label>
                        <div className="flex gap-2 mt-1">
                            <Input 
                                value={showSecret ? secretKey : '••••••••••••••••••••••••'} 
                                readOnly 
                                className="font-mono text-sm" 
                                type={showSecret ? 'text' : 'password'}
                            />
                            <Button variant="outline" size="icon" onClick={() => setShowSecret(!showSecret)}>
                                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(secretKey, 'Secret Key')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Keep this secret! Use only on server-side</p>
                    </div>

                    <div className="pt-2">
                        <Badge variant="outline" className="text-xs">Environment: Production</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Webhook Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Webhook URL</Label>
                        <Input 
                            placeholder="https://your-pos-system.com/webhook"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Receive real-time notifications for redemptions</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Events to Subscribe</Label>
                        <div className="space-y-2">
                            {['redemption.created', 'redemption.approved', 'redemption.fulfilled', 'redemption.cancelled'].map(event => (
                                <label key={event} className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-sm font-mono">{event}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button>Save Webhook Configuration</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Quick Start Integration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre>{`// Initialize SDK
const loyaltySDK = require('@loyalty/sdk');
const client = new loyaltySDK.Client('${apiKey}');

// Verify redemption at POS
async function verifyRedemption(qrCode) {
  const redemption = await client.redemptions.verify(qrCode);
  
  if (redemption.status === 'approved') {
    await client.redemptions.fulfill(redemption.id);
    return { success: true, reward: redemption.reward };
  }
  
  return { success: false };
}`}</pre>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full API Documentation
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Supported POS Systems</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Square', 'Shopify', 'Vend', 'Lightspeed', 'Toast POS', 'Custom'].map(pos => (
                            <div key={pos} className="border rounded-lg p-3 text-center">
                                <p className="font-semibold text-sm">{pos}</p>
                                <Button size="sm" variant="link" className="mt-1 text-xs">Integration Guide</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}