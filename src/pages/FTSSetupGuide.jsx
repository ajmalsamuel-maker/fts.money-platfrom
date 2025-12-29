import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Building2, Code, ArrowRight } from 'lucide-react';

export default function FTSSetupGuide() {
    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar currentPage="FTSSetupGuide" />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8 max-w-5xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">FTS.Money Setup Guide</h1>
                    <p className="text-gray-600 mb-8">Complete guide to accessing and configuring all services</p>

                    {/* Platform Admin Access */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">1</div>
                                Platform Admin Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium">Login URL:</p>
                                <code className="text-sm bg-slate-100 px-3 py-1 rounded">/PlatformAdminLogin</code>
                            </div>
                            <div>
                                <p className="font-medium mb-2">Create admin account:</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 ml-4">
                                    <li>Go to /PlatformAdminRegister</li>
                                    <li>Enter email, password, full name</li>
                                    <li>Select role (super_admin for full access)</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ISO Gateway Service */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-6 w-6 text-indigo-600" />
                                ISO Gateway Service
                                <Badge className="bg-indigo-100 text-indigo-700">Message Translation</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <p className="font-medium text-indigo-900 mb-2">🎯 Purpose:</p>
                                <p className="text-sm text-indigo-800">Translate between ISO 8583 ↔ ISO 20022 payment messages</p>
                            </div>

                            <div>
                                <p className="font-medium mb-2">Setup Flow:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="font-medium">Create Customer (Platform Admin)</p>
                                            <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">ISO Gateway Service → Customers</code></p>
                                            <p className="text-sm text-slate-600">Click "Add Customer" → Enter company details, email, password</p>
                                            <p className="text-xs text-slate-500 mt-1">✅ Optional: Enable orchestration feature if customer needs routing</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="font-medium">Customer Login</p>
                                            <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/ISOGatewayLogin</code></p>
                                            <p className="text-sm text-slate-600">Use email + password from step 1</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                        <div>
                                            <p className="font-medium">Configure Portal</p>
                                            <p className="text-sm text-slate-600 space-y-1">
                                                <span className="block">• <strong>API Keys tab:</strong> Create production/test keys</span>
                                                <span className="block">• <strong>Connections tab:</strong> Create translation connections</span>
                                                <span className="block">• <strong>Routing tab:</strong> Configure routing rules (if enabled)</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PSP Service */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-emerald-600" />
                                PSP Platform
                                <Badge className="bg-emerald-100 text-emerald-700">Full Payment Platform</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-emerald-50 rounded-lg">
                                <p className="font-medium text-emerald-900 mb-2">🎯 Purpose:</p>
                                <p className="text-sm text-emerald-800">Complete white-label payment service provider platform</p>
                            </div>

                            <div>
                                <p className="font-medium mb-2">Setup Flow:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="font-medium">Provision PSP Instance (Platform Admin)</p>
                                            <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">PSP Operations → PSP Instances</code></p>
                                            <p className="text-sm text-slate-600">Click "Add Service" → Select "PSP Instance" → Complete wizard</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="font-medium">Create PSP Admin User</p>
                                            <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Users & Access → PSP Administrators</code></p>
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
                                            <p className="font-medium">Enable Orchestration (Optional)</p>
                                            <p className="text-sm text-slate-600">Platform Admin → Edit PSP → Add "orchestration" to enabled_features</p>
                                            <p className="text-sm text-slate-600">PSP staff can then access: <code className="bg-slate-100 px-2 py-0.5 rounded">/PSPRouting</code></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orchestration Service */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="h-6 w-6 text-purple-600" />
                                Orchestration Service (Standalone)
                                <Badge className="bg-purple-100 text-purple-700">Smart Routing</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <p className="font-medium text-purple-900 mb-2">🎯 Purpose:</p>
                                <p className="text-sm text-purple-800">Intelligent payment/payout routing without full PSP platform</p>
                            </div>

                            <div>
                                <p className="font-medium mb-2">Setup Flow:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="font-medium">Create Customer (Platform Admin)</p>
                                            <p className="text-sm text-slate-600">Navigate to: <code className="bg-slate-100 px-2 py-0.5 rounded">Orchestration Service → Customers</code></p>
                                            <p className="text-sm text-slate-600">Click "Add Customer" → Enter company details, email, password</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="font-medium">Customer Login</p>
                                            <p className="text-sm text-slate-600">URL: <code className="bg-slate-100 px-2 py-0.5 rounded">/OrchestrationLogin</code></p>
                                            <p className="text-sm text-slate-600">Use email + password from step 1</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                        <div>
                                            <p className="font-medium">Configure Routing Rules</p>
                                            <p className="text-sm text-slate-600 space-y-1">
                                                <span className="block">• <strong>Payment Routing tab:</strong> Create rules for payments</span>
                                                <span className="block">• <strong>Payout Routing tab:</strong> Create rules for payouts</span>
                                                <span className="block">• <strong>Execution Logs tab:</strong> Monitor routing decisions</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crypto & RWA Services */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">$</div>
                                    Crypto Banking Gateway
                                    <Badge className="bg-cyan-100 text-cyan-700">White-label Crypto</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 bg-cyan-50 rounded-lg">
                                    <p className="font-medium text-cyan-900 mb-1">🎯 Purpose:</p>
                                    <p className="text-sm text-cyan-800">White-label crypto banking (wallets, IBANs, cards)</p>
                                </div>
                                <div className="text-sm space-y-2">
                                    <p><strong>Platform Admin:</strong> Create customer via Crypto Banking → Customers</p>
                                    <p><strong>Customer Login:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded">/CryptoGatewayLogin</code></p>
                                    <p className="text-xs text-slate-600">Powered by Striga integration</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">R</div>
                                    RWA Tokenization Platform
                                    <Badge className="bg-amber-100 text-amber-700">Real-World Assets</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <p className="font-medium text-amber-900 mb-1">🎯 Purpose:</p>
                                    <p className="text-sm text-amber-800">Tokenize and manage real-world assets on blockchain</p>
                                </div>
                                <div className="text-sm space-y-2">
                                    <p><strong>Platform Admin:</strong> Create provider via RWA Platform → Providers</p>
                                    <p><strong>Provider Login:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded">/RWAProviderLogin</code></p>
                                    <p className="text-xs text-slate-600">Asset issuers → Investors → Trading</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Reference */}
                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
                        <CardHeader>
                            <CardTitle>Quick Reference - Login URLs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="font-medium text-sm mb-2">Platform Admin</p>
                                    <div className="space-y-1 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded">/PlatformAdminLogin</code> - FTS Control Panel</div>
                                        <div><code className="bg-white px-2 py-1 rounded">/CommunityPortalLogin</code> - Community Portal</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-2">Core Services</p>
                                    <div className="space-y-1 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded">/PSPLogin</code> - PSP Platform</div>
                                        <div><code className="bg-white px-2 py-1 rounded">/ISOGatewayLogin</code> - ISO Gateway</div>
                                        <div><code className="bg-white px-2 py-1 rounded">/OrchestrationLogin</code> - Orchestration</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-2">Advanced Services</p>
                                    <div className="space-y-1 text-sm">
                                        <div><code className="bg-white px-2 py-1 rounded">/CryptoGatewayLogin</code> - Crypto Banking</div>
                                        <div><code className="bg-white px-2 py-1 rounded">/RWAProviderLogin</code> - RWA Platform</div>
                                        <div><code className="bg-white px-2 py-1 rounded">/MerchantLogin</code> - Merchant Portal</div>
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