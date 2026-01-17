import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, ExternalLink, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ENTITY_TYPE_LABELS = {
    'AppUser': 'User Account',
    'ProvisionedPSP': 'Payment Service Provider',
    'ISOGatewayCustomer': 'ISO Gateway Service',
    'OrchestrationCustomer': 'Orchestration Service',
    'CryptoGatewayCustomer': 'Crypto Banking Service',
    'RWAProvider': 'RWA Tokenization Service',
    'Merchant': 'Merchant Account'
};

export default function GracePeriodBanner({ entityType, entityId, onDismiss }) {
    const [gracePeriodInfo, setGracePeriodInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkGracePeriod();
    }, [entityType, entityId]);

    const checkGracePeriod = async () => {
        try {
            const { data } = await base44.functions.invoke('gleifIntegration', {
                action: 'check_grace_period',
                entity_type: entityType,
                entity_id: entityId
            });

            if (data?.in_grace_period) {
                setGracePeriodInfo(data);
            }
        } catch (error) {
            console.error('Failed to check grace period:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !gracePeriodInfo) return null;

    const daysRemaining = gracePeriodInfo?.days_remaining || 0;
    const isCritical = daysRemaining <= 7;
    const isUrgent = daysRemaining <= 30;
    const entityLabel = ENTITY_TYPE_LABELS[entityType] || 'Account';

    return (
        <Alert className={`${isCritical ? 'border-red-500 bg-red-50' : isUrgent ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'} mb-6`}>
            <div className="flex items-start gap-3">
                {isCritical ? (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                ) : isUrgent ? (
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                ) : (
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                    <AlertDescription>
                        <p className={`font-semibold mb-2 ${isCritical ? 'text-red-900' : isUrgent ? 'text-orange-900' : 'text-blue-900'}`}>
                            LEI Grace Period - Regulatory Compliance Notice
                        </p>
                        
                        <p className="text-sm mb-2">
                            <strong>NOTICE:</strong> This {entityLabel} is operating under a temporary 90-day grace period for 
                            Legal Entity Identifier (LEI) compliance as required by financial services regulations (EMIR, MiFID II, SFTR).
                        </p>
                        
                        <p className="text-sm mb-2">
                            <strong>Time Remaining:</strong> <span className="font-bold">{daysRemaining} days</span> until{' '}
                            <strong>{gracePeriodInfo?.grace_period_end ? new Date(gracePeriodInfo.grace_period_end).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            }) : 'N/A'}</strong>
                        </p>

                        {isCritical && (
                            <div className="p-2 mb-3 bg-red-100 border border-red-300 rounded">
                                <p className="text-sm font-semibold text-red-900">
                                    ⚠️ URGENT: Grace period expires in {daysRemaining} days. Failure to obtain a valid LEI 
                                    may result in service restrictions or suspension. Immediate action required.
                                </p>
                            </div>
                        )}

                        {isUrgent && !isCritical && (
                            <div className="p-2 mb-3 bg-orange-100 border border-orange-300 rounded">
                                <p className="text-sm font-medium text-orange-900">
                                    ⚠️ ACTION REQUIRED: Please obtain your LEI to ensure uninterrupted service and 
                                    regulatory compliance.
                                </p>
                            </div>
                        )}
                        
                        <p className="text-xs text-slate-600 mb-3">
                            An LEI is a unique 20-character identifier required for legal entities engaging in financial transactions. 
                            This grace period allows continued operations while completing registration through a GLEIF-accredited 
                            Local Operating Unit (LOU).
                        </p>
                        
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                size="sm"
                                className={isCritical ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                                onClick={() => window.open('https://www.gleif.org/en/lei/how-to-get-an-lei-find-lei-issuing-organizations', '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Obtain LEI Now
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open('https://www.gleif.org/en/about-lei/introducing-the-legal-entity-identifier-lei', '_blank')}
                            >
                                Learn More
                            </Button>
                            {onDismiss && !isCritical && (
                                <Button size="sm" variant="ghost" onClick={onDismiss}>
                                    Dismiss
                                </Button>
                            )}
                        </div>
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}