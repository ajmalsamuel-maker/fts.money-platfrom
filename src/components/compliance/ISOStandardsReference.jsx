import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Shield, CreditCard, Globe, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ISO_STANDARDS = [
    {
        id: 'iso20022',
        standard: 'ISO 20022',
        title: 'Financial Services - Universal Financial Industry Message Scheme',
        icon: FileText,
        status: 'Integrated',
        description: 'Comprehensive message format for financial transactions including payments, securities, trade services, cards, and foreign exchange.',
        implementations: [
            { name: 'moov-io/iso20022', url: 'https://github.com/moov-io/iso20022', language: 'Go' },
            { name: 'svapnil/iso20022.js', url: 'https://github.com/svapnil/iso20022.js', language: 'JavaScript' },
            { name: 'aws-samples/iso20022-message-generator', url: 'https://github.com/aws-samples/iso20022-message-generator', language: 'Python' }
        ],
        messages: ['pacs.008 - Credit Transfer', 'pain.001 - Payment Initiation', 'camt.053 - Bank Statement'],
        coverage: 'System-wide transaction messaging'
    },
    {
        id: 'iso8583',
        standard: 'ISO 8583',
        title: 'Financial Transaction Card Messages',
        icon: CreditCard,
        status: 'Integrated',
        description: 'International standard for card transaction messages between payment terminals and financial institutions.',
        implementations: [
            { name: 'MollardMichael/iso8583-typescript', url: 'https://github.com/MollardMichael/iso8583-typescript', language: 'TypeScript' },
            { name: 'zemuldo/iso_8583', url: 'https://github.com/zemuldo/iso_8583', language: 'JavaScript' },
            { name: 'neil-pan-s/j-iso8583', url: 'https://github.com/neil-pan-s/j-iso8583', language: 'JavaScript' }
        ],
        messages: ['0100 - Authorization Request', '0200 - Financial Transaction', '0400 - Reversal', '0800 - Network Management'],
        coverage: 'Card network connectivity, POS transactions'
    },
    {
        id: 'iso4217',
        standard: 'ISO 4217',
        title: 'Currency Codes',
        icon: Globe,
        status: 'Integrated',
        description: '3-letter alphabetic and 3-digit numeric codes for currencies, including minor unit specifications.',
        implementations: [
            { name: 'datahub.io/core/currency-codes', url: 'https://datahub.io/core/currency-codes', language: 'JSON' },
            { name: 'Built-in implementation', url: '/components/utils/iso4217.js', language: 'JavaScript' }
        ],
        messages: ['Complete currency code list', 'Minor units (decimals)', 'Numeric codes'],
        coverage: 'All transaction amounts, currency conversions'
    },
    {
        id: 'iso3166',
        standard: 'ISO 3166-1',
        title: 'Country Codes',
        icon: Globe,
        status: 'Integrated',
        description: 'Alpha-2, alpha-3, and numeric country codes for international representation.',
        implementations: [
            { name: 'iso-3166-1-codes (NPM)', url: 'https://www.npmjs.com/package/iso-3166-1-codes', language: 'JavaScript' },
            { name: 'Built-in implementation', url: '/components/utils/countries.js', language: 'JavaScript' }
        ],
        messages: ['2-letter codes (US, GB)', '3-letter codes (USA, GBR)', 'Numeric codes'],
        coverage: 'Merchant locations, customer data, compliance'
    },
    {
        id: 'iso9362',
        standard: 'ISO 9362',
        title: 'Business Identifier Codes (BIC/SWIFT)',
        icon: FileText,
        status: 'Integrated',
        description: 'Unique identification codes for financial institutions globally (SWIFT codes).',
        implementations: [
            { name: 'ibantools', url: 'https://github.com/koblas/ibankit-js', language: 'JavaScript' },
            { name: 'Built-in implementation', url: '/components/utils/ibanBic.js', language: 'JavaScript' }
        ],
        messages: ['8-character BIC codes', '11-character BIC with branch', 'Validation and parsing'],
        coverage: 'Bank identification, wire transfers, SWIFT messaging'
    },
    {
        id: 'iso13616',
        standard: 'ISO 13616',
        title: 'International Bank Account Number (IBAN)',
        icon: FileText,
        status: 'Integrated',
        description: 'Standardized international bank account numbering with validation.',
        implementations: [
            { name: 'ibantools', url: 'https://github.com/koblas/ibankit-js', language: 'JavaScript' },
            { name: 'Built-in implementation', url: '/components/utils/ibanBic.js', language: 'JavaScript' }
        ],
        messages: ['IBAN validation', 'Country-specific formats', 'Check digit calculation'],
        coverage: 'International bank transfers, SEPA payments'
    },
    {
        id: 'iso27001',
        standard: 'ISO 27001:2022',
        title: 'Information Security Management',
        icon: Shield,
        status: 'Compliance Framework',
        description: 'International standard for information security management systems (ISMS).',
        implementations: [
            { name: 'Vanta Compliance Platform', url: 'https://www.vanta.com/collection/iso-27001', language: 'Platform' },
            { name: 'ISO.org Official Standard', url: 'https://www.iso.org/standard/27001', language: 'Standard' }
        ],
        messages: ['93 controls across 4 categories', 'Organizational, People, Physical, Technological', 'Incident management & compliance'],
        coverage: 'Information security, risk management, compliance'
    }
];

export default function ISOStandardsReference() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    ISO Standards Implementation Reference
                </CardTitle>
                <p className="text-sm text-slate-500 mt-2">
                    Comprehensive implementation of international payment and security standards
                </p>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Implementation Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-3">
                        {ISO_STANDARDS.map((std) => {
                            const Icon = std.icon;
                            return (
                                <div key={std.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{std.standard}</h3>
                                                    <Badge variant={std.status === 'Integrated' ? 'default' : 'secondary'} className="text-xs">
                                                        {std.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">{std.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{std.description}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {std.messages.slice(0, 3).map((msg, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {msg}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        {ISO_STANDARDS.map((std) => (
                            <div key={std.id} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="font-semibold">{std.standard}</h3>
                                    <Badge variant="outline">{std.status}</Badge>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-slate-600 mb-1">Coverage:</p>
                                        <p className="text-sm text-slate-700">{std.coverage}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-600 mb-2">Implementations:</p>
                                        <div className="space-y-2">
                                            {std.implementations.map((impl, idx) => (
                                                <a
                                                    key={idx}
                                                    href={impl.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                                        <span className="text-sm font-mono">{impl.name}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {impl.language}
                                                    </Badge>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}