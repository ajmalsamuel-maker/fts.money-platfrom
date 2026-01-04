import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FTS_COLORS, FTS_GRADIENTS, FTS_LOGOS } from '@/components/community/FTSBrandColors';
import { Building2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function PSPLogin() {
    const [pspCode, setPspCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkComplete, setCheckComplete] = React.useState(false);
    
    React.useEffect(() => {
        console.log('🔐 PSPLogin: Checking for existing session...');
        const existingSession = localStorage.getItem('staff_session');
        console.log('🔐 PSPLogin: Session found:', !!existingSession);
        
        if (existingSession) {
            try {
                const session = JSON.parse(existingSession);
                console.log('🔐 PSPLogin: Session parsed:', session);
                if (session?.psp_code) {
                    console.log('🔐 PSPLogin: Valid session, navigating to Dashboard...');
                    window.location.replace('/Dashboard');
                    return;
                }
            } catch (err) {
                console.error('🔐 PSPLogin: Session parse error:', err);
                localStorage.removeItem('staff_session');
            }
        }
        setCheckComplete(true);
    }, []);
    
    if (!checkComplete) {
        return null;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { data } = await base44.functions.invoke('pspAuth', {
                action: 'login',
                email: email,
                password: password,
                psp_code: pspCode.trim()
            });

            if (data.success) {
                const sessionData = {
                    email: data.session.email,
                    full_name: data.session.full_name,
                    role: data.session.role,
                    user_id: data.session.user_id,
                    psp_code: pspCode.toUpperCase().trim(),
                    schema: data.session.schema
                };

                console.log('✅ PSPLogin: Login successful, saving session and redirecting...');
                localStorage.setItem('staff_session', JSON.stringify(sessionData));
                window.location.replace('/Dashboard');
                return;
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Login error: ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
            {/* Language Selector - Top Right Corner */}
            <div className="absolute top-4 right-6 z-20">
                <LanguageSwitcher variant="select" showLabel={false} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                {/* Wave Background */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3">
                    <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="url(#wave-gradient)" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <defs>
                            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#0066CC', stopOpacity: 0.8 }} />
                                <stop offset="50%" style={{ stopColor: '#00BFFF', stopOpacity: 0.8 }} />
                                <stop offset="100%" style={{ stopColor: '#87CEEB', stopOpacity: 0.7 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                
                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-6">
                        <div className="inline-flex flex-col items-center gap-1 mb-3">
                            <img 
                                src={FTS_LOGOS.symbol} 
                                alt="FTS.Money" 
                                className="h-32 w-32 object-contain"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    PSP Portal
                                </h1>
                                <p className="text-lg mt-1" style={{ color: FTS_COLORS.aqua }}>
                                    Fluid global payments
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-700 text-lg font-medium">Payment Service Provider Access</p>
                    </div>

                    <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-xl">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                PSP Sign In
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                
                                <div>
                                    <Label>PSP Code</Label>
                                    <Input
                                        type="text"
                                        value={pspCode}
                                        onChange={(e) => setPspCode(e.target.value.toUpperCase())}
                                        placeholder="YOUR PSP CODE"
                                        className="font-mono"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full text-white"
                                    style={{ background: FTS_GRADIENTS.dark1 }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In to PSP Portal
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
        </div>
    );
}