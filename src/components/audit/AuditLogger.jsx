import { base44 } from '@/api/base44Client';

/**
 * Comprehensive Audit Logger for FTS Platform
 * Logs all significant actions across the platform
 */

export class AuditLogger {
    /**
     * Log any audit event
     */
    static async log({
        event_type,
        category,
        severity = 'info',
        user_id = null,
        user_email = null,
        user_role = null,
        target_entity = null,
        target_id = null,
        action,
        description,
        old_value = null,
        new_value = null,
        ip_address = null,
        user_agent = null,
        session_id = null,
        request_id = null,
        status = 'success',
        error_message = null,
        metadata = null,
        pci_relevant = false,
        retention_period = '1_year'
    }) {
        try {
            // Extract IP and user agent from browser if available
            if (!ip_address && typeof window !== 'undefined') {
                // Note: Real IP is typically set server-side
                ip_address = 'client';
            }
            
            if (!user_agent && typeof navigator !== 'undefined') {
                user_agent = navigator.userAgent;
            }

            await base44.asServiceRole.entities.AuditLog.create({
                event_type,
                category,
                severity,
                user_id,
                user_email,
                user_role,
                target_entity,
                target_id,
                action,
                description,
                old_value: old_value ? JSON.stringify(old_value) : null,
                new_value: new_value ? JSON.stringify(new_value) : null,
                ip_address,
                user_agent,
                session_id,
                request_id,
                status,
                error_message,
                metadata,
                pci_relevant,
                retention_period
            });
        } catch (error) {
            console.error('Audit logging failed:', error);
            // Don't throw - audit failures shouldn't break operations
        }
    }

    // Authentication Events
    static async logLogin(user_email, user_id, user_role, ip_address, status = 'success', error = null) {
        return this.log({
            event_type: 'user_login',
            category: 'authentication',
            severity: status === 'success' ? 'info' : 'warning',
            user_id,
            user_email,
            user_role,
            action: 'login',
            description: `User ${user_email} ${status === 'success' ? 'logged in successfully' : 'failed to login'}`,
            ip_address,
            status,
            error_message: error,
            retention_period: '3_years'
        });
    }

    static async logLogout(user_email, user_id, user_role, ip_address) {
        return this.log({
            event_type: 'user_logout',
            category: 'authentication',
            severity: 'info',
            user_id,
            user_email,
            user_role,
            action: 'logout',
            description: `User ${user_email} logged out`,
            ip_address,
            retention_period: '1_year'
        });
    }

    static async logPasswordChange(user_email, user_id, user_role, changed_by_admin = false) {
        return this.log({
            event_type: 'password_changed',
            category: 'authentication',
            severity: 'warning',
            user_id,
            user_email,
            user_role,
            action: 'password_change',
            description: `Password changed for ${user_email}${changed_by_admin ? ' (by administrator)' : ''}`,
            retention_period: '3_years'
        });
    }

    // User Management Events
    static async logUserCreated(new_user, created_by_email, created_by_role) {
        return this.log({
            event_type: 'user_created',
            category: 'user_management',
            severity: 'info',
            user_email: created_by_email,
            user_role: created_by_role,
            target_entity: 'User',
            target_id: new_user.id,
            action: 'create_user',
            description: `User ${new_user.email} created with role ${new_user.role}`,
            new_value: new_user,
            retention_period: '3_years'
        });
    }

    static async logUserUpdated(old_user, new_user, updated_by_email, updated_by_role) {
        return this.log({
            event_type: 'user_updated',
            category: 'user_management',
            severity: 'info',
            user_email: updated_by_email,
            user_role: updated_by_role,
            target_entity: 'User',
            target_id: new_user.id,
            action: 'update_user',
            description: `User ${new_user.email} updated`,
            old_value: old_user,
            new_value: new_user,
            retention_period: '3_years'
        });
    }

    static async logUserDeleted(deleted_user, deleted_by_email, deleted_by_role) {
        return this.log({
            event_type: 'user_deleted',
            category: 'user_management',
            severity: 'critical',
            user_email: deleted_by_email,
            user_role: deleted_by_role,
            target_entity: 'User',
            target_id: deleted_user.id,
            action: 'delete_user',
            description: `User ${deleted_user.email} deleted`,
            old_value: deleted_user,
            retention_period: '7_years'
        });
    }

    static async logRoleChange(user_email, user_id, old_role, new_role, changed_by_email, changed_by_role) {
        return this.log({
            event_type: 'user_role_changed',
            category: 'authorization',
            severity: 'warning',
            user_email: changed_by_email,
            user_role: changed_by_role,
            target_entity: 'User',
            target_id: user_id,
            action: 'change_role',
            description: `Role changed for ${user_email} from ${old_role} to ${new_role}`,
            old_value: { role: old_role },
            new_value: { role: new_role },
            retention_period: '7_years'
        });
    }

