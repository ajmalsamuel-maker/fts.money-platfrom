import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Fingerprint } from 'lucide-react';

const stats = [
    { value: "2000+", label: "Customers & Partners", suffix: "" },
    { value: "20+", label: "Years of Experience", suffix: "" },
    { value: "1B+", label: "Transactions Annually", suffix: "" },
    { value: "99.99%", label: "Platform Uptime", suffix: "" },
];

const certifications = [
    { icon: Shield, label: "PCI DSS Level 1", description: "Highest Security Standard" },
    { icon: Award, label: "ISO 27001", description: "Information Security" },
    { icon: Fingerprint, label: "SOC 2 Type II", description: "Service Trust" },
];

export default function StatsSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            
            {/* Glowing Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-cyan-300 text-sm font-medium mb-4 border border-white/10">
                        Why PaymentHub?
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        Delivering innovative, secure payment solutions with years of industry expertise.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center"
                        >
                            <div className="relative inline-block">
                                <motion.span 
                                    className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                                >
                                    {stat.value}
                                </motion.span>
                            </div>
                            <p className="text-slate-400 mt-2 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Certifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
                >
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">Enterprise-Grade Security</h3>
                            <p className="text-slate-400">Certified and compliant with global security standards</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {certifications.map((cert, idx) => (
                                <div 
                                    key={idx}
                                    className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/10"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <cert.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{cert.label}</p>
                                        <p className="text-slate-400 text-sm">{cert.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}