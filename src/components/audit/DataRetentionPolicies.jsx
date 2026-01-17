import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Archive, Plus, Edit2, Trash2 } from 'lucide-react';

export default function DataRetentionPolicies() {
  const [policies, setPolicies] = useState([
    {
      id: 1,
      name: 'PCI-DSS Compliance',
      data_type: 'Audit Logs',
      retention_days: 2555,
      description: '7-year retention for compliance',
      status: 'active'
    },
    {
      id: 2,
      name: 'GDPR Standard',
      data_type: 'Personal Data',
      retention_days: 1095,
      description: '3-year retention period',
      status: 'active'
    },
    {
      id: 3,
      name: 'SOC 2 Audit Trail',
      data_type: 'System Events',
      retention_days: 730,
      description: '2-year retention for SOC 2',
      status: 'active'
    },
  ]);

  const [editingId, setEditingId] = useState(null);

  const getRetentionYears = (days) => {
    return (days / 365).toFixed(1);
  };

  const handleDeletePolicy = (id) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Data Retention Policies
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Box */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium mb-1">Compliance Requirements</p>
          <p className="text-slate-700">Policies define how long different types of data are retained based on regulatory requirements.</p>
        </div>

        {/* Policies Table */}
        <div className="space-y-3">
          {policies.map(policy => (
            <div key={policy.id} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">{policy.name}</h4>
                  <p className="text-sm text-slate-600">{policy.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {policy.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 py-3 border-y">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Data Type</p>
                  <p className="font-mono text-sm">{policy.data_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Retention Period</p>
                  <p className="font-mono text-sm">{getRetentionYears(policy.retention_days)} years</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Days</p>
                  <p className="font-mono text-sm">{policy.retention_days} days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Archive Action</p>
                  <p className="font-mono text-sm">Auto-delete on expiry</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700"
                  onClick={() => handleDeletePolicy(policy.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Default Policies Info */}
        <div className="p-3 bg-slate-50 rounded-lg text-xs">
          <p className="font-medium mb-2">Default System Policies</p>
          <ul className="space-y-1 text-slate-600">
            <li>• Successful transactions: 7 years (PCI-DSS)</li>
            <li>• Failed transactions: 3 years</li>
            <li>• User activity logs: 2 years</li>
            <li>• API request logs: 90 days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}