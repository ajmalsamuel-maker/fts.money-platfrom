import { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { usePermissions } from './usePermissions';

export const PLATFORM_ROLES = {
    SUPER_ADMIN: 'super_admin',
    PLATFORM_ADMIN: 'platform_admin',
    OPERATIONS: 'operations',
    FINANCE: 'finance',
    FINANCE_MANAGER: 'finance_manager',
    SUPPORT: 'support',
    VIEWER: 'viewer'
};

export const PLATFORM_PERMISSIONS = {
    // PSP Management
    PSP_CREATE: 'psp:create',
    PSP_READ: 'psp:read',
    PSP_UPDATE: 'psp:update',
    PSP_DELETE: 'psp:delete',
    PSP_CONFIG: 'psp:configure',
    
    // Provider Pool Management
    PROVIDER_CREATE: 'provider:create',
    PROVIDER_READ: 'provider:read',
    PROVIDER_UPDATE: 'provider:update',
    PROVIDER_DELETE: 'provider:delete',
    
    // Payout Routes
    PAYOUT_CREATE: 'payout:create',
    PAYOUT_READ: 'payout:read',
    PAYOUT_UPDATE: 'payout:update',
    PAYOUT_DELETE: 'payout:delete',
    
    // Analytics & Reporting
    ANALYTICS_VIEW: 'analytics:view',
    REVENUE_VIEW: 'revenue:view',
    
    // System Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_UPDATE: 'settings:update',
    
    // User Management
    USER_MANAGE: 'users:manage',
    
    // Pricing Management
    PRICING_VIEW: 'pricing:view',
    PRICING_CREATE: 'pricing:create',
    PRICING_UPDATE: 'pricing:update',
    PRICING_DELETE: 'pricing:delete',
    PRICING_APPROVE: 'pricing:approve',
    PRICING_RECONCILE: 'pricing:reconcile'
};

const ROLE_PERMISSIONS_MAP = {
    [PLATFORM_ROLES.SUPER_ADMIN]: Object.values(PLATFORM_PERMISSIONS),
    [PLATFORM_ROLES.PLATFORM_ADMIN]: [
        PLATFORM_PERMISSIONS.PSP_CREATE,
        PLATFORM_PERMISSIONS.PSP_READ,
        PLATFORM_PERMISSIONS.PSP_UPDATE,
        PLATFORM_PERMISSIONS.PSP_CONFIG,
        PLATFORM_PERMISSIONS.PROVIDER_CREATE,
        PLATFORM_PERMISSIONS.PROVIDER_READ,
        PLATFORM_PERMISSIONS.PROVIDER_UPDATE,
        PLATFORM_PERMISSIONS.PAYOUT_CREATE,
        PLATFORM_PERMISSIONS.PAYOUT_READ,
        PLATFORM_PERMISSIONS.PAYOUT_UPDATE,
        PLATFORM_PERMISSIONS.ANALYTICS_VIEW,
        PLATFORM_PERMISSIONS.REVENUE_VIEW,
        PLATFORM_PERMISSIONS.SETTINGS_VIEW
    ],
    [PLATFORM_ROLES.OPERATIONS]: [
        PLATFORM_PERMISSIONS.PSP_READ,
        PLATFORM_PERMISSIONS.PSP_CONFIG,
        PLATFORM_PERMISSIONS.PROVIDER_READ,
        PLATFORM_PERMISSIONS.PAYOUT_READ,
        PLATFORM_PERMISSIONS.ANALYTICS_VIEW
    ],
    [PLATFORM_ROLES.FINANCE]: [
        PLATFORM_PERMISSIONS.PSP_READ,
        PLATFORM_PERMISSIONS.ANALYTICS_VIEW,
        PLATFORM_PERMISSIONS.REVENUE_VIEW,
        PLATFORM_PERMISSIONS.PRICING_VIEW
    ],
    [PLATFORM_ROLES.FINANCE_MANAGER]: [
        PLATFORM_PERMISSIONS.PSP_READ,
        PLATFORM_PERMISSIONS.ANALYTICS_VIEW,
        PLATFORM_PERMISSIONS.REVENUE_VIEW,
        PLATFORM_PERMISSIONS.PRICING_VIEW,
        PLATFORM_PERMISSIONS.PRICING_CREATE,
        PLATFORM_PERMISSIONS.PRICING_UPDATE,
        PLATFORM_PERMISSIONS.PRICING_DELETE,
        PLATFORM_PERMISSIONS.PRICING_APPROVE,
        PLATFORM_PERMISSIONS.PRICING_RECONCILE,
        PLATFORM_PERMISSIONS.PROVIDER_READ,
        PLATFORM_PERMISSIONS.PAYOUT_READ
    ],
    [PLATFORM_ROLES.SUPPORT]: [
        PLATFORM_PERMISSIONS.PSP_READ,
        PLATFORM_PERMISSIONS.PROVIDER_READ,
        PLATFORM_PERMISSIONS.PAYOUT_READ,
        PLATFORM_PERMISSIONS.ANALYTICS_VIEW
    ],
    [PLATFORM_ROLES.VIEWER]: [
        PLATFORM_PERMISSIONS.PSP_READ,
        PLATFORM_PERMISSIONS.PROVIDER_READ,
        PLATFORM_PERMISSIONS.PAYOUT_READ,
        PLATFORM_PERMISSIONS.ANALYTICS_VIEW
    ]
};

export function usePlatformAuth(requiredPermissions = []) {
    const [platformUser, setPlatformUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem('platform_admin_session');
        
        if (!sessionData) {
            window.location.href = createPageUrl('PlatformAdminLogin');
            return;
        }

        const session = JSON.parse(sessionData);
        setPlatformUser(session);
        setLoading(false);

        // Check if user has required permissions (legacy support)
        if (requiredPermissions.length > 0) {
            const hasAllPermissions = requiredPermissions.every(permission => 
                hasPermission(session.platform_role, permission)
            );
            
            if (!hasAllPermissions) {
                window.location.href = createPageUrl('FTSMoneyPlatform');
            }
        }
    }, []);

    // Get permission utilities for this user
    const permissions = usePermissions(platformUser);

    return { platformUser, loading, permissions };
}

export function hasPermission(role, permission) {
    const rolePermissions = ROLE_PERMISSIONS_MAP[role] || [];
    return rolePermissions.includes(permission);
}

export function hasAnyPermission(role, permissions) {
    return permissions.some(permission => hasPermission(role, permission));
}

export function getRoleLabel(role) {
    const labels = {
        [PLATFORM_ROLES.SUPER_ADMIN]: 'Super Admin',
        [PLATFORM_ROLES.PLATFORM_ADMIN]: 'Platform Admin',
        [PLATFORM_ROLES.OPERATIONS]: 'Operations',
        [PLATFORM_ROLES.FINANCE]: 'Finance',
        [PLATFORM_ROLES.SUPPORT]: 'Support',
        [PLATFORM_ROLES.VIEWER]: 'Viewer'
    };
    return labels[role] || role;
}