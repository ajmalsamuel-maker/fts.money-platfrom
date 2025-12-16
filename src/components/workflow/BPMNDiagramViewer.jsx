import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Upload, 
    Link as LinkIcon, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Play,
    AlertTriangle,
    ZoomIn,
    ZoomOut,
    Maximize
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useWorkflowRBAC } from './useWorkflowRBAC';
import { WORKFLOW_PERMISSIONS } from './WorkflowRBAC';
import { WorkflowAuditLogger } from './WorkflowAuditLogger';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';

export default function BPMNDiagramViewer({ workflow, executionStatus = null, compact = false }) {
    const { platformUser } = usePlatformAuth();
    const { can } = useWorkflowRBAC(platformUser);
    const [diagramUrl, setDiagramUrl] = useState(workflow?.bpmn_diagram_url || '');
    const [isEditMode, setIsEditMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef(null);
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async (url) => {
            await WorkflowAuditLogger.logBPMNUpload(workflow, url, platformUser);
            return base44.entities.WorkflowCompliance.update(workflow.id, {
                bpmn_diagram_url: url
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['workflow-audit-trail']);
            queryClient.invalidateQueries(['workflows']);
            setIsEditMode(false);
            toast.success('BPMN diagram updated');
        }
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setDiagramUrl(file_url);
            updateMutation.mutate(file_url);
        } catch (error) {
            toast.error('Failed to upload diagram');
        }
    };

    const handleUrlSave = () => {
        if (diagramUrl) {
            updateMutation.mutate(diagramUrl);
        }
    };

    // Parse workflow definition for step visualization
    const getWorkflowSteps = () => {
        if (!workflow?.workflow_definition) return [];
        
        try {
            const definition = typeof workflow.workflow_definition === 'string' 
                ? JSON.parse(workflow.workflow_definition) 
                : workflow.workflow_definition;
            return definition.steps || [];
        } catch {
            return [];
        }
    };

    const steps = getWorkflowSteps();

    // Real-time execution status rendering
    const renderExecutionOverlay = () => {
        if (!executionStatus || !steps.length) return null;

        return (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                {steps.map((step, index) => {
                    const status = executionStatus.steps?.[step.id];
                    if (!status) return null;

                    return (
                        <div
                            key={step.id}
                            className="absolute"
                            style={{
                                left: `${(index + 1) * 15}%`,
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        >
                            {status === 'success' && (
                                <CheckCircle className="h-8 w-8 text-emerald-500 animate-pulse" />
                            )}
                            {status === 'failure' && (
                                <XCircle className="h-8 w-8 text-red-500 animate-pulse" />
                            )}
                            {status === 'in_progress' && (
                                <Clock className="h-8 w-8 text-blue-500 animate-spin" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (compact) {
        return (
            <div className="relative w-full h-32 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                {diagramUrl ? (
                    <>
                        <img 
                            src={diagramUrl} 
                            alt="BPMN Diagram" 
                            className="w-full h-full object-contain"
                        />
                        {renderExecutionOverlay()}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        No BPMN diagram
                    </div>
                )}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">BPMN 2.0 Diagram</CardTitle>
                    <div className="flex items-center gap-2">
                        {workflow?.iso_19510_compliant && (
                            <Badge className="bg-emerald-100 text-emerald-700">
                                ISO 19510 Compliant
                            </Badge>
                        )}
                        {!isEditMode && can(WORKFLOW_PERMISSIONS.UPLOAD_BPMN) && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload/Link
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isEditMode ? (
                    <div className="space-y-4">
                        <div>
                            <Label>Upload BPMN Diagram</Label>
                            <Input
                                type="file"
                                accept="image/*,.svg,.bpmn"
                                onChange={handleFileUpload}
                                className="mt-1"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-2 text-slate-500">OR</span>
                            </div>
                        </div>
                        <div>
                            <Label>Link to External Diagram</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={diagramUrl}
                                    onChange={(e) => setDiagramUrl(e.target.value)}
                                    placeholder="https://example.com/diagram.svg"
                                />
                                <Button onClick={handleUrlSave} disabled={!diagramUrl}>
                                    Save
                                </Button>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditMode(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <div>
                        {diagramUrl ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                                        >
                                            <ZoomOut className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm text-slate-600">{Math.round(zoom * 100)}%</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                                        >
                                            <ZoomIn className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setZoom(1)}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    {executionStatus && (
                                        <Badge className="bg-blue-100 text-blue-700">
                                            <Play className="h-3 w-3 mr-1" />
                                            Live Execution
                                        </Badge>
                                    )}
                                </div>
                                <div 
                                    ref={containerRef}
                                    className="relative w-full min-h-96 bg-slate-50 rounded-lg border border-slate-200 overflow-auto"
                                >
                                    <div 
                                        className="relative"
                                        style={{ 
                                            transform: `scale(${zoom})`,
                                            transformOrigin: 'top left',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        <img 
                                            src={diagramUrl} 
                                            alt="BPMN 2.0 Workflow Diagram" 
                                            className="w-full h-auto"
                                        />
                                        {renderExecutionOverlay()}
                                    </div>
                                </div>
                                
                                {/* Execution Legend */}
                                {executionStatus && (
                                    <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="text-sm font-medium text-slate-700">Legend:</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-slate-600">In Progress</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm text-slate-600">Success</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-slate-600">Failure</span>
                                        </div>
                                    </div>
                                )}

                                {/* Workflow Steps Table */}
                                {steps.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Workflow Steps</h4>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="text-left p-2 font-medium text-slate-700">Step</th>
                                                        <th className="text-left p-2 font-medium text-slate-700">Name</th>
                                                        <th className="text-left p-2 font-medium text-slate-700">Type</th>
                                                        {executionStatus && (
                                                            <th className="text-left p-2 font-medium text-slate-700">Status</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {steps.map((step, index) => {
                                                        const status = executionStatus?.steps?.[step.id];
                                                        return (
                                                            <tr key={step.id} className="border-t border-slate-200">
                                                                <td className="p-2 text-slate-600">{index + 1}</td>
                                                                <td className="p-2 font-medium text-slate-900">{step.name}</td>
                                                                <td className="p-2 text-slate-600">{step.type || 'Task'}</td>
                                                                {executionStatus && (
                                                                    <td className="p-2">
                                                                        {status === 'success' && (
                                                                            <Badge className="bg-emerald-100 text-emerald-700">Success</Badge>
                                                                        )}
                                                                        {status === 'failure' && (
                                                                            <Badge className="bg-red-100 text-red-700">Failed</Badge>
                                                                        )}
                                                                        {status === 'in_progress' && (
                                                                            <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                                                                        )}
                                                                        {!status && (
                                                                            <Badge variant="outline">Pending</Badge>
                                                                        )}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertTriangle className="h-12 w-12 text-slate-300 mb-4" />
                                <p className="text-slate-600 mb-4">No BPMN diagram uploaded</p>
                                <Button onClick={() => setIsEditMode(true)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Diagram
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}