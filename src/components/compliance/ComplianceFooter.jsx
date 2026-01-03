/**
 * Platform-Wide Compliance Footer
 * Modern, sleek design with actual certification logos
 * @version 2.0.0 - Optimized aesthetic with real PCI DSS & GLEIF logos
 */

import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ComplianceFooter() {
    return (
        <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Compact Certification Badges Row */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                    {/* W3C WCAG 2.1 AA */}
                    <a 
                        href="https://www.w3.org/WAI/WCAG2AA-Conformance" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative"
                        title="WCAG 2.1 Level AA Conformance"
                    >
                        <img 
                            src="https://www.w3.org/WAI/WCAG21/wcag2.1AA-blue-v.svg" 
                            alt="WCAG 2.1 Level AA"
                            className="h-14 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </a>

                    {/* PCI DSS Level 1 - Official Logo */}
                    <a 
                        href="https://www.pcisecuritystandards.org/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative"
                        title="PCI DSS Level 1 Service Provider Certified"
                    >
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/47f4a9106_PCI-L1.jpg" 
                            alt="PCI DSS Level 1 Certified"
                            className="h-16 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </a>

                    {/* GLEIF Partner - Official Logo */}
                    <a 
                        href="https://www.gleif.org/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative"
                        title="GLEIF LEI/vLEI Partner"
                    >
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/01a7ae610_GLEIF-new.png" 
                            alt="GLEIF Partner"
                            className="h-16 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </a>

                    {/* SOC 2 Type II - Official Logo */}
                    <a 
                        href="https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative"
                        title="SOC 2 Type II Compliant"
                    >
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/2e449a989_SOC.png" 
                            alt="SOC 2 Type II Compliant"
                            className="h-16 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </a>
                </div>

                {/* Compact ISO Standards */}
                <div className="text-center mb-6">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Global Standards Compliance</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {['ISO 639', 'ISO 3166', 'ISO 4217', 'ISO 8583', 'ISO 20022', 'ISO 23257', 'BCP 47', 'Unicode CLDR'].map((standard) => (
                            <Badge key={standard} variant="outline" className="text-[10px] py-0.5 px-2 bg-white">
                                {standard}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 mb-4"></div>

                {/* Footer Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/865871aa1_FTSMoney-primary-logo-RGB.jpg"
                            alt="FTS.Money"
                            className="h-6 opacity-80"
                        />
                        <span className="text-slate-600">
                            © {new Date().getFullYear()} FTS.Money
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                        <Lock className="h-3 w-3" />
                        <span>End-to-end encrypted</span>
                        <span>•</span>
                        <span>GDPR & CCPA compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/**
 * Minimal version for login pages
 */
export function MinimalComplianceFooter() {
    return (
        <footer className="py-4 bg-transparent">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} FTS.Money - Enterprise Payment Infrastructure
                </div>
            </div>
        </footer>
    );
}