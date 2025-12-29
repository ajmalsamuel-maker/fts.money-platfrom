// Comprehensive Permission System for FTS Platform
// Format: ENTITY:ACTION:SCOPE

export const PERMISSIONS = {
    // ==================== USER MANAGEMENT ====================
    USER_VIEW_ANY: 'user:view:any',
    USER_VIEW_OWN: 'user:view:own',
    USER_CREATE: 'user:create:any',
    USER_EDIT_ANY: 'user:edit:any',
    USER_EDIT_OWN: 'user:edit:own',
    USER_EDIT_ROLE_BELOW: 'user:edit:role_below',
    USER_DELETE_ANY: 'user:delete:any',
    USER_DELETE_ROLE_BELOW: 'user:delete:role_below',
    USER_CHANGE_ROLE: 'user:change_role:any',
    USER_RESET_PASSWORD_ANY: 'user:reset_password:any',
    USER_RESET_PASSWORD_OWN: 'user:reset_password:own',

    // ==================== PSP MANAGEMENT ====================
    PSP_VIEW_ANY: 'psp:view:any',
    PSP_VIEW_OWN: 'psp:view:own',
    PSP_CREATE: 'psp:create:any',
    PSP_EDIT_ANY: 'psp:edit:any',
    PSP_EDIT_OWN: 'psp:edit:own',
    PSP_DELETE_ANY: 'psp:delete:any',
    PSP_DELETE_OWN: 'psp:delete:own',
    PSP_APPROVE: 'psp:approve:any',
    PSP_CONFIGURE: 'psp:configure:any',
    PSP_TRANSFER_OWNERSHIP: 'psp:transfer_ownership:any',

    // ==================== CLIENT MANAGEMENT ====================
    CLIENT_VIEW_ANY: 'client:view:any',
    CLIENT_CREATE: 'client:create:any',
    CLIENT_EDIT_ANY: 'client:edit:any',
    CLIENT_DELETE_ANY: 'client:delete:any',
    CLIENT_APPROVE: 'client:approve:any',

    // ==================== SERVICE MANAGEMENT ====================
    SERVICE_VIEW: 'service:view:any',
    SERVICE_CREATE: 'service:create:any',
    SERVICE_EDIT: 'service:edit:any',
    SERVICE_DELETE: 'service:delete:any',
    SERVICE_CONFIGURE: 'service:configure:any',

    // ==================== PROVIDER MANAGEMENT ====================
    PROVIDER_VIEW: 'provider:view:any',
    PROVIDER_CREATE: 'provider:create:any',
    PROVIDER_EDIT: 'provider:edit:any',
    PROVIDER_DELETE: 'provider:delete:any',

    // ==================== PAYOUT MANAGEMENT ====================
    PAYOUT_VIEW: 'payout:view:any',
    PAYOUT_CREATE: 'payout:create:any',
    PAYOUT_EDIT: 'payout:edit:any',
    PAYOUT_DELETE: 'payout:delete:any',
    PAYOUT_APPROVE: 'payout:approve:any',

    // ==================== PRICING MANAGEMENT ====================
    PRICING_VIEW: 'pricing:view:any',
    PRICING_CREATE: 'pricing:create:any',
    PRICING_EDIT: 'pricing:edit:any',
    PRICING_DELETE: 'pricing:delete:any',
    PRICING_APPROVE: 'pricing:approve:any',
    PRICING_RECONCILE: 'pricing:reconcile:any',

    // ==================== ANALYTICS & REPORTING ====================
    ANALYTICS_VIEW: 'analytics:view:any',
    REVENUE_VIEW: 'revenue:view:any',
    REPORTS_CREATE: 'reports:create:any',
    REPORTS_VIEW_SENSITIVE: 'reports:view:sensitive',

    // ==================== SETTINGS & CONFIGURATION ====================
    SETTINGS_VIEW: 'settings:view:any',
    SETTINGS_EDIT: 'settings:edit:any',
    SETTINGS_EDIT_CRITICAL: 'settings:edit:critical',

    // ==================== APPROVAL WORKFLOWS ====================
    APPROVAL_VIEW: 'approval:view:any',
    APPROVAL_CREATE: 'approval:create:any',
    APPROVAL_APPROVE: 'approval:approve:any',
    APPROVAL_REJECT: 'approval:reject:any',

    // ==================== AUDIT & COMPLIANCE ====================
    AUDIT_VIEW: 'audit:view:any',
    AUDIT_EXPORT: 'audit:export:any',
    COMPLIANCE_MANAGE: 'compliance:manage:any',

    // ==================== SUPER ADMIN ONLY ====================
    SUPER_ADMIN_MANAGE: 'super_admin:manage:any',
    SYSTEM_CRITICAL: 'system:critical:any'
};

