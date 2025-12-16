// Workflow Management Role-Based Access Control

export const WORKFLOW_ROLES = {
    ADMIN: 'workflow_admin',
    COMPLIANCE_OFFICER: 'compliance_officer',
    AUDITOR: 'auditor',
    DEVELOPER: 'developer'
};

export const WORKFLOW_PERMISSIONS = {
    // View permissions
    VIEW_WORKFLOWS: 'workflow:view',
    VIEW_AUDIT_TRAIL: 'workflow:audit:view',
    VIEW_TEMPLATES: 'workflow:templates:view',
    VIEW_COMPLIANCE: 'workflow:compliance:view',
    VIEW_BPMN: 'workflow:bpmn:view',
    
    // Edit permissions
    CREATE_WORKFLOW: 'workflow:create',
    EDIT_WORKFLOW: 'workflow:edit',
    DELETE_WORKFLOW: 'workflow:delete',
    UPLOAD_BPMN: 'workflow:bpmn:upload',
    
    // Template permissions
    CREATE_TEMPLATE: 'workflow:template:create',
    EDIT_TEMPLATE: 'workflow:template:edit',
    DELETE_TEMPLATE: 'workflow:template:delete',
    
    // Compliance permissions
    APPROVE_WORKFLOW: 'workflow:approve',
    MARK_COMPLIANT: 'workflow:compliance:mark',
    MANAGE_STANDARDS: 'workflow:standards:manage',
    
    // Audit permissions
    EXPORT_AUDIT: 'workflow:audit:export',
    VIEW_SENSITIVE_DATA: 'workflow:audit:sensitive'
};

const ROLE_PERMISSIONS_MAP = {
    [WORKFLOW_ROLES.ADMIN]: Object.values(WORKFLOW_PERMISSIONS),
    
    [WORKFLOW_ROLES.COMPLIANCE_OFFICER]: [
        WORKFLOW_PERMISSIONS.VIEW_WORKFLOWS,
        WORKFLOW_PERMISSIONS.VIEW_AUDIT_TRAIL,
        WORKFLOW_PERMISSIONS.VIEW_TEMPLATES,
        WORKFLOW_PERMISSIONS.VIEW_COMPLIANCE,
        WORKFLOW_PERMISSIONS.VIEW_BPMN,
        WORKFLOW_PERMISSIONS.EDIT_WORKFLOW,
        WORKFLOW_PERMISSIONS.APPROVE_WORKFLOW,
        WORKFLOW_PERMISSIONS.MARK_COMPLIANT,
        WORKFLOW_PERMISSIONS.MANAGE_STANDARDS,
        WORKFLOW_PERMISSIONS.EXPORT_AUDIT,
        WORKFLOW_PERMISSIONS.VIEW_SENSITIVE_DATA
    ],
    
    [WORKFLOW_ROLES.AUDITOR]: [
        WORKFLOW_PERMISSIONS.VIEW_WORKFLOWS,
        WORKFLOW_PERMISSIONS.VIEW_AUDIT_TRAIL,
        WORKFLOW_PERMISSIONS.VIEW_TEMPLATES,
        WORKFLOW_PERMISSIONS.VIEW_COMPLIANCE,
        WORKFLOW_PERMISSIONS.VIEW_BPMN,
        WORKFLOW_PERMISSIONS.EXPORT_AUDIT,
        WORKFLOW_PERMISSIONS.VIEW_SENSITIVE_DATA
    ],
    
    [WORKFLOW_ROLES.DEVELOPER]: [
        WORKFLOW_PERMISSIONS.VIEW_WORKFLOWS,
        WORKFLOW_PERMISSIONS.VIEW_TEMPLATES,
        WORKFLOW_PERMISSIONS.VIEW_BPMN,
        WORKFLOW_PERMISSIONS.CREATE_WORKFLOW,
        WORKFLOW_PERMISSIONS.EDIT_WORKFLOW,
        WORKFLOW_PERMISSIONS.UPLOAD_BPMN,
        WORKFLOW_PERMISSIONS.CREATE_TEMPLATE,
        WORKFLOW_PERMISSIONS.EDIT_TEMPLATE
    ]
};

export function getUserWorkflowRole(platformRole) {
    // Map platform roles to workflow roles
    const roleMap = {
        'super_admin': WORKFLOW_ROLES.ADMIN,
        'platform_admin': WORKFLOW_ROLES.ADMIN,
        'operations': WORKFLOW_ROLES.DEVELOPER,
        'finance': WORKFLOW_ROLES.AUDITOR,
        'support': WORKFLOW_ROLES.AUDITOR
    };
    
    return roleMap[platformRole] || WORKFLOW_ROLES.AUDITOR;
}

export function hasWorkflowPermission(workflowRole, permission) {
    if (!workflowRole) return false;
    const rolePermissions = ROLE_PERMISSIONS_MAP[workflowRole] || [];
    return rolePermissions.includes(permission);
}

export function hasAnyWorkflowPermission(workflowRole, permissions) {
    return permissions.some(permission => hasWorkflowPermission(workflowRole, permission));
}

export function getRoleLabel(role) {
    const labels = {
        [WORKFLOW_ROLES.ADMIN]: 'Workflow Admin',
        [WORKFLOW_ROLES.COMPLIANCE_OFFICER]: 'Compliance Officer',
        [WORKFLOW_ROLES.AUDITOR]: 'Auditor',
        [WORKFLOW_ROLES.DEVELOPER]: 'Developer'
    };
    return labels[role] || 'Unknown';
}

export function getRoleDescription(role) {
    const descriptions = {
        [WORKFLOW_ROLES.ADMIN]: 'Full access to all workflow management features',
        [WORKFLOW_ROLES.COMPLIANCE_OFFICER]: 'Manage compliance, approve workflows, mark standards',
        [WORKFLOW_ROLES.AUDITOR]: 'View-only access with audit export capabilities',
        [WORKFLOW_ROLES.DEVELOPER]: 'Create and edit workflows, templates, and BPMN diagrams'
    };
    return descriptions[role] || '';
}