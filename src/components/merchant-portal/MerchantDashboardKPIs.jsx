import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

export default function MerchantDashboardKPIs({ metrics }) {
  const kpis = [
    {
      title: 'Total Volume',
      value: metrics?.totalVolume || 0,
      prefix: '$',
      icon: DollarSign,
      change: metrics?.volumeChange || 0,
    },
    {
      title: 'Success Rate',
      value: (metrics?.successRate || 0).toFixed(2),
      suffix: '%',
      icon: CheckCircle2,
      change: metrics?.successRateChange || 0,
    },
    {
      title: 'Active Disputes',
      value: metrics?.activeDisputes || 0,
      icon: AlertCircle,
      change: metrics?.disputeChange || 0,
    },
    {
      title: 'Pending Settlement',
      value: metrics?.pendingSettlement || 0,
      prefix: '$',
      icon: TrendingUp,
      change: metrics?.settlementChange || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change >= 0;
        
        return (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.prefix}{kpi.value}{kpi.suffix}
              </div>
              <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{kpi.change.toFixed(2)}% from last period
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}