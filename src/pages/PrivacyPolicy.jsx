import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Globe, Mail, Phone } from 'lucide-react';

export default function PrivacyPolicy() {
    const [pspSettings, setPspSettings] = useState(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await base44.entities.PSPSettings.list();
                if (settings && settings.length > 0) {
                    setPspSettings(settings[0]);
                }
            } catch (error) {
                console.error('Failed to load PSP settings');
            }
        };
        loadSettings();
    }, []);

    const companyName = pspSettings?.company_name || 'netXhub.tech';
    const supportEmail = pspSettings?.support_email || 'support@netxhub.tech';
    const address = pspSettings?.address_line1 || 'netXhub Technology Services';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-10 w-10 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                            <p className="text-slate-600">{companyName}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Last Updated: December 7, 2025</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Card className="p-8 mb-6 bg-blue-50 border-blue-200">
                    <p className="text-slate-700 leading-relaxed">
                        At {companyName}, we are committed to protecting your privacy and ensuring the security of your personal information. 
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our payment services platform.
                    </p>
                </Card>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-4 text-slate-700">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">1.1 Business Information</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Company name, registration details, and tax identification numbers</li>
                                        <li>Business address, contact information, and website</li>
                                        <li>Ownership structure and beneficial owner information</li>
                                        <li>Banking details for settlement purposes</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">1.2 Transaction Data</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Payment transaction details (amount, currency, date)</li>
                                        <li>Cardholder information (masked, in compliance with PCI DSS)</li>
                                        <li>Transaction metadata and device information</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">1.3 Usage Information</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>IP addresses, browser type, and device information</li>
                                        <li>Access logs and platform usage analytics</li>
                                        <li>Communication records with our support team</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">2. How We Use Your Information</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p><strong>Service Provision:</strong> To process payments, manage accounts, and provide our payment services.</p>
                                <p><strong>Compliance:</strong> To comply with KYB, AML, and regulatory requirements including PCI DSS Level 1.</p>
                                <p><strong>Security:</strong> To prevent fraud, detect suspicious activity, and protect against security threats.</p>
                                <p><strong>Communication:</strong> To send operational notifications, updates, and respond to inquiries.</p>
                                <p><strong>Improvement:</strong> To analyze usage patterns and improve our platform and services.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">3. Data Security</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3+) and at rest (AES-256).</p>
                                <p><strong>PCI DSS Compliance:</strong> We maintain PCI DSS Level 1 certification for handling cardholder data.</p>
                                <p><strong>Access Controls:</strong> Strict role-based access controls and multi-factor authentication.</p>
                                <p><strong>Monitoring:</strong> 24/7 security monitoring and incident response capabilities.</p>
                                <p><strong>Auditing:</strong> Regular security audits and penetration testing.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">4. Information Sharing</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>We may share your information with:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>Payment Networks:</strong> Visa, Mastercard, and other card schemes for transaction processing</li>
                                    <li><strong>Banking Partners:</strong> Acquiring banks and financial institutions</li>
                                    <li><strong>Service Providers:</strong> KYB/AML verification services, fraud prevention tools</li>
                                    <li><strong>Regulatory Bodies:</strong> When required by law or regulatory obligations</li>
                                    <li><strong>Legal Processes:</strong> In response to valid legal requests or court orders</li>
                                </ul>
                                <p className="mt-4 text-sm italic">We do not sell your personal information to third parties.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">5. Your Rights</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>You have the right to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                                    <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                                    <li><strong>Object:</strong> Object to certain processing activities</li>
                                    <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                                </ul>
                            </div>
                        </Card>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">6. Data Retention</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>We retain your information for as long as necessary to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Provide our services and maintain your account</li>
                                    <li>Comply with legal, regulatory, and tax obligations (typically 7 years)</li>
                                    <li>Resolve disputes and enforce our agreements</li>
                                    <li>Prevent fraud and ensure platform security</li>
                                </ul>
                            </div>
                        </Card>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">7. International Transfers</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>Your information may be transferred to and processed in countries other than your country of residence. 
                                We ensure appropriate safeguards are in place, including:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Standard contractual clauses approved by regulatory authorities</li>
                                    <li>Adequacy decisions by relevant data protection authorities</li>
                                    <li>Compliance with applicable data protection frameworks</li>
                                </ul>
                            </div>
                        </Card>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">8. Contact Us</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>For privacy-related questions or to exercise your rights, contact us at:</p>
                                <div className="mt-4 space-y-2">
                                    <p><strong>{companyName}</strong></p>
                                    <p>{address}</p>
                                    <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">{supportEmail}</a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {pspSettings?.support_phone || '+1 (555) 123-4567'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">9. Changes to This Policy</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Posting the updated policy on our platform</li>
                                    <li>Sending email notifications to registered users</li>
                                    <li>Displaying a prominent notice on the platform</li>
                                </ul>
                                <p className="mt-4">Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}