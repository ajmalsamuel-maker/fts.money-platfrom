import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { User, Mail, Shield, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InvestorSettings() {
    const [session, setSession] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    React.useEffect(() => {
        const savedSession = localStorage.getItem('investor_session');
        if (savedSession) setSession(JSON.parse(savedSession));
    }, []);

    const queryClient = useQueryClient();

    const { data: investorData } = useQuery({
        queryKey: ['investor', session?.email],
        queryFn: async () => {
            const investors = await base44.entities.RWAInvestor.filter({ email: session.email });
            return investors[0];
        },
        enabled: !!session
    });

    const [profile, setProfile] = useState({});

    React.useEffect(() => {
        if (investorData) {
            setProfile({
                full_name: investorData.full_name || '',
                email: investorData.email || '',
                jurisdiction: investorData.jurisdiction || '',
                tax_id: investorData.tax_id || '',
                investor_type: investorData.investor_type || 'individual'
            });
        }
    }, [investorData]);

    const updateMutation = useMutation({
        mutationFn: (data) => base44.entities.RWAInvestor.update(investorData.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['investor']);
        }
    });

    const handleDocumentUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDoc(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            const currentDocs = investorData.documents || [];
            const updatedDocs = [
                ...currentDocs.filter(d => d.document_type !== docType),
                {
                    document_type: docType,
                    ipfs_hash: file_url,
                    upload_date: new Date().toISOString()
                }
            ];

            await base44.entities.RWAInvestor.update(investorData.id, {
                documents: updatedDocs
            });

            queryClient.invalidateQueries(['investor']);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploadingDoc(false);
        }
    };

    const documents = investorData?.documents || [];
    const requiredDocs = ['proof_of_identity', 'proof_of_address', 'accreditation_proof'];

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorSettings"
                investorName={session?.full_name}
                investorEmail={session?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Profile & Settings</h1>

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="verification">Verification</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Full Name</Label>
                                            <Input
                                                value={profile.full_name || ''}
                                                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                value={profile.email || ''}
                                                disabled
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div>
                                            <Label>Investor Type</Label>
                                            <select
                                                className="w-full px-3 py-2 border rounded-lg"
                                                value={profile.investor_type || 'individual'}
                                                onChange={(e) => setProfile({...profile, investor_type: e.target.value})}
                                            >
                                                <option value="individual">Individual</option>
                                                <option value="institutional">Institutional</option>
                                                <option value="fund">Fund</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Jurisdiction</Label>
                                            <Input
                                                placeholder="e.g., US, UK, SG"
                                                value={profile.jurisdiction || ''}
                                                onChange={(e) => setProfile({...profile, jurisdiction: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => updateMutation.mutate(profile)}
                                        disabled={updateMutation.isPending}
                                    >
                                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="verification">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            KYC Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium">Verification Status</span>
                                            <Badge className={
                                                investorData?.kyc_status === 'verified' ? 'bg-green-100 text-green-700' :
                                                investorData?.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }>
                                                {investorData?.kyc_status || 'Not Started'}
                                            </Badge>
                                        </div>

                                        {investorData?.kyc_status === 'verified' && (
                                            <Alert className="bg-green-50 border-green-200">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <AlertDescription className="text-green-800">
                                                    Your identity has been verified. You can invest in all available assets.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {investorData?.kyc_verified_date && (
                                            <p className="text-xs text-slate-500">
                                                Verified on: {new Date(investorData.kyc_verified_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Accreditation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium">Accredited Investor</span>
                                            <Badge className={
                                                investorData?.accredited_investor ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                            }>
                                                {investorData?.accredited_investor ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>

                                        {investorData?.accredited_investor && (
                                            <Alert className="bg-blue-50 border-blue-200">
                                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-800">
                                                    You have access to accredited-only investment opportunities.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="documents">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Investment Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Upload required documents for KYC verification and accreditation status.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        {requiredDocs.map(docType => {
                                            const uploaded = documents.find(d => d.document_type === docType);
                                            return (
                                                <div key={docType} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium capitalize">
                                                                {docType.replace(/_/g, ' ')}
                                                            </p>
                                                            {uploaded ? (
                                                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Uploaded {new Date(uploaded.upload_date).toLocaleDateString()}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-slate-500 mt-1">Required</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {uploaded && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => window.open(uploaded.ipfs_hash, '_blank')}
                                                                >
                                                                    View
                                                                </Button>
                                                            )}
                                                            <label>
                                                                <Button
                                                                    size="sm"
                                                                    variant={uploaded ? 'outline' : 'default'}
                                                                    disabled={uploadingDoc}
                                                                    asChild
                                                                >
                                                                    <span className="cursor-pointer">
                                                                        <Upload className="h-3 w-3 mr-1" />
                                                                        {uploaded ? 'Replace' : 'Upload'}
                                                                    </span>
                                                                </Button>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    onChange={(e) => handleDocumentUpload(e, docType)}
                                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}