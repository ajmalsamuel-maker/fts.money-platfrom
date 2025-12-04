import React from 'react';
import { motion } from 'framer-motion';
import { 
    Cloud, 
    Globe2, 
    Puzzle, 
    Settings2, 
    Palette, 
    Workflow,
    Clock
} from 'lucide-react';

const features = [
    {
        icon: Cloud,
        title: "Cloud-based Solutions",
        description: "Scale effortlessly with a fully featured cloud infrastructure designed for high availability.",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Globe2,
        title: "Go Global",
        description: "Reach new markets with ease. Accept payments in 180+ countries with local payment methods.",
        color: "from-emerald-500 to-teal-500"
    },
    {
        icon: Puzzle,
        title: "Seamless Integration",
        description: "Connect to the global payments ecosystem with flexible APIs and comprehensive documentation.",
        color: "from-purple-500 to-indigo-500"
    },
    {
        icon: Settings2,
        title: "Custom Functionalities",
        description: "Tailor your platform with personalized business features and custom workflows.",
        color: "from-orange-500 to-amber-500"
    },
    {
        icon: Palette,
        title: "White-label Solutions",
        description: "Launch faster with pre-built web and mobile banking solutions under your own brand.",
        color: "from-pink-500 to-rose-500"
    },
    {
        icon: Workflow,
        title: "Automate Workflows",
        description: "Streamline operations and eliminate unnecessary steps with intelligent automation.",
        color: "from-violet-500 to-purple-500"
    },
    {
        icon: Clock,
        title: "99.99% Uptime",
        description: "Trust in industry-leading reliability with our enterprise-grade infrastructure.",
        color: "from-cyan-500 to-blue-500"
    }
];

export default function FeaturesGrid() {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
                        Why Choose Us
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Explore the Payments World
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Start your journey with us. Innovative services and exceptional support
                        to power your payment operations.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                                <feature.icon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}