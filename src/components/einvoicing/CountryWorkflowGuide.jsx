import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    CheckCircle, 
    AlertTriangle, 
    ExternalLink, 
    FileText, 
    Code, 
    Info,
    Lightbulb,
    Book
} from 'lucide-react';

// Comprehensive workflow guides for each country
const COUNTRY_WORKFLOWS = {
    zatca_saudi: {
        name: 'Saudi Arabia (ZATCA)',
        overview: 'ZATCA e-invoicing is mandatory for all VAT-registered businesses in Saudi Arabia, implementing a phased approach with Phase 1 (Generation) and Phase 2 (Integration/Clearance).',
        steps: [
            {
                title: 'Phase 1: E-Invoice Generation',
                description: 'Generate compliant e-invoices using ZATCA-approved solutions',
                actions: [
                    'Implement UBL 2.1 XML format',
                    'Include mandatory fields (Seller VAT, Buyer VAT, Invoice hash, QR code)',
                    'Generate cryptographic stamp (CSR)',
                    'Embed QR code with invoice data'
                ]
            },
            {
                title: 'Phase 2: Integration & Clearance',
                description: 'Integrate with ZATCA platform for real-time clearance',
                actions: [
                    'Obtain compliance CSID certificate',
                    'Implement Clearance API for B2B/B2G invoices',
                    'Implement Reporting API for B2C simplified invoices',
                    'Handle real-time validation responses'
                ]
            },
            {
                title: 'Testing & Certification',
                description: 'Complete ZATCA compliance testing',
                actions: [
                    'Test in ZATCA sandbox environment',
                    'Submit compliance certificate request',
                    'Validate cryptographic implementation',
                    'Obtain production credentials'
                ]
            }
        ],
        resources: [
            { title: 'ZATCA Developer Portal', url: 'https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/default.aspx', type: 'docs' },
            { title: 'ZATCA Sandbox Environment', url: 'https://sandbox.zatca.gov.sa', type: 'api' },
            { title: 'UBL 2.1 Specification', url: 'https://docs.oasis-open.org/ubl/UBL-2.1.html', type: 'spec' },
            { title: 'SDK & Code Examples', url: 'https://github.com/zatca', type: 'code' }
        ],
        challenges: [
            {
                issue: 'Cryptographic Stamp Generation',
                solution: 'Use certified HSM modules or cloud KMS for CSR generation. Ensure private keys are securely stored.',
                severity: 'high'
            },
            {
                issue: 'Real-time Clearance Latency',
                solution: 'Implement async processing with retry logic. Cache clearance responses. Use webhook notifications.',
                severity: 'medium'
            },
            {
                issue: 'QR Code Generation',
                solution: 'Use TLV (Tag-Length-Value) encoding as per ZATCA specs. Include all required fields in correct order.',
                severity: 'low'
            }
        ],
        apiEndpoint: 'https://api.zatca.gov.sa',
        documentation: 'https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/default.aspx'
    },
    
    ksef_poland: {
        name: 'Poland (KSeF)',
        overview: 'KSeF (National e-Invoicing System) is Poland\'s mandatory structured e-invoicing system using FA(3) XML format.',
        steps: [
            {
                title: 'System Registration',
                description: 'Register with Polish tax authority',
                actions: [
                    'Obtain NIP (tax identification number)',
                    'Register business in KSeF portal',
                    'Generate API credentials',
                    'Configure authorization token'
                ]
            },
            {
                title: 'FA(3) Implementation',
                description: 'Implement Polish FA(3) XML schema',
                actions: [
                    'Validate against FA(3) XSD schema',
                    'Include mandatory Polish VAT fields',
                    'Implement invoice numbering per Polish rules',
                    'Add buyer/seller NIP numbers'
                ]
            },
            {
                title: 'API Integration',
                description: 'Integrate with KSeF REST API',
                actions: [
                    'Authenticate using OAuth 2.0',
                    'Submit invoices via REST API',
                    'Poll for acceptance status',
                    'Handle rejection scenarios'
                ]
            }
        ],
        resources: [
            { title: 'KSeF Official Portal', url: 'https://www.gov.pl/web/kas/ksef', type: 'docs' },
            { title: 'API Documentation', url: 'https://ksef.mf.gov.pl/api', type: 'api' },
            { title: 'FA(3) Schema', url: 'https://ksef-test.mf.gov.pl/schema', type: 'spec' }
        ],
        challenges: [
            {
                issue: 'FA(3) Schema Complexity',
                solution: 'Use XML validation libraries. Create templates for common invoice types. Leverage schema documentation.',
                severity: 'high'
            },
            {
                issue: 'B2B Mandate Timeline',
                solution: 'Prepare infrastructure early. Pilot with key customers. Monitor official deadline announcements.',
                severity: 'medium'
            }
        ],
        apiEndpoint: 'https://ksef.mf.gov.pl/api',
        documentation: 'https://www.gov.pl/web/kas/ksef'
    },

    gst_india: {
        name: 'India (GST e-Invoice)',
        overview: 'GST e-invoicing is mandatory for businesses with turnover exceeding ₹5 crore, using JSON format and IRP (Invoice Registration Portal) system.',
        steps: [
            {
                title: 'IRP Registration',
                description: 'Register with Invoice Registration Portal',
                actions: [
                    'Register GSTIN on IRP portal',
                    'Generate API credentials (username/password)',
                    'Configure callback URLs',
                    'Test sandbox environment'
                ]
            },
            {
                title: 'JSON Invoice Generation',
                description: 'Generate e-invoices in prescribed JSON format',
                actions: [
                    'Implement mandatory 34 fields',
                    'Calculate invoice hash (SHA-256)',
                    'Include HSN/SAC codes',
                    'Add GSTIN of supplier and recipient'
                ]
            },
            {
                title: 'IRN Generation',
                description: 'Generate Invoice Reference Number via IRP',
                actions: [
                    'Submit invoice JSON to IRP',
                    'Receive IRN and signed QR code',
                    'Generate e-invoice PDF with IRN',
                    'Auto-report to GST/E-way bill portal'
                ]
            }
        ],
        resources: [
            { title: 'GST E-Invoice Portal', url: 'https://einvoice1.gst.gov.in', type: 'docs' },
            { title: 'IRP API Documentation', url: 'https://einvoice1.gst.gov.in/Others/API', type: 'api' },
            { title: 'Schema Specification', url: 'https://einvoice1.gst.gov.in/Others/Schema', type: 'spec' },
            { title: 'Sandbox Environment', url: 'https://einvoice1.gst.gov.in/sandbox', type: 'api' }
        ],
        challenges: [
            {
                issue: 'IRP Portal Downtime',
                solution: 'Implement retry mechanism with exponential backoff. Use multiple IRP providers (NIC, GSTN). Cache IRN responses.',
                severity: 'high'
            },
            {
                issue: 'HSN Code Accuracy',
                solution: 'Maintain HSN master database. Validate against official HSN list. Use fuzzy matching for product lookup.',
                severity: 'medium'
            },
            {
                issue: 'QR Code Generation',
                solution: 'Use signed QR from IRP response. Don\'t generate manually. Embed in PDF using standard libraries.',
                severity: 'low'
            }
        ],
        apiEndpoint: 'https://einvoice1.gst.gov.in/api',
        documentation: 'https://einvoice1.gst.gov.in'
    },

    chorus_france: {
        name: 'France (Chorus Pro)',
        overview: 'Chorus Pro is France\'s e-invoicing platform for B2G transactions (mandatory) and future B2B transactions (planned).',
        steps: [
            {
                title: 'Chorus Pro Registration',
                description: 'Register on Chorus Pro platform',
                actions: [
                    'Create account on Chorus Pro',
                    'Validate company SIRET number',
                    'Configure organizational structure',
                    'Set up user roles and permissions'
                ]
            },
            {
                title: 'Format Implementation',
                description: 'Implement UBL or CII format',
                actions: [
                    'Choose between UBL 2.1 or UN/CEFACT CII',
                    'Include mandatory French fields',
                    'Add service code for public entities',
                    'Validate against Chorus Pro schema'
                ]
            },
            {
                title: 'Submission & Tracking',
                description: 'Submit invoices and track status',
                actions: [
                    'Submit via API or portal upload',
                    'Track invoice status (deposited, validated, paid)',
                    'Handle rejection notifications',
                    'Archive validated invoices'
                ]
            }
        ],
        resources: [
            { title: 'Chorus Pro Portal', url: 'https://chorus-pro.gouv.fr', type: 'docs' },
            { title: 'API Documentation', url: 'https://communaute.chorus-pro.gouv.fr', type: 'api' },
            { title: 'Technical Specifications', url: 'https://chorus-pro.gouv.fr/cpp/file/CDP_Specifications_externes_v13.0.0.pdf', type: 'spec' }
        ],
        challenges: [
            {
                issue: 'Service Code Matching',
                solution: 'Maintain database of public entity service codes. Validate with recipient before submission.',
                severity: 'medium'
            },
            {
                issue: 'B2B Transition Planning',
                solution: 'Monitor official announcements. Pilot with volunteer partners. Prepare dual-format capability.',
                severity: 'medium'
            }
        ],
        apiEndpoint: 'https://chorus-pro.gouv.fr/api',
        documentation: 'https://chorus-pro.gouv.fr'
    }
};

