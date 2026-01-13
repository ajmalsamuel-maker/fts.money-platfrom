import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Gift, Target, Menu, X, LogOut, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import ParticipantFAQ from '@/components/participant/ParticipantFAQ';

export default function ParticipantHelp() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex">
            <aside className={cn("fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col h-screen transform transition-transform shadow-xl md:shadow-none",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
                <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-purple-600 to-blue-600">
                    <div className="flex items-center gap-2 text-white">
                        <Trophy className="h-6 w-6" />
                        <span className="font-bold text-sm">My Rewards</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b bg-purple-50">
                    <p className="text-xs text-slate-600">Welcome</p>
                    <p className="font-semibold truncate">{session.full_name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/ParticipantDashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Trophy className="h-4 w-4" />Dashboard
                    </a>
                    <a href="/ParticipantActivities" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <TrendingUp className="h-4 w-4" />My Activities
                    </a>
                    <a href="/ParticipantRewards" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Gift className="h-4 w-4" />Redeem Rewards
                    </a>
                    <a href="/ParticipantChallenges" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                        <Target className="h-4 w-4" />Challenges
                    </a>
                    <a href="/ParticipantHelp" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium">
                        <HelpCircle className="h-4 w-4" />Help & FAQ
                    </a>
                </nav>

                <div className="p-4 border-t">
                    <Button onClick={() => { 
                        localStorage.removeItem('participant_session'); 
                        window.location.href = '/ParticipantLogin'; 
                    }} variant="outline" className="w-full text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                    </Button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            <div className="flex-1 overflow-y-auto h-screen">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center px-4 md:px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden mr-3" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Help & FAQ</h1>
                </header>

                <div className="p-4 md:p-6 max-w-4xl mx-auto">
                    <ParticipantFAQ />
                </div>
            </div>
        </div>
    );
}