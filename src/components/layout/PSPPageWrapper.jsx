import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { getStaffSession } from '@/components/auth/useStaffAuth';

/**
 * PSP Portal Standard Layout Wrapper
 * All PSP Portal pages (except PSPLogin) should wrap their content with this component.
 * This ensures consistent scaling, spacing, sidebar behavior, and responsive design.
 * 
 * Usage:
 * <PSPPageWrapper currentPage="Dashboard">
 *   <YourPageContent />
 * </PSPPageWrapper>
 */
export default function PSPPageWrapper({ children, currentPage }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    
    useEffect(() => {
        const session = getStaffSession();
        if (!session) {
            window.location.href = '/PSPLogin';
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage={currentPage}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            
            <div className="flex-1 flex flex-col min-h-screen">
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}