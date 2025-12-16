import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThemeCustomizer({ theme, onChange }) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Customize your portal colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="color"
                                value={theme.primary_color}
                                onChange={(e) => onChange({...theme, primary_color: e.target.value})}
                                className="w-20 h-10"
                            />
                            <Input
                                type="text"
                                value={theme.primary_color}
                                onChange={(e) => onChange({...theme, primary_color: e.target.value})}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="color"
                                value={theme.secondary_color}
                                onChange={(e) => onChange({...theme, secondary_color: e.target.value})}
                                className="w-20 h-10"
                            />
                            <Input
                                type="text"
                                value={theme.secondary_color}
                                onChange={(e) => onChange({...theme, secondary_color: e.target.value})}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Accent Color</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="color"
                                value={theme.accent_color}
                                onChange={(e) => onChange({...theme, accent_color: e.target.value})}
                                className="w-20 h-10"
                            />
                            <Input
                                type="text"
                                value={theme.accent_color}
                                onChange={(e) => onChange({...theme, accent_color: e.target.value})}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>Upload your logo and set font</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Logo URL</Label>
                        <Input
                            value={theme.logo_url || ''}
                            onChange={(e) => onChange({...theme, logo_url: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <Label>Font Family</Label>
                        <Select
                            value={theme.font_family}
                            onValueChange={(v) => onChange({...theme, font_family: v})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Poppins">Poppins</SelectItem>
                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Background Pattern</Label>
                        <Select
                            value={theme.background_pattern}
                            onValueChange={(v) => onChange({...theme, background_pattern: v})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="dots">Dots</SelectItem>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="waves">Waves</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}