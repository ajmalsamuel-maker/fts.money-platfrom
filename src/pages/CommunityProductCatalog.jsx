import React from 'react';
import CommunityProductCatalogComponent from '@/components/docs/CommunityProductCatalog';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function CommunityProductCatalogPage() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CommunityProductCatalog" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            <div className="flex-1 overflow-auto">
                <CommunityProductCatalogComponent />
            </div>
        </div>
    );
}