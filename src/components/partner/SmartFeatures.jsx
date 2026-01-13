import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, TrendingUp, Package, Clock, Target } from 'lucide-react';

export default function SmartFeatures({ partnerId, programId }) {
    const aiRecommendations = [
        {
            type: 'offer',
            title: 'Create "Coffee + Pastry Bundle"',
            reason: 'High correlation in customer purchases',
            impact: '+15% redemption rate',
            confidence: 87
        },
        {
            type: 'timing',
            title: 'Extend Monday hours',
            reason: 'Peak demand 6-7pm',
            impact: '+23 potential redemptions/week',
            confidence: 92
        },
        {
            type: 'pricing',
            title: 'Adjust points for Premium Meal',
            reason: 'Lower than market average',
            impact: 'Better profit margin',
            confidence: 78
        }
    ];

    const insights = [
        { icon: Package, label: 'Low Stock Alert', value: 'Chocolate Cake', color: 'text-orange-600' },
        { icon: Clock, label: 'Peak Hour Today', value: '6-7 PM', color: 'text-blue-600' },
        { icon: TrendingUp, label: 'Trending Offer', value: 'Free Coffee', color: 'text-green-600' }
    ];

    const predictions = [
        { day: 'Tomorrow', redemptions: 45, confidence: 85 },
        { day: 'This Week', redemptions: 320, confidence: 78 },
        { day: 'Next Month', redemptions: 1450, confidence: 72 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    AI-Powered Insights
                </h2>
                <Badge className="bg-purple-100 text-purple-800">
                    <Brain className="h-3 w-3 mr-1" />
                    Smart Features
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-6">
                            <insight.icon className={`h-8 w-8 ${insight.color} mb-2`} />
                            <p className="text-sm text-gray-600">{insight.label}</p>
                            <p className="text-xl font-bold mt-1">{insight.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        AI Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {aiRecommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white border border-purple-100 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-100 text-green-800">
                                                {rec.impact}
                                            </Badge>
                                            <Badge variant="outline">
                                                {rec.confidence}% confidence
                                            </Badge>
                                        </div>
                                    </div>
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1">
                                        Apply Suggestion
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Learn More
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Predictive Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {predictions.map((pred, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">{pred.day}</span>
                                    <Badge variant="outline">{pred.confidence}% accurate</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Expected Redemptions</span>
                                    <span className="text-2xl font-bold text-blue-600">{pred.redemptions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <strong>Inventory Tip:</strong> Based on predictions, ensure you have enough stock for high-demand items this week.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Automated Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">Auto-adjust offer visibility</p>
                            <p className="text-sm text-gray-600">Boost high-performing offers automatically</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">Smart inventory alerts</p>
                            <p className="text-sm text-gray-600">Get notified before running out</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">Peak time staffing suggestions</p>
                            <p className="text-sm text-gray-600">Optimize staff scheduling</p>
                        </div>
                        <Button size="sm" variant="outline">Enable</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}