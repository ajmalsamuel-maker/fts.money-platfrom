import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MERCHANT_SESSION_KEY = 'merchant_session';

export function useMerchantAuth() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = () => {
        const stored = localStorage.getItem('merchantSession');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Check if session is not older than 24 hours
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setSession(parsed);
                } else {
                    localStorage.removeItem('merchantSession');
                }
            } catch (e) {
                localStorage.removeItem('merchantSession');
            }
        }
        setLoading(false);
    };

    const login = (sessionData) => {
        localStorage.setItem('merchantSession', JSON.stringify(sessionData));
        setSession(sessionData);
    };

    const logout = () => {
        localStorage.removeItem('merchantSession');
        setSession(null);
        navigate(createPageUrl('MerchantLogin'));
    };

    const updateSession = (updates) => {
        const updated = { ...session, ...updates };
        localStorage.setItem('merchantSession', JSON.stringify(updated));
        setSession(updated);
    };

    return {
        user: session,
        session,
        loading,
        isAuthenticated: !!session,
        login,
        logout,
        updateSession
    };
}

export function getMerchantSession() {
    const stored = localStorage.getItem('merchantSession');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                return parsed;
            }
        } catch (e) {}
    }
    return null;
}

export function merchantLogout() {
    localStorage.removeItem('merchantSession');
    window.location.href = createPageUrl('MerchantLogin');
}