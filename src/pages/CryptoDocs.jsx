import React, { useState } from 'react';
import CryptoGatewaySidebar from '@/components/crypto/CryptoGatewaySidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Book, Code, ExternalLink } from 'lucide-react';

export default function CryptoDocs() {
    const [session] = useState(() => {
        const stored = localStorage.getItem('crypto_gateway_session');
        if (!stored) {
            window.location.href = '/CryptoGatewayLogin';
            return null;
        }
        return JSON.parse(stored);
    });

    if (!session) return null;

    const docSections = [
        { title: 'Getting Started', icon: Book, description: 'Quick start guide for integration' },
        { title: 'API Reference', icon: Code, description: 'Complete API documentation' },
        { title: 'Webhooks', icon: FileText, description: 'Event notifications and webhooks' }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <CryptoGatewaySidebar currentPage="CryptoDocs" userEmail={session.user.email} />
            
            <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Documentation</h1>
                        <p className="text-slate-600 mb-8">Integration guides and API reference</p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {docSections.map((section, idx) => {
                                const Icon = section.icon;
                                return (
                                    <Card key={idx} className="cursor-pointer hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                                            <p className="text-sm text-slate-500">{section.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
        </div>
    );
}