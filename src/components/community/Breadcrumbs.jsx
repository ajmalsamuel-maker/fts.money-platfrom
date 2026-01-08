import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

const pageHierarchy = {
    'CommunityPortalDashboard': ['Dashboard'],
    'LaunchServices': ['Launch Services'],
    'CommunityPSPProvisioning': ['Launch Services', 'New Service'],
    'MyPSPInstances': ['My Services'],
    'MyAllServices': ['My Services'],
    'ISOGatewayLogin': ['My Services', 'ISO Gateway'],
    'OrchestrationLogin': ['My Services', 'Orchestration'],
    'CommunityMarketplace': ['Marketplace'],
    'MySubscriptions': ['My Services', 'Subscriptions'],
    'CommunityBilling': ['Billing'],
    'CommunityAnalytics': ['Analytics'],
    'ServiceProviderRegistration': ['Provider Hub'],
    'MyWholesaleOfferings': ['Provider Hub', 'My Offerings'],
    'CommunityAccountSettings': ['Settings']
};

export default function Breadcrumbs({ currentPage }) {
    const breadcrumbs = pageHierarchy[currentPage] || ['Dashboard'];

    return (
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <Link 
                to={createPageUrl('CommunityPortalDashboard')}
                className="hover:text-blue-600 transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                    <span className={index === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : ''}>
                        {crumb}
                    </span>
                </React.Fragment>
            ))}
        </nav>
    );
}