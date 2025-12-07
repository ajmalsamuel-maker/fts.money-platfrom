import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { FileText, AlertTriangle, DollarSign, Shield, Scale, Clock } from 'lucide-react';

export default function TermsOfService() {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="h-10 w-10 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                            <p className="text-slate-600">{companyName}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Last Updated: December 7, 2025</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Card className="p-8 mb-6 bg-amber-50 border-amber-200">
                    <p className="text-slate-700 leading-relaxed">
                        <strong>Important:</strong> Please read these Terms of Service carefully before using {companyName}'s payment services platform. 
                        By accessing or using our services, you agree to be bound by these terms.
                    </p>
                </Card>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>By registering for, accessing, or using {companyName}'s services, you agree to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Be bound by these Terms of Service</li>
                                    <li>Comply with all applicable laws and regulations</li>
                                    <li>Provide accurate and complete information during registration</li>
                                    <li>Maintain the security of your account credentials</li>
                                </ul>
                                <p className="mt-4">If you do not agree to these terms, you may not access or use our services.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">2. Service Description</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>{companyName} provides payment processing services including:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Payment acceptance and processing for card-present and card-not-present transactions</li>
                                    <li>Settlement and payout services</li>
                                    <li>Fraud prevention and risk management tools</li>
                                    <li>Reporting and analytics dashboards</li>
                                    <li>API access for payment integration</li>
                                    <li>Chargeback and dispute management</li>
                                </ul>
                            </div>
                        </Card>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">3. Merchant Obligations</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-4 text-slate-700">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">3.1 Compliance</h3>
                                    <p>You must comply with:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>PCI DSS requirements for handling cardholder data</li>
                                        <li>Card network rules (Visa, Mastercard, etc.)</li>
                                        <li>Applicable consumer protection laws</li>
                                        <li>Anti-money laundering (AML) regulations</li>
                                        <li>Data protection and privacy laws (GDPR, CCPA, etc.)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">3.2 Prohibited Activities</h3>
                                    <p>You may not use our services for:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Illegal goods, services, or activities</li>
                                        <li>Fraudulent or deceptive practices</li>
                                        <li>High-risk businesses without prior approval</li>
                                        <li>Transactions that violate card network rules</li>
                                        <li>Money laundering or terrorist financing</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">3.3 Business Practices</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Provide clear and accurate product/service descriptions</li>
                                        <li>Display refund and return policies prominently</li>
                                        <li>Respond promptly to customer inquiries and disputes</li>
                                        <li>Maintain adequate customer support channels</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">4. Fees and Pricing</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p><strong>Transaction Fees:</strong> You agree to pay the fees specified in your merchant agreement, including:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Percentage-based fees on transaction amounts (MDR)</li>
                                    <li>Fixed per-transaction fees</li>
                                    <li>Monthly account fees (if applicable)</li>
                                    <li>Chargeback fees</li>
                                    <li>Currency conversion fees for cross-border transactions</li>
                                </ul>
                                <p className="mt-4"><strong>Fee Changes:</strong> We reserve the right to modify fees with 30 days' advance notice.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">5. Settlement and Payouts</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p><strong>Settlement Timing:</strong> Funds are settled according to your agreement (typically T+1 to T+3).</p>
                                <p><strong>Reserves:</strong> We may hold reserves to cover chargebacks, refunds, or other liabilities as permitted by your agreement.</p>
                                <p><strong>Holds:</strong> We may place holds or delay payouts if:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Unusual transaction patterns are detected</li>
                                    <li>Chargeback rates exceed acceptable thresholds</li>
                                    <li>Compliance or verification issues arise</li>
                                    <li>Required for legal or regulatory reasons</li>
                                </ul>
                            </div>
                        </Card>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">6. Chargebacks and Disputes</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>You are responsible for:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>All chargebacks and associated fees</li>
                                    <li>Providing compelling evidence to dispute chargebacks</li>
                                    <li>Responding to chargeback requests within specified timeframes</li>
                                    <li>Maintaining chargeback ratios within acceptable limits (typically &lt;1%)</li>
                                </ul>
                                <p className="mt-4"><strong>Excessive Chargebacks:</strong> Accounts with excessive chargebacks may be subject to increased fees, reserves, or termination.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">7. Account Termination</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p><strong>By You:</strong> You may terminate your account with 30 days' written notice.</p>
                                <p><strong>By Us:</strong> We may suspend or terminate your account immediately if:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>You breach these Terms of Service</li>
                                    <li>We are required to do so by law or card networks</li>
                                    <li>Your account presents unacceptable risk</li>
                                    <li>You engage in prohibited activities</li>
                                </ul>
                                <p className="mt-4"><strong>Post-Termination:</strong> Upon termination, you remain liable for all obligations incurred before termination, including chargebacks and fees.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">8. Limitation of Liability</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>To the maximum extent permitted by law:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>{companyName} is not liable for indirect, incidental, or consequential damages</li>
                                    <li>Our total liability is limited to fees paid by you in the 12 months preceding the claim</li>
                                    <li>We are not liable for service interruptions, data loss, or third-party actions</li>
                                    <li>You indemnify us against claims arising from your use of our services</li>
                                </ul>
                            </div>
                        </Card>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">9. Changes to Terms</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>We may modify these Terms of Service at any time. Material changes will be communicated via:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Email notification to your registered address</li>
                                    <li>Prominent notice in your merchant dashboard</li>
                                    <li>Posted updates with the effective date</li>
                                </ul>
                                <p className="mt-4">Continued use of services after changes become effective constitutes acceptance.</p>
                            </div>
                        </Card>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">10. Governing Law and Disputes</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p><strong>Governing Law:</strong> These terms are governed by the laws of the jurisdiction where {companyName} is registered.</p>
                                <p><strong>Dispute Resolution:</strong> Disputes will be resolved through:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-4">
                                    <li>Good faith negotiation between parties</li>
                                    <li>Mediation if negotiation fails</li>
                                    <li>Binding arbitration or court proceedings as specified in your agreement</li>
                                </ol>
                            </div>
                        </Card>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">11. Contact Information</h2>
                        </div>
                        <Card className="p-6">
                            <div className="space-y-3 text-slate-700">
                                <p>For questions about these Terms of Service, contact:</p>
                                <div className="mt-4">
                                    <p><strong>{companyName}</strong></p>
                                    <p className="mt-2">Email: <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">{supportEmail}</a></p>
                                    <p>Support: <a href="https://netxhub.tech/support" className="text-blue-600 hover:underline">https://netxhub.tech/support</a></p>
                                </div>
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