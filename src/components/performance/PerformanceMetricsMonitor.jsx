import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';

export default function PerformanceMetricsMonitor() {
  const [metrics, setMetrics] = useState([
    { time: '00:00', avgResponseTime: 45, p95: 120, p99: 245 },
    { time: '04:00', avgResponseTime: 42, p95: 115, p99: 235 },
    { time: '08:00', avgResponseTime: 58, p95: 165, p99: 310 },
    { time: '12:00', avgResponseTime: 72, p95: 185, p99: 380 },
    { time: '16:00', avgResponseTime: 65, p95: 170, p99: 350 },
    { time: '20:00', avgResponseTime: 48, p95: 125, p99: 250 },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Response Time Trends (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value}ms`} />
            <Legend />
            <Line type="monotone" dataKey="avgResponseTime" stroke="#3b82f6" name="Average" strokeWidth={2} />
            <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="P95" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="p99" stroke="#ef4444" name="P99" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}