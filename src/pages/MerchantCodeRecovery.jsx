import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, AlertCircle, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MerchantCodeRecovery() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Query merchant users by email
            const users = await base44.entities.MerchantUser.filter({ email });

            if (!users || users.length === 0) {
                setError('No merchant account found with this email address.');
                setLoading(false);
                return;
            }

            // Get unique merchant codes for this email
            const merchantCodes = [...new Set(users.map(u => u.merchant_code))];
            const merchantNames = [...new Set(users.map(u => u.merchant_name))];

            // Send email with merchant codes
            await base44.integrations.Core.SendEmail({
                to: email,
                subject: 'Your Merchant Portal Codes',
                body: `
Hello,

You requested your merchant code(s) for the Merchant Portal.

Your Merchant Code(s):
${merchantCodes.map((code, i) => `• ${code} - ${merchantNames[i] || 'Merchant'}`).join('\n')}

To log in, visit the Merchant Portal and use:
- Merchant Code: (any of the above)
- Email: ${email}
- Password: Your password

If you didn't request this information, please contact support immediately.

Best regards,
PSP Portal Team
                `
            });

            setSuccess(true);
        } catch (err) {
            console.error('Recovery error:', err);
            setError('Failed to send recovery email. Please try again or contact support.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent your merchant code(s) to {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">Email sent successfully</p>
                                    <p className="text-blue-700">
                                        Check your inbox and spam folder. The email contains all merchant codes associated with your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <Link to={createPageUrl('MerchantLogin')} className="block">
                            <Button className="w-full" variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Merchant Code?</CardTitle>
                    <CardDescription>
                        Enter your email to receive your merchant code(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="merchant@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-slate-500">
                                Enter the email address associated with your merchant account
                            </p>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Merchant Code
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <Link 
                                to={createPageUrl('MerchantLogin')} 
                                className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Back to Login
                            </Link>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        <p>Need help? Contact your PSP administrator</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}