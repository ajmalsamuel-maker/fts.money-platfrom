import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <ConsumerNavbar user={user} />

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center space-y-6 mb-16">
                    <Badge className="bg-green-100 text-green-700 border-green-300 px-4 py-2 text-sm">
                        🌱 Join the Green Revolution
                    </Badge>
                    <h1 className="text-6xl font-bold text-slate-900">
                        Earn Rewards for
                        <span className="text-green-600"> Sustainable Actions</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Complete eco-friendly tasks, earn NANO tokens, get discounts at green merchants, 
                        and make a real impact on the planet.
                    </p>
                    <div className="flex justify-center gap-4 pt-6">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                            <Link to={createPageUrl('NanoTaskMarketplace')}>
                                <Leaf className="h-5 w-5 mr-2" />
                                Browse Tasks
                            </Link>
                        </Button>
                        {!user && (
                            <Button size="lg" variant="outline" asChild>
                                <Link to={createPageUrl('ConsumerRegister')}>
                                    Get Started Free
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <Card className="border-green-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Leaf className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Complete Tasks</h3>
                            <p className="text-slate-600">
                                Take public transport, recycle, plant trees, and more. Every action counts.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                <Zap className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Earn NANO Tokens</h3>
                            <p className="text-slate-600">
                                Get rewarded with NANO tokens for each verified sustainable action.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Gift className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Get Rewards</h3>
                            <p className="text-slate-600">
                                Redeem tokens for discounts at green merchants and eco-friendly brands.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl shadow-xl p-12 mb-20">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                        Our Community Impact
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">12,450</div>
                            <p className="text-slate-600">Tasks Completed</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">3,200 kg</div>
                            <p className="text-slate-600">CO₂ Offset</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">8,900+</div>
                            <p className="text-slate-600">Active Users</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">150+</div>
                            <p className="text-slate-600">Green Merchants</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
                    <CardContent className="p-12 text-center space-y-6">
                        <h2 className="text-4xl font-bold">Ready to Make a Difference?</h2>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            Join thousands of people earning rewards while building a sustainable future.
                        </p>
                        <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100" asChild>
                            <Link to={createPageUrl('NanoTaskMarketplace')}>
                                Start Earning Now
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">FTS.Money Green</h3>
                            <p className="text-sm text-slate-400">
                                Sustainability rewards powered by blockchain technology.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link to={createPageUrl('NanoTaskMarketplace')}>Browse Tasks</Link></li>
                                <li><Link to={createPageUrl('UserNanoHub')}>My Impact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
                        © 2026 FTS.Money. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}