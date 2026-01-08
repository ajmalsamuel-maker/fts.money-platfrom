import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Calendar } from 'lucide-react';

export default function StreakTracker({ streak }) {
    if (!streak) {
        return (
            <Card>
                <CardContent className="p-6 text-center space-y-3">
                    <Flame className="h-12 w-12 mx-auto text-slate-300" />
                    <div>
                        <p className="font-bold text-slate-900">Start Your Streak</p>
                        <p className="text-sm text-slate-600">Complete a task today!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStreakColor = (current) => {
        if (current >= 30) return 'text-purple-600';
        if (current >= 14) return 'text-blue-600';
        if (current >= 7) return 'text-green-600';
        return 'text-orange-600';
    };

    const getStreakEmoji = (current) => {
        if (current >= 30) return '🔥🔥🔥';
        if (current >= 14) return '🔥🔥';
        if (current >= 7) return '🔥';
        return '⚡';
    };

    return (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flame className={`h-6 w-6 ${getStreakColor(streak.current_streak)}`} />
                        <h3 className="font-bold text-lg">Streak Status</h3>
                    </div>
                    <Badge className={streak.streak_status === 'active' ? 'bg-green-600' : 'bg-orange-600'}>
                        {streak.streak_status}
                    </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                            {streak.current_streak}
                        </div>
                        <p className="text-xs text-slate-600">Current Streak</p>
                        <p className="text-2xl mt-1">{getStreakEmoji(streak.current_streak)}</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                            {streak.longest_streak}
                        </div>
                        <p className="text-xs text-slate-600">Longest Streak</p>
                        <TrendingUp className="h-5 w-5 mx-auto mt-1 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {streak.weekly_streak}
                        </div>
                        <p className="text-xs text-slate-600">Weeks Active</p>
                        <Calendar className="h-5 w-5 mx-auto mt-1 text-blue-600" />
                    </div>
                </div>

                {streak.current_streak >= 7 && (
                    <div className="mt-4 p-3 bg-white rounded-lg text-center">
                        <p className="text-sm font-medium text-green-700">
                            🎉 Amazing! Keep your streak going!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}