/**
 * Main Layout Component
 * @version 1.2.0
 */
import React from 'react';
import { I18nextProvider } from '@/components/i18n/I18nextProvider';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { SkipNavigation } from '@/components/accessibility/AccessibleComponents';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import ComplianceFooter from '@/components/compliance/ComplianceFooter';

export default function Layout({ children }) {
    // Check if this is a staff session - bypass Base44 auth (NO STATE CHANGE)
    const staffSession = localStorage.getItem('staff_session');
    const merchantSession = localStorage.getItem('merchantSession');
    const platformSession = localStorage.getItem('platform_admin_session');
    const cryptoSession = localStorage.getItem('crypto_gateway_session');
    
    const isStaffSession = !!(staffSession || merchantSession || platformSession || cryptoSession);

    // For custom auth sessions, skip Base44's AuthContext entirely
    return (
        <I18nextProvider>
            <AccessibilityProvider>
                <SkipNavigation targetId="main-content" />
                <div className="min-h-screen bg-slate-50 flex flex-col">
                    <FintechNewsTicker />
                    <main id="main-content" className="flex-1">
                        {children}
                    </main>
                    <ComplianceFooter />
                </div>
            </AccessibilityProvider>
        </I18nextProvider>
    );
}