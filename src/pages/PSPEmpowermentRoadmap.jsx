import React from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import PSPEmpowermentRoadmap from '@/components/docs/PSPEmpowermentRoadmap';

export default function PSPEmpowermentRoadmapPage() {
    const { platformUser, loading } = usePlatformAuth();

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PSPEmpowermentRoadmap" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">PSP Empowerment Implementation Roadmap</h2>
                        <p className="text-xs text-slate-600">Comprehensive plan covering all 12 missing functionalities</p>
                    </div>
                </header>

                <main className="p-6">
                    <PSPEmpowermentRoadmap />
                </main>
            </div>
        </div>
    );
}