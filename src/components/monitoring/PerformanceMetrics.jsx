import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, BarChart3 } from 'lucide-react';

export default function PerformanceMetrics({ metrics }) {
  const latencyData = [
    { time: '00:00', latency: 120 },
    { time: '04:00', latency: 115 },
    { time: '08:00', latency: 130 },
    { time: '12:00', latency: 125 },
    { time: '16:00', latency: 140 },
    { time: '20:00', latency: 128 },
  ];

  const throughputData = [
    { time: '00:00', tps: 450 },
    { time: '04:00', tps: 420 },
    { time: '08:00', tps: 580 },
    { time: '12:00', tps: 650 },
    { time: '16:00', tps: 720 },
    { time: '20:00', tps: 600 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Latency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Avg Response Latency (ms)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-600 mt-2">Current: {metrics?.latency || 128}ms</p>
        </CardContent>
      </Card>

      {/* Throughput */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Transactions Per Second (TPS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="tps" fill="#10b981" stroke="#059669" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-600 mt-2">Peak: {metrics?.peakTps || 720} TPS</p>
        </CardContent>
      </Card>
    </div>
  );
}