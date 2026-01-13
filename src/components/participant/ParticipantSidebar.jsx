import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LogOut, Flame, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ParticipantSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState({ earn: true, social: true });
    const [searchParams] = useSearchParams();
    const session = JSON.parse(localStorage.getItem('participant_session') || '{}');

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('participant_session');
        window.location.href = '/ParticipantLogin';
    };

    return (
        <aside className={cn("relative bg-white border-r flex flex-col h-screen transition-all duration-300 shadow-lg",
            sidebarOpen ? "w-64" : "w-20")}>
            <div className="h-16 flex items-center justify-between border-b px-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                {sidebarOpen && (
                    <div className="flex items-center gap-2 text-white">
                        <Flame className="h-6 w-6" />
                        <span className="font-bold text-sm">Participant</span>
                    </div>
                )}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-purple-700 p-1 rounded">
                    {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* PRIMARY ACTION - Home/Dashboard */}
                <Link to="/ParticipantDashboard" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 whitespace-nowrap font-medium", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">🏠</span>
                    {sidebarOpen && <span>Home</span>}
                </Link>

                {/* EARNING SECTION - How to earn points */}
                <div className="mt-6 mb-3">
                    {sidebarOpen && <span className="text-xs font-bold text-slate-500 uppercase px-3">Earn Points</span>}
                </div>

                <button onClick={() => toggleMenu('earn')} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 font-medium whitespace-nowrap", expandedMenus.earn && "bg-green-50", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">⚡</span>
                    {sidebarOpen && (
                        <>
                            <span>Activities</span>
                            <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedMenus.earn && "rotate-180")} />
                        </>
                    )}
                </button>
                {sidebarOpen && expandedMenus.earn && (
                    <div className="space-y-1 mt-1 pl-4 border-l-2 border-green-200">
                        <Link to="/ParticipantActivities" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-green-50">
                            📊 My Progress
                        </Link>
                        <Link to="/ParticipantActivities?filter=completed" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-green-50">
                            ✅ Completed
                        </Link>
                    </div>
                )}

                <button onClick={() => toggleMenu('challenges')} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium whitespace-nowrap", expandedMenus.challenges && "bg-blue-50", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">🎯</span>
                    {sidebarOpen && (
                        <>
                            <span>Challenges</span>
                            <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedMenus.challenges && "rotate-180")} />
                        </>
                    )}
                </button>
                {sidebarOpen && expandedMenus.challenges && (
                    <div className="space-y-1 mt-1 pl-4 border-l-2 border-blue-200">
                        <Link to="/ParticipantChallenges" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-blue-50">
                            🏆 Active
                        </Link>
                        <Link to="/ParticipantChallenges?filter=completed" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-blue-50">
                            ⭐ Completed
                        </Link>
                    </div>
                )}

                <button onClick={() => toggleMenu('social')} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 font-medium whitespace-nowrap", expandedMenus.social && "bg-purple-50", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">🔥</span>
                    {sidebarOpen && (
                        <>
                            <span>Social Earn</span>
                            <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedMenus.social && "rotate-180")} />
                        </>
                    )}
                </button>
                {sidebarOpen && expandedMenus.social && (
                    <div className="space-y-1 mt-1 pl-4 border-l-2 border-purple-200">
                        <Link to="/ParticipantSocialTasks?filter=all" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-purple-50">
                            🌍 All Tasks
                        </Link>
                        <Link to="/ParticipantSocialTasks?filter=invite" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-purple-50">
                            👥 Referrals
                        </Link>
                        <Link to="/ParticipantSocialTasks?filter=social_share" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-purple-50">
                            📢 Share
                        </Link>
                        <Link to="/ParticipantSocialTasks?filter=community_post" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-purple-50">
                            💬 Community
                        </Link>
                    </div>
                )}

                {/* REDEMPTION SECTION */}
                <div className="mt-6 mb-3">
                    {sidebarOpen && <span className="text-xs font-bold text-slate-500 uppercase px-3">Redeem</span>}
                </div>

                <Link to="/ParticipantRewards" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 font-medium whitespace-nowrap", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">🎁</span>
                    {sidebarOpen && <span>Rewards Shop</span>}
                </Link>

                {/* ENGAGEMENT SECTION */}
                <div className="mt-6 mb-3">
                    {sidebarOpen && <span className="text-xs font-bold text-slate-500 uppercase px-3">Engagement</span>}
                </div>

                <button onClick={() => toggleMenu('social_proof')} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 font-medium whitespace-nowrap", expandedMenus.social_proof && "bg-amber-50", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">📈</span>
                    {sidebarOpen && (
                        <>
                            <span>Leaderboard</span>
                            <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", expandedMenus.social_proof && "rotate-180")} />
                        </>
                    )}
                </button>
                {sidebarOpen && expandedMenus.social_proof && (
                    <div className="space-y-1 mt-1 pl-4 border-l-2 border-amber-200">
                        <Link to="/ParticipantSocialTasks" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-amber-50">
                            👑 Top Earners
                        </Link>
                        <Link to="/ParticipantChallenges?view=leaderboard" className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-amber-50">
                            🏅 Rankings
                        </Link>
                    </div>
                )}

                {/* UTILITY SECTION */}
                <div className="mt-6 mb-3">
                    {sidebarOpen && <span className="text-xs font-bold text-slate-500 uppercase px-3">Support</span>}
                </div>

                <Link to="/ParticipantHelp" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 whitespace-nowrap", !sidebarOpen && "justify-center")}>
                    <span className="text-lg">❓</span>
                    {sidebarOpen && <span>Help & FAQ</span>}
                </Link>
            </nav>

            <div className="p-4 border-t flex-shrink-0">
                <Button onClick={handleLogout} variant="outline" className={cn("w-full text-red-600 text-xs", !sidebarOpen && "p-2")}>
                    <LogOut className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">Logout</span>}
                </Button>
            </div>
        </aside>
    );
}