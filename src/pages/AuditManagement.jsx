import React, { useState } from 'react';
import PSPPageWrapper from '@/components/layout/PSPPageWrapper';
import AuditTrailViewer from '@/components/audit/AuditTrailViewer';
import ComplianceAuditReport from '@/components/audit/ComplianceAuditReport';
import ChangeLogTracker from '@/components/audit/ChangeLogTracker';
import DataRetentionPolicies from '@/components/audit/DataRetentionPolicies';
import AnomalyDetectionMonitor from '@/components/audit/AnomalyDetectionMonitor';
import AuditExportManager from '@/components/audit/AuditExportManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, Clock, Archive, AlertTriangle, Download } from 'lucide-react';

export default function AuditManagement() {
  const [activeTab, setActiveTab] = useState('trail');

  const tabs = [
    { id: 'trail', label: 'Audit Trail', icon: Activity },
    { id: 'changelog', label: 'Change Log', icon: Clock },
    { id: 'reports', label: 'Compliance Reports', icon: FileText },
    { id: 'retention', label: 'Data Retention', icon: Archive },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'export', label: 'Export & Archive', icon: Download },
  ];

  return (
    <PSPPageWrapper>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Management</h1>
          <p className="text-slate-600 mt-1">Monitor, track, and export audit trails for compliance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">45,892</p>
              <p className="text-xs text-slate-600 mt-1">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">4</p>
              <p className="text-xs text-slate-600 mt-1">Pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-slate-600 mt-1">Generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">7 years</p>
              <p className="text-xs text-slate-600 mt-1">Compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
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
          <TabsContent value="trail" className="mt-6">
            <AuditTrailViewer />
          </TabsContent>

          <TabsContent value="changelog" className="mt-6">
            <ChangeLogTracker />
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <ComplianceAuditReport />
          </TabsContent>

          <TabsContent value="retention" className="mt-6">
            <DataRetentionPolicies />
          </TabsContent>

          <TabsContent value="anomalies" className="mt-6">
            <AnomalyDetectionMonitor />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <AuditExportManager />
          </TabsContent>
        </Tabs>
      </div>
    </PSPPageWrapper>
  );
}