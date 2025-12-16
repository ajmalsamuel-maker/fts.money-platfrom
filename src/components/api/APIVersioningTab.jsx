import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function APIVersioningTab() {
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);

    const { data: apis = [] } = useQuery({
        queryKey: ['api-definitions'],
        queryFn: () => base44.entities.APIDefinition.list()
    });

    const { data: versions = [] } = useQuery({
        queryKey: ['api-versions'],
        queryFn: () => base44.entities.APIVersion.list()
    });

    const [versionForm, setVersionForm] = useState({
        api_id: '',
        version: '',
        version_description: '',
        deprecation_date: '',
        breaking_changes: [],
        migration_guide: ''
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            const api = apis.find(a => a.id === data.api_id);
            const sunsetDate = data.deprecation_date 
                ? new Date(new Date(data.deprecation_date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : null;
            
            return base44.entities.APIVersion.create({
                ...data,
                version_id: `VER-${Date.now()}`,
                api_name: api?.api_name,
                release_date: new Date().toISOString().split('T')[0],
                sunset_date: sunsetDate
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['api-versions']);
            setShowDialog(false);
            resetForm();
            toast.success('Version created');
        }
    });

    const deprecateMutation = useMutation({
        mutationFn: ({ id }) => base44.entities.APIVersion.update(id, {
            is_deprecated: true,
            deprecation_date: new Date().toISOString().split('T')[0],
            sunset_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-versions']);
            toast.success('Version deprecated (90-day sunset period)');
        }
    });

    const resetForm = () => {
        setVersionForm({
            api_id: '',
            version: '',
            version_description: '',
            deprecation_date: '',
            breaking_changes: [],
            migration_guide: ''
        });
    };

    const addBreakingChange = () => {
        const change = prompt('Enter breaking change:');
        if (change) {
            setVersionForm({
                ...versionForm,
                breaking_changes: [...(versionForm.breaking_changes || []), change]
            });
        }
    };

    const versionsByAPI = versions.reduce((acc, version) => {
        if (!acc[version.api_id]) acc[version.api_id] = [];
        acc[version.api_id].push(version);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">API Versioning</h3>
                    <p className="text-sm text-slate-600">Manage API versions with 90-day deprecation schedules</p>
                </div>
                <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Version
                </Button>
            </div>

            <div className="space-y-6">
                {apis.map(api => (
                    <Card key={api.id}>
                        <CardHeader>
                            <CardTitle className="text-base">{api.api_name}</CardTitle>
                            <p className="text-sm text-slate-600">Current: {api.current_version}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(versionsByAPI[api.id] || []).map(version => (
                                    <div key={version.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold">{version.version}</span>
                                                {version.is_deprecated && (
                                                    <Badge className="bg-red-100 text-red-700">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Deprecated
                                                    </Badge>
                                                )}
                                                {version.is_active && !version.is_deprecated && (
                                                    <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{version.version_description}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>Released: {version.release_date}</span>
                                                {version.deprecation_date && (
                                                    <span className="text-red-600">Deprecated: {version.deprecation_date}</span>
                                                )}
                                                {version.sunset_date && (
                                                    <span className="text-red-600 font-semibold">Sunset: {version.sunset_date}</span>
                                                )}
                                            </div>
                                        </div>
                                        {!version.is_deprecated && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="text-red-600"
                                                onClick={() => {
                                                    if (confirm('Deprecate this version? 90-day sunset period will start.')) {
                                                        deprecateMutation.mutate({ id: version.id });
                                                    }
                                                }}
                                            >
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Deprecate
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {(!versionsByAPI[api.id] || versionsByAPI[api.id].length === 0) && (
                                    <p className="text-sm text-slate-500 text-center py-4">No versions created yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create API Version</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>API</Label>
                            <Select value={versionForm.api_id} onValueChange={(v) => setVersionForm({...versionForm, api_id: v})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select API" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apis.map(api => (
                                        <SelectItem key={api.id} value={api.id}>{api.api_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Version</Label>
                                <Input
                                    value={versionForm.version}
                                    onChange={(e) => setVersionForm({...versionForm, version: e.target.value})}
                                    placeholder="v2"
                                />
                            </div>
                            <div>
                                <Label>Deprecation Date (Optional)</Label>
                                <Input
                                    type="date"
                                    value={versionForm.deprecation_date}
                                    onChange={(e) => setVersionForm({...versionForm, deprecation_date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Version Description</Label>
                            <Textarea
                                value={versionForm.version_description}
                                onChange={(e) => setVersionForm({...versionForm, version_description: e.target.value})}
                                rows={3}
                                placeholder="What changed in this version..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Breaking Changes</Label>
                                <Button size="sm" variant="outline" onClick={addBreakingChange}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(versionForm.breaking_changes || []).map((change, idx) => (
                                    <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                                        {change}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Migration Guide</Label>
                            <Textarea
                                value={versionForm.migration_guide}
                                onChange={(e) => setVersionForm({...versionForm, migration_guide: e.target.value})}
                                rows={4}
                                placeholder="Instructions for upgrading from previous version..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => createMutation.mutate(versionForm)}>Create Version</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}