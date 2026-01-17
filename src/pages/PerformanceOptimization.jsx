import React, { useState } from 'react';
import PSPPageWrapper from '@/components/layout/PSPPageWrapper';
import PerformanceMetricsMonitor from '@/components/performance/PerformanceMetricsMonitor';
import QueryOptimizationAnalyzer from '@/components/performance/QueryOptimizationAnalyzer';
import CachingStrategyManager from '@/components/performance/CachingStrategyManager';
import APILatencyMonitor from '@/components/performance/APILatencyMonitor';
import ResourceUtilizationDashboard from '@/components/performance/ResourceUtilizationDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Zap, Database, Activity, Gauge } from 'lucide-react';

export default function PerformanceOptimization() {
  const [activeTab, setActiveTab] = useState('metrics');

  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
    { id: 'queries', label: 'Query Optimization', icon: Database },
    { id: 'caching', label: 'Caching', icon: Zap },
    { id: 'api', label: 'API Latency', icon: Gauge },
    { id: 'resources', label: 'Resources', icon: Activity },
  ];

  return (
    <PSPPageWrapper>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Optimization</h1>
          <p className="text-slate-600 mt-1">Monitor and optimize system performance metrics</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">58ms</p>
              <p className="text-xs text-green-600 mt-1">↓ 12% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">96.2%</p>
              <p className="text-xs text-slate-600 mt-1">Excellent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-xs text-slate-600 mt-1">Pending optimization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">65%</p>
              <p className="text-xs text-green-600 mt-1">Normal range</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2 text-xs lg:text-sm">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Content */}
          <TabsContent value="metrics" className="mt-6">
            <PerformanceMetricsMonitor />
          </TabsContent>

          <TabsContent value="queries" className="mt-6 space-y-6">
            <QueryOptimizationAnalyzer />
          </TabsContent>

          <TabsContent value="caching" className="mt-6">
            <CachingStrategyManager />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <APILatencyMonitor />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <ResourceUtilizationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PSPPageWrapper>
  );
}