import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Phone, MessageSquare } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Transform
                            <br />
                            Your Payments?
                        </h2>
                        <p className="text-xl text-blue-100 leading-relaxed mb-8">
                            Get started with PaymentHub today. Our team will help you 
                            integrate seamlessly and start accepting payments in no time.
                        </p>

                        <div className="flex flex-wrap gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-white">hello@paymenthub.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-white">+1 (800) 123-4567</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white rounded-3xl p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Get in Touch</h3>
                                    <p className="text-sm text-slate-500">We'll respond within 24 hours</p>
                                </div>
                            </div>

                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">
                                            First Name
                                        </label>
                                        <Input 
                                            placeholder="John" 
                                            className="rounded-xl border-slate-200 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">
                                            Last Name
                                        </label>
                                        <Input 
                                            placeholder="Doe" 
                                            className="rounded-xl border-slate-200 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Work Email
                                    </label>
                                    <Input 
                                        type="email"
                                        placeholder="john@company.com" 
                                        className="rounded-xl border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Company
                                    </label>
                                    <Input 
                                        placeholder="Your company name" 
                                        className="rounded-xl border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Monthly Transaction Volume
                                    </label>
                                    <select className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700">
                                        <option value="">Select volume</option>
                                        <option value="0-100k">$0 - $100K</option>
                                        <option value="100k-1m">$100K - $1M</option>
                                        <option value="1m-10m">$1M - $10M</option>
                                        <option value="10m+">$10M+</option>
                                    </select>
                                </div>
                                <Button 
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl py-6"
                                >
                                    Request a Demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}