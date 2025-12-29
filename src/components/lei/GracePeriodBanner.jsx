import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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

            if (data.in_grace_period) {
                setGracePeriodInfo(data);
            }
        } catch (error) {
            console.error('Failed to check grace period:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !gracePeriodInfo) return null;

    const isUrgent = gracePeriodInfo.days_remaining <= 30;
    const isExpiringSoon = gracePeriodInfo.days_remaining <= 14;

    return (
        <Alert className={`${isExpiringSoon ? 'border-red-200 bg-red-50' : isUrgent ? 'border-orange-200 bg-orange-50' : 'border-yellow-200 bg-yellow-50'} mb-6`}>
            <div className="flex items-start gap-3">
                {isExpiringSoon ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : (
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                    <AlertDescription>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-semibold mb-1 ${isExpiringSoon ? 'text-red-900' : 'text-yellow-900'}`}>
                                    {isExpiringSoon ? '⚠️ LEI Grace Period Expiring Soon!' : 'LEI Grace Period Active'}
                                </p>
                                <p className="text-sm">
                                    You have <span className="font-bold">{gracePeriodInfo.days_remaining} days</span> remaining to obtain your Legal Entity Identifier (LEI).
                                </p>
                                <p className="text-xs mt-1 text-slate-600">
                                    Expires: {new Date(gracePeriodInfo.grace_period_end).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open('https://www.gleif.org/en/lei/how-to-get-an-lei-find-lei-issuing-organizations', '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Apply for LEI
                                </Button>
                                {onDismiss && (
                                    <Button size="sm" variant="ghost" onClick={onDismiss}>
                                        Dismiss
                                    </Button>
                                )}
                            </div>
                        </div>
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}