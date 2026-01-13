import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Award, TrendingUp, Zap } from 'lucide-react';

export default function GamificationEngagement({ partnerId, partnerData }) {
    const achievements = [
        { name: 'Early Adopter', description: 'First 100 partners to join', earned: true, points: 500 },
        { name: 'Customer Favorite', description: '100+ redemptions', earned: true, points: 1000 },
        { name: 'Quick Responder', description: 'Avg. fulfillment < 5 min', earned: true, points: 750 },
        { name: 'Five Star Partner', description: 'Maintain 4.5+ rating', earned: false, points: 2000 },
        { name: 'Growth Champion', description: '50% MoM growth', earned: false, points: 1500 }
    ];

    const challenges = [
        { name: 'January Rush', description: 'Fulfill 200 redemptions', progress: 145, target: 200, reward: '5000 bonus points', active: true },
        { name: 'Weekend Warrior', description: 'High weekend activity', progress: 80, target: 100, reward: 'Featured placement', active: true },
        { name: 'New Year Boost', description: 'Create 3 new offers', progress: 2, target: 3, reward: 'Premium badge', active: true }
    ];

    const leaderboard = [
        { rank: 1, name: 'Pacific Coffee - Central', redemptions: 2450, badge: '🥇' },
        { rank: 2, name: 'Wellcome - TST', redemptions: 2103, badge: '🥈' },
        { rank: 3, name: 'Peak Tram Services', redemptions: 1876, badge: '🥉' },
        { rank: 15, name: partnerData?.business_name || 'Your Business', redemptions: 450, badge: '', current: true }
    ];

    const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gamification & Engagement</h2>

            <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Partner Rank</p>
                            <p className="text-4xl font-bold mt-1">#15</p>
                            <p className="text-sm opacity-90 mt-2">Out of 247 partners</p>
                        </div>
                        <Trophy className="h-20 w-20 opacity-80" />
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between">
                            <span>Total Points Earned</span>
                            <span className="text-2xl font-bold">{totalPoints.toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Active Challenges
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {challenges.map((challenge, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold">{challenge.name}</h3>
                                        <p className="text-sm text-gray-600">{challenge.description}</p>
                                        <Badge className="mt-2 bg-blue-100 text-blue-800">
                                            <Zap className="h-3 w-3 mr-1" />
                                            {challenge.reward}
                                        </Badge>
                                    </div>
                                    <Badge variant={challenge.active ? 'default' : 'secondary'}>
                                        {challenge.active ? 'Active' : 'Completed'}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span className="font-semibold">{challenge.progress} / {challenge.target}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {achievements.map((achievement, idx) => (
                            <div 
                                key={idx} 
                                className={`border rounded-lg p-4 ${achievement.earned ? 'bg-green-50 border-green-200' : 'opacity-60'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            {achievement.name}
                                            {achievement.earned && <Award className="h-4 w-4 text-green-600" />}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                        <Badge className="mt-2" variant="outline">
                                            {achievement.points} points
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Partner Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {leaderboard.map((partner) => (
                            <div 
                                key={partner.rank} 
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                    partner.current ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl w-8">{partner.badge || `#${partner.rank}`}</span>
                                    <div>
                                        <p className={`font-semibold ${partner.current ? 'text-blue-700' : ''}`}>
                                            {partner.name}
                                        </p>
                                        {partner.current && (
                                            <Badge className="mt-1">Your Position</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{partner.redemptions.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600">redemptions</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                        View Full Leaderboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}