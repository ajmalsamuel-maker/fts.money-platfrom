import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function GlobalEInvoicingGapAnalysis() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Global E-Invoicing Standards - Gap Analysis
                </h1>
                <p className="text-lg text-slate-600">
                    Comprehensive review of worldwide e-invoicing mandates and tax reporting systems
                </p>
                <div className="text-sm text-slate-500">
                    Research Date: January 8, 2026 | Coverage: 60+ Countries
                </div>
            </div>

            {/* Executive Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Key Finding:</strong> FTS.Money platform currently supports 8 major e-invoicing standards. 
                            This analysis identified <strong>25+ additional country-specific systems</strong> that should be integrated 
                            for complete global coverage.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-700">9</div>
                            <div className="text-sm text-slate-600">Currently Supported</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-3xl font-bold text-orange-700">25+</div>
                            <div className="text-sm text-slate-600">Missing Systems</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-700">60+</div>
                            <div className="text-sm text-slate-600">Countries Analyzed</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Currently Supported Standards */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Currently Supported Standards (9)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: 'Peppol (Universal)', countries: 'EU, Singapore, Australia, NZ', format: 'UBL 2.1 XML', status: '✅' },
                            { name: 'ZATCA (Saudi Arabia)', countries: 'Saudi Arabia', format: 'UBL 2.1 XML', status: '✅' },
                            { name: 'FatturaPA (Italy)', countries: 'Italy', format: 'XML', status: '✅' },
                            { name: 'CFDI (Mexico)', countries: 'Mexico', format: 'XML', status: '✅' },
                            { name: 'XRechnung (Germany)', countries: 'Germany', format: 'XML', status: '✅' },
                            { name: 'FacturaE (Spain)', countries: 'Spain', format: 'XML', status: '✅' },
                            { name: 'EHF (Norway)', countries: 'Norway', format: 'UBL 2.0 XML', status: '✅' },
                            { name: 'Finvoice (Finland)', countries: 'Finland', format: 'XML', status: '✅' },
                            { name: 'PRAL/FBR (Pakistan)', countries: 'Pakistan', format: 'JSON', status: '✅ NEW' }
                        ].map((standard, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                                <div className="text-2xl">{standard.status}</div>
                                <div>
                                    <div className="font-semibold text-sm">{standard.name}</div>
                                    <div className="text-xs text-slate-600">{standard.countries}</div>
                                    <Badge variant="outline" className="mt-1 text-xs">{standard.format}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* CRITICAL MISSING: Asia Pacific */}
            <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                        <AlertCircle className="h-5 w-5" />
                        CRITICAL MISSING: Asia Pacific (10 Systems)
                    </CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="space-y-4">
                        {[
                            {
                                country: '🇮🇳 India',
                                system: 'GST e-Invoice (IRN/IRP)',
                                format: 'JSON',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory since Oct 2020',
                                threshold: '₹5 crore turnover',
                                api: 'Invoice Registration Portal (IRP)',
                                priority: 'HIGH',
                                notes: 'Real-time IRN generation, 64-char hash, multiple IRPs'
                            },
                            {
                                country: '🇲🇾 Malaysia',
                                system: 'MyInvois (LHDN)',
                                format: 'JSON or XML',
                                model: 'Clearance',
                                mandate: 'Phased 2024-2025',
                                threshold: 'RM100M (2024), all by 2027',
                                api: 'MyInvois Portal API',
                                priority: 'HIGH',
                                notes: 'UBL 2.1 format, real-time validation by IRBM'
                            },
                            {
                                country: '🇮🇩 Indonesia',
                                system: 'e-Faktur Pajak → Coretax',
                                format: 'XML',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory since 2016',
                                threshold: 'IDR 4.7B turnover',
                                api: 'Coretax system (2026)',
                                priority: 'HIGH',
                                notes: 'Migrating from e-Faktur to Coretax by Dec 2025'
                            },
                            {
                                country: '🇸🇬 Singapore',
                                system: 'InvoiceNow (Peppol)',
                                format: 'UBL 2.1 XML',
                                model: 'Network-based',
                                mandate: 'Mandatory from Nov 2025',
                                threshold: 'New GST registrants',
                                api: 'Peppol Access Point',
                                priority: 'MEDIUM',
                                notes: 'Peppol-based, PINT A-NZ spec, voluntary GST registrants'
                            },
                            {
                                country: '🇻🇳 Vietnam',
                                system: 'e-Invoice (GDT)',
                                format: 'XML',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory since July 2022',
                                threshold: 'All taxpayers',
                                api: 'General Department of Taxation',
                                priority: 'MEDIUM',
                                notes: 'Digital signature required, real-time validation'
                            },
                            {
                                country: '🇹🇭 Thailand',
                                system: 'e-Tax Invoice & e-Receipt',
                                format: 'XML',
                                model: 'Post-audit',
                                mandate: 'Voluntary (widely adopted)',
                                threshold: 'Optional',
                                api: 'Revenue Department',
                                priority: 'LOW',
                                notes: 'Tax incentives for e-tax invoice adoption'
                            },
                            {
                                country: '🇵🇭 Philippines',
                                system: 'e-Invoicing (BIR)',
                                format: 'XML',
                                model: 'Post-audit',
                                mandate: 'Planned 2026-2027',
                                threshold: 'TBD',
                                api: 'Bureau of Internal Revenue',
                                priority: 'MEDIUM',
                                notes: 'Currently in pilot phase, full mandate expected'
                            },
                            {
                                country: '🇰🇷 South Korea',
                                system: 'e-Tax Invoice (NTS)',
                                format: 'XML',
                                model: 'Real-time reporting',
                                mandate: 'Mandatory since 2011',
                                threshold: 'KRW 300M turnover',
                                api: 'National Tax Service',
                                priority: 'MEDIUM',
                                notes: 'One of earliest CTC systems globally'
                            },
                            {
                                country: '🇯🇵 Japan',
                                system: 'Qualified Invoice (JCT) + JP PINT',
                                format: 'Peppol (XML)',
                                model: 'Post-audit',
                                mandate: 'Effective Oct 2023',
                                threshold: 'All JCT taxpayers',
                                api: 'Peppol JP-PINT',
                                priority: 'MEDIUM',
                                notes: 'Qualified Invoice System for consumption tax, Peppol-based'
                            },
                            {
                                country: '🇦🇺 Australia',
                                system: 'E-Invoicing (Peppol)',
                                format: 'UBL 2.1 XML',
                                model: 'Network-based',
                                mandate: 'B2G mandatory (phased)',
                                threshold: 'ATO suppliers',
                                api: 'Peppol Access Point',
                                priority: 'LOW',
                                notes: 'Peppol-based, government mandating for suppliers'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-bold text-lg">{item.country}</div>
                                        <div className="text-sm font-semibold text-slate-700">{item.system}</div>
                                    </div>
                                    <Badge variant={item.priority === 'HIGH' ? 'destructive' : item.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                                        {item.priority}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3">
                                    <div><span className="font-semibold">Format:</span> {item.format}</div>
                                    <div><span className="font-semibold">Model:</span> {item.model}</div>
                                    <div><span className="font-semibold">Mandate:</span> {item.mandate}</div>
                                    <div><span className="font-semibold">Threshold:</span> {item.threshold}</div>
                                </div>
                                <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                                    <span className="font-semibold">API:</span> {item.api}
                                </div>
                                <div className="mt-2 text-xs text-slate-600 italic">
                                    {item.notes}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* CRITICAL MISSING: Latin America */}
            <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        CRITICAL MISSING: Latin America (6 Systems)
                    </CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="space-y-4">
                        {[
                            {
                                country: '🇧🇷 Brazil',
                                system: 'NF-e / NFS-e / NFCom',
                                format: 'XML',
                                model: 'Pre-clearance (Authorization)',
                                mandate: 'Mandatory since 2006',
                                threshold: 'All taxpayers',
                                api: 'SEFAZ (State Tax Authority)',
                                priority: 'CRITICAL',
                                notes: 'Multiple document types: NF-e (goods), NFS-e (services), NFCom (telecom). Most mature system globally.'
                            },
                            {
                                country: '🇨🇱 Chile',
                                system: 'DTE (SII)',
                                format: 'XML',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory since 2003',
                                threshold: 'All taxpayers',
                                api: 'Servicio de Impuestos Internos',
                                priority: 'HIGH',
                                notes: 'Pioneer in e-invoicing, CAF stamp required, 6-year archival'
                            },
                            {
                                country: '🇨🇴 Colombia',
                                system: 'Factura Electrónica (DIAN)',
                                format: 'UBL 2.1 XML',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory since 2019',
                                threshold: 'Progressive rollout',
                                api: 'DIAN validation API',
                                priority: 'HIGH',
                                notes: 'UBL 2.1 format, CUFE unique identifier, real-time validation'
                            },
                            {
                                country: '🇵🇪 Peru',
                                system: 'CPE (SUNAT)',
                                format: 'UBL 2.1 XML',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory (phased 2017)',
                                threshold: '75 UIT turnover',
                                api: 'SUNAT OSE',
                                priority: 'HIGH',
                                notes: 'Comprobantes de Pago Electrónicos, UBL format'
                            },
                            {
                                country: '🇦🇷 Argentina',
                                system: 'Factura Electrónica (AFIP)',
                                format: 'XML',
                                model: 'Authorization',
                                mandate: 'Mandatory (phased)',
                                threshold: 'Progressive by activity',
                                api: 'AFIP Web Services',
                                priority: 'MEDIUM',
                                notes: 'CAE authorization required, multiple invoice types'
                            },
                            {
                                country: '🇺🇾 Uruguay',
                                system: 'CFE (DGI)',
                                format: 'XML',
                                model: 'Pre-clearance',
                                mandate: 'Mandatory since 2012',
                                threshold: 'All taxpayers',
                                api: 'DGI',
                                priority: 'MEDIUM',
                                notes: 'Comprobantes Fiscales Electrónicos'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-bold text-lg">{item.country}</div>
                                        <div className="text-sm font-semibold text-slate-700">{item.system}</div>
                                    </div>
                                    <Badge variant={item.priority === 'CRITICAL' ? 'destructive' : 'default'}>
                                        {item.priority}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3">
                                    <div><span className="font-semibold">Format:</span> {item.format}</div>
                                    <div><span className="font-semibold">Model:</span> {item.model}</div>
                                    <div><span className="font-semibold">Mandate:</span> {item.mandate}</div>
                                    <div><span className="font-semibold">Threshold:</span> {item.threshold}</div>
                                </div>
                                <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                                    <span className="font-semibold">API:</span> {item.api}
                                </div>
                                <div className="mt-2 text-xs text-slate-600 italic">
                                    {item.notes}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* MISSING: Europe (5 Systems) */}
            <Card className="border-yellow-200">
                <CardHeader className="bg-yellow-50">
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <Clock className="h-5 w-5" />
                        MISSING: Europe (5 Systems)
                    </CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="space-y-4">
                        {[
                            {
                                country: '🇷🇴 Romania',
                                system: 'RO e-Factura + e-Transport',
                                format: 'UBL 2.1 XML (RO_CIUS)',
                                model: 'Clearance',
                                mandate: 'Mandatory July 2024 (B2B)',
                                threshold: 'All businesses',
                                api: 'ANAF e-Factura platform',
                                priority: 'HIGH',
                                notes: 'B2B, B2C, B2G mandatory. E-Transport (AWB) also mandatory.'
                            },
                            {
                                country: '🇵🇱 Poland',
                                system: 'KSeF (JPK_VAT)',
                                format: 'FA(3) XML',
                                model: 'Clearance',
                                mandate: 'Feb 2026 (large), Apr 2026 (all)',
                                threshold: 'PLN 200M (2024)',
                                api: 'KSeF 2.0 API',
                                priority: 'HIGH',
                                notes: 'National system, structured e-invoices, JPK reporting integration'
                            },
                            {
                                country: '🇹🇷 Turkey',
                                system: 'e-Fatura / e-Arşiv / e-SMM',
                                format: 'UBL-TR 1.2 XML',
                                model: 'Clearance',
                                mandate: 'Mandatory since 2012',
                                threshold: 'TRY 4M turnover',
                                api: 'GIB (Revenue Administration)',
                                priority: 'HIGH',
                                notes: 'e-Fatura (B2B), e-Arşiv (B2C), e-SMM (freelancers). QR code required.'
                            },
                            {
                                country: '🇧🇪 Belgium',
                                system: 'B2B Peppol (structured)',
                                format: 'UBL 2.1 XML (Peppol BIS)',
                                model: 'Network-based',
                                mandate: 'Mandatory Jan 2026',
                                threshold: 'All B2B',
                                api: 'Peppol Access Point',
                                priority: 'MEDIUM',
                                notes: 'Peppol-based B2B mandate, 3-month grace period'
                            },
                            {
                                country: '🇫🇷 France',
                                system: 'Chorus Pro / e-Reporting',
                                format: 'Multiple (UBL, Factur-X)',
                                model: 'Post-audit + Platform',
                                mandate: 'B2G live, B2B from 2026',
                                threshold: 'Progressive rollout',
                                api: 'Chorus Pro / PDPs',
                                priority: 'HIGH',
                                notes: 'Dual obligation: e-invoicing via PDPs + e-reporting to tax authority'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-bold text-lg">{item.country}</div>
                                        <div className="text-sm font-semibold text-slate-700">{item.system}</div>
                                    </div>
                                    <Badge variant={item.priority === 'HIGH' ? 'default' : 'secondary'}>
                                        {item.priority}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3">
                                    <div><span className="font-semibold">Format:</span> {item.format}</div>
                                    <div><span className="font-semibold">Model:</span> {item.model}</div>
                                    <div><span className="font-semibold">Mandate:</span> {item.mandate}</div>
                                    <div><span className="font-semibold">Threshold:</span> {item.threshold}</div>
                                </div>
                                <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                                    <span className="font-semibold">API:</span> {item.api}
                                </div>
                                <div className="mt-2 text-xs text-slate-600 italic">
                                    {item.notes}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* MISSING: Middle East & Africa */}
            <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Clock className="h-5 w-5" />
                        MISSING: Middle East & Africa (5 Systems)
                    </CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="space-y-4">
                        {[
                            {
                                country: '🇪🇬 Egypt',
                                system: 'e-Invoice (ETA)',
                                format: 'XML or JSON',
                                model: 'Clearance',
                                mandate: 'Mandatory (phased 2020-)',
                                threshold: 'All VAT registered',
                                api: 'Egyptian Tax Authority',
                                priority: 'HIGH',
                                notes: 'Digital signature, UUID per invoice, B2B and B2C'
                            },
                            {
                                country: '🇦🇪 UAE',
                                system: 'E-Invoicing (FTA)',
                                format: 'UBL 2.1 XML / PDF/A-3',
                                model: 'Post-audit (phased to CTC)',
                                mandate: 'Phase 1 (2022), Phase 2 (TBD)',
                                threshold: 'All VAT registered',
                                api: 'Federal Tax Authority',
                                priority: 'MEDIUM',
                                notes: 'Phase 1: structured format. Phase 2: real-time integration planned'
                            },
                            {
                                country: '🇰🇪 Kenya',
                                system: 'eTIMS',
                                format: 'JSON',
                                model: 'Real-time reporting',
                                mandate: 'Mandatory Jan 2024',
                                threshold: 'All businesses',
                                api: 'KRA eTIMS API',
                                priority: 'HIGH',
                                notes: 'Universal adoption for VAT and non-VAT, real-time transmission'
                            },
                            {
                                country: '🇪🇹 Ethiopia',
                                system: 'e-Invoice (ERCA)',
                                format: 'XML',
                                model: 'Clearance',
                                mandate: 'Mandatory (phased)',
                                threshold: 'Large taxpayers',
                                api: 'ERCA',
                                priority: 'MEDIUM',
                                notes: 'Ethiopian Revenues and Customs Authority, progressive rollout'
                            },
                            {
                                country: '🇹🇿 Tanzania',
                                system: 'VFD (EFD)',
                                format: 'XML',
                                model: 'Device-based',
                                mandate: 'Mandatory',
                                threshold: 'All VAT registered',
                                api: 'TRA Virtual Fiscal Device',
                                priority: 'LOW',
                                notes: 'Virtual Fiscal Device integration required'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-bold text-lg">{item.country}</div>
                                        <div className="text-sm font-semibold text-slate-700">{item.system}</div>
                                    </div>
                                    <Badge variant={item.priority === 'HIGH' ? 'default' : 'secondary'}>
                                        {item.priority}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3">
                                    <div><span className="font-semibold">Format:</span> {item.format}</div>
                                    <div><span className="font-semibold">Model:</span> {item.model}</div>
                                    <div><span className="font-semibold">Mandate:</span> {item.mandate}</div>
                                    <div><span className="font-semibold">Threshold:</span> {item.threshold}</div>
                                </div>
                                <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                                    <span className="font-semibold">API:</span> {item.api}
                                </div>
                                <div className="mt-2 text-xs text-slate-600 italic">
                                    {item.notes}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Implementation Roadmap */}
            <Card>
                <CardHeader>
                    <CardTitle>Recommended Implementation Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Badge variant="destructive">Q1 2026</Badge>
                                Critical Priority (9 Systems)
                            </h3>
                            <div className="pl-4 space-y-1 text-sm">
                                <div>• 🇧🇷 Brazil (NF-e/NFS-e) - Largest LATAM economy, most mature system</div>
                                <div>• 🇮🇳 India (GST e-Invoice) - 1.4B population, massive market</div>
                                <div>• 🇲🇾 Malaysia (MyInvois) - 2024 mandate, ASEAN hub</div>
                                <div>• 🇮🇩 Indonesia (Coretax) - ASEAN's largest economy</div>
                                <div>• 🇷🇴 Romania (RO e-Factura) - EU mandate active</div>
                                <div>• 🇵🇱 Poland (KSeF) - Feb/Apr 2026 mandate</div>
                                <div>• 🇹🇷 Turkey (e-Fatura) - Established system, growing economy</div>
                                <div>• 🇨🇱 Chile (DTE) - LATAM pioneer, mature system</div>
                                <div>• 🇨🇴 Colombia (DIAN) - UBL 2.1, LATAM leader</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Badge variant="default">Q2 2026</Badge>
                                High Priority (7 Systems)
                            </h3>
                            <div className="pl-4 space-y-1 text-sm">
                                <div>• 🇵🇪 Peru (CPE) - LATAM market</div>
                                <div>• 🇫🇷 France (Chorus Pro) - EU largest economy, 2026 B2B mandate</div>
                                <div>• 🇪🇬 Egypt (ETA) - MENA leader</div>
                                <div>• 🇰🇪 Kenya (eTIMS) - African hub</div>
                                <div>• 🇻🇳 Vietnam (GDT) - Fast-growing ASEAN</div>
                                <div>• 🇰🇷 South Korea (NTS) - Established system</div>
                                <div>• 🇵🇭 Philippines (BIR) - Upcoming 2026 mandate</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Badge variant="secondary">Q3-Q4 2026</Badge>
                                Medium Priority (9 Systems)
                            </h3>
                            <div className="pl-4 space-y-1 text-sm">
                                <div>• 🇸🇬 Singapore (InvoiceNow) - Peppol-based</div>
                                <div>• 🇧🇪 Belgium (B2B Peppol) - Peppol-based</div>
                                <div>• 🇦🇷 Argentina (AFIP)</div>
                                <div>• 🇺🇾 Uruguay (CFE)</div>
                                <div>• 🇦🇪 UAE (FTA)</div>
                                <div>• 🇯🇵 Japan (Qualified Invoice)</div>
                                <div>• 🇪🇹 Ethiopia (ERCA)</div>
                                <div>• 🇦🇺 Australia (Peppol) - Already supported via Peppol</div>
                                <div>• 🇹🇭 Thailand (Revenue Dept) - Voluntary but incentivized</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Technical Complexity Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Technical Complexity & Integration Effort</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg bg-red-50">
                                <div className="font-semibold text-red-800 mb-2">High Complexity (6-8 weeks)</div>
                                <div className="text-xs space-y-1">
                                    <div>• Brazil (Multiple document types)</div>
                                    <div>• India (IRN generation, multiple IRPs)</div>
                                    <div>• France (Dual system: PDP + e-reporting)</div>
                                    <div>• Romania (e-Factura + e-Transport)</div>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-orange-50">
                                <div className="font-semibold text-orange-800 mb-2">Medium Complexity (3-5 weeks)</div>
                                <div className="text-xs space-y-1">
                                    <div>• Turkey (Multiple systems: Fatura/Arşiv/SMM)</div>
                                    <div>• Poland (KSeF 2.0 API)</div>
                                    <div>• Chile, Colombia, Peru (UBL variations)</div>
                                    <div>• Indonesia (Coretax migration)</div>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-green-50">
                                <div className="font-semibold text-green-800 mb-2">Low Complexity (1-2 weeks)</div>
                                <div className="text-xs space-y-1">
                                    <div>• Singapore, Belgium (Peppol-based)</div>
                                    <div>• Egypt (Standard JSON/XML)</div>
                                    <div>• Kenya (JSON API)</div>
                                    <div>• Malaysia (UBL 2.1 standard)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Architectural Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle>Architectural Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold mb-1">1. Modular Integration Architecture</div>
                            <div className="text-xs">Create a plugin-based system where each country's e-invoicing standard is a separate module with standardized interfaces</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold mb-1">2. Universal Mapper</div>
                            <div className="text-xs">Build a universal invoice data model that can map to any regional format (UBL, JSON, proprietary XML)</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold mb-1">3. API Gateway Pattern</div>
                            <div className="text-xs">Implement a gateway that handles authentication, rate limiting, retry logic for all country-specific APIs</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold mb-1">4. Certification Management</div>
                            <div className="text-xs">Centralized digital certificate storage and management for countries requiring digital signatures</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold mb-1">5. Compliance Monitoring</div>
                            <div className="text-xs">Track mandate changes, deadline updates, and regulatory changes across all 60+ countries</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Global Coverage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Region</th>
                                    <th className="text-center p-2">Supported</th>
                                    <th className="text-center p-2">Missing</th>
                                    <th className="text-center p-2">Priority</th>
                                    <th className="text-left p-2">Key Systems</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2 font-semibold">Europe (EU)</td>
                                    <td className="text-center">6</td>
                                    <td className="text-center">5</td>
                                    <td className="text-center"><Badge variant="default">HIGH</Badge></td>
                                    <td className="text-xs">Romania, Poland, France, Belgium, Turkey</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 font-semibold">Latin America</td>
                                    <td className="text-center">1</td>
                                    <td className="text-center">6</td>
                                    <td className="text-center"><Badge variant="destructive">CRITICAL</Badge></td>
                                    <td className="text-xs">Brazil, Chile, Colombia, Peru, Argentina</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 font-semibold">Asia Pacific</td>
                                    <td className="text-center">1</td>
                                    <td className="text-center">10</td>
                                    <td className="text-center"><Badge variant="destructive">CRITICAL</Badge></td>
                                    <td className="text-xs">India, Malaysia, Indonesia, Singapore, Vietnam</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 font-semibold">Middle East</td>
                                    <td className="text-center">1</td>
                                    <td className="text-center">2</td>
                                    <td className="text-center"><Badge variant="default">HIGH</Badge></td>
                                    <td className="text-xs">Egypt, UAE</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 font-semibold">Africa</td>
                                    <td className="text-center">0</td>
                                    <td className="text-center">3</td>
                                    <td className="text-center"><Badge variant="default">MEDIUM</Badge></td>
                                    <td className="text-xs">Kenya, Ethiopia, Tanzania</td>
                                </tr>
                                <tr className="border-b font-bold">
                                    <td className="p-2">TOTAL</td>
                                    <td className="text-center">9</td>
                                    <td className="text-center">26</td>
                                    <td className="text-center">-</td>
                                    <td className="text-xs">35 standards total</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}