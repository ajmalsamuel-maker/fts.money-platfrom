import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from 'lucide-react';

const badgeData = {
    tree_planter: { name: 'Tree Planter', emoji: '🌳', description: 'Plant trees and restore forests' },
    plastic_reducer: { name: 'Plastic Reducer', emoji: '♻️', description: 'Reduce plastic waste' },
    transport_hero: { name: 'Transport Hero', emoji: '🚌', description: 'Use sustainable transport' },
    energy_saver: { name: 'Energy Saver', emoji: '💡', description: 'Save energy at home' },
    green_champion: { name: 'Green Champion', emoji: '🏆', description: 'Complete 50 tasks' },
    eco_warrior: { name: 'Eco Warrior', emoji: '⚡', description: 'Complete 100 tasks' },
    carbon_crusher: { name: 'Carbon Crusher', emoji: '🌍', description: 'Offset 100kg CO₂' },
    streak_master: { name: 'Streak Master', emoji: '🔥', description: '30-day streak' },
    community_leader: { name: 'Community Leader', emoji: '👥', description: 'Help 10 community members' },
    task_creator: { name: 'Task Creator', emoji: '⭐', description: 'Create custom tasks' },
};

const levelColors = {
    bronze: 'from-amber-600 to-amber-700',
    silver: 'from-slate-400 to-slate-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
};

export default function BadgeDisplay({ achievements = [], compact = false }) {
    const earned = achievements.reduce((acc, a) => {
        acc[a.badge_type] = a.badge_level;
        return acc;
    }, {});

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {Object.entries(badgeData).map(([type, data]) => {
                    const level = earned[type];
                    const isEarned = !!level;
                    return (
                        <div
                            key={type}
                            className={`relative text-2xl ${!isEarned && 'grayscale opacity-30'}`}
                            title={`${data.name} ${isEarned ? `(${level})` : '(Locked)'}`}
                        >
                            {data.emoji}
                            {isEarned && (
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${levelColors[level]} border-2 border-white`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(badgeData).map(([type, data]) => {
                const level = earned[type];
                const isEarned = !!level;
                return (
                    <Card key={type} className={!isEarned && 'opacity-50'}>
                        <CardContent className="p-4 text-center space-y-2">
                            <div className="text-4xl relative inline-block">
                                {data.emoji}
                                {!isEarned && (
                                    <Lock className="absolute top-0 right-0 h-4 w-4 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{data.name}</p>
                                <p className="text-xs text-slate-600">{data.description}</p>
                            </div>
                            {isEarned && (
                                <Badge className={`bg-gradient-to-br ${levelColors[level]} text-white border-0`}>
                                    {level}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}