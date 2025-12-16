import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';

export default function WorkflowExecutionMonitor({ executions, workflows }) {
    return (
        <div className="space-y-4">
            {executions.map(execution => {
                const workflow = workflows.find(w => w.id === execution.workflow_id);
                return (
                    <Card key={execution.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{execution.merchant_name || 'Merchant'}</CardTitle>
                                    <p className="text-xs text-slate-500 mt-1">{workflow?.workflow_name}</p>
                                </div>
                                <Badge className={
                                    execution.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    execution.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                    execution.status === 'awaiting_approval' ? 'bg-amber-100 text-amber-700' :
                                    execution.status === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                                }>
                                    {execution.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {execution.status === 'in_progress' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                                    {execution.status === 'awaiting_approval' && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {execution.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                    {execution.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-600">Progress:</span>
                                    <Badge variant="outline">
                                        Step {execution.current_step_order || 1} / {workflow?.steps?.length || 0}
                                    </Badge>
                                </div>

                                {execution.step_history && execution.step_history.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-700">Step History:</p>
                                        <div className="space-y-1">
                                            {execution.step_history.map((historyItem, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs">
                                                    {historyItem.status === 'completed' && (
                                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                    )}
                                                    {historyItem.status === 'failed' && (
                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                    )}
                                                    {historyItem.status === 'in_progress' && (
                                                        <Clock className="h-3 w-3 text-blue-600" />
                                                    )}
                                                    <span className="text-slate-700">{historyItem.step_name}</span>
                                                    {historyItem.error && (
                                                        <span className="text-red-600">• {historyItem.error}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {execution.status === 'failed' && execution.error_message && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        <p className="font-semibold mb-1">Error:</p>
                                        <p>{execution.error_message}</p>
                                        {execution.rollback_completed && (
                                            <p className="text-xs mt-2">✓ Rollback completed</p>
                                        )}
                                    </div>
                                )}

                                {execution.status === 'awaiting_approval' && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                        Waiting for approval from finance manager
                                    </div>
                                )}

                                <div className="text-xs text-slate-500">
                                    Started: {new Date(execution.started_at).toLocaleString()}
                                    {execution.completed_at && (
                                        <> • Completed: {new Date(execution.completed_at).toLocaleString()}</>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {executions.length === 0 && (
                <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No workflow executions yet</p>
                </div>
            )}
        </div>
    );
}