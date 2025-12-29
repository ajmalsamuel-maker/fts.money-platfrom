/**
 * Community Portal RBAC - Permission Registry
 * Defines all permissions and role mappings for community users
 */

export const COMMUNITY_PERMISSIONS = {
    // PSP Management
    PSP_CREATE: 'psp:create',
    PSP_READ: 'psp:read',
    PSP_UPDATE: 'psp:update',
    PSP_DELETE: 'psp:delete',
    PSP_BILLING: 'psp:billing',
    PSP_CONFIGURE: 'psp:configure',
    
    // Service Management
    SERVICE_SUBSCRIBE: 'service:subscribe',
    SERVICE_UNSUBSCRIBE: 'service:unsubscribe',
    SERVICE_CONFIGURE: 'service:configure',
    SERVICE_VIEW_BILLING: 'service:view_billing',
    
    // User Management (within organization)
    USER_INVITE: 'user:invite',
    USER_MANAGE: 'user:manage',
    USER_DELETE: 'user:delete',
    
    // API & Technical
    API_KEYS_MANAGE: 'api:keys_manage',
    API_WEBHOOKS_MANAGE: 'api:webhooks_manage',
    API_DOCS_ACCESS: 'api:docs_access',
    
    // Marketplace & Provisioning
    MARKETPLACE_BROWSE: 'marketplace:browse',
    MARKETPLACE_PURCHASE: 'marketplace:purchase',
    
    // Analytics & Reports
    ANALYTICS_VIEW: 'analytics:view',
    ANALYTICS_EXPORT: 'analytics:export',
    
    // Wholesale Operations
    WHOLESALE_OFFER: 'wholesale:offer',
    WHOLESALE_MANAGE: 'wholesale:manage',
    
    // Partner Operations
    PARTNER_PSP_VIEW: 'partner:psp_view',
    PARTNER_PSP_MANAGE: 'partner:psp_manage',
    
    // Reseller Operations
    RESELLER_PROVISION: 'reseller:provision',
    RESELLER_CLIENT_MANAGE: 'reseller:client_manage',
    RESELLER_BILLING: 'reseller:billing'
};

export const COMMUNITY_ROLES = {
    PSP_OWNER: 'psp_owner',
    PSP_ADMINISTRATOR: 'psp_administrator',
    DEVELOPER: 'developer',
    PARTNER: 'partner',
    RESELLER: 'reseller',
    OPERATIONS: 'operations',
    ANALYST: 'analyst'
};

export const ROLE_PERMISSIONS = {
    [COMMUNITY_ROLES.PSP_OWNER]: [
        // Full access to everything
        COMMUNITY_PERMISSIONS.PSP_CREATE,
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.PSP_UPDATE,
        COMMUNITY_PERMISSIONS.PSP_DELETE,
        COMMUNITY_PERMISSIONS.PSP_BILLING,
        COMMUNITY_PERMISSIONS.PSP_CONFIGURE,
        COMMUNITY_PERMISSIONS.SERVICE_SUBSCRIBE,
        COMMUNITY_PERMISSIONS.SERVICE_UNSUBSCRIBE,
        COMMUNITY_PERMISSIONS.SERVICE_CONFIGURE,
        COMMUNITY_PERMISSIONS.SERVICE_VIEW_BILLING,
        COMMUNITY_PERMISSIONS.USER_INVITE,
        COMMUNITY_PERMISSIONS.USER_MANAGE,
        COMMUNITY_PERMISSIONS.USER_DELETE,
        COMMUNITY_PERMISSIONS.API_KEYS_MANAGE,
        COMMUNITY_PERMISSIONS.API_WEBHOOKS_MANAGE,
        COMMUNITY_PERMISSIONS.API_DOCS_ACCESS,
        COMMUNITY_PERMISSIONS.MARKETPLACE_BROWSE,
        COMMUNITY_PERMISSIONS.MARKETPLACE_PURCHASE,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW,
        COMMUNITY_PERMISSIONS.ANALYTICS_EXPORT,
        COMMUNITY_PERMISSIONS.WHOLESALE_OFFER,
        COMMUNITY_PERMISSIONS.WHOLESALE_MANAGE
    ],
    
    [COMMUNITY_ROLES.PSP_ADMINISTRATOR]: [
        // Full operational control but no billing/delete
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.PSP_UPDATE,
        COMMUNITY_PERMISSIONS.PSP_CONFIGURE,
        COMMUNITY_PERMISSIONS.SERVICE_CONFIGURE,
        COMMUNITY_PERMISSIONS.SERVICE_VIEW_BILLING,
        COMMUNITY_PERMISSIONS.USER_INVITE,
        COMMUNITY_PERMISSIONS.USER_MANAGE,
        COMMUNITY_PERMISSIONS.API_KEYS_MANAGE,
        COMMUNITY_PERMISSIONS.API_WEBHOOKS_MANAGE,
        COMMUNITY_PERMISSIONS.API_DOCS_ACCESS,
        COMMUNITY_PERMISSIONS.MARKETPLACE_BROWSE,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW,
        COMMUNITY_PERMISSIONS.ANALYTICS_EXPORT,
        COMMUNITY_PERMISSIONS.WHOLESALE_MANAGE
    ],
    
    [COMMUNITY_ROLES.DEVELOPER]: [
        // Technical access only
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.API_KEYS_MANAGE,
        COMMUNITY_PERMISSIONS.API_WEBHOOKS_MANAGE,
        COMMUNITY_PERMISSIONS.API_DOCS_ACCESS,
        COMMUNITY_PERMISSIONS.SERVICE_CONFIGURE,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW
    ],
    
    [COMMUNITY_ROLES.PARTNER]: [
        // View and manage PSPs they're partnered with
        COMMUNITY_PERMISSIONS.PARTNER_PSP_VIEW,
        COMMUNITY_PERMISSIONS.PARTNER_PSP_MANAGE,
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.MARKETPLACE_BROWSE,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW
    ],
    
    [COMMUNITY_ROLES.RESELLER]: [
        // Can provision and manage multiple client PSPs
        COMMUNITY_PERMISSIONS.RESELLER_PROVISION,
        COMMUNITY_PERMISSIONS.RESELLER_CLIENT_MANAGE,
        COMMUNITY_PERMISSIONS.RESELLER_BILLING,
        COMMUNITY_PERMISSIONS.PSP_CREATE,
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.PSP_UPDATE,
        COMMUNITY_PERMISSIONS.PSP_CONFIGURE,
        COMMUNITY_PERMISSIONS.SERVICE_SUBSCRIBE,
        COMMUNITY_PERMISSIONS.MARKETPLACE_BROWSE,
        COMMUNITY_PERMISSIONS.MARKETPLACE_PURCHASE,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW,
        COMMUNITY_PERMISSIONS.WHOLESALE_MANAGE
    ],
    
    [COMMUNITY_ROLES.OPERATIONS]: [
        // Day-to-day operations
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.PSP_UPDATE,
        COMMUNITY_PERMISSIONS.SERVICE_CONFIGURE,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW,
        COMMUNITY_PERMISSIONS.MARKETPLACE_BROWSE
    ],
    
    [COMMUNITY_ROLES.ANALYST]: [
        // Analytics and reporting only
        COMMUNITY_PERMISSIONS.PSP_READ,
        COMMUNITY_PERMISSIONS.ANALYTICS_VIEW,
        COMMUNITY_PERMISSIONS.ANALYTICS_EXPORT,
        COMMUNITY_PERMISSIONS.SERVICE_VIEW_BILLING
    ]
};

