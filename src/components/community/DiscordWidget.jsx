import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Radio, ExternalLink } from 'lucide-react';

export default function DiscordWidget({ serverUrl = "https://discord.gg/ftsmoney" }) {
    // Mock activity data - in production, fetch from Discord API
    const recentActivity = [
        { user: "EcoWarrior", action: "started a discussion", topic: "Best solar panels for home?", time: "2m ago", online: true },
        { user: "GreenChamp", action: "voted on", topic: "Ocean Cleanup Proposal #42", time: "15m ago", online: true },
        { user: "TreePlanter", action: "shared", topic: "Just planted 50 trees! 🌳", time: "1h ago", online: false },
        { user: "CarbonZero", action: "joined voice", topic: "DAO Governance Call", time: "2h ago", online: true },
    ];

    const stats = {
        members: 3241,
        online: 847,
        channels: 24
    };

    return (
        <Card className="border-[#5865F2] border-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#5865F2] rounded-full flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Join our Discord</CardTitle>
                            <p className="text-xs text-slate-500">Real-time community discussions</p>
                        </div>
                    </div>
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                        <Radio className="h-3 w-3" />
                        {stats.online} online
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{stats.members}</div>
                        <div className="text-xs text-slate-600">Members</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.online}</div>
                        <div className="text-xs text-slate-600">Online</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.channels}</div>
                        <div className="text-xs text-slate-600">Channels</div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div>
                    <h4 className="text-sm font-semibold mb-3 text-slate-700">Recent Activity</h4>
                    <div className="space-y-3">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                        {activity.user.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-700">
                                        <span className="font-semibold">{activity.user}</span>
                                        {activity.online && <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full"></span>}
                                        {' '}<span className="text-slate-500">{activity.action}</span>
                                    </p>
                                    <p className="text-slate-600 truncate">{activity.topic}</p>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Join Button */}
                <Button 
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                    onClick={() => window.open(serverUrl, '_blank')}
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Join Discord Server
                    <ExternalLink className="h-3 w-3 ml-2" />
                </Button>

                {/* Features */}
                <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">What's on Discord:</p>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <span>🎤</span>
                            <span>Live DAO governance calls</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🌍</span>
                            <span>Regional sustainability channels</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🎁</span>
                            <span>Exclusive airdrops & early access</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}