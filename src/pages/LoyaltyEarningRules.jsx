import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import { Menu, Plus, Pencil, Trash2, Settings, Activity, Heart, TrendingUp, ShoppingCart, Users, Leaf, Briefcase, Zap, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyEarningRules() {
    const sessionData = localStorage.getItem('loyalty_customer_session');
    const [session] = useState(() => sessionData ? JSON.parse(sessionData) : null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [ruleDialog, setRuleDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        rule_name: '',
        activity_type: 'distance',
        points_per_unit: 1,
        unit_type: 'km',
        verification_method: 'gps',
        integration_config: {},
        min_threshold: 0,
        max_daily_points: null,
        bonus_multiplier: 1,
        is_active: true
    });
    const queryClient = useQueryClient();

    if (!session || !session.id || !session.admin_email) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const { data: programs = [] } = useQuery({
        queryKey: ['my-programs', session.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: session.admin_email })
    });

    const [selectedProgram, setSelectedProgram] = useState('');

    React.useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0].id);
        }
    }, [programs, selectedProgram]);

    const { data: rules = [] } = useQuery({
        queryKey: ['earning-rules', selectedProgram],
        queryFn: () => base44.entities.EarningRule.filter({ program_id: selectedProgram }),
        enabled: !!selectedProgram
    });

    const createRuleMutation = useMutation({
        mutationFn: (data) => base44.entities.EarningRule.create(data),
        onSuccess: () => {
            toast.success('Earning rule created!');
            queryClient.invalidateQueries(['earning-rules']);
            setRuleDialog(false);
            resetForm();
        }
    });

    const updateRuleMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.EarningRule.update(id, data),
        onSuccess: () => {
            toast.success('Earning rule updated!');
            queryClient.invalidateQueries(['earning-rules']);
            setRuleDialog(false);
            resetForm();
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (id) => base44.entities.EarningRule.delete(id),
        onSuccess: () => {
            toast.success('Earning rule deleted');
            queryClient.invalidateQueries(['earning-rules']);
        }
    });

    const resetForm = () => {
        setEditingRule(null);
        setFormData({
            rule_name: '',
            activity_type: 'distance',
            points_per_unit: 1,
            unit_type: 'km',
            verification_method: 'gps',
            integration_config: {},
            min_threshold: 0,
            max_daily_points: null,
            bonus_multiplier: 1,
            is_active: true
        });
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            rule_name: rule.rule_name,
            activity_type: rule.activity_type,
            points_per_unit: rule.points_per_unit,
            unit_type: rule.unit_type,
            verification_method: rule.verification_method,
            integration_config: rule.integration_config || {},
            min_threshold: rule.min_threshold || 0,
            max_daily_points: rule.max_daily_points || null,
            bonus_multiplier: rule.bonus_multiplier || 1,
            is_active: rule.is_active
        });
        setRuleDialog(true);
    };

    const activityCategories = {
        fitness: {
            label: 'Fitness & Sports',
            icon: Activity,
            types: ['distance', 'time', 'steps', 'calories', 'elevation']
        },
        health: {
            label: 'Health & Wellness',
            icon: Heart,
            types: ['health_checkup', 'meditation', 'sleep_quality', 'water_intake']
        },
        engagement: {
            label: 'Engagement & Social',
            icon: Users,
            types: ['event_attendance', 'social_share', 'review', 'survey', 'community_post', 'live_stream_attendance']
        },
        commerce: {
            label: 'Purchase & Transaction',
            icon: ShoppingCart,
            types: ['purchase', 'transaction', 'referral']
        },
        sustainability: {
            label: 'Sustainability & Impact',
            icon: Leaf,
            types: ['sustainability', 'recycling', 'carbon_offset', 'donation', 'volunteer']
        },
        education: {
            label: 'Education & Learning',
            icon: Briefcase,
            types: ['education', 'course_completion', 'quiz_completion']
        },
        blockchain: {
            label: 'Blockchain & Web3',
            icon: Zap,
            types: ['nft_mint', 'token_stake']
        }
    };

    const verificationCategories = {
        basic: {
            label: 'Basic Verification',
            methods: ['manual', 'photo', 'qr_code', 'nfc', 'beacon', 'gps', 'geofence', 'time_based']
        },
        fitness: {
            label: 'Fitness Trackers',
            methods: ['strava', 'garmin_connect', 'fitbit', 'apple_health', 'google_fit', 'samsung_health', 'whoop', 'oura_ring', 'peloton', 'zwift', 'myfitnesspal']
        },
        wellness: {
            label: 'Wellness & Mindfulness',
            methods: ['headspace', 'calm', 'smart_scale', 'smart_watch']
        },
        payment: {
            label: 'Payment & Commerce',
            methods: ['stripe_payment', 'paypal_payment', 'receipt_scan', 'shopify', 'woocommerce', 'ecommerce_api']
        },
        blockchain: {
            label: 'Blockchain & Web3',
            methods: ['blockchain_transaction', 'smart_contract', 'chainlink_oracle', 'ethereum_attestation', 'zero_knowledge_proof']
        },
        biometric: {
            label: 'Biometric & Security',
            methods: ['biometric', 'facial_recognition', 'fingerprint']
        },
        social: {
            label: 'Social Media APIs',
            methods: ['twitter_api', 'instagram_api', 'linkedin_api', 'youtube_api', 'social_media_api']
        },
        productivity: {
            label: 'Productivity & Work',
            methods: ['github_api', 'notion_api', 'google_calendar', 'zoom_api']
        },
        iot: {
            label: 'IoT & Sensors',
            methods: ['iot_sensor', 'smart_scale', 'smart_watch']
        },
        api: {
            label: 'API & Integration',
            methods: ['api', 'webhook', 'oauth_integration', 'email_verification', 'sms_verification']
        },
        ai: {
            label: 'AI & Computer Vision',
            methods: ['ai_verification', 'computer_vision']
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, program_id: selectedProgram };
        
        if (editingRule) {
            updateRuleMutation.mutate({ id: editingRule.id, data });
        } else {
            createRuleMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30 flex">
            <CustomerPortalSidebar 
                session={session}
                currentPage="/LoyaltyEarningRules"
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Earning Rules</h1>
                    </div>
                    <Button onClick={() => { resetForm(); setRuleDialog(true); }} className="bg-purple-600">
                        <Plus className="h-4 w-4 mr-2" />Add Rule
                    </Button>
                </header>

                <div className="p-4 md:p-6 space-y-6">
                    {programs.length > 1 && (
                        <Card>
                            <CardContent className="pt-6">
                                <Label>Select Program</Label>
                                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Earning Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {rules.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Settings className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                    <p>No earning rules configured yet</p>
                                    <Button onClick={() => { resetForm(); setRuleDialog(true); }} className="mt-4" variant="outline">
                                        Create First Rule
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rules.map(rule => (
                                        <div key={rule.id} className="border rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{rule.rule_name}</h3>
                                                <p className="text-sm text-slate-600">
                                                    {rule.points_per_unit} points per {rule.unit_type} • {rule.activity_type}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline">{rule.verification_method}</Badge>
                                                    <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                                                        {rule.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(rule)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRule ? 'Edit' : 'Create'} Earning Rule</DialogTitle>
                        <CardDescription>Configure advanced earning rules with third-party integrations</CardDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Basic Setup</TabsTrigger>
                                <TabsTrigger value="verification">Verification</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-4">
                                <div>
                                    <Label>Rule Name</Label>
                                    <Input value={formData.rule_name} onChange={(e) => setFormData({...formData, rule_name: e.target.value})} placeholder="e.g., 10km Run Challenge" required />
                                </div>
                                
                                <div>
                                    <Label>Activity Type</Label>
                                    <Select value={formData.activity_type} onValueChange={(v) => setFormData({...formData, activity_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            {Object.entries(activityCategories).map(([key, category]) => (
                                                <React.Fragment key={key}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 flex items-center gap-2">
                                                        <category.icon className="h-3 w-3" />
                                                        {category.label}
                                                    </div>
                                                    {category.types.map(type => (
                                                        <SelectItem key={type} value={type} className="pl-6">
                                                            {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                            <SelectItem value="custom">Custom Activity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Points per Unit</Label>
                                        <Input type="number" step="0.1" value={formData.points_per_unit} onChange={(e) => setFormData({...formData, points_per_unit: Number(e.target.value)})} required />
                                    </div>
                                    <div>
                                        <Label>Unit Type</Label>
                                        <Input value={formData.unit_type} onChange={(e) => setFormData({...formData, unit_type: e.target.value})} placeholder="km, steps, minutes, tasks" required />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="verification" className="space-y-4 mt-4">
                                <div>
                                    <Label>Verification Method</Label>
                                    <Select value={formData.verification_method} onValueChange={(v) => setFormData({...formData, verification_method: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            {Object.entries(verificationCategories).map(([key, category]) => (
                                                <React.Fragment key={key}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0">
                                                        {category.label}
                                                    </div>
                                                    {category.methods.map(method => (
                                                        <SelectItem key={method} value={method} className="pl-6">
                                                            {method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formData.verification_method === 'strava' && '🏃 Connect to Strava for automatic run/ride tracking'}
                                        {formData.verification_method === 'apple_health' && '🍎 Sync with Apple Health for comprehensive health data'}
                                        {formData.verification_method === 'stripe_payment' && '💳 Verify purchases via Stripe webhooks'}
                                        {formData.verification_method === 'blockchain_transaction' && '⛓️ Verify on-chain transactions automatically'}
                                        {formData.verification_method === 'chainlink_oracle' && '🔗 Use Chainlink oracles for off-chain data verification'}
                                        {formData.verification_method === 'ai_verification' && '🤖 AI-powered verification using computer vision'}
                                    </p>
                                </div>

                                {['strava', 'garmin_connect', 'fitbit', 'apple_health', 'google_fit', 'api', 'webhook', 'oauth_integration'].includes(formData.verification_method) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <Label className="text-sm font-semibold mb-2 block">Integration Configuration</Label>
                                        <Textarea 
                                            placeholder='{"api_key": "...", "webhook_url": "...", "oauth_client_id": "..."}'
                                            value={JSON.stringify(formData.integration_config, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    setFormData({...formData, integration_config: JSON.parse(e.target.value)});
                                                } catch {}
                                            }}
                                            rows={4}
                                            className="font-mono text-xs"
                                        />
                                        <p className="text-xs text-slate-600 mt-2">
                                            Configure API keys, webhook URLs, and OAuth credentials for third-party integrations
                                        </p>
                                    </div>
                                )}

                                {formData.verification_method === 'blockchain_transaction' && (
                                    <div className="space-y-3">
                                        <Label className="text-sm">Blockchain Network</Label>
                                        <Select value={formData.integration_config?.network || 'ethereum'} onValueChange={(v) => setFormData({...formData, integration_config: {...formData.integration_config, network: v}})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ethereum">Ethereum</SelectItem>
                                                <SelectItem value="polygon">Polygon</SelectItem>
                                                <SelectItem value="base">Base</SelectItem>
                                                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                                <SelectItem value="optimism">Optimism</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Minimum Threshold</Label>
                                        <Input type="number" value={formData.min_threshold} onChange={(e) => setFormData({...formData, min_threshold: Number(e.target.value)})} />
                                        <p className="text-xs text-slate-500 mt-1">Min units needed to earn points</p>
                                    </div>
                                    <div>
                                        <Label>Max Daily Points</Label>
                                        <Input type="number" value={formData.max_daily_points || ''} onChange={(e) => setFormData({...formData, max_daily_points: e.target.value ? Number(e.target.value) : null})} placeholder="Unlimited" />
                                        <p className="text-xs text-slate-500 mt-1">Cap daily earnings per user</p>
                                    </div>
                                </div>
                                <div>
                                    <Label>Bonus Multiplier</Label>
                                    <Input type="number" step="0.1" value={formData.bonus_multiplier} onChange={(e) => setFormData({...formData, bonus_multiplier: Number(e.target.value)})} />
                                    <p className="text-xs text-slate-500 mt-1">Multiply points during special events (e.g., 2x for double points)</p>
                                </div>
                                
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-purple-600" />
                                        Rule Preview
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Activity:</span>
                                            <span className="font-medium">{formData.activity_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Reward:</span>
                                            <span className="font-medium">{formData.points_per_unit} points per {formData.unit_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Verification:</span>
                                            <Badge>{formData.verification_method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Badge>
                                        </div>
                                        {formData.min_threshold > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Threshold:</span>
                                                <span className="font-medium">Min {formData.min_threshold} {formData.unit_type}</span>
                                            </div>
                                        )}
                                        {formData.max_daily_points && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Daily Cap:</span>
                                                <span className="font-medium">{formData.max_daily_points} points max</span>
                                            </div>
                                        )}
                                        {formData.bonus_multiplier > 1 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Bonus:</span>
                                                <Badge className="bg-yellow-100 text-yellow-800">{formData.bonus_multiplier}x Multiplier</Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex gap-3 mt-6">
                            <Button type="button" variant="outline" onClick={() => setRuleDialog(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">{editingRule ? 'Update Rule' : 'Create Rule'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}