import React, { useEffect, useState } from 'react';
import WorkflowValidator from './WorkflowValidator';
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * Higher-Order Component to automatically add workflow compliance to any component
 * Usage: export default withWorkflowCompliance(YourComponent, 'workflow_type');
 */
export const withWorkflowCompliance = (Component, workflowType, requiredStandards = ['iso_19510', 'iso_10746', 'iso_9001']) => {
    return function WorkflowWrappedComponent(props) {
        const [compliance, setCompliance] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const checkCompliance = async () => {
                try {
                    const result = await WorkflowValidator.checkCompliance(workflowType, requiredStandards);
                    setCompliance(result);
                } catch (error) {
                    console.error('Workflow compliance check failed:', error);
                    setCompliance({ compliant: false, reason: 'Check failed' });
                } finally {
                    setLoading(false);
                }
            };
            checkCompliance();
        }, []);

        return (
            <div className="relative">
                {!loading && compliance && (
                    <div className="absolute top-4 right-4 z-50">
                        <Badge className={compliance.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {compliance.compliant ? (
                                <Shield className="h-3 w-3 mr-1" />
                            ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {compliance.compliant ? 'ISO Compliant' : 'Compliance Issue'}
                        </Badge>
                    </div>
                )}
                <Component {...props} workflowCompliance={compliance} />
            </div>
        );
    };
};

/**
 * Hook version for functional components
 */
export const useWorkflowCompliance = (workflowType, requiredStandards = ['iso_19510', 'iso_10746', 'iso_9001']) => {
    const [compliance, setCompliance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCompliance = async () => {
            try {
                const result = await WorkflowValidator.checkCompliance(workflowType, requiredStandards);
                setCompliance(result);
            } catch (error) {
                console.error('Workflow compliance check failed:', error);
                setCompliance({ compliant: false, reason: 'Check failed' });
            } finally {
                setLoading(false);
            }
        };
        checkCompliance();
    }, [workflowType]);

    return { compliance, loading };
};

/**
 * Wrapper function for operations to automatically log to workflow
 */
export const withWorkflowLogging = async (workflowType, stepName, operation, metadata = {}) => {
    return await WorkflowValidator.executeStep(
        workflowType,
        stepName,
        operation,
        metadata
    );
};

export default withWorkflowCompliance;