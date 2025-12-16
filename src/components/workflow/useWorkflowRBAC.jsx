import { useMemo } from 'react';
import { getUserWorkflowRole, hasWorkflowPermission, getRoleLabel } from './WorkflowRBAC';

export function useWorkflowRBAC(platformUser) {
    const workflowRole = useMemo(() => {
        if (!platformUser?.platform_role) return null;
        return getUserWorkflowRole(platformUser.platform_role);
    }, [platformUser]);

    const can = (permission) => {
        return hasWorkflowPermission(workflowRole, permission);
    };

    const roleLabel = useMemo(() => {
        return workflowRole ? getRoleLabel(workflowRole) : 'No Access';
    }, [workflowRole]);

    return {
        workflowRole,
        can,
        roleLabel,
        isAdmin: workflowRole === 'workflow_admin',
        isComplianceOfficer: workflowRole === 'compliance_officer',
        isAuditor: workflowRole === 'auditor',
        isDeveloper: workflowRole === 'developer'
    };
}