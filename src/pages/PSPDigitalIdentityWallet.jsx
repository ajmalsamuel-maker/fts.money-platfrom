import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Wallet, 
    Shield, 
    Key, 
    CheckCircle, 
    AlertCircle,
    Plus,
    QrCode,
    Download
} from 'lucide-react';
import AddCredentialDialog from '@/components/identity/AddCredentialDialog';
import CredentialCard from '@/components/identity/CredentialCard';
import CredentialDetailsDialog from '@/components/identity/CredentialDetailsDialog';
import { getStaffSession } from '@/components/auth/useStaffAuth';

export default function PSPDigitalIdentityWallet() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState(null);

    const staffSession = getStaffSession();
    const userEmail = staffSession?.email;

    const { data: credentials = [], isLoading } = useQuery({
        queryKey: ['user-credentials', userEmail],
        queryFn: () => base44.entities.UserCredential.filter({ created_by: userEmail }),
        enabled: !!userEmail
    });

    const activeCreds = credentials.filter(c => c.status === 'active');
    const pendingCreds = credentials.filter(c => c.status === 'pending');

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="PSPDigitalIdentityWallet" />
            
            <div className={cn("transition-all duration-300", "lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6 max-w-6xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <Wallet className="h-8 w-8 text-blue-600" />
                                Digital Identity Wallet
                            </h1>
                            <p className="text-slate-600 mt-2">Manage your verifiable credentials and digital identity</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Credential
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Active Credentials</p>
                                        <p className="text-3xl font-bold text-green-600">{activeCreds.length}</p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Pending</p>
                                        <p className="text-3xl font-bold text-amber-600">{pendingCreds.length}</p>
                                    </div>
                                    <AlertCircle className="h-12 w-12 text-amber-200" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total</p>
                                        <p className="text-3xl font-bold text-blue-600">{credentials.length}</p>
                                    </div>
                                    <Shield className="h-12 w-12 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">All Credentials</TabsTrigger>
                            <TabsTrigger value="lei">LEI / vLEI</TabsTrigger>
                            <TabsTrigger value="roles">Roles</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {isLoading ? (
                                <Card><CardContent className="p-12 text-center text-slate-500">Loading credentials...</CardContent></Card>
                            ) : credentials.length === 0 ? (
                                <Card><CardContent className="p-12 text-center text-slate-500">No credentials yet. Add your first credential to get started.</CardContent></Card>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {credentials.map(cred => (
                                        <CredentialCard 
                                            key={cred.id} 
                                            credential={cred}
                                            onView={() => setSelectedCredential(cred)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="lei">
                            <div className="grid md:grid-cols-2 gap-4">
                                {credentials.filter(c => c.credential_type === 'lei' || c.credential_type === 'vlei').map(cred => (
                                    <CredentialCard 
                                        key={cred.id} 
                                        credential={cred}
                                        onView={() => setSelectedCredential(cred)}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="roles">
                            <div className="grid md:grid-cols-2 gap-4">
                                {credentials.filter(c => c.credential_type === 'oor' || c.credential_type === 'ecr').map(cred => (
                                    <CredentialCard 
                                        key={cred.id} 
                                        credential={cred}
                                        onView={() => setSelectedCredential(cred)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            <AddCredentialDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
            <CredentialDetailsDialog 
                credential={selectedCredential} 
                open={!!selectedCredential} 
                onOpenChange={(open) => !open && setSelectedCredential(null)} 
            />
        </div>
    );
}