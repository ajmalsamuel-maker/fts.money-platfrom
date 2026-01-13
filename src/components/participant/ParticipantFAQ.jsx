import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle } from 'lucide-react';

export default function ParticipantFAQ({ programId }) {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const activeProgramId = programId || session.program_id;

    const { data: allFAQs = [] } = useQuery({
        queryKey: ['faqs', activeProgramId],
        queryFn: () => base44.entities.FAQ.filter({ 
            program_id: activeProgramId,
            is_published: true,
            target_audience: ['participant', 'both']
        }),
        enabled: !!activeProgramId
    });

    const faqsByCategory = allFAQs.reduce((acc, faq) => {
        if (!acc[faq.category]) acc[faq.category] = [];
        acc[faq.category].push(faq);
        return acc;
    }, {});

    const categoryLabels = {
        getting_started: 'Getting Started',
        earning_points: 'Earning Points',
        redeeming_rewards: 'Redeeming Rewards',
        account: 'Account',
        technical: 'Technical',
        general: 'General'
    };

    if (allFAQs.length === 0) {
        return (
            <Card className="w-full bg-white/80 backdrop-blur-sm border-none shadow-sm">
                <CardContent className="py-12 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No FAQs available yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-white/80 backdrop-blur-sm border-none shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    Frequently Asked Questions
                </CardTitle>
            </CardHeader>
            <CardContent>
                {Object.keys(faqsByCategory).length > 1 ? (
                    <Tabs defaultValue={Object.keys(faqsByCategory)[0]} className="w-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(faqsByCategory).length, 3)}, 1fr)` }}>
                            {Object.keys(faqsByCategory).map((category) => (
                                <TabsTrigger key={category} value={category} className="text-xs">
                                    {categoryLabels[category]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {Object.entries(faqsByCategory).map(([category, faqs]) => (
                            <TabsContent key={category} value={category}>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq) => (
                                        <AccordionItem key={faq.id} value={faq.id}>
                                            <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                                            <AccordionContent className="text-sm text-gray-600">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {allFAQs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-sm text-gray-600">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    );
}