export const ROLE_HIERARCHY = {
    [COMMUNITY_ROLES.PSP_OWNER]: 100,
    [COMMUNITY_ROLES.RESELLER]: 90,
    [COMMUNITY_ROLES.PSP_ADMINISTRATOR]: 80,
    [COMMUNITY_ROLES.OPERATIONS]: 60,
    [COMMUNITY_ROLES.DEVELOPER]: 50,
    [COMMUNITY_ROLES.PARTNER]: 40,
    [COMMUNITY_ROLES.ANALYST]: 30
};

export function hasPermission(role, permission) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}

export function hasAnyPermission(role, permissions) {
    return permissions.some(permission => hasPermission(role, permission));
}

export function hasAllPermissions(role, permissions) {
    return permissions.every(permission => hasPermission(role, permission));
}

export function canManageUser(currentUserRole, targetUserRole) {
    const currentLevel = ROLE_HIERARCHY[currentUserRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetUserRole] || 0;
    return currentLevel > targetLevel;
}

export function getRoleLabel(role) {
    const labels = {
        [COMMUNITY_ROLES.PSP_OWNER]: 'PSP Owner',
        [COMMUNITY_ROLES.PSP_ADMINISTRATOR]: 'PSP Administrator',
        [COMMUNITY_ROLES.DEVELOPER]: 'Developer',
        [COMMUNITY_ROLES.PARTNER]: 'Partner',
        [COMMUNITY_ROLES.RESELLER]: 'Reseller',
        [COMMUNITY_ROLES.OPERATIONS]: 'Operations',
        [COMMUNITY_ROLES.ANALYST]: 'Analyst'
    };
    return labels[role] || role;
}

export function getRoleDescription(role) {
    const descriptions = {
        [COMMUNITY_ROLES.PSP_OWNER]: 'Full control including billing and account deletion',
        [COMMUNITY_ROLES.PSP_ADMINISTRATOR]: 'Full operational control, cannot manage billing or delete account',
        [COMMUNITY_ROLES.DEVELOPER]: 'Technical integration, API access, and webhooks only',
        [COMMUNITY_ROLES.PARTNER]: 'View and manage partnered PSP instances',
        [COMMUNITY_ROLES.RESELLER]: 'Provision and manage multiple client PSP instances',
        [COMMUNITY_ROLES.OPERATIONS]: 'Day-to-day operations and configuration',
        [COMMUNITY_ROLES.ANALYST]: 'Analytics, reporting, and read-only access'
    };
    return descriptions[role] || '';
}