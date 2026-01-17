import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function APILatencyMonitor() {
  const [endpoints] = useState([
    { endpoint: '/transactions', avgLatency: 45, p99: 180, requests: 45230, status: 'optimal', trend: 'down' },
    { endpoint: '/merchants', avgLatency: 52, p99: 210, requests: 23145, status: 'good', trend: 'up' },
    { endpoint: '/settlements', avgLatency: 78, p99: 290, requests: 12456, status: 'fair', trend: 'up' },
    { endpoint: '/webhooks', avgLatency: 125, p99: 420, requests: 8932, status: 'needs_attention', trend: 'up' },
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs_attention': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoint Latency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div key={ep.endpoint} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium font-mono text-sm">{ep.endpoint}</p>
                <p className="text-xs text-slate-600 mt-1">{ep.requests.toLocaleString()} requests</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-bold">{ep.avgLatency}ms</p>
                  <p className="text-xs text-slate-600">avg</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{ep.p99}ms</p>
                  <p className="text-xs text-slate-600">p99</p>
                </div>
                <div className="flex items-center gap-2">
                  {ep.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-green-500" />
                  )}
                  <Badge className={getStatusColor(ep.status)}>
                    {ep.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}