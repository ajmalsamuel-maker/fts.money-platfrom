import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Trash2 } from 'lucide-react';

export default function CachingStrategyManager() {
  const [cacheData] = useState([
    { name: 'Merchants', size: 1024, hits: 15420, misses: 342, hitRate: 97.8 },
    { name: 'Exchange Rates', size: 256, hits: 8934, misses: 156, hitRate: 98.3 },
    { name: 'API Keys', size: 512, hits: 4521, misses: 89, hitRate: 98.1 },
    { name: 'Compliance Data', size: 768, hits: 2156, misses: 234, hitRate: 90.2 },
  ]);

  const cacheStrategies = [
    { key: 'merchant_data', ttl: '1 hour', strategy: 'LRU', size: '1.2 GB', status: 'active' },
    { key: 'transaction_summary', ttl: '5 mins', strategy: 'TTL', size: '256 MB', status: 'active' },
    { key: 'fx_rates', ttl: '30 mins', strategy: 'TTL', size: '50 MB', status: 'active' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Cache Hit Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cacheData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" label={{ value: 'Hit Rate %', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Size (MB)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="hitRate" fill="#10b981" name="Hit Rate %" />
              <Bar yAxisId="right" dataKey="size" fill="#3b82f6" name="Size (MB)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cache Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Active Cache Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cacheStrategies.map((strategy) => (
            <div key={strategy.key} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm font-mono">{strategy.key}</p>
                  <p className="text-xs text-slate-600">Strategy: {strategy.strategy} | TTL: {strategy.ttl}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Size: {strategy.size}</span>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}