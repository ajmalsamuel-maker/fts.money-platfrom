import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '2rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: '#0f172a' }}>PSP Login</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>Sign in to your PSP account</p>
                
                {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>PSP Code</label>
                        <input
                            type="text"
                            value={pspCode}
                            onChange={(e) => setPspCode(e.target.value.toUpperCase())}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="YOUR PSP CODE"
                            required
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}