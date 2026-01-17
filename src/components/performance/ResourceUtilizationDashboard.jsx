import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

export default function ResourceUtilizationDashboard() {
  const [resources] = useState([
    { name: 'CPU', usage: 65, limit: 100, status: 'good' },
    { name: 'Memory', usage: 78, limit: 100, status: 'fair' },
    { name: 'Disk', usage: 45, limit: 100, status: 'good' },
    { name: 'Network', usage: 52, limit: 100, status: 'good' },
  ]);

  const cpuData = [
    { name: 'In Use', value: 65 },
    { name: 'Available', value: 35 }
  ];

  const COLORS = ['#3b82f6', '#e5e7eb'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Resource Overview */}
      <div className="lg:col-span-2 space-y-4">
        {resources.map((resource) => (
          <Card key={resource.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{resource.name} Usage</CardTitle>
                <Badge className={getStatusColor(resource.status)}>
                  {resource.usage}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    resource.status === 'good' ? 'bg-green-500' :
                    resource.status === 'fair' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${resource.usage}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {resource.usage}% of {resource.limit} GB
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CPU Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            CPU Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={cpuData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                {cpuData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Max: 12 cores</span>
              <Badge>65% used</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}