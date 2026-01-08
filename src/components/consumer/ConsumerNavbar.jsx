import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Leaf, User, LogOut, Wallet, TrendingUp, Trophy, MessageSquare, Zap, Users } from 'lucide-react';
import { FTS_LOGOS } from '@/components/community/FTSBrandColors';

export default function ConsumerNavbar({ user }) {
    const handleLogout = () => {
        localStorage.removeItem('consumer_session');
        window.location.href = createPageUrl('ConsumerLogin');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to={createPageUrl('ConsumerHome')} className="flex items-center gap-3">
                        <img 
                            src={FTS_LOGOS.symbol} 
                            alt="FTS.Money" 
                            className="h-10 w-10"
                        />
                        <div>
                            <h1 className="font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                FTS.Money
                            </h1>
                            <p className="text-xs text-green-600">Green Rewards</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link 
                            to={createPageUrl('NanoTaskMarketplace')}
                            className="text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            Tasks
                        </Link>
                        <Link 
                            to={createPageUrl('UserNanoHub')}
                            className="text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            My Impact
                        </Link>
                        <Link 
                            to={createPageUrl('GreenBondsMarketplace')}
                            className="text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            Green Bonds
                        </Link>
                        <Link 
                            to={createPageUrl('NFTAchievements')}
                            className="text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            NFTs
                        </Link>
                        <Link 
                            to={createPageUrl('NANOStaking')}
                            className="text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            Staking
                        </Link>
                        <Link 
                            to={createPageUrl('ProjectDAO')}
                            className="text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            DAO
                        </Link>
                        <Link 
                            to={createPageUrl('CommunityLeaderboard')}
                            className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                        >
                            Leaderboard
                        </Link>
                        <Link 
                            to={createPageUrl('CommunityForum')}
                            className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                        >
                            Community
                        </Link>
                    </div>

                    {/* User Menu */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-green-100 text-green-700">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline text-sm">{user.email}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link to={createPageUrl('UserNanoHub')}>
                                        <Wallet className="h-4 w-4 mr-2" />
                                        My Impact Hub
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={createPageUrl('CommunityLeaderboard')}>
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Leaderboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('CommunityForum')}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Community
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('GreenBondsMarketplace')}>
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Green Bonds
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('NFTAchievements')}>
                                            <Trophy className="h-4 w-4 mr-2" />
                                            NFT Achievements
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('NANOStaking')}>
                                            <Zap className="h-4 w-4 mr-2" />
                                            Staking
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('ProjectDAO')}>
                                            <Users className="h-4 w-4 mr-2" />
                                            DAO Governance
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('ConsumerProfile')}>
                                            <User className="h-4 w-4 mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" asChild>
                                <Link to={createPageUrl('ConsumerLogin')}>Sign In</Link>
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full" asChild>
                                <Link to={createPageUrl('ConsumerRegister')}>Sign up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}