import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Award, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function StreakTracker({ participant }) {
    const streakDays = participant?.streak_days || 0;
    const longestStreak = participant?.longest_streak || 0;
    
    const getStreakColor = () => {
        if (streakDays >= 30) return 'from-purple-500 to-pink-500';
        if (streakDays >= 14) return 'from-orange-500 to-red-500';
        if (streakDays >= 7) return 'from-yellow-500 to-orange-500';
        return 'from-blue-500 to-cyan-500';
    };

    const getStreakMessage = () => {
        if (streakDays === 0) return 'Start your streak today!';
        if (streakDays === 1) return 'Day 1! Keep going!';
        if (streakDays < 7) return 'Building momentum!';
        if (streakDays < 14) return 'Week streak! Amazing!';
        if (streakDays < 30) return 'Two weeks strong!';
        return 'Legendary streak!';
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className={cn("rounded-xl p-6 bg-gradient-to-br", getStreakColor())}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Flame className="h-8 w-8 text-white animate-pulse" />
                            <div>
                                <p className="text-white/80 text-sm font-medium">Current Streak</p>
                                <p className="text-white text-xs">{getStreakMessage()}</p>
                            </div>
                        </div>
                        {streakDays >= 7 && (
                            <Badge className="bg-white/20 text-white border-white/30">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                On Fire!
                            </Badge>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-white/80 text-xs mb-1">Current</p>
                            <p className="text-4xl font-bold text-white">{streakDays}</p>
                            <p className="text-white/80 text-xs">days</p>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-white/80 text-xs mb-1 flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Best
                            </p>
                            <p className="text-4xl font-bold text-white">{longestStreak}</p>
                            <p className="text-white/80 text-xs">days</p>
                        </div>
                    </div>

                    {streakDays > 0 && (
                        <div className="mt-4 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-white/80 text-xs mb-2">Streak Progress</p>
                            <div className="flex gap-1">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className={cn(
                                        "flex-1 h-2 rounded",
                                        i < (streakDays % 7) ? "bg-white" : "bg-white/20"
                                    )} />
                                ))}
                            </div>
                            <p className="text-white/80 text-xs mt-2">
                                {7 - (streakDays % 7)} days to next milestone
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}