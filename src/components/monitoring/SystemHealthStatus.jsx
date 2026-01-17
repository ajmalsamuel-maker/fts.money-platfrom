import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Server, Clock } from 'lucide-react';

export default function SystemHealthStatus({ healthData }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const services = [
    { name: 'API Gateway', icon: Server, status: healthData?.api || 'healthy', uptime: '99.98%' },
    { name: 'Database', icon: Database, status: healthData?.database || 'healthy', uptime: '99.99%' },
    { name: 'Payment Processors', icon: Activity, status: healthData?.processors || 'healthy', uptime: '99.95%' },
    { name: 'Settlement Engine', icon: Clock, status: healthData?.settlement || 'healthy', uptime: '99.97%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-slate-600">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}