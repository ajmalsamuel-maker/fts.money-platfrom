import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CreditCard, Zap, Globe } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-10 w-64 h-64 bg-gradient-to-br from-cyan-300/10 to-blue-300/10 rounded-full blur-2xl" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm text-slate-600 font-medium">Trusted by 2000+ businesses worldwide</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                            <span className="text-slate-900">Your Brand,</span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                Our Payment
                            </span>
                            <br />
                            <span className="text-slate-900">Gateway</span>
                        </h1>

                        <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                            White-label payment infrastructure for merchants, fintechs and banks. 
                            Launch your payment services with PCI DSS-compliant solutions that scale.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-12">
                            <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg"
                                className="px-8 py-6 text-lg rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                            >
                                View Documentation
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Shield className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-medium">PCI DSS Level 1</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Zap className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-medium">99.99% Uptime</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Globe className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium">180+ Countries</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Main Dashboard Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 -rotate-3" />
                            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">PaymentHub</h3>
                                            <p className="text-xs text-slate-500">Dashboard</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Today's Volume</p>
                                        <p className="text-lg font-bold text-slate-900">$2.4M</p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Transactions</p>
                                        <p className="text-2xl font-bold text-slate-900">12.4K</p>
                                        <p className="text-xs text-emerald-600 font-medium">+12.5%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4">
                                        <p className="text-xs text-emerald-600 font-medium mb-1">Success Rate</p>
                                        <p className="text-2xl font-bold text-slate-900">98.7%</p>
                                        <p className="text-xs text-emerald-600 font-medium">+2.1%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4">
                                        <p className="text-xs text-purple-600 font-medium mb-1">Revenue</p>
                                        <p className="text-2xl font-bold text-slate-900">$847K</p>
                                        <p className="text-xs text-emerald-600 font-medium">+8.3%</p>
                                    </div>
                                </div>

                                {/* Mini Chart */}
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-slate-700">Weekly Performance</span>
                                        <span className="text-xs text-slate-500">Last 7 days</span>
                                    </div>
                                    <div className="flex items-end justify-between gap-2 h-16">
                                        {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                                                className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Secured</p>
                                    <p className="text-xs text-slate-500">256-bit SSL</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Global</p>
                                    <p className="text-xs text-slate-500">180+ Countries</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}