/**
 * Orchestration Platform RBAC - Permission Registry
 */

export const ORCH_PERMISSIONS = {
    // Customer Management
    CUSTOMER_READ: 'customer:read',
    CUSTOMER_UPDATE: 'customer:update',
    CUSTOMER_BILLING: 'customer:billing',
    
    // Routing Rules
    ROUTING_CREATE: 'routing:create',
    ROUTING_UPDATE: 'routing:update',
    ROUTING_DELETE: 'routing:delete',
    ROUTING_VIEW: 'routing:view',
    ROUTING_TEST: 'routing:test',
    
    // Payment Routes
    ROUTE_CREATE: 'route:create',
    ROUTE_UPDATE: 'route:update',
    ROUTE_DELETE: 'route:delete',
    ROUTE_VIEW: 'route:view',
    
    // Execution Monitoring
    EXECUTION_VIEW: 'execution:view',
    EXECUTION_REPLAY: 'execution:replay',
    EXECUTION_EXPORT: 'execution:export',
    
    // API Access
    API_KEYS_MANAGE: 'api:keys_manage',
    API_DOCS_VIEW: 'api:docs_view',
    API_LOGS_VIEW: 'api:logs_view',
    
    // User Management
    USER_INVITE: 'user:invite',
    USER_MANAGE: 'user:manage',
    USER_DELETE: 'user:delete',
    
    // Analytics
    ANALYTICS_VIEW: 'analytics:view',
    ANALYTICS_EXPORT: 'analytics:export'
};

export const ORCH_ROLES = {
    OWNER: 'owner',
    ADMINISTRATOR: 'administrator',
    DEVELOPER: 'developer',
    OPERATIONS: 'operations',
    ANALYST: 'analyst',
    VIEWER: 'viewer'
};

export const ORCH_ROLE_PERMISSIONS = {
    [ORCH_ROLES.OWNER]: Object.values(ORCH_PERMISSIONS),
    
    [ORCH_ROLES.ADMINISTRATOR]: [
        ORCH_PERMISSIONS.CUSTOMER_READ,
        ORCH_PERMISSIONS.CUSTOMER_UPDATE,
        ORCH_PERMISSIONS.ROUTING_CREATE,
        ORCH_PERMISSIONS.ROUTING_UPDATE,
        ORCH_PERMISSIONS.ROUTING_DELETE,
        ORCH_PERMISSIONS.ROUTING_VIEW,
        ORCH_PERMISSIONS.ROUTING_TEST,
        ORCH_PERMISSIONS.ROUTE_CREATE,
        ORCH_PERMISSIONS.ROUTE_UPDATE,
        ORCH_PERMISSIONS.ROUTE_DELETE,
        ORCH_PERMISSIONS.ROUTE_VIEW,
        ORCH_PERMISSIONS.EXECUTION_VIEW,
        ORCH_PERMISSIONS.EXECUTION_REPLAY,
        ORCH_PERMISSIONS.EXECUTION_EXPORT,
        ORCH_PERMISSIONS.API_KEYS_MANAGE,
        ORCH_PERMISSIONS.API_DOCS_VIEW,
        ORCH_PERMISSIONS.API_LOGS_VIEW,
        ORCH_PERMISSIONS.USER_INVITE,
        ORCH_PERMISSIONS.USER_MANAGE,
        ORCH_PERMISSIONS.ANALYTICS_VIEW,
        ORCH_PERMISSIONS.ANALYTICS_EXPORT
    ],
    
    [ORCH_ROLES.DEVELOPER]: [
        ORCH_PERMISSIONS.CUSTOMER_READ,
        ORCH_PERMISSIONS.ROUTING_VIEW,
        ORCH_PERMISSIONS.ROUTING_TEST,
        ORCH_PERMISSIONS.ROUTE_VIEW,
        ORCH_PERMISSIONS.EXECUTION_VIEW,
        ORCH_PERMISSIONS.API_KEYS_MANAGE,
        ORCH_PERMISSIONS.API_DOCS_VIEW,
        ORCH_PERMISSIONS.API_LOGS_VIEW
    ],
    
    [ORCH_ROLES.OPERATIONS]: [
        ORCH_PERMISSIONS.CUSTOMER_READ,
        ORCH_PERMISSIONS.ROUTING_VIEW,
        ORCH_PERMISSIONS.ROUTE_VIEW,
        ORCH_PERMISSIONS.EXECUTION_VIEW,
        ORCH_PERMISSIONS.EXECUTION_EXPORT,
        ORCH_PERMISSIONS.API_LOGS_VIEW,
        ORCH_PERMISSIONS.ANALYTICS_VIEW
    ],
    
    [ORCH_ROLES.ANALYST]: [
        ORCH_PERMISSIONS.CUSTOMER_READ,
        ORCH_PERMISSIONS.EXECUTION_VIEW,
        ORCH_PERMISSIONS.ANALYTICS_VIEW,
        ORCH_PERMISSIONS.ANALYTICS_EXPORT
    ],
    
    [ORCH_ROLES.VIEWER]: [
        ORCH_PERMISSIONS.CUSTOMER_READ,
        ORCH_PERMISSIONS.ROUTING_VIEW,
        ORCH_PERMISSIONS.ROUTE_VIEW,
        ORCH_PERMISSIONS.EXECUTION_VIEW,
        ORCH_PERMISSIONS.ANALYTICS_VIEW
    ]
};

export const ORCH_ROLE_HIERARCHY = {
    [ORCH_ROLES.OWNER]: 100,
    [ORCH_ROLES.ADMINISTRATOR]: 80,
    [ORCH_ROLES.DEVELOPER]: 60,
    [ORCH_ROLES.OPERATIONS]: 50,
    [ORCH_ROLES.ANALYST]: 40,
    [ORCH_ROLES.VIEWER]: 20
};

export function hasOrchPermission(role, permission) {
    return (ORCH_ROLE_PERMISSIONS[role] || []).includes(permission);
}

export function getOrchRoleLabel(role) {
    const labels = {
        [ORCH_ROLES.OWNER]: 'Owner',
        [ORCH_ROLES.ADMINISTRATOR]: 'Administrator',
        [ORCH_ROLES.DEVELOPER]: 'Developer',
        [ORCH_ROLES.OPERATIONS]: 'Operations',
        [ORCH_ROLES.ANALYST]: 'Analyst',
        [ORCH_ROLES.VIEWER]: 'Viewer'
    };
    return labels[role] || role;
}