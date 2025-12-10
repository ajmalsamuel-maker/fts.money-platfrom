import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export function useVTAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const session = getVTSession();
        if (session) {
            validateSession(session);
        } else {
            setLoading(false);
            navigate(createPageUrl('VirtualTerminalLogin'));
        }
    }, []);

    const validateSession = async (session) => {
        try {
            const { data } = await base44.functions.invoke('vtAuth', {
                action: 'validate',
                email: session.email
            });

            if (data.success) {
                setUser(session);
                setIsAuthenticated(true);
            } else {
                vtLogout();
            }
        } catch (error) {
            vtLogout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await base44.functions.invoke('vtAuth', {
            action: 'login',
            email,
            password
        });

        if (data.success) {
            localStorage.setItem('vt_session', JSON.stringify(data.session));
            setUser(data.session);
            setIsAuthenticated(true);
            return data;
        }
        throw new Error(data.error || 'Login failed');
    };

    const logout = () => {
        vtLogout();
    };

    const updateSession = (updates) => {
        const session = getVTSession();
        if (session) {
            const updated = { ...session, ...updates };
            localStorage.setItem('vt_session', JSON.stringify(updated));
            setUser(updated);
        }
    };

    return { user, loading, isAuthenticated, login, logout, updateSession };
}

export function getVTSession() {
    const session = localStorage.getItem('vt_session');
    if (!session) return null;
    
    try {
        const parsed = JSON.parse(session);
        if (Date.now() - parsed.timestamp > 8 * 60 * 60 * 1000) {
            localStorage.removeItem('vt_session');
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function vtLogout() {
    localStorage.removeItem('vt_session');
    window.location.href = createPageUrl('VirtualTerminalLogin');
}