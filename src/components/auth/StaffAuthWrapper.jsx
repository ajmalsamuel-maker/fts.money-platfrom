import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StaffAuthWrapper({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        
        if (!sessionData) {
            navigate(createPageUrl('PSPLogin'));
            return;
        }

        try {
            const session = JSON.parse(sessionData);
            if (!session?.psp_code) {
                localStorage.clear();
                navigate(createPageUrl('PSPLogin'));
            }
        } catch (err) {
            localStorage.clear();
            navigate(createPageUrl('PSPLogin'));
        }
    }, [navigate]);

    return <>{children}</>;
}