/**
 * Main Layout Component
 * @version 1.2.0
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { I18nextProvider } from '@/components/i18n/I18nextProvider';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { SkipNavigation } from '@/components/accessibility/AccessibleComponents';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import ComplianceFooter from '@/components/compliance/ComplianceFooter';

export default function Layout({ children }) {
    const location = useLocation();
    const pathname = location?.pathname || '';
    
    // Suppress MetaMask connection errors globally
    React.useEffect(() => {
        const originalError = console.error;
        const originalInfo = console.info;
        
        console.error = (...args) => {
            const msg = args.join(' ');
            if (msg.includes('MetaMask')) return;
            originalError.apply(console, args);
        };
        
        console.info = (...args) => {
            const msg = args.join(' ');
            if (msg.includes('MetaMask')) return;
            originalInfo.apply(console, args);
        };
        
        return () => {
            console.error = originalError;
            console.info = originalInfo;
        };
    }, []);
    
    // Auth pages that should not have layout wrapper
    const authPages = ['/PSPLogin', '/MerchantLogin', '/BusinessEInvoiceLogin', '/CryptoGatewayLogin', '/ISOGatewayLogin', '/AssetIssuerLogin', '/InvestorLogin', '/OrchestrationLogin', '/QSAPortalLogin', '/RWAProviderLogin', '/CommunityPortalLogin', '/VirtualTerminalLogin', '/PlatformAdminLogin'];
    
    // If this is an auth page, render children without layout wrapper
    if (authPages.some(page => pathname.includes(page))) {
        return children;
    }
    
    // Check if this is a custom auth session - bypass Base44 auth
    const staffSession = localStorage.getItem('staff_session');
    const merchantSession = localStorage.getItem('merchantSession');
    const platformSession = localStorage.getItem('platform_admin_session');
    const cryptoSession = localStorage.getItem('crypto_gateway_session');
    const rwaProviderSession = localStorage.getItem('rwa_provider_session');
    const assetIssuerSession = localStorage.getItem('asset_issuer_session');
    const investorSession = localStorage.getItem('rwa_investor_session');
    const communitySession = localStorage.getItem('community_portal_session');

    const isCustomAuthSession = !!(staffSession || merchantSession || platformSession || cryptoSession || rwaProviderSession || assetIssuerSession || investorSession || communitySession);

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