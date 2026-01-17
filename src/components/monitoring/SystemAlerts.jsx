import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X, CheckCircle2 } from 'lucide-react';

export default function SystemAlerts({ alerts = [] }) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const defaultAlerts = [
    { id: 1, severity: 'high', title: 'API Response Time Spike', message: 'Response time exceeded 200ms threshold', time: '5m ago' },
    { id: 2, severity: 'medium', title: 'Database Connection Pool', message: '85% of connections in use', time: '12m ago' },
    { id: 3, severity: 'low', title: 'Scheduled Maintenance', message: 'Database maintenance window in 2 hours', time: '1h ago' },
  ];

  const activeAlerts = (alerts.length > 0 ? alerts : defaultAlerts).filter(
    a => !dismissedAlerts.has(a.id)
  );

  const dismissAlert = (id) => {
    setDismissedAlerts(new Set([...dismissedAlerts, id]));
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch(severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          System Alerts
          {activeAlerts.length > 0 && (
            <Badge className="ml-auto">{activeAlerts.length} Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-slate-600">All systems operational</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{alert.title}</p>
                      <Badge variant={getSeverityBadgeColor(alert.severity)} className="text-xs">
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-2">{alert.time}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}