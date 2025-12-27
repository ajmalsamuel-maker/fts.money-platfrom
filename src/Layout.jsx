import React from 'react';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';

export default function Layout({ children }) {
    // Check if this is a staff session - bypass Base44 auth
    const [isStaffSession, setIsStaffSession] = React.useState(false);
    
    React.useEffect(() => {
        const staffSession = localStorage.getItem('staff_session');
        const merchantSession = localStorage.getItem('merchantSession');
        const platformSession = localStorage.getItem('platform_admin_session');
        const cryptoSession = localStorage.getItem('crypto_gateway_session');
        
        if (staffSession || merchantSession || platformSession || cryptoSession) {
            setIsStaffSession(true);
        }
    }, []);

    // For custom auth sessions, skip Base44's AuthContext entirely
    if (isStaffSession) {
        return (
            <LanguageProvider>
                <div className="min-h-screen bg-slate-50">
                    <FintechNewsTicker />
                    {children}
                </div>
            </LanguageProvider>
        );
    }

    return (
        <LanguageProvider>
            <div className="min-h-screen bg-slate-50">
                <FintechNewsTicker />
                {children}
            </div>
        </LanguageProvider>
    );
}