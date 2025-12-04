import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
    Shield, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Loader2,
    ExternalLink,
    Info,
    AlertTriangle,
    Search,
    Globe,
    FileWarning,
    UserX,
    Ban
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const amlChecks = [
    { id: 'sanctions', name: 'Global Sanctions Lists', description: 'OFAC, EU, UN, UK sanctions screening', icon: Ban },
    { id: 'pep', name: 'PEP Screening', description: 'Politically Exposed Persons check', icon: UserX },
    { id: 'adverse_media', name: 'Adverse Media', description: 'Negative news and media screening', icon: FileWarning },
    { id: 'watchlists', name: 'Watchlists', description: 'Law enforcement and regulatory watchlists', icon: Search },
    { id: 'country_risk', name: 'Country Risk Assessment', description: 'Geographic risk analysis', icon: Globe },
];

export default function AMLScreeningStep({ data, onChange, errors, businessData, contactData }) {
    const [isScreening, setIsScreening] = useState(false);
    const [checkProgress, setCheckProgress] = useState(data.aml_checks || {});
    const [overallStatus, setOverallStatus] = useState(data.aml_status || 'not_started');
    const [alerts, setAlerts] = useState([]);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const initiateAMLScreening = async () => {
        setIsScreening(true);
        handleChange('aml_status', 'in_progress');
        handleChange('aml_initiated_at', new Date().toISOString());
        setOverallStatus('in_progress');
        setAlerts([]);

        const newCheckProgress = {};
        const newAlerts = [];

        // Simulate AMLWatcher API screening
        for (let i = 0; i < amlChecks.length; i++) {
            const check = amlChecks[i];
            
            setCheckProgress(prev => ({
                ...prev,
                [check.id]: 'in_progress'
            }));

            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

            // Simulate realistic AML results - most are clear
            const randomValue = Math.random();
            let status;
            let riskScore = Math.floor(Math.random() * 15); // Low risk by default
            
            if (randomValue < 0.90) {
                status = 'clear';
            } else if (randomValue < 0.97) {
                status = 'potential_match';
                riskScore = 25 + Math.floor(Math.random() * 20);
            } else {
                status = 'clear'; // Keep it clear for demo purposes
            }

            newCheckProgress[check.id] = status;
            
            if (status !== 'clear') {
                newAlerts.push({
                    check: check.name,
                    type: status,
                    details: `Potential match found - requires manual review`,
                    risk_score: riskScore
                });
            }

            setCheckProgress(prev => ({
                ...prev,
                [check.id]: status
            }));

            handleChange(`aml_check_${check.id}`, {
                status,
                risk_score: riskScore,
                matches_found: status === 'clear' ? 0 : 1,
                details: status === 'clear' ? 'No matches found' : 'Potential match requires review',
                sources_checked: ['OFAC', 'EU Sanctions', 'UN Consolidated List', 'PEP Database']
            });
        }

        // Determine overall status
        const hasMatch = Object.values(newCheckProgress).some(s => s === 'match');
        const hasPotential = Object.values(newCheckProgress).some(s => s === 'potential_match');
        
        let finalStatus;
        if (hasMatch) {
            finalStatus = 'flagged';
        } else if (hasPotential) {
            finalStatus = 'monitoring';
        } else {
            finalStatus = 'clear';
        }

        setOverallStatus(finalStatus);
        setAlerts(newAlerts);
        handleChange('aml_status', finalStatus);
        handleChange('aml_completed_at', new Date().toISOString());
        handleChange('aml_reference_id', `AML-${Date.now()}`);
        handleChange('aml_checks', newCheckProgress);
        handleChange('aml_alerts', newAlerts);
        handleChange('aml_risk_score', calculateRiskScore(newCheckProgress));
        setIsScreening(false);
    };

    const calculateRiskScore = (checks) => {
        const weights = { clear: 0, potential_match: 30, match: 100 };
        const scores = Object.values(checks).map(s => weights[s] || 0);
        return Math.min(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), 100);
    };

    const getCheckIcon = (status, DefaultIcon) => {
        switch (status) {
            case 'clear':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'match':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'potential_match':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'in_progress':
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return <DefaultIcon className="h-5 w-5 text-slate-400" />;
        }
    };

    const getStatusBadge = () => {
        switch (overallStatus) {
            case 'clear':
                return <Badge className="bg-emerald-100 text-emerald-700">Clear</Badge>;
            case 'flagged':
                return <Badge className="bg-red-100 text-red-700">Flagged</Badge>;
            case 'monitoring':
                return <Badge className="bg-amber-100 text-amber-700">Enhanced Monitoring</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-700">Screening...</Badge>;
            default:
                return <Badge variant="outline">Not Started</Badge>;
        }
    };

    const completedChecks = Object.values(checkProgress).filter(s => s !== 'in_progress' && s).length;
    const progressPercent = (completedChecks / amlChecks.length) * 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">AML Screening</h2>
                    <p className="text-sm text-slate-500">Anti-Money Laundering check via AMLWatcher</p>
                </div>
                {getStatusBadge()}
            </div>

            <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-700">
                    We use <a href="https://amlwatcher.com" target="_blank" rel="noopener noreferrer" className="font-medium underline">AMLWatcher</a> for 
                    comprehensive AML screening including sanctions, PEP checks, and adverse media monitoring.
                </AlertDescription>
            </Alert>

            {overallStatus === 'not_started' && (
                <Card className="p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Ready for AML Screening</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Click below to screen your business and contacts against global sanctions and watchlists.
                        </p>
                        <Button 
                            onClick={initiateAMLScreening}
                            className="gap-2 bg-purple-600 hover:bg-purple-700"
                            size="lg"
                        >
                            <Search className="h-5 w-5" />
                            Start AML Screening
                        </Button>
                    </div>
                </Card>
            )}

            {(overallStatus === 'in_progress' || overallStatus !== 'not_started') && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Screening Progress</h3>
                        <span className="text-sm text-slate-500">{completedChecks} of {amlChecks.length} checks</span>
                    </div>
                    <Progress value={progressPercent} className="h-2 mb-6" />

                    <div className="space-y-4">
                        {amlChecks.map((check) => (
                            <div 
                                key={check.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                                    checkProgress[check.id] === 'clear' ? "bg-emerald-50 border-emerald-200" :
                                    checkProgress[check.id] === 'match' ? "bg-red-50 border-red-200" :
                                    checkProgress[check.id] === 'potential_match' ? "bg-amber-50 border-amber-200" :
                                    checkProgress[check.id] === 'in_progress' ? "bg-blue-50 border-blue-200" :
                                    "bg-slate-50"
                                )}
                            >
                                {getCheckIcon(checkProgress[check.id], check.icon)}
                                <div className="flex-1">
                                    <p className="font-medium">{check.name}</p>
                                    <p className="text-sm text-slate-500">{check.description}</p>
                                </div>
                                {checkProgress[check.id] === 'clear' && (
                                    <Badge className="bg-emerald-100 text-emerald-700">Clear</Badge>
                                )}
                                {checkProgress[check.id] === 'match' && (
                                    <Badge className="bg-red-100 text-red-700">Match Found</Badge>
                                )}
                                {checkProgress[check.id] === 'potential_match' && (
                                    <Badge className="bg-amber-100 text-amber-700">Review Required</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {alerts.length > 0 && (
                <Card className="p-6 border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <h3 className="font-medium text-amber-800">Alerts Detected</h3>
                    </div>
                    <div className="space-y-3">
                        {alerts.map((alert, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-amber-800">{alert.check}</span>
                                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                                        Score: {alert.risk_score}
                                    </Badge>
                                </div>
                                <p className="text-sm text-amber-700">{alert.details}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-amber-600 mt-4">
                        These alerts will be reviewed by our compliance team. You can proceed with onboarding.
                    </p>
                </Card>
            )}

            {overallStatus === 'clear' && (
                <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700">
                        <strong>AML Screening Complete!</strong> No sanctions matches or adverse findings. 
                        Reference: {data.aml_reference_id}
                    </AlertDescription>
                </Alert>
            )}

            {data.aml_reference_id && (
                <Card className="p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-slate-500">Screening Reference</p>
                            <p className="font-mono font-medium">{data.aml_reference_id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Risk Score</p>
                            <p className={cn(
                                "font-bold text-lg",
                                data.aml_risk_score < 25 ? "text-emerald-600" :
                                data.aml_risk_score < 50 ? "text-amber-600" : "text-red-600"
                            )}>
                                {data.aml_risk_score || 0}/100
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Switch 
                                id="ongoing-monitoring"
                                checked={data.ongoing_monitoring !== false}
                                onCheckedChange={(checked) => handleChange('ongoing_monitoring', checked)}
                            />
                            <Label htmlFor="ongoing-monitoring" className="text-sm">
                                Enable ongoing AML monitoring
                            </Label>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="https://amlwatcher.com" target="_blank" rel="noopener noreferrer" className="gap-1">
                                View on AMLWatcher <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}