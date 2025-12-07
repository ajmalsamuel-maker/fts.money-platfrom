import React from 'react';
import { LanguageProvider } from '@/components/i18n/LanguageContext';

export default function Layout({ children }) {
    return (
        <LanguageProvider>
            <div className="min-h-screen bg-slate-50">
                {children}
            </div>
        </LanguageProvider>
    );
}