import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Database, RefreshCw } from 'lucide-react';

export default function PSPOwnershipMigration() {
    const [psps, setPsps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const loadPSPs = async () => {
        setLoading(true);
        try {
            const { data } = await base44.functions.invoke('migratePSPOwnership', {
                action: 'listAll'
            });
            
            if (data.success) {
                setPsps(data.psps);
                setMessage('PSPs loaded successfully');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };

    const runMigration = async () => {
        setLoading(true);
        setMessage('Running migration...');
        try {
            const { data } = await base44.functions.invoke('migratePSPOwnership', {
                action: 'migrateAll'
            });
            
            if (data.success) {
                setMessage(`✅ Migration completed successfully! ${data.message}`);
                await loadPSPs();
            }
        } catch (error) {
            setMessage(`❌ Error: ${error.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-6 w-6" />
                            PSP Ownership Migration Tool
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    This tool will:
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Mark NETXHUB as a template (is_template=true, visibility='template')</li>
                                        <li>Set owner_email for all other PSPs based on their contact_email</li>
                                        <li>Set visibility='private' for all non-template PSPs</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-3">
                                <Button onClick={loadPSPs} disabled={loading} variant="outline">
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Load Current PSPs
                                </Button>
                                <Button onClick={runMigration} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Run Migration
                                </Button>
                            </div>

                            {message && (
                                <Alert className={message.includes('✅') ? 'bg-emerald-50 border-emerald-200' : ''}>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {psps.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>PSP Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {psps.map((psp) => (
                                    <div key={psp.psp_code} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-semibold">{psp.psp_name}</p>
                                                <Badge variant="outline" className="font-mono">{psp.psp_code}</Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Owner: {psp.owner_email || <span className="text-amber-600">Not set</span>}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {psp.is_template && (
                                                <Badge className="bg-purple-100 text-purple-700">Template</Badge>
                                            )}
                                            <Badge className={
                                                psp.visibility === 'template' ? 'bg-purple-100 text-purple-700' :
                                                psp.visibility === 'private' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-blue-100 text-blue-700'
                                            }>
                                                {psp.visibility}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}