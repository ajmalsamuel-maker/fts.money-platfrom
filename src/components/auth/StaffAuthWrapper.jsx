import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StaffAuthWrapper({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        
        if (!sessionData) {
            navigate(createPageUrl('PSPLogin'));
            return;
        }

        try {
            const session = JSON.parse(sessionData);
            if (session?.psp_code) {
                setIsAuthenticated(true);
            } else {
                navigate(createPageUrl('PSPLogin'));
            }
        } catch (err) {
            navigate(createPageUrl('PSPLogin'));
        }
    }, []);

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}