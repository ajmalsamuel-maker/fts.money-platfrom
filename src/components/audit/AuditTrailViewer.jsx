import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown } from 'lucide-react';

export default function AuditTrailViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const auditLogs = [
    {
      id: 1,
      timestamp: '2026-01-17 14:32:15',
      user: 'admin@fts.money',
      action: 'CREATE',
      entity_type: 'Merchant',
      entity_id: 'mer_123456',
      entity_name: 'Acme Corp',
      changes: { status: 'pending', business_name: 'Acme Corp' },
      ip_address: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      timestamp: '2026-01-17 13:45:22',
      user: 'compliance@fts.money',
      action: 'UPDATE',
      entity_type: 'Transaction',
      entity_id: 'txn_789012',
      entity_name: 'Transaction #789012',
      changes: { status: 'approved', reviewed_by: 'compliance@fts.money' },
      ip_address: '10.0.0.50',
      status: 'success'
    },
    {
      id: 3,
      timestamp: '2026-01-17 12:15:45',
      user: 'finance@fts.money',
      action: 'DELETE',
      entity_type: 'Settlement',
      entity_id: 'set_345678',
      entity_name: 'Settlement Batch #345678',
      changes: { reason: 'Duplicate entry', deleted_by: 'finance@fts.money' },
      ip_address: '172.16.0.75',
      status: 'success'
    },
    {
      id: 4,
      timestamp: '2026-01-17 10:30:12',
      user: 'admin@fts.money',
      action: 'LOGIN',
      entity_type: 'User',
      entity_id: 'admin@fts.money',
      entity_name: 'Admin User',
      changes: {},
      ip_address: '192.168.1.100',
      status: 'success'
    },
  ];

  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  const users = ['all', 'admin@fts.money', 'compliance@fts.money', 'finance@fts.money'];

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchUser = filterUser === 'all' || log.user === filterUser;
    return matchSearch && matchAction && matchUser;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by entity or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actions.map(action => (
                <SelectItem key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user} value={user}>
                  {user === 'all' ? 'All Users' : user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.map(log => (
            <div key={log.id} className="border rounded-lg">
              <button
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full p-4 hover:bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.entity_name}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>{log.user}</span>
                      <span>{log.timestamp}</span>
                      <span>{log.ip_address}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === log.id ? 'rotate-180' : ''}`} />
              </button>

              {expandedId === log.id && (
                <div className="p-4 bg-slate-50 border-t space-y-2 text-sm">
                  <div>
                    <p className="font-medium mb-1">Details</p>
                    <p className="text-slate-600">Entity Type: <span className="font-mono">{log.entity_type}</span></p>
                    <p className="text-slate-600">Entity ID: <span className="font-mono">{log.entity_id}</span></p>
                  </div>
                  {Object.keys(log.changes).length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Changes</p>
                      <div className="bg-white p-2 rounded font-mono text-xs">
                        {JSON.stringify(log.changes, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}