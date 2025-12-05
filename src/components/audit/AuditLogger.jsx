import { base44 } from '@/api/base44Client';

// Centralized audit logging utility for PCI Level 1 compliance
export const AuditLogger = {
    async log({
        eventType,
        category,
        action,
        description,
        targetEntity = null,
        targetId = null,
        oldValue = null,
        newValue = null,
        severity = 'info',
        pciRelevant = false,
        metadata = {}
    }) {
        try {
            const user = await base44.auth.me().catch(() => null);
            
            const auditEntry = {
                event_type: eventType,
                category: category,
                severity: severity,
                user_id: user?.id || 'system',
                user_email: user?.email || 'system',
                user_role: user?.app_role || 'unknown',
                target_entity: targetEntity,
                target_id: targetId,
                action: action,
                description: description,
                old_value: oldValue ? JSON.stringify(oldValue) : null,
                new_value: newValue ? JSON.stringify(newValue) : null,
                ip_address: 'client', // Would be set by backend in production
                user_agent: navigator.userAgent,
                session_id: sessionStorage.getItem('session_id') || generateSessionId(),
                request_id: generateRequestId(),
                status: 'success',
                pci_relevant: pciRelevant,
                retention_period: pciRelevant ? '7_years' : '1_year',
                metadata: metadata
            };

            await base44.entities.AuditLog.create(auditEntry);
            return true;
        } catch (error) {
            console.error('Audit log failed:', error);
            return false;
        }
    },

    // Authentication events
    async logLogin(user, success = true) {
        return this.log({
            eventType: success ? 'user_login' : 'user_login_failed',
            category: 'authentication',
            action: success ? 'LOGIN' : 'LOGIN_FAILED',
            description: success 
                ? `User ${user?.email} logged in successfully`
                : `Failed login attempt for ${user?.email}`,
            severity: success ? 'info' : 'warning',
            pciRelevant: true
        });
    },

    async logLogout(user) {
        return this.log({
            eventType: 'user_logout',
            category: 'authentication',
            action: 'LOGOUT',
            description: `User ${user?.email} logged out`,
            pciRelevant: true
        });
    },

    // User management events
    async logUserCreated(newUser, createdBy) {
        return this.log({
            eventType: 'user_created',
            category: 'user_management',
            action: 'CREATE_USER',
            description: `User ${newUser.email} created by ${createdBy?.email}`,
            targetEntity: 'User',
            targetId: newUser.id,
            newValue: { email: newUser.email, role: newUser.app_role },
            pciRelevant: true,
            severity: 'info'
        });
    },

    async logUserRoleChanged(user, oldRole, newRole, changedBy) {
        return this.log({
            eventType: 'user_role_changed',
            category: 'user_management',
            action: 'CHANGE_ROLE',
            description: `Role changed for ${user.email} from ${oldRole} to ${newRole} by ${changedBy?.email}`,
            targetEntity: 'User',
            targetId: user.id,
            oldValue: { role: oldRole },
            newValue: { role: newRole },
            pciRelevant: true,
            severity: 'warning'
        });
    },

    async logPermissionChanged(permission, oldValue, newValue, changedBy) {
        return this.log({
            eventType: 'permission_changed',
            category: 'authorization',
            action: 'CHANGE_PERMISSION',
            description: `Permission ${permission} modified by ${changedBy?.email}`,
            targetEntity: 'Permission',
            targetId: permission,
            oldValue: oldValue,
            newValue: newValue,
            pciRelevant: true,
            severity: 'warning'
        });
    },

    // Transaction events
    async logTransaction(transaction, action) {
        return this.log({
            eventType: `transaction_${action}`,
            category: 'transaction',
            action: action.toUpperCase(),
            description: `Transaction ${transaction.transaction_id} ${action}`,
            targetEntity: 'Transaction',
            targetId: transaction.id,
            pciRelevant: true,
            metadata: { amount: transaction.amount, currency: transaction.currency }
        });
    },

    // Merchant events
    async logMerchant(merchant, action, user) {
        return this.log({
            eventType: `merchant_${action}`,
            category: 'merchant',
            action: action.toUpperCase(),
            description: `Merchant ${merchant.business_name} ${action} by ${user?.email}`,
            targetEntity: 'Merchant',
            targetId: merchant.id,
            pciRelevant: action === 'approved' || action === 'suspended'
        });
    },

    // Data access events
    async logDataAccess(entityType, action, recordCount) {
        return this.log({
            eventType: 'data_access',
            category: 'data_access',
            action: action,
            description: `Accessed ${recordCount} ${entityType} records`,
            targetEntity: entityType,
            pciRelevant: ['Transaction', 'User', 'Merchant'].includes(entityType)
        });
    },

    // Report/Export events
    async logExport(reportType, format, recordCount) {
        return this.log({
            eventType: 'export_data',
            category: 'data_access',
            action: 'EXPORT',
            description: `Exported ${reportType} report in ${format} format (${recordCount} records)`,
            pciRelevant: true,
            severity: 'warning',
            metadata: { reportType, format, recordCount }
        });
    },

    // Settings/Config events
    async logConfigChange(settingName, oldValue, newValue) {
        return this.log({
            eventType: 'config_changed',
            category: 'configuration',
            action: 'UPDATE_CONFIG',
            description: `Configuration ${settingName} updated`,
            targetEntity: 'Settings',
            targetId: settingName,
            oldValue: oldValue,
            newValue: newValue,
            pciRelevant: true,
            severity: 'warning'
        });
    },

    // Security events
    async logSecurityAlert(alertType, details) {
        return this.log({
            eventType: 'security_alert',
            category: 'security',
            action: alertType,
            description: details,
            severity: 'critical',
            pciRelevant: true
        });
    }
};

function generateSessionId() {
    const id = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('session_id', id);
    return id;
}

function generateRequestId() {
    return 'req_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export default AuditLogger;