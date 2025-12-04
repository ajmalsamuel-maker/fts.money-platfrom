import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Link2, 
    Copy, 
    Check, 
    Mail, 
    Clock,
    ExternalLink,
    QrCode
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function SelfOnboardingUrlGenerator({ open, onOpenChange, onGenerate }) {
    const [copied, setCopied] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [formData, setFormData] = useState({
        merchant_email: '',
        expiry_days: '7',
        send_email: true,
    });

    const generateUrl = () => {
        const token = `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/MerchantSelfOnboarding?token=${token}`;
        setGeneratedUrl(url);
        
        if (onGenerate) {
            onGenerate({
                token,
                url,
                email: formData.merchant_email,
                expires: new Date(Date.now() + parseInt(formData.expiry_days) * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Generate Self-Onboarding Link
                    </DialogTitle>
                    <DialogDescription>
                        Create a unique URL for the merchant to complete their onboarding
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Merchant Email</Label>
                        <Input 
                            type="email"
                            value={formData.merchant_email}
                            onChange={(e) => setFormData({...formData, merchant_email: e.target.value})}
                            placeholder="merchant@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Link Expiry</Label>
                        <Select 
                            value={formData.expiry_days} 
                            onValueChange={(val) => setFormData({...formData, expiry_days: val})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {!generatedUrl && (
                        <Button onClick={generateUrl} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                            <Link2 className="h-4 w-4" />
                            Generate Onboarding Link
                        </Button>
                    )}

                    {generatedUrl && (
                        <Card className="p-4 bg-emerald-50 border-emerald-200">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-emerald-600" />
                                    <span className="font-medium text-emerald-700">Link Generated</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Input 
                                        value={generatedUrl} 
                                        readOnly 
                                        className="font-mono text-xs bg-white"
                                    />
                                    <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={copyToClipboard}
                                        className={copied ? "bg-emerald-100" : ""}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Expires in {formData.expiry_days} days
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="gap-1" asChild>
                                        <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3" />Preview
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Mail className="h-3 w-3" />Send Email
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <QrCode className="h-3 w-3" />QR Code
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="p-4 bg-slate-50">
                        <h4 className="font-medium text-sm mb-2">Onboarding Includes:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-500" />Business Details
                            </div>
                            <div className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-500" />LEI Verification
                            </div>
                            <div className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-500" />KYB via TheKYB
                            </div>
                            <div className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-500" />AML via AMLWatcher
                            </div>
                        </div>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => { onOpenChange(false); setGeneratedUrl(''); }}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}