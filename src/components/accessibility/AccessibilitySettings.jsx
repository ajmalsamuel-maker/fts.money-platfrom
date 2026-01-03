/**
 * User Accessibility Preferences Panel
 * Allows users to customize accessibility features
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAccessibility, ACCESSIBILITY_FEATURES } from './AccessibilityProvider';
import { Eye, Keyboard, Type, Contrast, Zap, Focus } from 'lucide-react';

export default function AccessibilitySettings() {
    const { preferences, toggleFeature } = useAccessibility();

    const features = [
        {
            id: ACCESSIBILITY_FEATURES.HIGH_CONTRAST,
            name: "High Contrast Mode",
            description: "Increase contrast for better visibility",
            icon: Contrast,
            wcag: "1.4.3"
        },
        {
            id: ACCESSIBILITY_FEATURES.LARGE_TEXT,
            name: "Large Text",
            description: "Increase text size to 125%",
            icon: Type,
            wcag: "1.4.4"
        },
        {
            id: ACCESSIBILITY_FEATURES.KEYBOARD_NAV,
            name: "Keyboard Navigation",
            description: "Enable keyboard shortcuts and navigation",
            icon: Keyboard,
            wcag: "2.1.1"
        },
        {
            id: ACCESSIBILITY_FEATURES.SCREEN_READER,
            name: "Screen Reader Optimization",
            description: "Enhanced announcements and ARIA labels",
            icon: Eye,
            wcag: "4.1.2"
        },
        {
            id: ACCESSIBILITY_FEATURES.REDUCE_MOTION,
            name: "Reduce Motion",
            description: "Minimize animations and transitions",
            icon: Zap,
            wcag: "2.3.3"
        },
        {
            id: ACCESSIBILITY_FEATURES.FOCUS_INDICATORS,
            name: "Enhanced Focus Indicators",
            description: "Make keyboard focus more visible",
            icon: Focus,
            wcag: "2.4.7"
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Accessibility Preferences</CardTitle>
                <CardDescription>
                    Customize your experience • WCAG 2.1 AA Compliant
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div key={feature.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <Icon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                                            {feature.name}
                                        </Label>
                                        <Badge variant="outline" className="text-[9px]">
                                            WCAG {feature.wcag}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">{feature.description}</p>
                                </div>
                            </div>
                            <Switch
                                id={feature.id}
                                checked={preferences[feature.id]}
                                onCheckedChange={() => toggleFeature(feature.id)}
                            />
                        </div>
                    );
                })}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> These settings are saved locally and apply across all FTS.Money portals (PSP, Merchant, ISO Gateway, Orchestration, Crypto Banking, RWA).
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}