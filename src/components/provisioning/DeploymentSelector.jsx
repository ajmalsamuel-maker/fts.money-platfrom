import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Cloud, MapPin, DollarSign, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DeploymentSelector({ connectors, formData, setFormData }) {
    const [enableDR, setEnableDR] = useState(false);

    const updateDeployment = (field, value) => {
        setFormData({
            ...formData,
            deployment_config: {
                ...formData.deployment_config,
                [field]: value
            }
        });
    };

    const getConnectorDetails = (connectorId) => {
        return connectors.find(c => c.id === connectorId);
    };

    const calculateMonthlyPrice = (connector) => {
        if (!connector) return 0;
        const baseCost = 500; // Base infrastructure cost
        return Math.round(baseCost * (connector.cost_multiplier || 1));
    };

    const primaryConnector = getConnectorDetails(formData.deployment_config?.primary_cloud);
    const drConnector = getConnectorDetails(formData.deployment_config?.dr_cloud);

    const primaryCost = calculateMonthlyPrice(primaryConnector);
    const drCost = enableDR ? calculateMonthlyPrice(drConnector) : 0;
    const totalCost = primaryCost + drCost;

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Cloud className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="font-semibold text-blue-900 mb-1">Infrastructure Deployment</p>
                        <p className="text-sm text-blue-700">
                            Select your cloud providers for hosting the PSP infrastructure. Disaster Recovery (DR) is optional for high availability.
                        </p>
                    </div>
                </div>
            </div>

            {/* Available Cloud Providers */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base">Available Cloud Providers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {connectors.map((connector) => (
                            <div
                                key={connector.id}
                                className="p-3 border border-slate-200 rounded-lg bg-slate-50"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Server className="h-4 w-4 text-slate-600" />
                                    <span className="font-medium text-sm">{connector.display_name}</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1 text-slate-600">
                                        <MapPin className="h-3 w-3" />
                                        <span>{connector.region}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600">
                                        <DollarSign className="h-3 w-3" />
                                        <span>${calculateMonthlyPrice(connector)}/mo (estimated)</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {connector.provider_type}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                    {connectors.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <Cloud className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm">No active cloud connectors available</p>
                            <p className="text-xs mt-1">Contact platform admin to configure cloud providers</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Primary Cloud Selection */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-600" />
                            Primary Environment (Required)
                        </CardTitle>
                        <Badge className="bg-blue-600">Required</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Select Cloud Provider</Label>
                        <Select
                            value={formData.deployment_config?.primary_cloud}
                            onValueChange={(v) => updateDeployment('primary_cloud', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose cloud provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {connectors.map((connector) => (
                                    <SelectItem key={connector.id} value={connector.id}>
                                        {connector.display_name} - {connector.region} (${calculateMonthlyPrice(connector)}/mo)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {primaryConnector && (
                        <div className="p-4 bg-white rounded-lg border border-blue-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-600 mb-1">Provider</p>
                                    <p className="font-medium">{primaryConnector.display_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600 mb-1">Region</p>
                                    <p className="font-medium">{primaryConnector.region}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600 mb-1">Type</p>
                                    <Badge variant="outline" className="capitalize">{primaryConnector.provider_type}</Badge>
                                </div>
                                <div>
                                    <p className="text-slate-600 mb-1">Monthly Cost</p>
                                    <p className="font-bold text-blue-600">${primaryCost}</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs font-medium text-slate-700 mb-2">Included Services:</p>
                                <div className="flex flex-wrap gap-2">
                                    {primaryConnector.supported_operations?.slice(0, 4).map((op, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                                            {op.replace(/_/g, ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Disaster Recovery Selection */}
            <Card className={cn(
                "border-2",
                enableDR ? "border-amber-300 bg-amber-50" : "border-slate-200"
            )}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className={cn("h-5 w-5", enableDR ? "text-amber-600" : "text-slate-400")} />
                            Disaster Recovery Environment (Optional)
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline">Optional</Badge>
                            <Switch
                                checked={enableDR}
                                onCheckedChange={(checked) => {
                                    setEnableDR(checked);
                                    if (!checked) {
                                        updateDeployment('dr_cloud', null);
                                        updateDeployment('dr_enabled', false);
                                    } else {
                                        updateDeployment('dr_enabled', true);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!enableDR ? (
                        <div className="text-center py-6">
                            <ShieldCheck className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600 mb-1">No Disaster Recovery</p>
                            <p className="text-xs text-slate-500">Enable DR for high availability and business continuity</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label>Select DR Cloud Provider</Label>
                                <Select
                                    value={formData.deployment_config?.dr_cloud}
                                    onValueChange={(v) => updateDeployment('dr_cloud', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose DR cloud provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {connectors
                                            .filter(c => c.id !== formData.deployment_config?.primary_cloud)
                                            .map((connector) => (
                                                <SelectItem key={connector.id} value={connector.id}>
                                                    {connector.display_name} - {connector.region} (${calculateMonthlyPrice(connector)}/mo)
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-600 mt-1">
                                    Choose a different region for geographic redundancy
                                </p>
                            </div>

                            {drConnector && (
                                <div className="p-4 bg-white rounded-lg border border-amber-300">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-600 mb-1">DR Provider</p>
                                            <p className="font-medium">{drConnector.display_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600 mb-1">DR Region</p>
                                            <p className="font-medium">{drConnector.region}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600 mb-1">Replication Type</p>
                                            <Badge variant="outline">Active-Passive</Badge>
                                        </div>
                                        <div>
                                            <p className="text-slate-600 mb-1">DR Cost</p>
                                            <p className="font-bold text-amber-600">${drCost}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="border-slate-200 bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-base">Infrastructure Cost Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600">Primary Environment</span>
                            <span className="font-medium">${primaryCost}/month</span>
                        </div>
                        {enableDR && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-600">DR Environment</span>
                                <span className="font-medium">${drCost}/month</span>
                            </div>
                        )}
                        <div className="border-t border-slate-300 pt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-900">Total Infrastructure Cost</span>
                                <span className="text-2xl font-bold text-blue-600">${totalCost}/month</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-xs text-blue-900">
                                <strong>Note:</strong> This is an estimated infrastructure cost. Actual costs may vary based on usage, data transfer, and additional services.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}