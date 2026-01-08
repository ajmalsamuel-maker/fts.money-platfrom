import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Globe } from 'lucide-react';

export default function CountryIntegrationGuide() {
    const integrations = {
        europe: [
            { country: '🇷🇴 Romania', standard: 'RO e-Factura (ANAF)', format: 'UBL 2.1 XML (RO_CIUS)', api: 'ANAF e-Factura API', vat: '19%' },
            { country: '🇹🇷 Turkey', standard: 'e-Fatura (GIB)', format: 'UBL-TR 1.2 XML', api: 'GIB Portal Integration', vat: '20%' },
            { country: '🇫🇷 France', standard: 'Chorus Pro', format: 'UBL/CII/Factur-X', api: 'Chorus Pro / PDP', vat: '20%' },
            { country: '🇵🇱 Poland', standard: 'KSeF', format: 'FA(3) XML', api: 'KSeF 2.0 API', vat: '23%' },
            { country: '🇧🇪 Belgium', standard: 'B2B Peppol', format: 'UBL 2.1 XML', api: 'Peppol Access Point', vat: '21%' }
        ],
        asia: [
            { country: '🇮🇳 India', standard: 'GST e-Invoice', format: 'JSON', api: 'IRP (Invoice Registration Portal)', gst: '18% (IGST) or 9%+9% (CGST+SGST)' },
            { country: '🇲🇾 Malaysia', standard: 'MyInvois (LHDN)', format: 'UBL 2.1 XML/JSON', api: 'MyInvois Portal API', tax: '6-10% SST' },
            { country: '🇮🇩 Indonesia', standard: 'Coretax (e-Faktur)', format: 'XML', api: 'DJP Coretax System', vat: '11%' },
            { country: '🇻🇳 Vietnam', standard: 'GDT e-Invoice', format: 'XML', api: 'GDT Validation', vat: '10%' },
            { country: '🇰🇷 South Korea', standard: 'NTS e-Tax', format: 'XML', api: 'National Tax Service', vat: '10%' },
            { country: '🇵🇭 Philippines', standard: 'BIR e-Invoice', format: 'XML', api: 'Bureau of Internal Revenue', vat: '12%' }
        ],
        latam: [
            { country: '🇧🇷 Brazil', standard: 'NF-e/NFS-e', format: 'XML', api: 'SEFAZ (State Tax Authority)', tax: '18% ICMS/ISS (varies)' },
            { country: '🇨🇱 Chile', standard: 'DTE (SII)', format: 'XML', api: 'SII Validation', iva: '19%' },
            { country: '🇨🇴 Colombia', standard: 'DIAN', format: 'UBL 2.1 XML', api: 'DIAN Validation', iva: '19%' },
            { country: '🇵🇪 Peru', standard: 'CPE (SUNAT)', format: 'UBL 2.1 XML', api: 'SUNAT OSE', igv: '18%' },
            { country: '🇦🇷 Argentina', standard: 'AFIP', format: 'XML', api: 'AFIP Web Services', iva: '21%' },
            { country: '🇺🇾 Uruguay', standard: 'CFE (DGI)', format: 'XML', api: 'DGI Sistema CFE', iva: '22%' },
            { country: '🇲🇽 Mexico', standard: 'CFDI 4.0', format: 'XML', api: 'PAC Certification', iva: '16%' }
        ],
        mena: [
            { country: '🇪🇬 Egypt', standard: 'ETA', format: 'JSON/XML', api: 'Egyptian Tax Authority', vat: '14%' },
            { country: '🇦🇪 UAE', standard: 'FTA', format: 'UBL 2.1 XML/PDF', api: 'Federal Tax Authority', vat: '5%' },
            { country: '🇰🇪 Kenya', standard: 'eTIMS (KRA)', format: 'JSON', api: 'KRA eTIMS API', vat: '16%' },
            { country: '🇸🇦 Saudi Arabia', standard: 'ZATCA', format: 'UBL 2.1 XML', api: 'FATOORA Portal', vat: '15%' }
        ]
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Country Integration Guide
                </h1>
                <p className="text-lg text-slate-600">29 E-Invoicing Standards - Implementation Details</p>
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                        <div>
                            <div className="text-3xl font-bold text-slate-900">29 Countries</div>
                            <div className="text-slate-600">Fully Integrated & Compliant</div>
                        </div>
                        <Globe className="h-12 w-12 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="europe">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="europe">Europe (11)</TabsTrigger>
                    <TabsTrigger value="asia">Asia Pacific (7)</TabsTrigger>
                    <TabsTrigger value="latam">Latin America (7)</TabsTrigger>
                    <TabsTrigger value="mena">MENA (4)</TabsTrigger>
                </TabsList>

                <TabsContent value="europe" className="space-y-3">
                    {integrations.europe.map((item, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>{item.country}</span>
                                    <Badge className="bg-green-100 text-green-800">Integrated</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                                <div><span className="font-semibold">Standard:</span> {item.standard}</div>
                                <div><span className="font-semibold">Format:</span> {item.format}</div>
                                <div><span className="font-semibold">API:</span> {item.api}</div>
                                <div><span className="font-semibold">VAT Rate:</span> {item.vat}</div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="asia" className="space-y-3">
                    {integrations.asia.map((item, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>{item.country}</span>
                                    <Badge className="bg-green-100 text-green-800">Integrated</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                                <div><span className="font-semibold">Standard:</span> {item.standard}</div>
                                <div><span className="font-semibold">Format:</span> {item.format}</div>
                                <div><span className="font-semibold">API:</span> {item.api}</div>
                                <div><span className="font-semibold">Tax:</span> {item.gst || item.vat || item.tax}</div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="latam" className="space-y-3">
                    {integrations.latam.map((item, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>{item.country}</span>
                                    <Badge className="bg-green-100 text-green-800">Integrated</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                                <div><span className="font-semibold">Standard:</span> {item.standard}</div>
                                <div><span className="font-semibold">Format:</span> {item.format}</div>
                                <div><span className="font-semibold">API:</span> {item.api}</div>
                                <div><span className="font-semibold">Tax:</span> {item.iva || item.igv || item.tax}</div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="mena" className="space-y-3">
                    {integrations.mena.map((item, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>{item.country}</span>
                                    <Badge className="bg-green-100 text-green-800">Integrated</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                                <div><span className="font-semibold">Standard:</span> {item.standard}</div>
                                <div><span className="font-semibold">Format:</span> {item.format}</div>
                                <div><span className="font-semibold">API:</span> {item.api}</div>
                                <div><span className="font-semibold">VAT Rate:</span> {item.vat}</div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}