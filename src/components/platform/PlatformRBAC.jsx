// FTS.Money Platform RBAC Configuration

export const PLATFORM_ROLES = {
    PLATFORM_OPERATOR: 'platform_operator',
    FINANCE_TEAM: 'finance_team',
    SUPPORT_AGENT: 'support_agent',
    ADMIN: 'admin'
};

export const PLATFORM_PERMISSIONS = {
    // PSP Management
    VIEW_PSPS: 'view_psps',
    CREATE_PSP: 'create_psp',
    EDIT_PSP: 'edit_psp',
    DELETE_PSP: 'delete_psp',
    RESTART_PSP: 'restart_psp',
    BACKUP_PSP: 'backup_psp',
    
    // Analytics
    VIEW_ANALYTICS: 'view_analytics',
    EXPORT_ANALYTICS: 'export_analytics',
    
    // Revenue
    VIEW_REVENUE: 'view_revenue',
    MANAGE_BILLING: 'manage_billing',
    MODIFY_PRICING: 'modify_pricing',
    
    // Settings
    VIEW_SETTINGS: 'view_settings',
    MODIFY_SETTINGS: 'modify_settings',
    
    // Support
    VIEW_LOGS: 'view_logs',
    VIEW_AUDIT_TRAIL: 'view_audit_trail',
    MANAGE_SUPPORT_TICKETS: 'manage_support_tickets',
    
    // Clients
    VIEW_CLIENTS: 'view_clients',
    MANAGE_CLIENTS: 'manage_clients'
};

export const ROLE_PERMISSIONS_MAP = {
    [PLATFORM_ROLES.ADMIN]: Object.values(PLATFORM_PERMISSIONS),
    
    [PLATFORM_ROLES.PLATFORM_OPERATOR]: [
        PLATFORM_PERMISSIONS.VIEW_PSPS,
        PLATFORM_PERMISSIONS.CREATE_PSP,
        PLATFORM_PERMISSIONS.EDIT_PSP,
        PLATFORM_PERMISSIONS.RESTART_PSP,
        PLATFORM_PERMISSIONS.BACKUP_PSP,
        PLATFORM_PERMISSIONS.VIEW_ANALYTICS,
        PLATFORM_PERMISSIONS.VIEW_LOGS,
        PLATFORM_PERMISSIONS.VIEW_AUDIT_TRAIL,
        PLATFORM_PERMISSIONS.VIEW_SETTINGS,
        PLATFORM_PERMISSIONS.VIEW_CLIENTS
    ],
    
    [PLATFORM_ROLES.FINANCE_TEAM]: [
        PLATFORM_PERMISSIONS.VIEW_PSPS,
        PLATFORM_PERMISSIONS.VIEW_ANALYTICS,
        PLATFORM_PERMISSIONS.EXPORT_ANALYTICS,
        PLATFORM_PERMISSIONS.VIEW_REVENUE,
        PLATFORM_PERMISSIONS.MANAGE_BILLING,
        PLATFORM_PERMISSIONS.MODIFY_PRICING,
        PLATFORM_PERMISSIONS.VIEW_CLIENTS
    ],
    
    [PLATFORM_ROLES.SUPPORT_AGENT]: [
        PLATFORM_PERMISSIONS.VIEW_PSPS,
        PLATFORM_PERMISSIONS.VIEW_LOGS,
        PLATFORM_PERMISSIONS.VIEW_AUDIT_TRAIL,
        PLATFORM_PERMISSIONS.MANAGE_SUPPORT_TICKETS,
        PLATFORM_PERMISSIONS.VIEW_CLIENTS
    ]
};

export const hasPlatformPermission = (userRole, permission) => {
    const permissions = ROLE_PERMISSIONS_MAP[userRole] || [];
    return permissions.includes(permission);
};

export const getPlatformRoleConfig = (role) => {
    const configs = {
        [PLATFORM_ROLES.ADMIN]: {
            label: 'Platform Admin',
            description: 'Full platform access',
            color: 'text-red-700',
            bgColor: 'bg-red-100'
        },
        [PLATFORM_ROLES.PLATFORM_OPERATOR]: {
            label: 'Platform Operator',
            description: 'Infrastructure management',
            color: 'text-blue-700',
            bgColor: 'bg-blue-100'
        },
        [PLATFORM_ROLES.FINANCE_TEAM]: {
            label: 'Finance Team',
            description: 'Revenue and billing management',
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-100'
        },
        [PLATFORM_ROLES.SUPPORT_AGENT]: {
            label: 'Support Agent',
            description: 'Client support and troubleshooting',
            color: 'text-purple-700',
            bgColor: 'bg-purple-100'
        }
    };
    return configs[role] || configs[PLATFORM_ROLES.SUPPORT_AGENT];
};