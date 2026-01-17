import React, { useState, useEffect } from 'react';
import PSPPageWrapper from '@/components/layout/PSPPageWrapper';
import SystemHealthStatus from '@/components/monitoring/SystemHealthStatus';
import PerformanceMetrics from '@/components/monitoring/PerformanceMetrics';
import ErrorRateTracker from '@/components/monitoring/ErrorRateTracker';
import SystemAlerts from '@/components/monitoring/SystemAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RealTimeMonitoringDashboard() {
  const [healthData, setHealthData] = useState({
    api: 'healthy',
    database: 'healthy',
    processors: 'healthy',
    settlement: 'healthy',
  });

  const [metrics, setMetrics] = useState({
    latency: 128,
    peakTps: 720,
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Simulate data refresh
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.floor(Math.random() * (150 - 100) + 100),
        peakTps: Math.floor(Math.random() * (750 - 600) + 600),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PSPPageWrapper>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Monitoring</h1>
            <p className="text-slate-600 mt-1">Real-time system health & performance</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="w-4 h-4 text-green-600" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-2xl font-bold">Operational</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">99.98%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics.latency}ms</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Peak TPS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics.peakTps}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Monitoring Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Health */}
            <SystemHealthStatus healthData={healthData} />

            {/* Performance Metrics */}
            <PerformanceMetrics metrics={metrics} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Alerts */}
            <SystemAlerts />

            {/* Error Rate */}
            <ErrorRateTracker />
          </div>
        </div>
      </div>
    </PSPPageWrapper>
  );
}