export const TENANT_ROLES = {
    TENANT_ADMIN: 'tenant_admin',
    BILLING_MANAGER: 'billing_manager',
    SUPPORT_AGENT: 'support_agent',
    STANDARD_USER: 'standard_user'
};

export const TENANT_PERMISSIONS = {
    // PSP Management
    PSP_VIEW: 'tenant:psp:view',
    PSP_CREATE: 'tenant:psp:create',
    PSP_UPDATE: 'tenant:psp:update',
    PSP_DELETE: 'tenant:psp:delete',
    
    // User Management
    USER_VIEW: 'tenant:user:view',
    USER_INVITE: 'tenant:user:invite',
    USER_UPDATE: 'tenant:user:update',
    USER_DELETE: 'tenant:user:delete',
    
    // Billing & Subscription
    BILLING_VIEW: 'tenant:billing:view',
    BILLING_MANAGE: 'tenant:billing:manage',
    INVOICE_VIEW: 'tenant:invoice:view',
    
    // Support
    TICKET_VIEW: 'tenant:ticket:view',
    TICKET_CREATE: 'tenant:ticket:create',
    TICKET_MANAGE: 'tenant:ticket:manage',
    
    // Settings
    SETTINGS_VIEW: 'tenant:settings:view',
    SETTINGS_UPDATE: 'tenant:settings:update',
    
    // Analytics
    ANALYTICS_VIEW: 'tenant:analytics:view',
    REPORTS_VIEW: 'tenant:reports:view'
};

export const TENANT_ROLE_PERMISSIONS_MAP = {
    [TENANT_ROLES.TENANT_ADMIN]: Object.values(TENANT_PERMISSIONS),
    [TENANT_ROLES.BILLING_MANAGER]: [
        TENANT_PERMISSIONS.PSP_VIEW,
        TENANT_PERMISSIONS.BILLING_VIEW,
        TENANT_PERMISSIONS.BILLING_MANAGE,
        TENANT_PERMISSIONS.INVOICE_VIEW,
        TENANT_PERMISSIONS.ANALYTICS_VIEW,
        TENANT_PERMISSIONS.REPORTS_VIEW
    ],
    [TENANT_ROLES.SUPPORT_AGENT]: [
        TENANT_PERMISSIONS.PSP_VIEW,
        TENANT_PERMISSIONS.USER_VIEW,
        TENANT_PERMISSIONS.TICKET_VIEW,
        TENANT_PERMISSIONS.TICKET_CREATE,
        TENANT_PERMISSIONS.TICKET_MANAGE,
        TENANT_PERMISSIONS.SETTINGS_VIEW
    ],
    [TENANT_ROLES.STANDARD_USER]: [
        TENANT_PERMISSIONS.PSP_VIEW,
        TENANT_PERMISSIONS.TICKET_VIEW,
        TENANT_PERMISSIONS.TICKET_CREATE,
        TENANT_PERMISSIONS.ANALYTICS_VIEW
    ]
};

export function hasTenantPermission(tenantRole, permission) {
    const rolePermissions = TENANT_ROLE_PERMISSIONS_MAP[tenantRole] || [];
    return rolePermissions.includes(permission);
}

export function getTenantRoleLabel(role) {
    const labels = {
        [TENANT_ROLES.TENANT_ADMIN]: 'Tenant Admin',
        [TENANT_ROLES.BILLING_MANAGER]: 'Billing Manager',
        [TENANT_ROLES.SUPPORT_AGENT]: 'Support Agent',
        [TENANT_ROLES.STANDARD_USER]: 'Standard User'
    };
    return labels[role] || role;
}