export default function CountryWorkflowGuide({ countryCode, onClose }) {
    const workflow = COUNTRY_WORKFLOWS[countryCode];

    if (!workflow) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Workflow guide not available for this country.</p>
                    <p className="text-sm text-slate-400 mt-2">Check the Global Registry for basic integration details.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Book className="h-6 w-6" />
                        {workflow.name} - Integration Guide
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        {workflow.overview}
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="steps">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="steps">Integration Steps</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="challenges">Common Issues</TabsTrigger>
                </TabsList>

                {/* Integration Steps */}
                <TabsContent value="steps" className="space-y-4">
                    {workflow.steps.map((step, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                        {idx + 1}
                                    </span>
                                    {step.title}
                                </CardTitle>
                                <CardDescription>{step.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {step.actions.map((action, actionIdx) => (
                                        <li key={actionIdx} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-slate-700">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Resources */}
                <TabsContent value="resources" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Official Resources & Documentation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {workflow.resources.map((resource, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        {resource.type === 'docs' && <FileText className="h-5 w-5 text-blue-600" />}
                                        {resource.type === 'api' && <Code className="h-5 w-5 text-purple-600" />}
                                        {resource.type === 'spec' && <Book className="h-5 w-5 text-green-600" />}
                                        {resource.type === 'code' && <Code className="h-5 w-5 text-orange-600" />}
                                        <div>
                                            <div className="font-medium text-sm">{resource.title}</div>
                                            <div className="text-xs text-slate-500">{resource.url}</div>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => window.open(resource.url, '_blank')}
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Open
                                    </Button>
                                </div>
                            ))}

                            <Alert className="bg-blue-50 border-blue-200 mt-4">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800 text-sm">
                                    <strong>API Endpoint:</strong> {workflow.apiEndpoint}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Common Challenges */}
                <TabsContent value="challenges" className="space-y-4">
                    {workflow.challenges.map((challenge, idx) => (
                        <Card key={idx} className={
                            challenge.severity === 'high' ? 'border-red-200' :
                            challenge.severity === 'medium' ? 'border-orange-200' :
                            'border-yellow-200'
                        }>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className={`h-5 w-5 ${
                                        challenge.severity === 'high' ? 'text-red-600' :
                                        challenge.severity === 'medium' ? 'text-orange-600' :
                                        'text-yellow-600'
                                    }`} />
                                    {challenge.issue}
                                    <Badge variant="outline" className="ml-auto">
                                        {challenge.severity} priority
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-sm text-slate-700 mb-1">Solution:</div>
                                        <p className="text-sm text-slate-600">{challenge.solution}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            {onClose && (
                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close Guide</Button>
                </div>
            )}
        </div>
    );
}

// Export workflow data for use in other components
export { COUNTRY_WORKFLOWS };