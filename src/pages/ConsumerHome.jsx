import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Zap, Gift, TrendingUp, ArrowRight, Globe, Users, Award } from 'lucide-react';

export default function ConsumerHome() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('consumer_session');
        if (session) {
            setUser(JSON.parse(session));
        }
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <ConsumerNavbar user={user} />

            {/* Hero Section - FTS.Money Style */}
            <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-white overflow-hidden">
                {/* Fluid Wave Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute bottom-0 w-full h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="url(#wave-gradient)" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,154.7C672,160,768,192,864,181.3C960,171,1056,117,1152,106.7C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <defs>
                            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#003EFF', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#54F0E4', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="text-center space-y-8">
                        <h1 className="text-5xl md:text-7xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <span className="text-blue-600">Sustainable rewards</span>
                        </h1>
                        <p className="text-2xl md:text-3xl text-slate-900 max-w-4xl mx-auto leading-relaxed">
                            One platform for <span className="font-bold">smarter, greener, simpler</span> sustainability
                        </p>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Complete eco-friendly tasks, earn NANO tokens, get discounts at green merchants, 
                            and make a real impact on the planet.
                        </p>
                        <div className="flex justify-center gap-4 pt-6">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full px-8" asChild>
                                <a href={createPageUrl('NanoTaskMarketplace')}>
                                    Browse Tasks
                                </a>
                            </Button>
                            {!user && (
                                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-8" asChild>
                                    <a href={createPageUrl('ConsumerRegister')}>
                                        Sign up now
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    The <span className="text-blue-600">green rewards</span> platform
                </h2>
                <p className="text-center text-slate-600 mb-16 max-w-3xl mx-auto">
                    Task marketplace, gamified rewards, community engagement, carbon tracking, and merchant partnerships
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-4 p-8 hover:bg-blue-50 rounded-lg transition-colors">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center mx-auto">
                            <Leaf className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Complete Tasks</h3>
                        <p className="text-slate-600">
                            Take public transport, recycle, plant trees, and more. Every action counts.
                        </p>
                    </div>

                    <div className="text-center space-y-4 p-8 hover:bg-cyan-50 rounded-lg transition-colors">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-lg flex items-center justify-center mx-auto">
                            <Zap className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Earn NANO Tokens</h3>
                        <p className="text-slate-600">
                            Get rewarded with NANO tokens for each verified sustainable action.
                        </p>
                    </div>

                    <div className="text-center space-y-4 p-8 hover:bg-blue-50 rounded-lg transition-colors">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mx-auto">
                            <Gift className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Get Rewards</h3>
                        <p className="text-slate-600">
                            Redeem tokens for discounts at green merchants and eco-friendly brands.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section - FTS Style */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        FTS.Money makes sustainability…
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12 mt-16">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-blue-600 mb-4">12,450</div>
                            <h3 className="text-xl font-bold mb-2">Smarter</h3>
                            <p className="text-slate-600">Tasks completed with optimized carbon impact routing</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-cyan-600 mb-4">3.2 tons</div>
                            <h3 className="text-xl font-bold mb-2">Safer</h3>
                            <p className="text-slate-600">CO₂ offset tracked with blockchain verification</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-blue-700 mb-4">8,900+</div>
                            <h3 className="text-xl font-bold mb-2">Simpler</h3>
                            <p className="text-slate-600">Active community members earning green rewards</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm">
                    <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Robust and trustworthy green rewards
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">Blockchain verified impact</h4>
                            <p className="text-slate-600">Every task completion and carbon offset is recorded on-chain for transparency</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">150+ green merchants</h4>
                            <p className="text-slate-600">Partner network of verified eco-friendly businesses offering exclusive rewards</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">Gamified engagement</h4>
                            <p className="text-slate-600">Leaderboards, badges, and streaks keep you motivated on your sustainability journey</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">Community driven</h4>
                            <p className="text-slate-600">Share tips, create tasks, and inspire others in our growing green community</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ready to make a difference?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of people earning rewards while building a sustainable future
                    </p>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 rounded-full px-8" asChild>
                        <a href={createPageUrl('NanoTaskMarketplace')}>
                            Start earning now
                        </a>
                    </Button>
                </div>
            </div>

            {/* Footer - FTS Style */}
            <footer className="bg-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="font-bold mb-4 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Green Rewards
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Part of the FTS.Money global payments ecosystem. Sustainability rewards powered by blockchain technology.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Platform</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href={createPageUrl('NanoTaskMarketplace')} className="text-slate-400 hover:text-cyan-400 transition-colors">Task Marketplace</a></li>
                                <li><a href={createPageUrl('UserNanoHub')} className="text-slate-400 hover:text-cyan-400 transition-colors">My Impact Hub</a></li>
                                <li><a href={createPageUrl('CommunityLeaderboard')} className="text-slate-400 hover:text-cyan-400 transition-colors">Leaderboard</a></li>
                                <li><a href={createPageUrl('CommunityForum')} className="text-slate-400 hover:text-cyan-400 transition-colors">Community</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="https://fts.money/about" className="text-slate-400 hover:text-cyan-400 transition-colors">About FTS.Money</a></li>
                                <li><a href="https://fts.money/contact" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">For Merchants</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
                        © 2026 FTS.Money. All rights reserved. | Privately owned and operated by global payments veterans
                    </div>
                </div>
            </footer>
        </div>
    );
}