    // Configuration Events
    static async logConfigChange(config_key, old_value, new_value, user_email, user_role) {
        return this.log({
            event_type: 'config_changed',
            category: 'configuration',
            severity: 'warning',
            user_email,
            user_role,
            action: 'update_config',
            description: `Configuration ${config_key} changed`,
            old_value: { [config_key]: old_value },
            new_value: { [config_key]: new_value },
            retention_period: '7_years'
        });
    }

    static async logSettingsUpdate(settings_type, changes, user_email, user_role) {
        return this.log({
            event_type: 'settings_updated',
            category: 'configuration',
            severity: 'info',
            user_email,
            user_role,
            action: 'update_settings',
            description: `${settings_type} settings updated`,
            new_value: changes,
            retention_period: '3_years'
        });
    }

    // Entity CRUD Events
    static async logEntityCreated(entity_type, entity_id, entity_data, user_email, user_role) {
        return this.log({
            event_type: this.getEntityEventType(entity_type, 'created'),
            category: this.getEntityCategory(entity_type),
            severity: 'info',
            user_email,
            user_role,
            target_entity: entity_type,
            target_id: entity_id,
            action: `create_${entity_type.toLowerCase()}`,
            description: `${entity_type} created`,
            new_value: entity_data,
            retention_period: this.getRetentionPeriod(entity_type)
        });
    }

    static async logEntityUpdated(entity_type, entity_id, old_data, new_data, user_email, user_role) {
        return this.log({
            event_type: this.getEntityEventType(entity_type, 'updated'),
            category: this.getEntityCategory(entity_type),
            severity: 'info',
            user_email,
            user_role,
            target_entity: entity_type,
            target_id: entity_id,
            action: `update_${entity_type.toLowerCase()}`,
            description: `${entity_type} updated`,
            old_value: old_data,
            new_value: new_data,
            retention_period: this.getRetentionPeriod(entity_type)
        });
    }

    static async logEntityDeleted(entity_type, entity_id, entity_data, user_email, user_role) {
        return this.log({
            event_type: this.getEntityEventType(entity_type, 'deleted'),
            category: this.getEntityCategory(entity_type),
            severity: 'critical',
            user_email,
            user_role,
            target_entity: entity_type,
            target_id: entity_id,
            action: `delete_${entity_type.toLowerCase()}`,
            description: `${entity_type} deleted`,
            old_value: entity_data,
            retention_period: '7_years'
        });
    }

    // Data Access Events
    static async logDataExport(data_type, record_count, user_email, user_role) {
        return this.log({
            event_type: 'export_data',
            category: 'data_access',
            severity: 'warning',
            user_email,
            user_role,
            action: 'export_data',
            description: `Exported ${record_count} ${data_type} records`,
            metadata: { data_type, record_count },
            retention_period: '7_years'
        });
    }

    static async logDataImport(data_type, record_count, user_email, user_role, status = 'success') {
        return this.log({
            event_type: 'import_data',
            category: 'data_access',
            severity: 'warning',
            user_email,
            user_role,
            action: 'import_data',
            description: `Imported ${record_count} ${data_type} records`,
            metadata: { data_type, record_count },
            status,
            retention_period: '7_years'
        });
    }

    // Security Events
    static async logSecurityAlert(alert_type, description, user_email, user_role, metadata = null) {
        return this.log({
            event_type: 'security_alert',
            category: 'security',
            severity: 'critical',
            user_email,
            user_role,
            action: 'security_alert',
            description: `Security Alert: ${description}`,
            metadata: { alert_type, ...metadata },
            retention_period: '7_years'
        });
    }

    // Helper Methods
    static getEntityEventType(entity_type, action) {
        const mapping = {
            'Merchant': { created: 'merchant_created', updated: 'merchant_updated', deleted: 'merchant_deleted' },
            'Transaction': { created: 'transaction_created', updated: 'transaction_updated' },
            'Terminal': { created: 'terminal_created', updated: 'terminal_updated', deleted: 'terminal_deleted' },
            'Settlement': { created: 'settlement_created' },
            'Chargeback': { created: 'chargeback_created', updated: 'chargeback_updated' }
        };
        return mapping[entity_type]?.[action] || 'system_access';
    }

    static getEntityCategory(entity_type) {
        const mapping = {
            'Merchant': 'merchant',
            'Transaction': 'transaction',
            'Terminal': 'terminal',
            'Settlement': 'settlement',
            'Chargeback': 'chargeback',
            'User': 'user_management',
            'MerchantUser': 'user_management'
        };
        return mapping[entity_type] || 'system';
    }

    static getRetentionPeriod(entity_type) {
        const financial = ['Transaction', 'Settlement', 'Chargeback', 'Payout'];
        return financial.includes(entity_type) ? '7_years' : '3_years';
    }
}

export default AuditLogger;