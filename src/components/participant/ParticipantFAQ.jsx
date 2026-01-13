import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from 'lucide-react';

export default function ParticipantFAQ() {
    const faqs = [
        {
            question: "How do I earn points?",
            answer: "You can earn points by participating in activities, completing challenges, and engaging with our partner programs. Check your dashboard for available earning opportunities."
        },
        {
            question: "How do I redeem rewards?",
            answer: "Once you have enough points, navigate to the Rewards section in your dashboard. Browse the available rewards and click 'Redeem' on the item you want."
        },
        {
            question: "I forgot my password, what should I do?",
            answer: "If you've forgotten your password, please contact your program administrator or use the 'Forgot Password' link if available to reset it."
        },
        {
            question: "My points aren't showing up.",
            answer: "Points usually appear immediately, but some activities may require verification which can take up to 24 hours. If they still don't appear, please contact support."
        },
        {
            question: "How do I check my tier status?",
            answer: "Your current tier status is displayed prominently on your dashboard. Earning more points helps you progress to higher tiers with better benefits."
        }
    ];

    return (
        <Card className="w-full mt-8 bg-white/80 backdrop-blur-sm border-none shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    Frequently Asked Questions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-sm text-gray-600">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}