import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function useStaffAuth() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const session = localStorage.getItem('staff_session');
        
        if (!session) {
            setIsLoading(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            const parsed = JSON.parse(session);
            
            if (parsed.expires < Date.now()) {
                // Session expired
                localStorage.removeItem('staff_session');
                setIsLoading(false);
                setIsAuthenticated(false);
                return;
            }

            setUser(parsed);
            setIsAuthenticated(true);
        } catch {
            localStorage.removeItem('staff_session');
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('staff_session');
        setUser(null);
        setIsAuthenticated(false);
        navigate(createPageUrl('PSPLogin'));
    };

    const requireAuth = () => {
        if (!isLoading && !isAuthenticated) {
            navigate(createPageUrl('PSPLogin'));
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated,
        logout,
        requireAuth,
        checkAuth
    };
}

export function getStaffSession() {
    const session = localStorage.getItem('staff_session');
    if (!session) return null;
    
    try {
        const parsed = JSON.parse(session);
        if (parsed.expires < Date.now()) {
            localStorage.removeItem('staff_session');
            return null;
        }
        return parsed;
    } catch {
        localStorage.removeItem('staff_session');
        return null;
    }
}

export function staffLogout() {
    localStorage.removeItem('staff_session');
    window.location.href = createPageUrl('PSPLogin');
}