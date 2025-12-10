import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Database, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';

const migrations = [
    {
        id: 'add_merchant_code',
        name: 'Add Merchant Code Columns',
        description: 'Adds merchant_code column to merchants and merchant_users tables',
        sql: `
-- Add merchant_code to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS merchant_code VARCHAR(50) UNIQUE;

-- Add merchant_code to merchant_users table
ALTER TABLE merchant_users 
ADD COLUMN IF NOT EXISTS merchant_code VARCHAR(50);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_code 
ON merchants(merchant_code);

CREATE INDEX IF NOT EXISTS idx_merchant_users_code_email 
ON merchant_users(merchant_code, email);

-- Add comment
COMMENT ON COLUMN merchants.merchant_code IS 'Unique merchant identifier for login';
COMMENT ON COLUMN merchant_users.merchant_code IS 'Merchant code for login identification';
        `.trim()
    },
    {
        id: 'populate_merchant_codes',
        name: 'Populate Merchant Codes',
        description: 'Updates merchant_code for existing merchant_users from merchants table',
        sql: `
UPDATE merchant_users mu
SET merchant_code = m.merchant_code
FROM merchants m
WHERE mu.merchant_id = m.id
AND mu.merchant_code IS NULL
AND m.merchant_code IS NOT NULL;
        `.trim()
    }
];

export default function DatabaseMigration() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});

    const runMigration = async (migration) => {
        setLoading(prev => ({ ...prev, [migration.id]: true }));
        setResults(prev => ({ ...prev, [migration.id]: null }));

        try {
            const response = await base44.functions.invoke('runMigration', {
                sql: migration.sql
            });

            if (response.data.success) {
                setResults(prev => ({ 
                    ...prev, 
                    [migration.id]: { 
                        success: true, 
                        message: 'Migration completed successfully' 
                    } 
                }));
            } else {
                setResults(prev => ({ 
                    ...prev, 
                    [migration.id]: { 
                        success: false, 
                        message: response.data.error || 'Migration failed' 
                    } 
                }));
            }
        } catch (error) {
            setResults(prev => ({ 
                ...prev, 
                [migration.id]: { 
                    success: false, 
                    message: error.message || 'Migration failed' 
                } 
            }));
        } finally {
            setLoading(prev => ({ ...prev, [migration.id]: false }));
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Database className="h-6 w-6" />
                                Database Migrations
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Run database migrations to update schema for new features
                            </p>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> These migrations will modify your database schema. 
                                Make sure you have a backup before proceeding.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            {migrations.map((migration) => (
                                <Card key={migration.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{migration.name}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {migration.description}
                                                </CardDescription>
                                            </div>
                                            {results[migration.id] && (
                                                <Badge className={results[migration.id].success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {results[migration.id].success ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Success
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Failed
                                                        </>
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                                            <pre>{migration.sql}</pre>
                                        </div>

                                        {results[migration.id] && (
                                            <Alert variant={results[migration.id].success ? 'default' : 'destructive'}>
                                                {results[migration.id].success ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4" />
                                                )}
                                                <AlertDescription>
                                                    {results[migration.id].message}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <Button
                                            onClick={() => runMigration(migration)}
                                            disabled={loading[migration.id]}
                                            className="w-full"
                                        >
                                            {loading[migration.id] ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Running Migration...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Run Migration
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}