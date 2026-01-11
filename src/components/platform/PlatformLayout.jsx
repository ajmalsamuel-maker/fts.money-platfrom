import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import FTSPlatformSidebar from './FTSPlatformSidebar';

export default function PlatformLayout({ 
    children, 
    currentPage, 
    userRole, 
    userEmail, 
    isSuperAdmin,
    showMobileMenuButton = true 
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <FTSPlatformSidebar 
                currentPage={currentPage}
                userEmail={userEmail}
                userRole={userRole}
                isSuperAdmin={isSuperAdmin}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto w-full">
                {/* Mobile Menu Button */}
                {showMobileMenuButton && (
                    <div className="md:hidden fixed top-4 left-4 z-30">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-white shadow-lg"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                )}
                
                {children}
            </div>
        </div>
    );
}