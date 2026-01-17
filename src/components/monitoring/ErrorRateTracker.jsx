import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export default function ErrorRateTracker({ errors }) {
  const errorCategories = [
    { type: 'API Errors', count: 12, rate: 0.15, trend: -5 },
    { type: 'Database Errors', count: 3, rate: 0.04, trend: -2 },
    { type: 'Payment Processing', count: 8, rate: 0.10, trend: +3 },
    { type: 'Settlement Errors', count: 2, rate: 0.03, trend: -1 },
    { type: 'Timeout Errors', count: 15, rate: 0.19, trend: +8 },
  ];

  const getErrorColor = (rate) => {
    if (rate > 0.15) return 'bg-red-100 text-red-800';
    if (rate > 0.08) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Error Rate by Category (Last 24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {errorCategories.map((error, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{error.type}</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${error.rate * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="text-sm font-medium">{(error.rate * 100).toFixed(2)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">{error.trend}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}