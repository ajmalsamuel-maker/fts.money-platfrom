import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StaffAuthWrapper({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;
        
        const sessionData = localStorage.getItem('staff_session');
        
        if (!sessionData) {
            setIsAuthenticated(false);
            navigate(createPageUrl('PSPLogin'));
            return;
        }

        try {
            const session = JSON.parse(sessionData);
            if (session?.psp_code) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                navigate(createPageUrl('PSPLogin'));
            }
        } catch (err) {
            setIsAuthenticated(false);
            navigate(createPageUrl('PSPLogin'));
        }
    }, [navigate]);

    if (isAuthenticated === null || isAuthenticated === false) {
        return null;
    }

    return <>{children}</>;
}