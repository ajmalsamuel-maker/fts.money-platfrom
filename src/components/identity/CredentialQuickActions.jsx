import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Building2, Wallet, Rocket, Globe, Shield, ArrowRight,
    CheckCircle2, Clock
} from 'lucide-react';

/**
 * Quick Actions for Credential Usage
 * Shows common services where credentials can be used
 */
export default function CredentialQuickActions({ credentials, onActionClick }) {
    const hasLEI = credentials.some(c => c.credential_type === 'lei' && c.status === 'active');
    const hasVLEI = credentials.some(c => c.credential_type === 'vlei' && c.status === 'active');

    const actions = [
        {
            id: 'vasp-onboarding',
            icon: Wallet,
            title: 'VASP Onboarding',
            description: 'Launch crypto banking with instant KYB',
            requirement: hasLEI || hasVLEI,
            color: 'from-cyan-500 to-blue-500',
            path: 'CryptoGatewayLogin'
        },
        {
            id: 'rwa-issuer',
            icon: Rocket,
            title: 'RWA Asset Issuance',
            description: 'Tokenize real-world assets',
            requirement: hasLEI || hasVLEI,
            color: 'from-amber-500 to-orange-500',
            path: 'AssetIssuerLogin'
        },
        {
            id: 'psp-admin',
            icon: Building2,
            title: 'PSP Admin Access',
            description: 'Manage payment infrastructure',
            requirement: hasVLEI,
            color: 'from-blue-500 to-indigo-500',
            path: 'PSPLogin'
        },
        {
            id: 'platform-admin',
            icon: Globe,
            title: 'Platform Admin',
            description: 'FTS platform administration',
            requirement: hasVLEI,
            color: 'from-purple-500 to-pink-500',
            path: 'PlatformAdminLogin'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => {
                const Icon = action.icon;
                const canUse = action.requirement;

                return (
                    <Card 
                        key={action.id}
                        className={`transition-all ${canUse ? 'hover:shadow-lg cursor-pointer border-2 hover:border-blue-300' : 'opacity-50'}`}
                        onClick={() => canUse && onActionClick?.(action)}
                    >
                        <CardContent className="p-5">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                            <p className="text-xs text-slate-600 mb-3">{action.description}</p>
                            
                            {canUse ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 w-full justify-center">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Ready to Use
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-300 w-full justify-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Add Credential
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}