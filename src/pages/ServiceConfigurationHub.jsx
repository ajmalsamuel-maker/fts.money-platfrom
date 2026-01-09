import React from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from '@/utils';
import { 
    Settings, 
    Wallet,
    Code,
    GitBranch,
    Package,
    FileText,
    Shield,
    ChevronRight,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const serviceConfigs = [
    {
        id: 'iso_gateway',
        name: 'ISO Gateway Configuration',
        description: 'Configure message formats, network endpoints, and routing rules',
        icon: Code,
        page: 'ISOGatewayServiceConfig',
        configured: true,
        sections: ['Message Formats', 'Network Endpoints', 'Security Settings', 'Routing Rules']
    },
    {
        id: 'rwa_tokenization',
        name: 'RWA Tokenization Configuration',
        description: 'Set up blockchain networks, smart contracts, and asset schemas',
        icon: Package,
        page: 'RWATokenizationServiceConfig',
        configured: false,
        sections: ['Blockchain Networks', 'Smart Contract Templates', 'Asset Schemas', 'Custody Integration']
    },
    {
        id: 'crypto_vasp',
        name: 'Crypto VASP Configuration',
        description: 'Configure Striga integration, wallet settings, and compliance',
        icon: Wallet,
        page: 'CryptoVASPServiceConfig',
        configured: true,
        sections: ['Provider Settings', 'KYC Configuration', 'Travel Rule', 'Card Issuance']
    },
    {
        id: 'orchestration',
        name: 'Orchestration Configuration',
        description: 'Set up payment routing, provider integrations, and smart routing',
        icon: GitBranch,
        page: 'OrchestrationServiceConfig',
        configured: false,
        sections: ['Provider Integrations', 'Routing Engine', 'Fallback Rules', 'Load Balancing']
    },
    {
        id: 'tax_management',
        name: 'Tax Management Configuration',
        description: 'Configure tax calculation APIs, jurisdictions, and compliance rules',
        icon: FileText,
        page: 'TaxManagementServiceConfig',
        configured: true,
        sections: ['API Integration', 'Jurisdiction Rules', 'Rate Updates', 'Compliance Reports']
    },
    {
        id: 'pci_compliance',
        name: 'PCI Compliance Configuration',
        description: 'Set up monitoring tools, QSA access, and compliance workflows',
        icon: Shield,
        page: 'PCIComplianceServiceConfig',
        configured: true,
        sections: ['Monitoring Tools', 'QSA Portal', 'Control Testing', 'Evidence Management']
    }
];

export default function ServiceConfigurationHub() {
    const { platformUser } = usePlatformAuth();

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ServiceConfigurationHub"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Settings className="h-8 w-8 text-blue-600" />
                            Service Configuration Hub
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Configure technical parameters, integrations, and compliance settings for each FTS.Money service
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {serviceConfigs.map(service => {
                            const Icon = service.icon;
                            return (
                                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Icon className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{service.name}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {service.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            {service.configured ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Configured
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Setup Required
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600 mb-2">Configuration Sections:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {service.sections.map(section => (
                                                        <div key={section} className="flex items-center gap-1 text-xs text-slate-600">
                                                            <ChevronRight className="h-3 w-3 text-slate-400" />
                                                            {section}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button 
                                                className="w-full mt-4"
                                                onClick={() => window.location.href = createPageUrl(service.page)}
                                            >
                                                Configure Service
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="mt-8 bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-2">About Service Configuration</h3>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Service configuration pages allow you to set up technical parameters, API integrations, 
                                        and compliance settings for each FTS.Money service. These settings are platform-wide and 
                                        affect all customers using the service. Configure pricing separately on the 
                                        <a href={createPageUrl('PlatformPricingConfiguration')} className="underline ml-1">
                                            Pricing Configuration page
                                        </a>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}