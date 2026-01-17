import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Clock } from 'lucide-react';

export default function ChangeLogTracker() {
  const [entityFilter, setEntityFilter] = useState('all');

  const changes = [
    {
      id: 1,
      timestamp: '2026-01-17 14:32:15',
      entity: 'Merchant',
      entity_id: 'mer_123456',
      entity_name: 'Acme Corp',
      field: 'status',
      old_value: 'pending',
      new_value: 'active',
      changed_by: 'admin@fts.money'
    },
    {
      id: 2,
      timestamp: '2026-01-17 13:45:22',
      entity: 'Transaction',
      entity_id: 'txn_789012',
      entity_name: 'Transaction #789012',
      field: 'settlement_status',
      old_value: 'pending',
      new_value: 'settled',
      changed_by: 'system'
    },
    {
      id: 3,
      timestamp: '2026-01-17 12:15:45',
      entity: 'Settings',
      entity_id: 'set_12345',
      entity_name: 'API Rate Limit',
      field: 'value',
      old_value: '1000',
      new_value: '2000',
      changed_by: 'admin@fts.money'
    },
  ];

  const entities = ['all', 'Merchant', 'Transaction', 'Settings', 'User', 'Payment Gateway'];

  const getEntityColor = (entity) => {
    switch(entity) {
      case 'Merchant': return 'bg-blue-100 text-blue-800';
      case 'Transaction': return 'bg-green-100 text-green-800';
      case 'Settings': return 'bg-purple-100 text-purple-800';
      case 'User': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredChanges = entityFilter === 'all' 
    ? changes 
    : changes.filter(c => c.entity === entityFilter);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Change Log Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Entity Type</label>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entities.map(entity => (
                <SelectItem key={entity} value={entity}>
                  {entity === 'all' ? 'All Entities' : entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Changes Timeline */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredChanges.map((change, idx) => (
            <div key={change.id} className="relative pb-6">
              {/* Timeline line */}
              {idx < filteredChanges.length - 1 && (
                <div className="absolute left-4 top-12 w-0.5 h-12 bg-slate-200" />
              )}

              {/* Timeline dot and content */}
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getEntityColor(change.entity)}>
                      {change.entity}
                    </Badge>
                    <span className="font-medium">{change.entity_name}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Changed: <span className="font-mono font-semibold">{change.field}</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="px-2 py-1 bg-red-50 border border-red-200 rounded font-mono text-xs text-red-700">
                      {change.old_value}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2 py-1 bg-green-50 border border-green-200 rounded font-mono text-xs text-green-700">
                      {change.new_value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {change.timestamp} by {change.changed_by}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}