import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { getStaffSession } from '@/components/auth/useStaffAuth';

export default function PSPLayout({ children, currentPage }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    
    // Redirect if session is invalid
    useEffect(() => {
        const session = getStaffSession();
        if (!session) {
            window.location.href = '/PSPLogin';
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage={currentPage}
            />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "lg:ml-64 ml-40")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}