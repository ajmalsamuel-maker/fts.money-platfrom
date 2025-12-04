import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Palette, Save, RotateCcw, Upload, Eye, Sun, Moon
} from 'lucide-react';

const presetThemes = [
    { name: 'Default Blue', primary: '#3b82f6', secondary: '#06b6d4', sidebar: '#0f172a' },
    { name: 'Ocean', primary: '#0ea5e9', secondary: '#14b8a6', sidebar: '#0c4a6e' },
    { name: 'Forest', primary: '#22c55e', secondary: '#84cc16', sidebar: '#14532d' },
    { name: 'Sunset', primary: '#f97316', secondary: '#eab308', sidebar: '#431407' },
    { name: 'Berry', primary: '#a855f7', secondary: '#ec4899', sidebar: '#3b0764' },
    { name: 'Slate', primary: '#64748b', secondary: '#94a3b8', sidebar: '#1e293b' },
];

export default function Appearance() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const queryClient = useQueryClient();
    
    const [settings, setSettings] = useState({
        company_name: 'PaymentHub',
        primary_color: '#3b82f6',
        secondary_color: '#06b6d4',
        accent_color: '#8b5cf6',
        sidebar_bg: '#0f172a',
        sidebar_text: '#94a3b8',
        logo_url: '',
        favicon_url: '',
        dark_mode: false,
        compact_sidebar: false,
    });

    const { data: savedSettings } = useQuery({
        queryKey: ['theme-settings'],
        queryFn: async () => {
            const list = await base44.entities.ThemeSettings.list();
            return list[0] || null;
        },
    });

    useEffect(() => {
        if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }));
    }, [savedSettings]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (savedSettings?.id) {
                return base44.entities.ThemeSettings.update(savedSettings.id, data);
            }
            return base44.entities.ThemeSettings.create({ ...data, name: 'default' });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['theme-settings'] }),
    });

    const applyPreset = (preset) => {
        setSettings(prev => ({ ...prev, primary_color: preset.primary, secondary_color: preset.secondary, sidebar_bg: preset.sidebar }));
    };

    const handleUpload = async (e, field) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setSettings(prev => ({ ...prev, [field]: file_url }));
            } catch (error) {
                console.error('Upload failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Appearance" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Appearance Settings</h1>
                            <p className="text-slate-500">Customize the look and feel of the dashboard</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSettings({ company_name: 'PaymentHub', primary_color: '#3b82f6', secondary_color: '#06b6d4', accent_color: '#8b5cf6', sidebar_bg: '#0f172a', sidebar_text: '#94a3b8', logo_url: '', favicon_url: '', dark_mode: false, compact_sidebar: false })}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                            <Button onClick={() => saveMutation.mutate(settings)} className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Company Name</Label>
                                        <Input value={settings.company_name} onChange={(e) => setSettings(p => ({ ...p, company_name: e.target.value }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Logo</Label>
                                            <div className="flex gap-2">
                                                <Input value={settings.logo_url} onChange={(e) => setSettings(p => ({ ...p, logo_url: e.target.value }))} placeholder="Logo URL" />
                                                <label className="cursor-pointer">
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'logo_url')} />
                                                    <Button variant="outline" size="icon" asChild><span><Upload className="h-4 w-4" /></span></Button>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Favicon</Label>
                                            <div className="flex gap-2">
                                                <Input value={settings.favicon_url} onChange={(e) => setSettings(p => ({ ...p, favicon_url: e.target.value }))} placeholder="Favicon URL" />
                                                <label className="cursor-pointer">
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'favicon_url')} />
                                                    <Button variant="outline" size="icon" asChild><span><Upload className="h-4 w-4" /></span></Button>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Color Scheme</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Presets</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {presetThemes.map((preset) => (
                                                <button key={preset.name} onClick={() => applyPreset(preset)} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-slate-50">
                                                    <div className="flex gap-1">
                                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }} />
                                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }} />
                                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.sidebar }} />
                                                    </div>
                                                    <span className="text-sm">{preset.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { key: 'primary_color', label: 'Primary' },
                                            { key: 'secondary_color', label: 'Secondary' },
                                            { key: 'accent_color', label: 'Accent' },
                                            { key: 'sidebar_bg', label: 'Sidebar BG' },
                                            { key: 'sidebar_text', label: 'Sidebar Text' },
                                        ].map(({ key, label }) => (
                                            <div key={key} className="space-y-2">
                                                <Label>{label}</Label>
                                                <div className="flex gap-2">
                                                    <input type="color" value={settings[key]} onChange={(e) => setSettings(p => ({ ...p, [key]: e.target.value }))} className="w-10 h-10 rounded border cursor-pointer" />
                                                    <Input value={settings[key]} onChange={(e) => setSettings(p => ({ ...p, [key]: e.target.value }))} className="flex-1 font-mono text-sm" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Layout Options</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div><p className="font-medium">Dark Mode</p><p className="text-sm text-slate-500">Use dark theme</p></div>
                                        <Switch checked={settings.dark_mode} onCheckedChange={(c) => setSettings(p => ({ ...p, dark_mode: c }))} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div><p className="font-medium">Compact Sidebar</p><p className="text-sm text-slate-500">Use narrower sidebar</p></div>
                                        <Switch checked={settings.compact_sidebar} onCheckedChange={(c) => setSettings(p => ({ ...p, compact_sidebar: c }))} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="sticky top-6">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />Preview</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="h-8 flex items-center px-2" style={{ backgroundColor: settings.sidebar_bg }}>
                                            {settings.logo_url ? <img src={settings.logo_url} alt="Logo" className="h-5" /> : <div className="w-5 h-5 rounded" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` }} />}
                                            <span className="text-xs ml-2 font-medium" style={{ color: settings.sidebar_text }}>{settings.company_name}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50">
                                            <div className="h-4 rounded mb-2" style={{ backgroundColor: settings.primary_color, width: '60%' }} />
                                            <div className="h-3 rounded mb-1 bg-slate-200" style={{ width: '80%' }} />
                                            <div className="h-3 rounded bg-slate-200" style={{ width: '40%' }} />
                                            <div className="flex gap-2 mt-3">
                                                <div className="h-6 rounded px-3 text-white text-xs flex items-center" style={{ backgroundColor: settings.primary_color }}>Primary</div>
                                                <div className="h-6 rounded px-3 text-white text-xs flex items-center" style={{ backgroundColor: settings.secondary_color }}>Secondary</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}