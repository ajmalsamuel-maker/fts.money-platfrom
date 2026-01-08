import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { 
    TrendingUp, TrendingDown, Trophy, Zap, Leaf, Shield, 
    DollarSign, Check, Lock, Star, Award, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantFIXDashboard() {
    const queryClient = useQueryClient();
    const [session] = useState(() => {
        const s = localStorage.getItem('merchantSession');
        return s ? JSON.parse(s) : null;
    });

    const { data: fixScore, isLoading } = useQuery({
        queryKey: ['fixScore', session?.merchant?.id],
        queryFn: async () => {
            const scores = await base44.entities.FIXScore.filter({ 
                merchant_id: session?.merchant?.id 
            });
            return scores[0];
        },
        enabled: !!session?.merchant?.id,
    });

    const calculateScoreMutation = useMutation({
        mutationFn: () => base44.functions.invoke('calculateFIXScore', { 
            merchant_id: session?.merchant?.id 
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['fixScore']);
            toast.success('FIX Score recalculated successfully!');
        },
    });

    const tierColors = {
        bronze: { bg: 'from-orange-400 to-orange-600', text: 'text-orange-600', border: 'border-orange-300' },
        silver: { bg: 'from-slate-300 to-slate-500', text: 'text-slate-600', border: 'border-slate-300' },
        gold: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600', border: 'border-yellow-300' },
        platinum: { bg: 'from-purple-400 to-purple-600', text: 'text-purple-600', border: 'border-purple-300' },
        diamond: { bg: 'from-cyan-400 to-blue-600', text: 'text-blue-600', border: 'border-blue-300' }
    };

    const tier = fixScore?.score_tier || 'bronze';
    const colors = tierColors[tier];

    const ScoreCard = ({ title, score, maxScore, icon: Icon, color }) => (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <span className="text-3xl font-bold">{score}/{maxScore}</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
                <Progress value={(score / maxScore) * 100} className="h-2" />
            </CardContent>
        </Card>
    );

    if (!session) {
        return <div className="p-8 text-center">Please log in to view FIX Dashboard</div>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <MerchantSidebar merchant={session.merchant} />
            <div className="flex-1 flex flex-col">
                <MerchantTopBar merchant={session.merchant} user={session.user} />
                
                <div className="p-8 space-y-8">
                    {/* Hero Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">FIX Score Dashboard</h1>
                            <p className="text-slate-600">FTS Index - Your Platform Health & ESG Performance</p>
                        </div>
                        <Button 
                            onClick={() => calculateScoreMutation.mutate()}
                            disabled={calculateScoreMutation.isPending}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${calculateScoreMutation.isPending && 'animate-spin'}`} />
                            Recalculate Score
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">Loading FIX Score...</div>
                    ) : !fixScore ? (
                        <Card>
                            <CardContent className="p-12 text-center space-y-4">
                                <Trophy className="h-16 w-16 mx-auto text-slate-300" />
                                <h3 className="text-xl font-bold">Calculate Your FIX Score</h3>
                                <p className="text-slate-600 max-w-md mx-auto">
                                    Get your FTS Index score to unlock benefits, better pricing, and show your ESG commitment.
                                </p>
                                <Button 
                                    size="lg" 
                                    onClick={() => calculateScoreMutation.mutate()}
                                    disabled={calculateScoreMutation.isPending}
                                >
                                    Calculate FIX Score
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Overall Score */}
                            <Card className={`border-2 ${colors.border}`}>
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`bg-gradient-to-r ${colors.bg} text-white text-lg px-4 py-1`}>
                                                    {tier.toUpperCase()}
                                                </Badge>
                                                {fixScore.score_trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                                                {fixScore.score_trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                                            </div>
                                            <h2 className="text-5xl font-bold">{fixScore.overall_score}</h2>
                                            <p className="text-slate-600">FTS Index Score</p>
                                            {fixScore.next_tier_threshold && (
                                                <p className="text-sm text-slate-500">
                                                    {fixScore.next_tier_threshold} points to next tier
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="text-right space-y-2">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Trophy className={`h-5 w-5 ${colors.text}`} />
                                                <span className="font-medium">Rank #{fixScore.rank_global} Global</span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <Award className={`h-5 w-5 ${colors.text}`} />
                                                <span className="font-medium">Rank #{fixScore.rank_industry} in {fixScore.industry_category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Progress value={(fixScore.overall_score / 1000) * 100} className="h-3" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Score Breakdown */}
                            <div className="grid md:grid-cols-4 gap-4">
                                <ScoreCard 
                                    title="Transaction Volume" 
                                    score={fixScore.transaction_score}
                                    maxScore={300}
                                    icon={DollarSign}
                                    color="text-green-600"
                                />
                                <ScoreCard 
                                    title="Service Adoption" 
                                    score={fixScore.service_adoption_score}
                                    maxScore={250}
                                    icon={Zap}
                                    color="text-blue-600"
                                />
                                <ScoreCard 
                                    title="ESG Metrics" 
                                    score={fixScore.esg_score}
                                    maxScore={250}
                                    icon={Leaf}
                                    color="text-emerald-600"
                                />
                                <ScoreCard 
                                    title="Compliance" 
                                    score={fixScore.compliance_score}
                                    maxScore={200}
                                    icon={Shield}
                                    color="text-purple-600"
                                />
                            </div>

                            <Tabs defaultValue="details" className="space-y-6">
                                <TabsList>
                                    <TabsTrigger value="details">Score Details</TabsTrigger>
                                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                                    <TabsTrigger value="improvement">Improvement Tips</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                    Transaction Volume
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-slate-600">30-Day Volume</p>
                                                        <p className="text-2xl font-bold">
                                                            ${(fixScore.monthly_transaction_volume || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Progress value={(fixScore.transaction_score / 300) * 100} />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-blue-600" />
                                                    Active Services
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {fixScore.services_active?.map(service => (
                                                        <div key={service} className="flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            <span>{service.replace('_', ' ')}</span>
                                                        </div>
                                                    ))}
                                                    {(!fixScore.services_active || fixScore.services_active.length === 0) && (
                                                        <p className="text-slate-500 text-sm">No services activated yet</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Leaf className="h-5 w-5 text-emerald-600" />
                                                    ESG Impact
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-slate-600">Carbon Offset</p>
                                                    <p className="text-xl font-bold">{fixScore.carbon_offset_kg || 0} kg CO₂</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600">NANO Tasks Sponsored</p>
                                                    <p className="text-xl font-bold">{fixScore.nano_tasks_sponsored || 0}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Shield className="h-5 w-5 text-purple-600" />
                                                    Compliance Status
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">PCI DSS Compliant</span>
                                                    {fixScore.pci_compliant ? (
                                                        <Check className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Lock className="h-5 w-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">LEI Verified</span>
                                                    {fixScore.lei_verified ? (
                                                        <Check className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Lock className="h-5 w-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Service Uptime</span>
                                                    <span className="font-medium">{fixScore.uptime_percentage}%</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="benefits">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Unlocked Benefits</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {fixScore.benefits_unlocked?.map((benefit, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                                        <Star className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="improvement">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>How to Improve Your FIX Score</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {fixScore.transaction_score < 300 && (
                                                <div className="p-4 bg-blue-50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">📈 Increase Transaction Volume</h4>
                                                    <p className="text-sm text-slate-700">
                                                        Grow your monthly transaction volume to earn more points. 
                                                        Current: ${(fixScore.monthly_transaction_volume || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                            {fixScore.service_adoption_score < 250 && (
                                                <div className="p-4 bg-purple-50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">⚡ Adopt More Services</h4>
                                                    <p className="text-sm text-slate-700 mb-2">
                                                        Each FTS service adds 50 points. Consider enabling:
                                                    </p>
                                                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                                                        {!fixScore.services_active?.includes('PSP') && <li>PSP Services</li>}
                                                        {!fixScore.services_active?.includes('RWA') && <li>RWA Tokenization</li>}
                                                        {!fixScore.services_active?.includes('Crypto') && <li>Crypto Gateway</li>}
                                                        {!fixScore.services_active?.includes('E_Invoicing') && <li>E-Invoicing</li>}
                                                    </ul>
                                                </div>
                                            )}
                                            {fixScore.esg_score < 250 && (
                                                <div className="p-4 bg-green-50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">🌱 Boost Your ESG Impact</h4>
                                                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                                                        <li>Sponsor NANO sustainability tasks (+15 points each)</li>
                                                        <li>Increase carbon offset initiatives</li>
                                                        <li>Achieve CSRD compliance (+50 points)</li>
                                                    </ul>
                                                </div>
                                            )}
                                            {!fixScore.pci_compliant && (
                                                <div className="p-4 bg-orange-50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">🛡️ Complete PCI Compliance</h4>
                                                    <p className="text-sm text-slate-700">
                                                        Achieve PCI DSS compliance to earn +50 points and improve security posture.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}