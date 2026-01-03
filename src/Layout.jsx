import React from 'react';
import { EnhancedLanguageProvider } from '@/components/i18n/EnhancedLanguageProvider';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { SkipNavigation } from '@/components/accessibility/AccessibleComponents';
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
            <AccessibilityProvider>
                <EnhancedLanguageProvider tenantType="platform">
                    <SkipNavigation targetId="main-content" />
                    <div className="min-h-screen bg-slate-50">
                        <FintechNewsTicker />
                        <main id="main-content">
                            {children}
                        </main>
                    </div>
                </EnhancedLanguageProvider>
            </AccessibilityProvider>
        );
    }

    return (
        <AccessibilityProvider>
            <EnhancedLanguageProvider tenantType="platform">
                <SkipNavigation targetId="main-content" />
                <div className="min-h-screen bg-slate-50">
                    <FintechNewsTicker />
                    <main id="main-content">
                        {children}
                    </main>
                </div>
            </EnhancedLanguageProvider>
        </AccessibilityProvider>
    );
}