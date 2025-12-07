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
        const stored = localStorage.getItem(MERCHANT_SESSION_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Check if session is not older than 24 hours
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setSession(parsed);
                } else {
                    logout();
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    };

    const login = (sessionData) => {
        localStorage.setItem(MERCHANT_SESSION_KEY, JSON.stringify(sessionData));
        setSession(sessionData);
    };

    const logout = () => {
        localStorage.removeItem(MERCHANT_SESSION_KEY);
        setSession(null);
        navigate(createPageUrl('MerchantLogin'));
    };

    const updateSession = (updates) => {
        const updated = { ...session, ...updates };
        localStorage.setItem(MERCHANT_SESSION_KEY, JSON.stringify(updated));
        setSession(updated);
    };

    return {
        session,
        loading,
        isAuthenticated: !!session,
        login,
        logout,
        updateSession
    };
}

export function getMerchantSession() {
    const stored = localStorage.getItem(MERCHANT_SESSION_KEY);
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
    localStorage.removeItem(MERCHANT_SESSION_KEY);
    window.location.href = createPageUrl('MerchantLogin');
}