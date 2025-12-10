import React from 'react';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import FintechNewsTicker from '@/components/dashboard/FintechNewsTicker';

export default function Layout({ children }) {
    return (
        <LanguageProvider>
            <div className="min-h-screen bg-slate-50">
                <FintechNewsTicker />
                {children}
            </div>
        </LanguageProvider>
    );
}