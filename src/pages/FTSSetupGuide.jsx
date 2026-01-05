import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Building2, Code, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSSetupGuide() {
    const { t } = useI18n();
    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar currentPage="FTSSetupGuide" />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:pages.setupGuide.title')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:pages.setupGuide.subtitle')}</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>

                <div className="p-8 max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">FTS.Money Platform Setup Guide</h1>
                    <p className="text-gray-600 mb-8">Complete setup instructions for all FTS.Money products and services</p>

                    <Tabs defaultValue="psp" className="mb-6">
                        <TabsList className="grid grid-cols-7 gap-2 bg-white p-2 rounded-lg shadow h-auto">
                            <TabsTrigger value="psp" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                                <Building2 className="h-4 w-4 mr-1" />
                                PSP Platform
                            </TabsTrigger>
                            <TabsTrigger value="vasp" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
                                <Wallet className="h-4 w-4 mr-1" />
                                VASP / Crypto
                            </TabsTrigger>
                            <TabsTrigger value="iso" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                                <Code className="h-4 w-4 mr-1" />
                                ISO Gateway
                            </TabsTrigger>
                            <TabsTrigger value="orch" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                                <GitBranch className="h-4 w-4 mr-1" />
                                Orchestration
                            </TabsTrigger>
                            <TabsTrigger value="rwa" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
                                <Rocket className="h-4 w-4 mr-1" />
                                RWA Platform
                            </TabsTrigger>
                            <TabsTrigger value="tax" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                <FileText className="h-4 w-4 mr-1" />
                                VAT/Tax
                            </TabsTrigger>
                            <TabsTrigger value="einvoice" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                                <Globe className="h-4 w-4 mr-1" />
                                E-Invoicing
                            </TabsTrigger>
                        </TabsList>

                        {/* PSP Platform Setup */}
                        <TabsContent value="psp">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-6 w-6 text-emerald-600" />
                                        PSP Platform Setup
                                        <Badge className="bg-emerald-100 text-emerald-700">Payment Service Provider</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-emerald-50 rounded-lg">
                                        <p className="font-medium text-emerald-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-emerald-800">Launch complete white-label payment service provider in 24-48 hours</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Provision PSP Instance (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">PSP Operations → PSP Instances</code></p>
                                                    <p className="text-sm text-slate-600">Click "Provision New PSP" → Complete wizard</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Create PSP Admin User</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Customer Management → PSP Staff</code></p>
                                                    <p className="text-sm text-slate-600">Click "Add User" → Enter PSP code, email, password</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">PSP Staff Login</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/PSPLogin</code></p>
                                                    <p className="text-sm text-slate-600">Use PSP code + email + password</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Configure PSP Portal</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Merchants:</strong> Onboard payment acceptors</span>
                                                        <span className="block">• <strong>Transactions:</strong> Monitor payment flow</span>
                                                        <span className="block">• <strong>Virtual Terminal:</strong> Manual card entry</span>
                                                        <span className="block">• <strong>Settings:</strong> Branding, fees, features</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* VASP / Crypto Banking Setup */}
                        <TabsContent value="vasp">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="h-6 w-6 text-cyan-600" />
                                        VASP Platform / Crypto Banking Setup
                                        <Badge className="bg-cyan-100 text-cyan-700">Complete Crypto Infrastructure</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-cyan-50 rounded-lg">
                                        <p className="font-medium text-cyan-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-cyan-800">White-labeled crypto banking: wallets, IBANs, cards, compliance (via Striga)</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Create VASP Customer (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Crypto Banking Service → Customers</code></p>
                                                    <p className="text-sm text-slate-600">Click "Add Customer" → Enter company details, email, LEI/TAS (optional)</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Customer Login</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/CryptoGatewayLogin</code></p>
                                                    <p className="text-sm text-slate-600">Use email + password from step 1</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Complete KYB/KYC (10-Step Process)</p>
                                                    <p className="text-sm text-slate-600">If TAS/vLEI: Instant approval</p>
                                                    <p className="text-sm text-slate-600">If LEI only: Complete KYB verification (2-14 days)</p>
                                                    <p className="text-sm text-slate-600">If no credentials: 90-day grace period with limited access</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Use VASP Portal</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Wallets:</strong> Create BTC, ETH, USDC wallets</span>
                                                        <span className="block">• <strong>IBANs:</strong> Generate virtual SEPA accounts</span>
                                                        <span className="block">• <strong>Cards:</strong> Issue virtual/physical Visa cards</span>
                                                        <span className="block">• <strong>Users:</strong> Onboard crypto customers with KYC</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ISO Gateway Setup */}
                        <TabsContent value="iso">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="h-6 w-6 text-indigo-600" />
                                        ISO Gateway Service Setup
                                        <Badge className="bg-indigo-100 text-indigo-700">Message Translation</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-indigo-50 rounded-lg">
                                        <p className="font-medium text-indigo-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-indigo-800">Translate ISO 8583 ↔ ISO 20022 ↔ SWIFT MT messages</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Create Customer (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">ISO Gateway Service → Customers</code></p>
                                                    <p className="text-sm text-slate-600">Click "Add Customer" → Enter details, email</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Customer Login</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/ISOGatewayLogin</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Configure Connections & Routing</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>API Keys:</strong> Generate keys</span>
                                                        <span className="block">• <strong>Connections:</strong> Define translation routes</span>
                                                        <span className="block">• <strong>Test Console:</strong> Validate messages</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orchestration Setup */}
                        <TabsContent value="orch">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-6 w-6 text-purple-600" />
                                        Orchestration Service Setup
                                        <Badge className="bg-purple-100 text-purple-700">Smart Routing</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <p className="font-medium text-purple-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-purple-800">Intelligent multi-processor payment routing, failover, cost optimization</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Create Customer (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Orchestration Service → Customers</code></p>
                                                    <p className="text-sm text-slate-600">Click "Add Customer" → Enter details</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Customer Login</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/OrchestrationLogin</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Configure Routing Rules</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Connect Processors:</strong> Add payment provider APIs</span>
                                                        <span className="block">• <strong>Create Rules:</strong> Cost, success rate, geographic routing</span>
                                                        <span className="block">• <strong>Test:</strong> Shadow mode validation</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* RWA Platform Setup */}
                        <TabsContent value="rwa">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Rocket className="h-6 w-6 text-amber-600" />
                                        RWA Platform Setup
                                        <Badge className="bg-amber-100 text-amber-700">Asset Tokenization</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-amber-50 rounded-lg">
                                        <p className="font-medium text-amber-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-amber-800">Tokenize real-world assets (real estate, bonds, credit) with ERC-3643 compliance</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Provision RWA Provider (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">RWA Platform → Provision Customers</code></p>
                                                    <p className="text-sm text-slate-600">LEI mandatory for asset issuers</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Provider Login</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/RWAProviderLogin</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Tokenize Assets</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Assets:</strong> Submit property/asset details</span>
                                                        <span className="block">• <strong>Issuers:</strong> Onboard asset issuers (KYB)</span>
                                                        <span className="block">• <strong>Investors:</strong> Onboard investors (KYC/accreditation)</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* VAT/Tax Setup */}
                        <TabsContent value="tax">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                        VAT & Tax Management Setup
                                        <Badge className="bg-blue-100 text-blue-700">Global Tax Compliance</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="font-medium text-blue-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-blue-800">Automated VAT/GST calculation for 100+ jurisdictions, MOSS/OSS compliance</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Configure Global Tax Settings</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">TaxManagement</code> (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Set up jurisdictions, rates, categories</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Integrate with Payment Processing</p>
                                                    <p className="text-sm text-slate-600">Automatically enabled for all PSP instances</p>
                                                    <p className="text-sm text-slate-600">Real-time tax calculation on transactions</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Use VAT Engine</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>API Integration:</strong> REST API for tax calculation</span>
                                                        <span className="block">• <strong>Returns:</strong> Automated VAT return generation</span>
                                                        <span className="block">• <strong>Reporting:</strong> Jurisdiction-specific reports</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* E-Invoicing Setup */}
                        <TabsContent value="einvoice">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-6 w-6 text-teal-600" />
                                        E-Invoicing System Setup
                                        <Badge className="bg-teal-100 text-teal-700">Multi-Standard Invoicing</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-teal-50 rounded-lg">
                                        <p className="font-medium text-teal-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-teal-800">Generate compliant e-invoices: Peppol, ZATCA, FatturaPA, CFDI, UBL</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Configure E-Invoicing (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">EInvoicingDashboard</code></p>
                                                    <p className="text-sm text-slate-600">Set up templates, digital certificates</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Enable for PSPs</p>
                                                    <p className="text-sm text-slate-600">Automatically integrated with payment processing</p>
                                                    <p className="text-sm text-slate-600">Auto-generate invoices after successful payments</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Government Gateway Integration</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Peppol:</strong> Access Point certified</span>
                                                        <span className="block">• <strong>ZATCA:</strong> Real-time clearance/reporting</span>
                                                        <span className="block">• <strong>SDI (Italy):</strong> Sistema di Interscambio</span>
                                                        <span className="block">• <strong>PAC (Mexico):</strong> Authorized stamping</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 mt-8">
                        <CardHeader>
                            <CardTitle>Quick Reference - All Login URLs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Platform Administration</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/PlatformAdminLogin</code> <span className="text-slate-500">- Control Panel</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/CommunityPortalLogin</code> <span className="text-slate-500">- Community</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Payment Services</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/PSPLogin</code> <span className="text-slate-500">- PSP Platform</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/ISOGatewayLogin</code> <span className="text-slate-500">- ISO Gateway</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/OrchestrationLogin</code> <span className="text-slate-500">- Orchestration</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Advanced Services</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/CryptoGatewayLogin</code> <span className="text-slate-500">- VASP/Crypto</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/RWAProviderLogin</code> <span className="text-slate-500">- RWA Platform</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/MerchantLogin</code> <span className="text-slate-500">- Merchant Portal</span></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}