import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import KongSetupGuide from '@/components/docs/KongSetupGuide';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';

export default function KongGatewaySetup() {
    const { session, loading } = usePlatformAuth(['platform_admin', 'platform_operator', 'super_admin']);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="KongGatewaySetup"
                userRole={session.role}
                userEmail={session.email}
                isSuperAdmin={session.role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Kong Gateway Setup</h2>
                        <p className="text-xs text-slate-600">Deploy API Gateway on DigitalOcean</p>
                    </div>
                </header>

                {/* Main Content */}
                <div className="p-6 max-w-6xl">
                    <KongSetupGuide />
                </div>
            </div>
        </div>
    );
}