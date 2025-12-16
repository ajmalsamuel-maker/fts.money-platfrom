import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, Layout, Menu } from 'lucide-react';

export default function LayoutEditor({ layout, onChange }) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Sidebar Configuration</CardTitle>
                    <CardDescription>Customize sidebar position and style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Sidebar Position</Label>
                        <Select
                            value={layout.sidebar_position}
                            onValueChange={(v) => onChange({...layout, sidebar_position: v})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="top">Top</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Sidebar Style</Label>
                        <Select
                            value={layout.sidebar_style}
                            onValueChange={(v) => onChange({...layout, sidebar_style: v})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full">Full Width</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                                <SelectItem value="icons_only">Icons Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Header Style</Label>
                        <Select
                            value={layout.header_style}
                            onValueChange={(v) => onChange({...layout, header_style: v})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="full">Full</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Layout Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 bg-slate-50">
                        {layout.sidebar_position === 'left' && (
                            <div className="flex gap-2">
                                <div className={`${layout.sidebar_style === 'icons_only' ? 'w-16' : layout.sidebar_style === 'compact' ? 'w-48' : 'w-64'} h-48 bg-slate-300 rounded flex items-center justify-center`}>
                                    <Sidebar className="h-8 w-8 text-slate-600" />
                                </div>
                                <div className="flex-1 h-48 bg-white rounded flex items-center justify-center">
                                    <Layout className="h-8 w-8 text-slate-400" />
                                </div>
                            </div>
                        )}
                        {layout.sidebar_position === 'right' && (
                            <div className="flex gap-2">
                                <div className="flex-1 h-48 bg-white rounded flex items-center justify-center">
                                    <Layout className="h-8 w-8 text-slate-400" />
                                </div>
                                <div className={`${layout.sidebar_style === 'icons_only' ? 'w-16' : layout.sidebar_style === 'compact' ? 'w-48' : 'w-64'} h-48 bg-slate-300 rounded flex items-center justify-center`}>
                                    <Sidebar className="h-8 w-8 text-slate-600" />
                                </div>
                            </div>
                        )}
                        {layout.sidebar_position === 'top' && (
                            <div>
                                <div className="h-16 bg-slate-300 rounded flex items-center justify-center mb-2">
                                    <Menu className="h-6 w-6 text-slate-600" />
                                </div>
                                <div className="h-32 bg-white rounded flex items-center justify-center">
                                    <Layout className="h-8 w-8 text-slate-400" />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}