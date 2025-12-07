// Role-based permissions configuration
// Admin: Full access to all features
// Editor: Can view and modify data, but cannot manage users or system settings
// Viewer: Read-only access to dashboards and reports

export const ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer'
};

export const ROLE_CONFIG = {
    admin: {
        label: 'Administrator',
        description: 'Full access to all features and settings',
        color: 'emerald',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200'
    },
    editor: {
        label: 'Editor',
        description: 'Can view and modify data, limited settings access',
        color: 'amber',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200'
    },
    viewer: {
        label: 'Viewer',
        description: 'Read-only access to dashboards and reports',
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200'
    },
    merchant: {
        label: 'Merchant',
        description: 'Access to merchant portal only',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    }
};

// Define permissions for each feature/action
export const PERMISSIONS = {
    // Dashboard & Analytics
    VIEW_DASHBOARD: ['admin', 'editor', 'viewer'],
    VIEW_ANALYTICS: ['admin', 'editor', 'viewer'],
    
    // Transactions
    VIEW_TRANSACTIONS: ['admin', 'editor', 'viewer'],
    EDIT_TRANSACTIONS: ['admin', 'editor'],
    REFUND_TRANSACTIONS: ['admin', 'editor'],
    VOID_TRANSACTIONS: ['admin'],
    
    // Settlements & Chargebacks
    VIEW_SETTLEMENTS: ['admin', 'editor', 'viewer'],
    MANAGE_SETTLEMENTS: ['admin', 'editor'],
    VIEW_CHARGEBACKS: ['admin', 'editor', 'viewer'],
    MANAGE_CHARGEBACKS: ['admin', 'editor'],
    VIEW_DISPUTES: ['admin', 'editor', 'viewer'],
    MANAGE_DISPUTES: ['admin', 'editor'],
    
    // Merchants
    VIEW_MERCHANTS: ['admin', 'editor', 'viewer'],
    CREATE_MERCHANTS: ['admin', 'editor'],
    EDIT_MERCHANTS: ['admin', 'editor'],
    DELETE_MERCHANTS: ['admin'],
    APPROVE_MERCHANTS: ['admin'],
    
    // Onboarding
    VIEW_ONBOARDING: ['admin', 'editor', 'viewer'],
    MANAGE_ONBOARDING: ['admin', 'editor'],
    APPROVE_ONBOARDING: ['admin'],
    
    // Terminals
    VIEW_TERMINALS: ['admin', 'editor', 'viewer'],
    MANAGE_TERMINALS: ['admin', 'editor'],
    
    // Finance
    VIEW_BALANCES: ['admin', 'editor', 'viewer'],
    VIEW_REPORTS: ['admin', 'editor', 'viewer'],
    EXPORT_REPORTS: ['admin', 'editor'],
    VIEW_PAYOUTS: ['admin', 'editor', 'viewer'],
    MANAGE_PAYOUTS: ['admin'],
    
    // Risk & Compliance
    VIEW_FRAUD_PREVENTION: ['admin', 'editor', 'viewer'],
    MANAGE_FRAUD_RULES: ['admin'],
    VIEW_COMPLIANCE: ['admin', 'editor', 'viewer'],
    MANAGE_COMPLIANCE: ['admin'],
    
    // Configuration
    VIEW_ROUTING: ['admin', 'editor', 'viewer'],
    MANAGE_ROUTING: ['admin'],
    VIEW_ORCHESTRATION: ['admin', 'editor', 'viewer'],
    MANAGE_ORCHESTRATION: ['admin'],
    
    // User Management
    VIEW_USERS: ['admin'],
    MANAGE_USERS: ['admin'],
    ASSIGN_ROLES: ['admin'],
    
    // Settings
    VIEW_SETTINGS: ['admin', 'editor'],
    MANAGE_SETTINGS: ['admin'],
    VIEW_APPEARANCE: ['admin', 'editor'],
    MANAGE_APPEARANCE: ['admin'],
    
    // API Credentials
    VIEW_CREDENTIALS: ['admin', 'editor'],
    MANAGE_CREDENTIALS: ['admin'],
};

// Check if a role has a specific permission
export function hasPermission(userRole, permission) {
    if (!userRole) return false;
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;
    return allowedRoles.includes(userRole);
}

// Get all permissions for a role
export function getRolePermissions(role) {
    const permissions = {};
    Object.keys(PERMISSIONS).forEach(permission => {
        permissions[permission] = hasPermission(role, permission);
    });
    return permissions;
}

// Menu items filtered by role permissions
export function getMenuItemsForRole(role) {
    const menuConfig = {
        Overview: {
            Dashboard: 'VIEW_DASHBOARD',
            Analytics: 'VIEW_ANALYTICS',
        },
        Transactions: {
            Transactions: 'VIEW_TRANSACTIONS',
            Settlements: 'VIEW_SETTLEMENTS',
            Chargebacks: 'VIEW_CHARGEBACKS',
            Disputes: 'VIEW_DISPUTES',
            AIDisputeResolution: 'VIEW_DISPUTES',
        },
        Onboarding: {
            MerchantOnboarding: 'VIEW_ONBOARDING',
            AcquirerOnboarding: 'VIEW_ONBOARDING',
            APMOnboarding: 'VIEW_ONBOARDING',
            Approvals: 'APPROVE_ONBOARDING',
        },
        Merchants: {
            Merchants: 'VIEW_MERCHANTS',
            Terminals: 'VIEW_TERMINALS',
            VirtualTerminals: 'VIEW_TERMINALS',
            MerchantCredentials: 'VIEW_CREDENTIALS',
            MerchantUsers: 'VIEW_USERS',
        },
        Finance: {
            Balances: 'VIEW_BALANCES',
            Reports: 'VIEW_REPORTS',
            Payouts: 'VIEW_PAYOUTS',
        },
        Risk: {
            FraudPrevention: 'VIEW_FRAUD_PREVENTION',
            Compliance: 'VIEW_COMPLIANCE',
        },
        Configuration: {
            SmartOrchestration: 'VIEW_ROUTING',
            PaymentOrchestration: 'VIEW_ORCHESTRATION',
            UserManagement: 'VIEW_USERS',
            Appearance: 'VIEW_APPEARANCE',
            Settings: 'VIEW_SETTINGS',
        }
    };

    return menuConfig;
}