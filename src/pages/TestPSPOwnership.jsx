import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Database, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function TestPSPOwnership() {
    const [session, setSession] = useState(null);
    const [allPSPs, setAllPSPs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const staffSession = localStorage.getItem('staff_session');
        if (staffSession) {
            setSession(JSON.parse(staffSession));
        }
    }, []);

    const { data: myPSPs = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.list();
            return psps.filter(p => p.owner_email === session?.email && !p.is_template);
        },
        enabled: !!session
    });

    const loadAllPSPs = async () => {
        setLoading(true);
        try {
            const { data } = await base44.functions.invoke('migratePSPOwnership', {
                action: 'listAll'
            });
            if (data.success) {
                setAllPSPs(data.psps);
            }
        } catch (error) {
            console.error('Error loading PSPs:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (session) {
            loadAllPSPs();
        }
    }, [session]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Current User Session */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Current User Session
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {session ? (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Email:</span>
                                    <span className="font-semibold">{session.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Role:</span>
                                    <Badge>{session.role}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">PSP Code:</span>
                                    <Badge variant="outline">{session.psp_code}</Badge>
                                </div>
                            </div>
                        ) : (
                            <Alert>
                                <AlertDescription>No session found. Please log in first.</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Test Results */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* What User Should See (MyPSPInstances) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-emerald-600" />
                                What User Sees (MyPSPInstances)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Alert className="bg-emerald-50 border-emerald-200">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <AlertDescription>
                                        Filters: owner_email = {session?.email}, is_template = false
                                    </AlertDescription>
                                </Alert>
                                
                                {myPSPs.length === 0 ? (
                                    <Alert>
                                        <AlertDescription>No PSPs owned by this user</AlertDescription>
                                    </Alert>
                                ) : (
                                    myPSPs.map(psp => (
                                        <div key={psp.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold">{psp.psp_name}</span>
                                                <Badge className="bg-emerald-600">{psp.psp_code}</Badge>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Owner:</span>
                                                    <span>{psp.owner_email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Visibility:</span>
                                                    <Badge variant="outline">{psp.visibility}</Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Is Template:</span>
                                                    <span>{psp.is_template ? '✅ Yes' : '❌ No'}</span>
                                                </div>
                                                {psp.template_source && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">From Template:</span>
                                                        <span>{psp.template_source}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* All PSPs in Database */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-blue-600" />
                                All PSPs in Database
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-3">
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertDescription>
                                            Raw database view (all PSPs)
                                        </AlertDescription>
                                    </Alert>
                                    <Button onClick={loadAllPSPs} disabled={loading} size="sm" variant="outline">
                                        Refresh
                                    </Button>
                                </div>
                                
                                {allPSPs.length === 0 ? (
                                    <Alert>
                                        <AlertDescription>Loading...</AlertDescription>
                                    </Alert>
                                ) : (
                                    allPSPs.map(psp => {
                                        const isOwnedByUser = psp.owner_email === session?.email;
                                        const isVisible = isOwnedByUser && !psp.is_template;
                                        
                                        return (
                                            <div 
                                                key={psp.psp_code} 
                                                className={`p-4 rounded-lg border ${
                                                    isVisible 
                                                        ? 'bg-emerald-50 border-emerald-200' 
                                                        : 'bg-slate-50 border-slate-200 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold">{psp.psp_name}</span>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline">{psp.psp_code}</Badge>
                                                        {isVisible ? (
                                                            <Eye className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Owner:</span>
                                                        <span className={isOwnedByUser ? 'text-emerald-700 font-semibold' : ''}>
                                                            {psp.owner_email || 'Not set'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Visibility:</span>
                                                        <Badge 
                                                            variant="outline"
                                                            className={
                                                                psp.visibility === 'template' ? 'bg-purple-100 text-purple-700' :
                                                                psp.visibility === 'private' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }
                                                        >
                                                            {psp.visibility}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Is Template:</span>
                                                        <span>
                                                            {psp.is_template ? (
                                                                <Badge className="bg-purple-100 text-purple-700">Template</Badge>
                                                            ) : (
                                                                '❌ No'
                                                            )}
                                                        </span>
                                                    </div>
                                                    {psp.template_source && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">From:</span>
                                                            <span>{psp.template_source}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Test Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Testing Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">✅ What should work:</h3>
                                <ul className="list-disc ml-6 space-y-1 text-sm">
                                    <li>Left panel shows only PSPs owned by logged-in user ({session?.email})</li>
                                    <li>Templates (like NETXHUB) are excluded from left panel</li>
                                    <li>Right panel shows all PSPs with visibility indicators</li>
                                    <li>Green highlighted items in right panel are visible to user in MyPSPInstances</li>
                                    <li>Grayed out items are hidden (templates or owned by others)</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">🧪 How to test:</h3>
                                <ol className="list-decimal ml-6 space-y-1 text-sm">
                                    <li>Navigate to "My PSP Instances" page - should see same PSPs as left panel</li>
                                    <li>Try creating a new PSP via "Community PSP Provisioning"</li>
                                    <li>Verify new PSP appears in your list with correct owner_email</li>
                                    <li>Log in as different user - should see different PSPs</li>
                                    <li>Templates should never appear in user lists</li>
                                </ol>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}