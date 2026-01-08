import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Building2, Code, Wallet, Rocket, FileText, Globe, Trophy, Shield, Leaf } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';

export default function FTSSetupGuide() {
    const { t } = useI18n();
    const { platformUser } = usePlatformAuth();
    
    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar 
                currentPage="FTSSetupGuide" 
                userEmail={platformUser?.email}
            />
            
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
                        <TabsList className="grid grid-cols-10 gap-2 bg-white p-2 rounded-lg shadow h-auto">
                            <TabsTrigger value="psp" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                                <Building2 className="h-4 w-4 mr-1" />
                                PSP
                            </TabsTrigger>
                            <TabsTrigger value="vasp" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
                                <Wallet className="h-4 w-4 mr-1" />
                                Crypto
                            </TabsTrigger>
                            <TabsTrigger value="iso" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                                <Code className="h-4 w-4 mr-1" />
                                ISO
                            </TabsTrigger>
                            <TabsTrigger value="orch" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                                <GitBranch className="h-4 w-4 mr-1" />
                                Orch
                            </TabsTrigger>
                            <TabsTrigger value="rwa" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
                                <Rocket className="h-4 w-4 mr-1" />
                                RWA
                            </TabsTrigger>
                            <TabsTrigger value="tax" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                <FileText className="h-4 w-4 mr-1" />
                                Tax
                            </TabsTrigger>
                            <TabsTrigger value="einvoice" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                                <Globe className="h-4 w-4 mr-1" />
                                E-Invoice
                            </TabsTrigger>
                            <TabsTrigger value="compliance" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                                <FileText className="h-4 w-4 mr-1" />
                                PCI/LEI
                            </TabsTrigger>
                            <TabsTrigger value="esg" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                                <FileText className="h-4 w-4 mr-1" />
                                ESG
                            </TabsTrigger>
                            <TabsTrigger value="nano" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                                <Leaf className="h-4 w-4 mr-1" />
                                Nano
                            </TabsTrigger>
                            <TabsTrigger value="fix" className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">
                                <Trophy className="h-4 w-4 mr-1" />
                                FIX Score
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
                                        <p className="text-sm text-amber-800">Tokenize real-world assets (real estate, bonds, credit) with ERC-3643 compliance, investor management, dividend distribution</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Platform Admin Setup:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Provision RWA Customers (White-Label)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">RWA Tokenization Platform → Provision Customers</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• LEI mandatory for verified compliance</span>
                                                        <span className="block">• Set subscription tier (Starter, Professional, Enterprise)</span>
                                                        <span className="block">• Configure enabled asset types & blockchain networks</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Monitor RWA Platform Analytics</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">RWA Tokenization Platform → Analytics</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Total value locked across all assets</span>
                                                        <span className="block">• Investor onboarding metrics</span>
                                                        <span className="block">• Dividend payment tracking</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2 mt-4">RWA Provider Portals:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Provider Portal Login</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/RWAProviderLogin</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Asset management & tokenization workflow</span>
                                                        <span className="block">• Issuer onboarding (KYB verification)</span>
                                                        <span className="block">• Investor management & accreditation tracking</span>
                                                        <span className="block">• Dividend & payout management</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Asset Issuer Portal</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/AssetIssuerLogin</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Submit assets for tokenization</span>
                                                        <span className="block">• Manage compliance documentation</span>
                                                        <span className="block">• Monitor investor base & holdings</span>
                                                        <span className="block">• Process dividend distributions</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                                                <div>
                                                    <p className="font-medium">Investor Portal (Consumer-Facing)</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/InvestorLogin</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Browse & invest in tokenized assets</span>
                                                        <span className="block">• Portfolio management & valuation tracking</span>
                                                        <span className="block">• Dividend payments & distributions</span>
                                                        <span className="block">• KYC/accreditation status management</span>
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
                                        <p className="text-sm text-blue-800">Automated VAT/GST calculation for 150+ jurisdictions, MOSS/OSS compliance, real-time tax rate updates</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Platform Admin Setup:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Configure Global Tax Settings</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Financial Operations → Tax Management</code></p>
                                                    <p className="text-sm text-slate-600">Set up 150+ countries, jurisdiction rules, product categories</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Enable Auto-Sync from Tax Providers</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Financial Operations → Tax Rate Update Manager</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Sync rates from Avalara, TaxJar, OECD, EU VIES</span>
                                                        <span className="block">• Auto-approval for minor changes, flagged review for major updates</span>
                                                        <span className="block">• Automatic application to all PSP instances</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Configure Tax Calculation Tester</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Financial Operations → Tax Calculation Tester</code></p>
                                                    <p className="text-sm text-slate-600">Validate complex tax scenarios before applying system-wide</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Enable Advanced Tax Reports</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Financial Operations → Tax Reports & Analytics</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Compliance dashboard with mandate tracking</span>
                                                        <span className="block">• Historical analysis and trend forecasting</span>
                                                        <span className="block">• Country-specific VAT return generation</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2 mt-4">PSP Tax Billing Integration:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                                                <div>
                                                    <p className="font-medium">Automatic Tax on Invoicing</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Auto-calculate tax on service billing</span>
                                                        <span className="block">• Generate tax-compliant platform invoices</span>
                                                        <span className="block">• Link to <code className="bg-slate-100 px-2 py-0.5 rounded">PlatformBillingPortal</code> for invoice management</span>
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
                                        <p className="text-sm text-teal-800">Generate compliant e-invoices: Peppol, ZATCA, FatturaPA, CFDI, UBL + business portal for self-service invoice generation</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Platform Admin Setup:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Configure E-Invoicing Standards</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Financial Operations → EInvoicingDashboard</code></p>
                                                    <p className="text-sm text-slate-600">Set up templates, digital certificates, government integrations</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Enable Compliance Monitoring</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Compliance → Compliance Monitoring Dashboard</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Track mandatory e-invoicing deadlines by country</span>
                                                        <span className="block">• Monitor adoption rates across PSPs & merchants</span>
                                                        <span className="block">• Gap analysis and readiness assessment</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Enable Auto-Generation for PSPs</p>
                                                    <p className="text-sm text-slate-600">Automatically integrated with payment processing</p>
                                                    <p className="text-sm text-slate-600">Auto-generate compliant invoices after successful payments</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2 mt-4">Business Invoice Portal Setup:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Business Portal for Invoice Generation</p>
                                                    <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/BusinessEInvoicePortal</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Self-service invoice creation & editing</span>
                                                        <span className="block">• Multi-format support (Peppol, UBL, Factura, etc.)</span>
                                                        <span className="block">• Batch upload & import functionality</span>
                                                        <span className="block">• Real-time compliance validation</span>
                                                        <span className="block">• Government submission tracking</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                                                <div>
                                                    <p className="font-medium">Business Portal Features</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Dashboard: Onboarding status & quick actions</span>
                                                        <span className="block">• Invoice Creator: Template-based generation</span>
                                                        <span className="block">• Batch Importer: CSV/Excel upload</span>
                                                        <span className="block">• Validation Engine: Real-time compliance checks</span>
                                                        <span className="block">• Submission Manager: Track government submissions</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                                                <div>
                                                    <p className="font-medium">Government Gateway Integration</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Peppol:</strong> Access Point certified</span>
                                                        <span className="block">• <strong>ZATCA:</strong> Real-time clearance (Saudi Arabia)</span>
                                                        <span className="block">• <strong>SDI (Italy):</strong> Sistema di Interscambio</span>
                                                        <span className="block">• <strong>PAC (Mexico):</strong> Authorized stamping provider</span>
                                                        <span className="block">• <strong>SAFT (Portugal):</strong> eInvoicing integration</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PCI/LEI Compliance Setup */}
                        <TabsContent value="compliance">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-6 w-6 text-orange-600" />
                                        PCI DSS & LEI Compliance Setup
                                        <Badge className="bg-orange-100 text-orange-700">Regulatory Compliance</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-orange-50 rounded-lg">
                                        <p className="font-medium text-orange-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-orange-800">PCI DSS continuous monitoring + LEI verification with grace period management</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">PCI Compliance Setup:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Access PCI Dashboard (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Compliance → PCI Compliance Dashboard</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Continuous Monitoring</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Real-time automated compliance checks</span>
                                                        <span className="block">• Predictive analytics for violations</span>
                                                        <span className="block">• Workflow-based remediation</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">QSA Portal Management</p>
                                                    <p className="text-sm text-slate-600">
                                                        URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/QSAPortalLogin</code>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2 mt-4">LEI Compliance Setup:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Access LEI Dashboard</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Compliance → LEI Compliance Dashboard</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Track Verification Status</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Monitor 90-day grace periods</span>
                                                        <span className="block">• Manage entity LEIs</span>
                                                        <span className="block">• vLEI credential tracking</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ESG/Carbon Setup */}
                        <TabsContent value="esg">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Leaf className="h-6 w-6 text-green-600" />
                                        ESG & Carbon Reporting Setup
                                        <Badge className="bg-green-100 text-green-700">Sustainability</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="font-medium text-green-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-green-800">Track carbon footprint, ESG scores, green merchant status, and CSRD compliance</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">ESG Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Access Carbon Dashboard (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Compliance → Carbon Dashboard</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Enable Green Merchant Program</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Set sustainability benchmarks</span>
                                                        <span className="block">• Track certifications (B-Corp, Climate Neutral, etc.)</span>
                                                        <span className="block">• Monitor merchant eco-scores</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Generate ESG Reports</p>
                                                    <p className="text-sm text-slate-600">
                                                        URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/ESGReportingDashboard</code> - CSRD/GRI compliance
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Nano Sustainability Marketplace */}
                        <TabsContent value="nano">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Leaf className="h-6 w-6 text-green-600" />
                                        Nano Sustainability Marketplace
                                        <Badge className="bg-green-100 text-green-700">Consumer Rewards</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="font-medium text-green-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-green-800">Engage consumers with micro-tasks for sustainability, reward with NANO tokens, sponsor via merchants</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Consumer Marketplace Portal:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Consumer Portal URL</p>
                                                    <p className="text-sm text-slate-600"><code className="bg-slate-100 px-2 py-0.5 rounded">/NanoTaskMarketplace</code> - Browse & complete tasks</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Task discovery & filtering</span>
                                                        <span className="block">• Real-time carbon impact tracking</span>
                                                        <span className="block">• Merchant discount redemption</span>
                                                        <span className="block">• NANO token wallet & staking</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Task Types & Rewards</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Reduce Plastic:</strong> Earn 5-20 NANO per task</span>
                                                        <span className="block">• <strong>Plant Tree:</strong> Earn 50-100 NANO per tree</span>
                                                        <span className="block">• <strong>Public Transport:</strong> Earn 10-30 NANO per trip</span>
                                                        <span className="block">• <strong>Recycle:</strong> Earn 5-15 NANO per item</span>
                                                        <span className="block">• <strong>Energy Saving:</strong> Earn 20-50 NANO</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Task Verification Methods</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Receipt scanning (carbon offset purchases)</span>
                                                        <span className="block">• Photo upload with GPS verification</span>
                                                        <span className="block">• GPS tracking (public transport routes)</span>
                                                        <span className="block">• QR code scanning (merchant locations)</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2 mt-4">Merchant Sponsorship Setup (Platform Admin):</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Create & Manage Sponsored Tasks</p>
                                                    <p className="text-sm text-slate-600">Platform Admin navigates to: <code className="bg-slate-100 px-2 py-0.5 rounded">Services → Nano Task Management</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Merchants sponsor tasks with budget allocation</span>
                                                        <span className="block">• Offer discount codes to task completers</span>
                                                        <span className="block">• Track task sponsorship ROI</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                                                <div>
                                                    <p className="font-medium">Green Merchant Tracking</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Services → Green Merchant Dashboard</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Monitor merchant sustainability scores</span>
                                                        <span className="block">• Track total NANO rewards issued</span>
                                                        <span className="block">• Carbon offset commitments</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2 mt-4">Consumer Engagement Features:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                                                <div>
                                                    <p className="font-medium">Rewards & Achievements</p>
                                                    <p className="text-sm text-slate-600"><code className="bg-slate-100 px-2 py-0.5 rounded">/NFTAchievements</code> - NFT badges for milestones</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Tree Planter (10 trees)</span>
                                                        <span className="block">• Plastic Reducer (50 items)</span>
                                                        <span className="block">• Green Champion (1000+ NANO earned)</span>
                                                        <span className="block">• Eco Warrior (500+ green transactions)</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">7</div>
                                                <div>
                                                    <p className="font-medium">Community & Leaderboards</p>
                                                    <p className="text-sm text-slate-600"><code className="bg-slate-100 px-2 py-0.5 rounded">/CommunityLeaderboard</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Global leaderboard by NANO earned</span>
                                                        <span className="block">• Regional rankings</span>
                                                        <span className="block">• Monthly challenges with bonus rewards</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">8</div>
                                                <div>
                                                    <p className="font-medium">Staking & Governance</p>
                                                    <p className="text-sm text-slate-600"><code className="bg-slate-100 px-2 py-0.5 rounded">/NANOStaking</code></p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Stake NANO to earn returns</span>
                                                        <span className="block">• Vote on new task categories</span>
                                                        <span className="block">• Governance participation rewards</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* FIX Score Management Setup */}
                        <TabsContent value="fix">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-6 w-6 text-rose-600" />
                                        FIX Score Management Setup
                                        <Badge className="bg-rose-100 text-rose-700">Merchant Scoring</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-rose-50 rounded-lg">
                                        <p className="font-medium text-rose-900 mb-2">🎯 Purpose:</p>
                                        <p className="text-sm text-rose-800">Comprehensive merchant scoring: transaction volume, service adoption, ESG, compliance metrics</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">FIX Score Setup Flow:</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Access FIX Management Dashboard (Platform Admin)</p>
                                                    <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Overview & Insights → FIX Score Management</code></p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Configure Algorithm Weights</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• Transaction Volume: 0-300 points</span>
                                                        <span className="block">• Service Adoption: 0-250 points</span>
                                                        <span className="block">• ESG Metrics: 0-250 points</span>
                                                        <span className="block">• Compliance/Security: 0-200 points</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Monitor & Manage Scores</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• View leaderboard & tier distribution</span>
                                                        <span className="block">• Recalculate individual or all merchant scores</span>
                                                        <span className="block">• Access analytics & trend reports</span>
                                                        <span className="block">• View detailed score breakdowns per merchant</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <p className="font-medium">Score Tiers & Benefits</p>
                                                    <p className="text-sm text-slate-600 space-y-1">
                                                        <span className="block">• <strong>Bronze</strong> (0-299): Basic access</span>
                                                        <span className="block">• <strong>Silver</strong> (300-499): Priority support, fee discounts</span>
                                                        <span className="block">• <strong>Gold</strong> (500-699): Dedicated manager, 1.5x rewards</span>
                                                        <span className="block">• <strong>Platinum</strong> (700-899): VIP support, 2x rewards</span>
                                                        <span className="block">• <strong>Diamond</strong> (900-1000): White glove service, custom integrations</span>
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
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Platform Administration</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/PlatformAdminLogin</code> <span className="text-slate-500">- Control Panel</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/CommunityPortalLogin</code> <span className="text-slate-500">- Community</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/QSAPortalLogin</code> <span className="text-slate-500">- QSA Portal</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Payment Services</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/PSPLogin</code> <span className="text-slate-500">- PSP Platform</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/ISOGatewayLogin</code> <span className="text-slate-500">- ISO Gateway</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/OrchestrationLogin</code> <span className="text-slate-500">- Orchestration</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/MerchantLogin</code> <span className="text-slate-500">- Merchant Portal</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Advanced Services</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/CryptoGatewayLogin</code> <span className="text-slate-500">- VASP/Crypto</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/RWAProviderLogin</code> <span className="text-slate-500">- RWA Provider</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/AssetIssuerLogin</code> <span className="text-slate-500">- Asset Issuer</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/InvestorLogin</code> <span className="text-slate-500">- RWA Investor</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-3 text-slate-700">Reporting & Analytics</p>
                                    <div className="space-y-2 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/TaxManagement</code> <span className="text-slate-500">- Tax Config</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/EInvoicingDashboard</code> <span className="text-slate-500">- E-Invoicing</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/ESGReportingDashboard</code> <span className="text-slate-500">- ESG Reports</span></div>
                                        <div><code className="bg-white px-2 py-1 rounded text-xs">/PCIComplianceDashboard</code> <span className="text-slate-500">- PCI Compliance</span></div>
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