import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import KongSetupGuide from '@/components/docs/KongSetupGuide';

export default function KongGatewaySetup() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem('platform_admin_session');
        if (!sessionData) {
            navigate(createPageUrl('PlatformAdminLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) return null;

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