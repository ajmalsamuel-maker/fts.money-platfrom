// Role-based permissions configuration
// Admin: Full access to all features
// Finance: Finance, settlements, and reports access
// Operations: Merchants, transactions, and operations
// Compliance: Risk, compliance, and audit
// Technical: System configuration and integration
// Editor: Can view and modify data, but cannot manage users or system settings
// Viewer: Read-only access to dashboards and reports

export const ROLES = {
    ADMIN: 'admin',
    FINANCE: 'finance',
    OPERATIONS: 'operations',
    COMPLIANCE: 'compliance',
    TECHNICAL: 'technical',
    EDITOR: 'editor',
    VIEWER: 'viewer'
};

export const ROLE_CONFIG = {
    admin: {
        label: 'Administrator',
        description: 'Full system access',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        accessibleGroups: ['overview', 'transactions', 'customers', 'products', 'merchants', 'connections', 'orchestration', 'terminals', 'finance', 'riskCompliance', 'developers', 'system', 'resources']
    },
    finance: {
        label: 'Finance Manager',
        description: 'Finance, settlements, and reports access',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-300',
        accessibleGroups: ['overview', 'transactions', 'customers', 'products', 'finance', 'resources']
    },
    operations: {
        label: 'Operations Manager',
        description: 'Merchants, transactions, and operations',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
        accessibleGroups: ['overview', 'transactions', 'customers', 'products', 'merchants', 'connections', 'terminals', 'resources']
    },
    compliance: {
        label: 'Compliance Officer',
        description: 'Risk, compliance, and audit access',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
        accessibleGroups: ['overview', 'transactions', 'customers', 'riskCompliance', 'system', 'resources']
    },
    technical: {
        label: 'Technical Manager',
        description: 'Gateways, orchestration, and system config',
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-300',
        accessibleGroups: ['overview', 'connections', 'orchestration', 'developers', 'system', 'resources']
    },
    editor: {
        label: 'Editor',
        description: 'Can manage content and view analytics',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        accessibleGroups: ['overview', 'transactions', 'customers', 'products', 'merchants', 'resources']
    },
    viewer: {
        label: 'Viewer',
        description: 'Read-only access',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-300',
        accessibleGroups: ['overview', 'resources']
    },
    merchant: {
        label: 'Merchant',
        description: 'Access to merchant portal only',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        accessibleGroups: []
    }
};

// Define permissions for each feature/action
export const PERMISSIONS = {
    // Dashboard & Analytics
    VIEW_DASHBOARD: ['admin', 'editor', 'viewer', 'finance', 'operations', 'compliance', 'technical'],
    VIEW_ANALYTICS: ['admin', 'editor', 'finance', 'operations'],
    
    // Transactions
    VIEW_TRANSACTIONS: ['admin', 'editor', 'viewer', 'finance', 'operations', 'compliance'],
    EDIT_TRANSACTIONS: ['admin', 'editor', 'operations'],
    REFUND_TRANSACTIONS: ['admin', 'finance', 'operations'],
    VOID_TRANSACTIONS: ['admin', 'operations'],
    
    // Settlements & Chargebacks
    VIEW_SETTLEMENTS: ['admin', 'editor', 'viewer', 'finance'],
    MANAGE_SETTLEMENTS: ['admin', 'finance'],
    VIEW_CHARGEBACKS: ['admin', 'editor', 'viewer', 'finance', 'operations'],
    MANAGE_CHARGEBACKS: ['admin', 'finance', 'operations'],
    VIEW_DISPUTES: ['admin', 'editor', 'viewer', 'operations', 'compliance'],
    MANAGE_DISPUTES: ['admin', 'operations'],
    
    // Merchants
    VIEW_MERCHANTS: ['admin', 'editor', 'viewer', 'operations'],
    CREATE_MERCHANTS: ['admin', 'operations'],
    EDIT_MERCHANTS: ['admin', 'operations'],
    DELETE_MERCHANTS: ['admin'],
    APPROVE_MERCHANTS: ['admin'],
    
    // Onboarding
    VIEW_ONBOARDING: ['admin', 'editor', 'viewer', 'operations'],
    MANAGE_ONBOARDING: ['admin', 'operations'],
    APPROVE_ONBOARDING: ['admin', 'operations'],
    
    // Terminals
    VIEW_TERMINALS: ['admin', 'editor', 'viewer', 'operations'],
    MANAGE_TERMINALS: ['admin', 'operations'],
    
    // Finance
    VIEW_BALANCES: ['admin', 'finance'],
    VIEW_REPORTS: ['admin', 'editor', 'finance'],
    EXPORT_REPORTS: ['admin', 'finance'],
    VIEW_PAYOUTS: ['admin', 'finance'],
    MANAGE_PAYOUTS: ['admin', 'finance'],
    
    // Risk & Compliance
    VIEW_FRAUD_PREVENTION: ['admin', 'compliance'],
    MANAGE_FRAUD_RULES: ['admin', 'compliance'],
    VIEW_COMPLIANCE: ['admin', 'compliance'],
    MANAGE_COMPLIANCE: ['admin', 'compliance'],
    
    // Configuration
    VIEW_ROUTING: ['admin', 'technical'],
    MANAGE_ROUTING: ['admin', 'technical'],
    VIEW_ORCHESTRATION: ['admin', 'technical'],
    MANAGE_ORCHESTRATION: ['admin', 'technical'],
    
    // User Management
    VIEW_USERS: ['admin', 'compliance'],
    MANAGE_USERS: ['admin'],
    ASSIGN_ROLES: ['admin'],
    
    // Settings
    VIEW_SETTINGS: ['admin', 'technical'],
    MANAGE_SETTINGS: ['admin', 'technical'],
    VIEW_APPEARANCE: ['admin', 'technical'],
    MANAGE_APPEARANCE: ['admin'],
    
    // API Credentials
    VIEW_CREDENTIALS: ['admin', 'technical'],
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