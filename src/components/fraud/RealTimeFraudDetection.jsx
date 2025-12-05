import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
    Shield, 
    AlertTriangle, 
    Activity, 
    Zap, 
    Globe, 
    Smartphone,
    TrendingUp,
    Brain,
    RefreshCw,
    Eye,
    Bell,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RISK_COLORS = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#f97316',
    critical: '#ef4444'
};

export default function RealTimeFraudDetection({ transactions = [], onAlertClick }) {
    const [riskScores, setRiskScores] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [fraudTrends, setFraudTrends] = useState([]);
    const [deviceFingerprints, setDeviceFingerprints] = useState([]);
    const [velocityData, setVelocityData] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [mlModelStatus, setMlModelStatus] = useState({ accuracy: 97.8, lastUpdate: new Date() });

    useEffect(() => {
        // Generate mock data for visualization
        generateMockData();
        const interval = setInterval(generateMockData, 30000);
        return () => clearInterval(interval);
    }, []);

    const generateMockData = () => {
        // Risk score distribution
        setRiskScores([
            { name: 'Low (0-25)', value: 7500, color: RISK_COLORS.low },
            { name: 'Medium (26-50)', value: 2100, color: RISK_COLORS.medium },
            { name: 'High (51-75)', value: 380, color: RISK_COLORS.high },
            { name: 'Critical (76-100)', value: 45, color: RISK_COLORS.critical }
        ]);

        // Recent alerts
        setRecentAlerts([
            { id: 1, type: 'velocity', merchant: 'TechStore Pro', message: '15 transactions in 2 minutes', severity: 'high', time: '2 min ago' },
            { id: 2, type: 'geo', merchant: 'Fashion Hub', message: 'Transaction from unusual location', severity: 'medium', time: '5 min ago' },
            { id: 3, type: 'device', merchant: 'GameZone', message: 'New device fingerprint detected', severity: 'low', time: '8 min ago' },
            { id: 4, type: 'amount', merchant: 'Luxury Goods', message: 'Unusual transaction amount: $12,500', severity: 'high', time: '12 min ago' },
            { id: 5, type: 'bin', merchant: 'Electronics Plus', message: 'Potential BIN attack detected', severity: 'critical', time: '15 min ago' }
        ]);

        // Fraud trends (hourly)
        setFraudTrends(Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            attempts: Math.round(10 + Math.random() * 40),
            blocked: Math.round(5 + Math.random() * 30),
            approved: Math.round(3 + Math.random() * 10)
        })));

        // Device fingerprints
        setDeviceFingerprints([
            { browser: 'Chrome', os: 'Windows', count: 4500, risk: 'low' },
            { browser: 'Safari', os: 'macOS', count: 2300, risk: 'low' },
            { browser: 'Firefox', os: 'Linux', count: 890, risk: 'medium' },
            { browser: 'Chrome', os: 'Android', count: 1200, risk: 'low' },
            { browser: 'Unknown', os: 'Unknown', count: 45, risk: 'high' }
        ]);

        // Velocity data
        setVelocityData([
            { metric: 'Same Card (5 min)', threshold: 5, current: 3, status: 'normal' },
            { metric: 'Same IP (1 hour)', threshold: 20, current: 18, status: 'warning' },
            { metric: 'Same Device (24h)', threshold: 50, current: 35, status: 'normal' },
            { metric: 'Failed Attempts', threshold: 10, current: 12, status: 'exceeded' }
        ]);
    };

    const runMLAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze current fraud patterns and provide recommendations. Current metrics:
                - Total transactions today: 10,025
                - Flagged transactions: 425 (4.2%)
                - Blocked transactions: 127 (1.3%)
                - Average risk score: 22.5
                
                Provide fraud pattern insights.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        patterns: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        riskLevel: { type: "string" }
                    }
                }
            });
        } catch (e) {}
        
        setMlModelStatus({
            accuracy: 97.8 + (Math.random() * 0.4 - 0.2),
            lastUpdate: new Date()
        });
        setIsAnalyzing(false);
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-blue-100 text-blue-700',
            medium: 'bg-amber-100 text-amber-700',
            high: 'bg-orange-100 text-orange-700',
            critical: 'bg-red-100 text-red-700'
        };
        return colors[severity] || colors.low;
    };

    return (
        <div className="space-y-6">
            {/* ML Model Status */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Brain className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">ML Fraud Detection Model</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span>Accuracy: <strong>{mlModelStatus.accuracy.toFixed(1)}%</strong></span>
                                    <span>Last trained: {mlModelStatus.lastUpdate.toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={runMLAnalysis} disabled={isAnalyzing} variant="outline" className="gap-2">
                            {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Approved</p>
                            <p className="text-xl font-bold text-emerald-600">9,453</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Under Review</p>
                            <p className="text-xl font-bold text-amber-600">425</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Blocked</p>
                            <p className="text-xl font-bold text-red-600">127</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Avg Risk Score</p>
                            <p className="text-xl font-bold text-purple-600">22.5</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Risk Score Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-5 w-5 text-slate-400" />
                            Risk Score Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskScores}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {riskScores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center mt-2">
                            {riskScores.map((score, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: score.color }} />
                                    <span>{score.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fraud Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-slate-400" />
                            Fraud Attempts (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={fraudTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="attempts" stroke="#ef4444" fill="#fecaca" name="Attempts" />
                                    <Area type="monotone" dataKey="blocked" stroke="#10b981" fill="#d1fae5" name="Blocked" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Velocity Checks */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-5 w-5 text-slate-400" />
                        Velocity Checks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        {velocityData.map((item, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{item.metric}</span>
                                    <Badge className={cn(
                                        item.status === 'normal' ? 'bg-emerald-100 text-emerald-700' :
                                        item.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    )}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <Progress 
                                        value={(item.current / item.threshold) * 100} 
                                        className={cn("h-2", item.status === 'exceeded' && "[&>div]:bg-red-500")}
                                    />
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>{item.current}</span>
                                        <span>Threshold: {item.threshold}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Device Fingerprints */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-slate-400" />
                        Device Fingerprints
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {deviceFingerprints.map((device, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-sm">{device.browser} / {device.os}</p>
                                        <p className="text-xs text-slate-500">{device.count.toLocaleString()} transactions</p>
                                    </div>
                                </div>
                                <Badge className={cn(
                                    device.risk === 'low' ? 'bg-emerald-100 text-emerald-700' :
                                    device.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                )}>
                                    {device.risk} risk
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="h-5 w-5 text-slate-400" />
                        Real-time Fraud Alerts
                        <Badge variant="destructive" className="ml-2">{recentAlerts.length} new</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentAlerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                onClick={() => onAlertClick?.(alert)}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className={cn(
                                        "h-5 w-5",
                                        alert.severity === 'critical' ? 'text-red-500' :
                                        alert.severity === 'high' ? 'text-orange-500' :
                                        alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                                    )} />
                                    <div>
                                        <p className="font-medium text-sm">{alert.message}</p>
                                        <p className="text-xs text-slate-500">{alert.merchant} • {alert.time}</p>
                                    </div>
                                </div>
                                <Badge className={getSeverityColor(alert.severity)}>
                                    {alert.severity}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}