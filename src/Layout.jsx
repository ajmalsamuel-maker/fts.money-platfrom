import React from 'react';
import { I18nextProvider } from '@/components/i18n/I18nextProvider';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { SkipNavigation } from '@/components/accessibility/AccessibleComponents';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';
import ComplianceFooter from '@/components/compliance/ComplianceFooter';
import PSPLayout from '@/components/layout/PSPLayout';

const pspPortalPages = [
    'Dashboard', 'Analytics', 'RealTimeMonitor', 'Transactions', 'Refunds', 'Settlements',
    'Chargebacks', 'Disputes', 'Merchants', 'MerchantOnboarding', 'MerchantMIDs',
    'PaymentGateways', 'PaymentOrchestration', 'Payouts', 'Balances', 'Reports',
    'Settings', 'APIKeys', 'Webhooks', 'AuditLogs', 'BuyRates', 'FeeTypeManagement',
    'Invoices', 'MIDPricingConfiguration', 'PSPMerchantPricing', 'PayoutOrchestration'
];

export default function Layout({ children, currentPageName }) {
    if (pspPortalPages.includes(currentPageName) && currentPageName !== 'PSPLogin') {
        return (
            <I18nextProvider>
                <AccessibilityProvider>
                    <PSPLayout currentPage={currentPageName}>
                        {children}
                    </PSPLayout>
                </AccessibilityProvider>
            </I18nextProvider>
        );
    }
    
    // Default layout for non-PSP pages (login, public pages, etc.)
    return (
        <I18nextProvider>
            <AccessibilityProvider>
                <main id="main-content" className="flex-1">
                    {children}
                </main>
            </AccessibilityProvider>
        </I18nextProvider>
    );
}