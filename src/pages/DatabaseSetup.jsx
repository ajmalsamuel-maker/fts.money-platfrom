import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { 
    Database, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    Server, 
    Table, 
    Shield,
    Zap,
    AlertTriangle
} from 'lucide-react';

export default function DatabaseSetup() {
    const [collapsed, setCollapsed] = useState(false);
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);

    const schemas = [
        {
            id: 'mids',
            name: 'Merchant MIDs',
            description: 'MID management tables with indexes',
            function: 'dbMids',
            tables: ['merchants', 'payment_providers', 'merchant_mids']
        },
        {
            id: 'transactions',
            name: 'Transactions',
            description: 'Transaction processing and history',
            function: 'dbTransactions',
            tables: ['transactions']
        }
    ];

    const initializeSchema = async (schema) => {
        setLoading(prev => ({ ...prev, [schema.id]: true }));
        setError(null);
        
        try {
            const response = await base44.functions.invoke(schema.function, {
                action: 'initSchema'
            });
            
            if (response.data?.success) {
                setStatus(prev => ({ ...prev, [schema.id]: 'success' }));
            } else {
                setStatus(prev => ({ ...prev, [schema.id]: 'error' }));
                setError(response.data?.error || 'Failed to initialize schema');
            }
        } catch (err) {
            setStatus(prev => ({ ...prev, [schema.id]: 'error' }));
            setError(err.message);
        } finally {
            setLoading(prev => ({ ...prev, [schema.id]: false }));
        }
    };

    const initializeAll = async () => {
        for (const schema of schemas) {
            await initializeSchema(schema);
        }
    };

    const testConnection = async () => {
        setLoading(prev => ({ ...prev, connection: true }));
        setError(null);
        
        try {
            const response = await base44.functions.invoke('dbMids', {
                action: 'list'
            });
            
            if (response.data?.success !== undefined) {
                setStatus(prev => ({ ...prev, connection: 'success' }));
            } else {
                setStatus(prev => ({ ...prev, connection: 'error' }));
                setError('Connection test failed');
            }
        } catch (err) {
            setStatus(prev => ({ ...prev, connection: 'error' }));
            setError(err.message);
        } finally {
            setLoading(prev => ({ ...prev, connection: false }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} currentPage="DatabaseSetup" />
            
            <div className={cn("transition-all duration-300", collapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setCollapsed(!collapsed)} collapsed={collapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Database Setup</h1>
                        <p className="text-slate-600">Initialize and configure your PostgreSQL database schema</p>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Connection Test */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Database Connection
                            </CardTitle>
                            <CardDescription>
                                Test your PostgreSQL connection before initializing schemas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Button 
                                    onClick={testConnection}
                                    disabled={loading.connection}
                                >
                                    {loading.connection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Test Connection
                                </Button>
                                {status.connection === 'success' && (
                                    <Badge className="bg-green-100 text-green-700">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Connected
                                    </Badge>
                                )}
                                {status.connection === 'error' && (
                                    <Badge className="bg-red-100 text-red-700">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Failed
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schema Initialization */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Schema Initialization
                                    </CardTitle>
                                    <CardDescription>
                                        Create tables and indexes for your PSP platform
                                    </CardDescription>
                                </div>
                                <Button onClick={initializeAll} className="bg-blue-600 hover:bg-blue-700">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Initialize All Schemas
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {schemas.map(schema => (
                                    <div 
                                        key={schema.id}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                <Table className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{schema.name}</h3>
                                                <p className="text-sm text-slate-500">{schema.description}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {schema.tables.map(table => (
                                                        <Badge key={table} variant="outline" className="text-xs">
                                                            {table}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {status[schema.id] === 'success' && (
                                                <Badge className="bg-green-100 text-green-700">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Created
                                                </Badge>
                                            )}
                                            {status[schema.id] === 'error' && (
                                                <Badge className="bg-red-100 text-red-700">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Failed
                                                </Badge>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => initializeSchema(schema)}
                                                disabled={loading[schema.id]}
                                            >
                                                {loading[schema.id] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Initialize
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Setup Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <ol className="list-decimal list-inside space-y-2 text-slate-600">
                                <li>Ensure your <code className="bg-slate-100 px-1 rounded">DATABASE_URL</code> secret is set correctly in Base44 settings</li>
                                <li>Click "Test Connection" to verify database connectivity</li>
                                <li>Click "Initialize All Schemas" to create all required tables</li>
                                <li>Navigate to <strong>Merchant MIDs</strong> page to start managing MIDs with PostgreSQL</li>
                            </ol>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">PostgreSQL Connection String Format:</h4>
                                <code className="text-sm text-blue-800 break-all">
                                    postgresql://username:password@host:5432/database?sslmode=require
                                </code>
                            </div>

                            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                                <h4 className="font-medium text-amber-900 mb-2">Recommended Providers:</h4>
                                <ul className="list-disc list-inside text-amber-800 text-sm">
                                    <li><strong>Supabase</strong> - Free tier available, easy setup</li>
                                    <li><strong>Neon</strong> - Serverless Postgres, generous free tier</li>
                                    <li><strong>Railway</strong> - Simple deployment</li>
                                    <li><strong>AWS RDS</strong> - Enterprise-grade</li>
                                    <li><strong>CockroachDB</strong> - Distributed, multi-region</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}