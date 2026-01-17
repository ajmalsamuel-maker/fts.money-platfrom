import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nextProvider';

export default function RiskAlertsCard() {
    const [alerts, setAlerts] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { language } = useI18n();

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const severityConfig = {
        high: {
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            badge: 'bg-red-100 text-red-700 border-red-200'
        },
        medium: {
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            badge: 'bg-amber-100 text-amber-700 border-amber-200'
        },
        low: {
            icon: ShieldAlert,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            badge: 'bg-blue-100 text-blue-700 border-blue-200'
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <CardTitle className="text-base">
                        {language === 'es' ? 'Alertas de Riesgo' :
                         language === 'fr' ? 'Alertes de Risque' :
                         language === 'zh' ? '风险警报' :
                         'Risk Alerts'}
                    </CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {alerts.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {alerts.map((alert) => {
                                const config = severityConfig[alert.type];
                                const Icon = config.icon;
                                
                                return (
                                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                        <div className={`p-2 rounded-lg ${config.bg} mt-0.5`}>
                                            <Icon className={`h-4 w-4 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className={`text-xs ${config.badge}`}>
                                                        {alert.category}
                                                    </Badge>
                                                    {alert.count > 1 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {alert.count}x
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 whitespace-nowrap">{alert.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-900 mb-1">{alert.message}</p>
                                            <p className="text-xs text-slate-500">{alert.merchant}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    {language === 'es' ? `${alerts.length} alertas activas` :
                                     language === 'fr' ? `${alerts.length} alertes actives` :
                                     language === 'zh' ? `${alerts.length}个活跃警报` :
                                     `${alerts.length} active alerts`}
                                </span>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                    {language === 'es' ? 'Ver todas' :
                                     language === 'fr' ? 'Voir tout' :
                                     language === 'zh' ? '查看全部' :
                                     'View all'}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center text-slate-400 text-sm">
                        No risk alerts - all systems operational
                    </div>
                )}
            </CardContent>
        </Card>
    );
}