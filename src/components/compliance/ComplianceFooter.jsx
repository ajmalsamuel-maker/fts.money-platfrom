/**
 * Platform-Wide Compliance Footer
 * Displays all implemented standards, certifications, and compliance badges
 */

import React from 'react';
import { Shield, Globe, Lock, CheckCircle, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ComplianceFooter() {
    return (
        <footer className="border-t border-slate-200 bg-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Compliance Badges Row */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
                    {/* W3C WCAG 2.1 AA Badge */}
                    <a 
                        href="https://www.w3.org/WAI/WCAG2AA-Conformance" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <img 
                            src="https://www.w3.org/WAI/WCAG21/wcag2.1AA-blue-v.svg" 
                            alt="WCAG 2.1 Level AA Conformance"
                            className="h-12"
                        />
                    </a>

                    {/* PCI DSS Level 1 */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border-2 border-emerald-600 rounded-lg">
                        <Shield className="h-8 w-8 text-emerald-700" />
                        <div>
                            <div className="font-bold text-emerald-900 text-sm">PCI DSS</div>
                            <div className="text-xs text-emerald-700">Level 1</div>
                        </div>
                    </div>

                    {/* GLEIF LEI */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border-2 border-indigo-600 rounded-lg">
                        <FileCheck className="h-8 w-8 text-indigo-700" />
                        <div>
                            <div className="font-bold text-indigo-900 text-sm">GLEIF</div>
                            <div className="text-xs text-indigo-700">LEI/vLEI Enabled</div>
                        </div>
                    </div>

                    {/* ISO Compliance */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border-2 border-purple-600 rounded-lg">
                        <Globe className="h-8 w-8 text-purple-700" />
                        <div>
                            <div className="font-bold text-purple-900 text-sm">ISO Standards</div>
                            <div className="text-xs text-purple-700">8+ Standards</div>
                        </div>
                    </div>

                    {/* CLDR */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border-2 border-orange-600 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-orange-700" />
                        <div>
                            <div className="font-bold text-orange-900 text-sm">Unicode CLDR</div>
                            <div className="text-xs text-orange-700">i18n Standard</div>
                        </div>
                    </div>
                </div>

                {/* Standards Implementation Text */}
                <div className="text-center mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                        Global Standards Compliance
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline" className="text-xs">ISO 639-1/2 (Languages)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 3166-1 (Countries)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 8601 (Date/Time)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 4217 (Currencies)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 8583 (Card Messages)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 20022 (Financial Messages)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 23257 (Blockchain/DLT)</Badge>
                        <Badge variant="outline" className="text-xs">ISO 24165 (Digital Tokens)</Badge>
                        <Badge variant="outline" className="text-xs">BCP 47 (Language Tags)</Badge>
                        <Badge variant="outline" className="text-xs">W3C i18n Best Practices</Badge>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 my-6"></div>

                {/* Footer Links and Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/865871aa1_FTSMoney-primary-logo-RGB.jpg"
                            alt="FTS.Money"
                            className="h-8"
                        />
                        <span className="text-sm text-slate-600">
                            © {new Date().getFullYear()} FTS.Money - Enterprise Payment Infrastructure
                        </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Compliance</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500">
                        <Lock className="inline h-3 w-3 mr-1" />
                        All data encrypted in transit and at rest • SOC 2 Type II Compliant • GDPR & CCPA Ready
                    </p>
                </div>
            </div>
        </footer>
    );
}

/**
 * Compact version for pages with limited space
 */
export function CompactComplianceFooter() {
    return (
        <footer className="border-t border-slate-200 bg-slate-50 py-4">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        WCAG 2.1 AA
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-emerald-600" />
                        PCI DSS Level 1
                    </span>
                    <span>•</span>
                    <span>ISO 20022 | ISO 8583 | ISO 639 | ISO 3166 | ISO 8601</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <FileCheck className="h-3 w-3 text-indigo-600" />
                        LEI/vLEI Enabled
                    </span>
                </div>
            </div>
        </footer>
    );
}