// Role hierarchy (higher index = more powerful)
export const ROLE_HIERARCHY = {
    'viewer': 0,
    'support': 1,
    'finance': 2,
    'operations': 3,
    'finance_manager': 4,
    'platform_admin': 5,
    'super_admin': 6
};

// Permission Matrix: Role -> Permissions
export const ROLE_PERMISSIONS = {
    super_admin: [
        // Super admins have ALL permissions
        '*'
    ],
    
    platform_admin: [
        // User Management (except super admins)
        PERMISSIONS.USER_VIEW_ANY,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_EDIT_ANY,
        PERMISSIONS.USER_DELETE_ANY,
        PERMISSIONS.USER_CHANGE_ROLE,
        PERMISSIONS.USER_RESET_PASSWORD_ANY,
        
        // PSP Management (full)
        PERMISSIONS.PSP_VIEW_ANY,
        PERMISSIONS.PSP_CREATE,
        PERMISSIONS.PSP_EDIT_ANY,
        PERMISSIONS.PSP_DELETE_ANY,
        PERMISSIONS.PSP_APPROVE,
        PERMISSIONS.PSP_CONFIGURE,
        
        // Client Management (full)
        PERMISSIONS.CLIENT_VIEW_ANY,
        PERMISSIONS.CLIENT_CREATE,
        PERMISSIONS.CLIENT_EDIT_ANY,
        PERMISSIONS.CLIENT_DELETE_ANY,
        PERMISSIONS.CLIENT_APPROVE,
        
        // Service Management
        PERMISSIONS.SERVICE_VIEW,
        PERMISSIONS.SERVICE_CREATE,
        PERMISSIONS.SERVICE_EDIT,
        PERMISSIONS.SERVICE_DELETE,
        PERMISSIONS.SERVICE_CONFIGURE,
        
        // Provider & Payout
        PERMISSIONS.PROVIDER_VIEW,
        PERMISSIONS.PROVIDER_CREATE,
        PERMISSIONS.PROVIDER_EDIT,
        PERMISSIONS.PROVIDER_DELETE,
        PERMISSIONS.PAYOUT_VIEW,
        PERMISSIONS.PAYOUT_CREATE,
        PERMISSIONS.PAYOUT_EDIT,
        PERMISSIONS.PAYOUT_DELETE,
        
        // Pricing (view only, needs approval)
        PERMISSIONS.PRICING_VIEW,
        
        // Analytics & Reports
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.REVENUE_VIEW,
        PERMISSIONS.REPORTS_CREATE,
        PERMISSIONS.REPORTS_VIEW_SENSITIVE,
        
        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_EDIT,
        
        // Approval workflows
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.APPROVAL_CREATE,
        PERMISSIONS.APPROVAL_APPROVE,
        PERMISSIONS.APPROVAL_REJECT,
        
        // Audit
        PERMISSIONS.AUDIT_VIEW,
        PERMISSIONS.AUDIT_EXPORT,
        PERMISSIONS.COMPLIANCE_MANAGE
    ],
    
    finance_manager: [
        // User Management (limited)
        PERMISSIONS.USER_VIEW_ANY,
        PERMISSIONS.USER_EDIT_OWN,
        PERMISSIONS.USER_RESET_PASSWORD_OWN,
        
        // PSP Management (view + own edit)
        PERMISSIONS.PSP_VIEW_ANY,
        PERMISSIONS.PSP_EDIT_OWN,
        
        // Pricing (full with approval)
        PERMISSIONS.PRICING_VIEW,
        PERMISSIONS.PRICING_CREATE,
        PERMISSIONS.PRICING_EDIT,
        PERMISSIONS.PRICING_DELETE,
        PERMISSIONS.PRICING_RECONCILE,
        
        // Provider & Payout (view)
        PERMISSIONS.PROVIDER_VIEW,
        PERMISSIONS.PAYOUT_VIEW,
        
        // Analytics
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.REVENUE_VIEW,
        PERMISSIONS.REPORTS_CREATE,
        PERMISSIONS.REPORTS_VIEW_SENSITIVE,
        
        // Approval (create requests)
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.APPROVAL_CREATE,
        
        // Audit (view)
        PERMISSIONS.AUDIT_VIEW
    ],
    
    operations: [
        // User Management (view only)
        PERMISSIONS.USER_VIEW_ANY,
        PERMISSIONS.USER_EDIT_OWN,
        PERMISSIONS.USER_RESET_PASSWORD_OWN,
        
        // PSP Management (create, edit, configure - no delete)
        PERMISSIONS.PSP_VIEW_ANY,
        PERMISSIONS.PSP_CREATE,
        PERMISSIONS.PSP_EDIT_ANY,
        PERMISSIONS.PSP_CONFIGURE,
        
        // Client Management (view + create)
        PERMISSIONS.CLIENT_VIEW_ANY,
        PERMISSIONS.CLIENT_CREATE,
        PERMISSIONS.CLIENT_EDIT_ANY,
        
        // Service Management (view + configure)
        PERMISSIONS.SERVICE_VIEW,
        PERMISSIONS.SERVICE_CONFIGURE,
        
        // Provider & Payout (view)
        PERMISSIONS.PROVIDER_VIEW,
        PERMISSIONS.PAYOUT_VIEW,
        
        // Analytics
        PERMISSIONS.ANALYTICS_VIEW,
        
        // Approval (create requests)
        PERMISSIONS.APPROVAL_VIEW,
        PERMISSIONS.APPROVAL_CREATE,
        
        // Audit (view)
        PERMISSIONS.AUDIT_VIEW
    ],
    
    finance: [
        // User Management (own only)
        PERMISSIONS.USER_VIEW_ANY,
        PERMISSIONS.USER_EDIT_OWN,
        PERMISSIONS.USER_RESET_PASSWORD_OWN,
        
        // PSP (view)
        PERMISSIONS.PSP_VIEW_ANY,
        
        // Pricing (view only)
        PERMISSIONS.PRICING_VIEW,
        
        // Analytics
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.REVENUE_VIEW,
        PERMISSIONS.REPORTS_CREATE,
        
        // Audit (view)
        PERMISSIONS.AUDIT_VIEW
    ],
    
    support: [
        // User Management (own only)
        PERMISSIONS.USER_VIEW_ANY,
        PERMISSIONS.USER_EDIT_OWN,
        PERMISSIONS.USER_RESET_PASSWORD_OWN,
        
        // View permissions
        PERMISSIONS.PSP_VIEW_ANY,
        PERMISSIONS.CLIENT_VIEW_ANY,
        PERMISSIONS.SERVICE_VIEW,
        PERMISSIONS.PROVIDER_VIEW,
        PERMISSIONS.PAYOUT_VIEW,
        PERMISSIONS.ANALYTICS_VIEW,
        
        // Audit (view)
        PERMISSIONS.AUDIT_VIEW
    ],
    
    viewer: [
        // User Management (own only)
        PERMISSIONS.USER_EDIT_OWN,
        PERMISSIONS.USER_RESET_PASSWORD_OWN,
        
        // View only permissions
        PERMISSIONS.PSP_VIEW_ANY,
        PERMISSIONS.CLIENT_VIEW_ANY,
        PERMISSIONS.SERVICE_VIEW,
        PERMISSIONS.PROVIDER_VIEW,
        PERMISSIONS.PAYOUT_VIEW,
        PERMISSIONS.ANALYTICS_VIEW
    ]
};

// Actions that require approval workflows
export const REQUIRES_APPROVAL = {
    'pricing:create:any': ['finance_manager'],
    'pricing:edit:any': ['finance_manager'],
    'pricing:delete:any': ['finance_manager'],
    'psp:delete:any': ['platform_admin'],
    'user:delete:any': ['platform_admin'],
    'settings:edit:critical': ['platform_admin']
};