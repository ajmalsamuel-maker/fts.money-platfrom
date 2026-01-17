import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function AnomalyDetectionMonitor() {
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      type: 'Unusual Login Pattern',
      severity: 'high',
      description: 'Admin user logged in from 5 different countries in 2 hours',
      timestamp: '2026-01-17 14:15:22',
      risk_score: 92,
      action: 'pending'
    },
    {
      id: 2,
      type: 'Bulk Data Export',
      severity: 'medium',
      description: 'Finance team exported 50k+ transactions in single session',
      timestamp: '2026-01-17 12:45:10',
      risk_score: 68,
      action: 'reviewed'
    },
    {
      id: 3,
      type: 'Configuration Change Spike',
      severity: 'high',
      description: '15 system configuration changes in 10 minutes',
      timestamp: '2026-01-17 10:22:45',
      risk_score: 85,
      action: 'pending'
    },
    {
      id: 4,
      type: 'Failed Login Attempts',
      severity: 'medium',
      description: '12 failed login attempts for user compliance@fts.money',
      timestamp: '2026-01-17 08:15:30',
      risk_score: 72,
      action: 'investigated'
    },
  ]);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'investigated': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleDismiss = (id) => {
    setAnomalies(anomalies.map(a => 
      a.id === id ? { ...a, action: 'resolved' } : a
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Anomaly Detection
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-800">
            {anomalies.filter(a => a.action === 'pending').length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info */}
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
          <p className="font-medium mb-1">AI-Powered Detection</p>
          <p className="text-slate-700">Machine learning model monitors audit logs for suspicious patterns and unusual activities.</p>
        </div>

        {/* Anomalies List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {anomalies.map(anomaly => (
            <div key={anomaly.id} className={`p-4 border rounded-lg ${getSeverityColor(anomaly.severity)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <p className="font-medium">{anomaly.type}</p>
                  </div>
                  <p className="text-sm">{anomaly.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{anomaly.risk_score}</div>
                  <p className="text-xs">Risk Score</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-current border-opacity-20">
                <div className="flex items-center gap-4 text-xs">
                  <span>{anomaly.timestamp}</span>
                  <Badge className={getActionColor(anomaly.action)}>
                    {anomaly.action.charAt(0).toUpperCase() + anomaly.action.slice(1)}
                  </Badge>
                </div>
                {anomaly.action === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => handleDismiss(anomaly.id)}
                    >
                      <Eye className="w-3 h-3" />
                      Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detection Settings */}
        <div className="p-3 bg-slate-50 rounded-lg text-sm">
          <p className="font-medium mb-2">Detection Sensitivity</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Low</Button>
            <Button size="sm">Medium (Current)</Button>
            <Button variant="outline" size="sm">High</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}