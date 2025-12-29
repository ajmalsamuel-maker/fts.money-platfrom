/**
 * ISO Gateway RBAC - Permission Registry
 */

export const ISO_PERMISSIONS = {
    // Customer Management
    CUSTOMER_READ: 'customer:read',
    CUSTOMER_UPDATE: 'customer:update',
    CUSTOMER_BILLING: 'customer:billing',
    
    // Translation & Routing
    TRANSLATION_CONFIGURE: 'translation:configure',
    TRANSLATION_TEST: 'translation:test',
    TRANSLATION_VIEW: 'translation:view',
    
    // Connections
    CONNECTION_CREATE: 'connection:create',
    CONNECTION_UPDATE: 'connection:update',
    CONNECTION_DELETE: 'connection:delete',
    CONNECTION_VIEW: 'connection:view',
    
    // Message Monitoring
    MESSAGE_VIEW: 'message:view',
    MESSAGE_EXPORT: 'message:export',
    MESSAGE_REPLAY: 'message:replay',
    
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

export const ISO_ROLES = {
    OWNER: 'owner',
    ADMINISTRATOR: 'administrator',
    DEVELOPER: 'developer',
    OPERATIONS: 'operations',
    ANALYST: 'analyst',
    VIEWER: 'viewer'
};

export const ISO_ROLE_PERMISSIONS = {
    [ISO_ROLES.OWNER]: Object.values(ISO_PERMISSIONS),
    
    [ISO_ROLES.ADMINISTRATOR]: [
        ISO_PERMISSIONS.CUSTOMER_READ,
        ISO_PERMISSIONS.CUSTOMER_UPDATE,
        ISO_PERMISSIONS.TRANSLATION_CONFIGURE,
        ISO_PERMISSIONS.TRANSLATION_TEST,
        ISO_PERMISSIONS.TRANSLATION_VIEW,
        ISO_PERMISSIONS.CONNECTION_CREATE,
        ISO_PERMISSIONS.CONNECTION_UPDATE,
        ISO_PERMISSIONS.CONNECTION_DELETE,
        ISO_PERMISSIONS.CONNECTION_VIEW,
        ISO_PERMISSIONS.MESSAGE_VIEW,
        ISO_PERMISSIONS.MESSAGE_EXPORT,
        ISO_PERMISSIONS.MESSAGE_REPLAY,
        ISO_PERMISSIONS.API_KEYS_MANAGE,
        ISO_PERMISSIONS.API_DOCS_VIEW,
        ISO_PERMISSIONS.API_LOGS_VIEW,
        ISO_PERMISSIONS.USER_INVITE,
        ISO_PERMISSIONS.USER_MANAGE,
        ISO_PERMISSIONS.ANALYTICS_VIEW,
        ISO_PERMISSIONS.ANALYTICS_EXPORT
    ],
    
    [ISO_ROLES.DEVELOPER]: [
        ISO_PERMISSIONS.CUSTOMER_READ,
        ISO_PERMISSIONS.TRANSLATION_CONFIGURE,
        ISO_PERMISSIONS.TRANSLATION_TEST,
        ISO_PERMISSIONS.TRANSLATION_VIEW,
        ISO_PERMISSIONS.CONNECTION_VIEW,
        ISO_PERMISSIONS.MESSAGE_VIEW,
        ISO_PERMISSIONS.API_KEYS_MANAGE,
        ISO_PERMISSIONS.API_DOCS_VIEW,
        ISO_PERMISSIONS.API_LOGS_VIEW
    ],
    
    [ISO_ROLES.OPERATIONS]: [
        ISO_PERMISSIONS.CUSTOMER_READ,
        ISO_PERMISSIONS.TRANSLATION_VIEW,
        ISO_PERMISSIONS.CONNECTION_VIEW,
        ISO_PERMISSIONS.MESSAGE_VIEW,
        ISO_PERMISSIONS.MESSAGE_EXPORT,
        ISO_PERMISSIONS.API_LOGS_VIEW,
        ISO_PERMISSIONS.ANALYTICS_VIEW
    ],
    
    [ISO_ROLES.ANALYST]: [
        ISO_PERMISSIONS.CUSTOMER_READ,
        ISO_PERMISSIONS.MESSAGE_VIEW,
        ISO_PERMISSIONS.ANALYTICS_VIEW,
        ISO_PERMISSIONS.ANALYTICS_EXPORT
    ],
    
    [ISO_ROLES.VIEWER]: [
        ISO_PERMISSIONS.CUSTOMER_READ,
        ISO_PERMISSIONS.TRANSLATION_VIEW,
        ISO_PERMISSIONS.CONNECTION_VIEW,
        ISO_PERMISSIONS.MESSAGE_VIEW,
        ISO_PERMISSIONS.ANALYTICS_VIEW
    ]
};

export const ISO_ROLE_HIERARCHY = {
    [ISO_ROLES.OWNER]: 100,
    [ISO_ROLES.ADMINISTRATOR]: 80,
    [ISO_ROLES.DEVELOPER]: 60,
    [ISO_ROLES.OPERATIONS]: 50,
    [ISO_ROLES.ANALYST]: 40,
    [ISO_ROLES.VIEWER]: 20
};

export function hasISOPermission(role, permission) {
    return (ISO_ROLE_PERMISSIONS[role] || []).includes(permission);
}

export function getISORoleLabel(role) {
    const labels = {
        [ISO_ROLES.OWNER]: 'Owner',
        [ISO_ROLES.ADMINISTRATOR]: 'Administrator',
        [ISO_ROLES.DEVELOPER]: 'Developer',
        [ISO_ROLES.OPERATIONS]: 'Operations',
        [ISO_ROLES.ANALYST]: 'Analyst',
        [ISO_ROLES.VIEWER]: 'Viewer'
    };
    return labels[role] || role;
}