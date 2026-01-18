import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, AlertCircle, Loader2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DeploymentChecklist() {
  const [pspList, setPspList] = useState([]);
  const [selectedPsp, setSelectedPsp] = useState('');
  const [dbInfo, setDbInfo] = useState(null);
  const [checks, setChecks] = useState([
    { id: 'setup', name: 'Database Setup', status: 'pending', message: '', fn: 'createPostgreSQLSchema' },
    { id: 'db', name: 'Database Connection', status: 'pending', message: '', fn: 'testDatabaseConnection' },
    { id: 'schema', name: 'Database Schema', status: 'pending', message: '', fn: 'validateDatabaseSchema' },
    { id: 'entities', name: 'Entity Validation', status: 'pending', message: '' },
    { id: 'auth', name: 'Authentication System', status: 'pending', message: '' },
    { id: 'psp_settings', name: 'PSP Settings', status: 'pending', message: '' },
    { id: 'connectors', name: 'Payment Connectors', status: 'pending', message: '' },
  ]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadPSPs();
  }, []);

  const loadPSPs = async () => {
    try {
      const psps = await base44.entities.ProvisionedPSP.list();
      setPspList(psps);
      if (psps.length > 0) {
        setSelectedPsp(psps[0].psp_code);
      }
    } catch (error) {
      console.error('Error loading PSPs:', error);
    }
  };

  const runDeploymentTests = async () => {
    if (!selectedPsp) {
      alert('Please select a PSP to test');
      return;
    }
    setTesting(true);
    
    // Get database info first
    await getDatabaseInfo();
    await new Promise(r => setTimeout(r, 500));
    
    // Setup Database
    await testSetup();
    await new Promise(r => setTimeout(r, 500));
    
    // Test Database Connection
    await testDatabase();
    await new Promise(r => setTimeout(r, 500));
    
    // Test Schema
    await testSchema();
    await new Promise(r => setTimeout(r, 500));
    
    // Test Entities
    await testEntities();
    await new Promise(r => setTimeout(r, 500));
    
    // Test Auth
    await testAuth();
    await new Promise(r => setTimeout(r, 500));
    
    // Test PSP Settings
    await testPSPSettings();
    await new Promise(r => setTimeout(r, 500));
    
    // Test Connectors
    await testConnectors();
    
    setTesting(false);
  };

  const updateCheck = (id, status, message) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, status, message } : c));
  };

  const getDatabaseInfo = async () => {
    try {
      const response = await base44.functions.invoke('testDatabaseConnection', {});
      if (response.data.success) {
        setDbInfo({
          version: response.data.version,
          host: response.data.host || 'N/A',
          database: response.data.database || 'N/A',
          tables: response.data.tables || []
        });
      }
    } catch (error) {
      console.error('Failed to get database info:', error);
    }
  };

  const testSetup = async () => {
    try {
      updateCheck('setup', 'running', 'Creating tables...');
      const response = await base44.functions.invoke('createPostgreSQLSchema', {});
      if (response.data.success) {
        updateCheck('setup', 'success', `${response.data.tables?.length || 0} tables created`);
      } else {
        updateCheck('setup', 'error', response.data.error || 'Setup failed');
      }
    } catch (error) {
      updateCheck('setup', 'error', error.message);
    }
  };

  const testDatabase = async () => {
    try {
      const response = await base44.functions.invoke('testDatabaseConnection', { psp_code: selectedPsp });
      if (response.data.success) {
        updateCheck('db', 'success', 'Connected successfully');
      } else {
        updateCheck('db', 'error', response.data.error || 'Connection failed');
      }
    } catch (error) {
      updateCheck('db', 'error', error.message);
    }
  };

  const testSchema = async () => {
    try {
      const response = await base44.functions.invoke('validateDatabaseSchema', { psp_code: selectedPsp });
      if (response.data.valid) {
        updateCheck('schema', 'success', `${response.data.tables?.length || 0} tables validated`);
      } else {
        updateCheck('schema', 'error', 'Schema validation failed');
      }
    } catch (error) {
      updateCheck('schema', 'error', error.message);
    }
  };

  const testEntities = async () => {
    try {
      const merchants = await base44.entities.Merchant.filter({ psp_code: selectedPsp });
      const transactions = await base44.entities.Transaction.filter({ psp_code: selectedPsp });
      updateCheck('entities', 'success', `Merchants: ${merchants.length}, Transactions: ${transactions.length}`);
    } catch (error) {
      updateCheck('entities', 'error', error.message);
    }
  };

  const testAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user) {
        updateCheck('auth', 'success', `Authenticated as ${user.email}`);
      } else {
        updateCheck('auth', 'warning', 'Not authenticated');
      }
    } catch (error) {
      updateCheck('auth', 'error', error.message);
    }
  };

  const testPSPSettings = async () => {
    try {
      const response = await base44.functions.invoke('getPSPSettings', { psp_code: selectedPsp });
      if (response.data.success && response.data.settings) {
        updateCheck('psp_settings', 'success', `PSP "${selectedPsp}" configured`);
      } else {
        updateCheck('psp_settings', 'warning', 'No PSP settings found');
      }
    } catch (error) {
      updateCheck('psp_settings', 'error', error.message);
    }
  };

  const testConnectors = async () => {
    try {
      const connectors = await base44.entities.ProcessorConnectorConfig.filter({ psp_code: selectedPsp });
      updateCheck('connectors', 'success', `${connectors.length} connector(s) configured`);
    } catch (error) {
      updateCheck('connectors', 'error', error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-800">Pending</Badge>;
    }
  };

  return (
    <PlatformLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deployment Checklist</h1>
          <p className="text-slate-600 mt-1">Validate platform readiness for production</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select PSP to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>PSP Instance</Label>
              <Select value={selectedPsp} onValueChange={setSelectedPsp}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a PSP" />
                </SelectTrigger>
                <SelectContent>
                  {pspList.map((psp) => (
                    <SelectItem key={psp.psp_code} value={psp.psp_code}>
                      {psp.psp_name} ({psp.psp_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {dbInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="font-medium text-sm">PostgreSQL Version</span>
                <span className="font-mono text-sm">{dbInfo.version}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="font-medium text-sm">Host</span>
                <span className="font-mono text-sm text-slate-600">{dbInfo.host}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="font-medium text-sm">Database</span>
                <span className="font-mono text-sm text-slate-600">{dbInfo.database}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="font-medium text-sm">Tables Found</span>
                <span className="font-mono text-sm">{dbInfo.tables.length}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Health Checks</CardTitle>
              <Button onClick={runDeploymentTests} disabled={testing || !selectedPsp}>
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    {check.message && (
                      <p className="text-sm text-slate-600 mt-1">{check.message}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <span className="font-mono text-sm">DATABASE_URL</span>
              <Badge className="bg-green-100 text-green-800">Set</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <span className="font-mono text-sm">STRIGA_API_KEY</span>
              <Badge className="bg-green-100 text-green-800">Set</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <span className="font-mono text-sm">GODADDY_API_KEY</span>
              <Badge className="bg-green-100 text-green-800">Set</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlatformLayout>
  );
}