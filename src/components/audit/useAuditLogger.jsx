import { useCallback } from 'react';
import AuditLogger from './AuditLogger';

/**
 * React hook for audit logging
 * Automatically captures user context
 */
export function useAuditLogger(user) {
    const log = useCallback(async (params) => {
        return AuditLogger.log({
            user_id: user?.id || user?.user_id,
            user_email: user?.email,
            user_role: user?.role || user?.platform_role,
            ...params
        });
    }, [user]);

    const logLogin = useCallback(async (ip_address, status = 'success', error = null) => {
        return AuditLogger.logLogin(
            user?.email,
            user?.id || user?.user_id,
            user?.role || user?.platform_role,
            ip_address,
            status,
            error
        );
    }, [user]);

    const logLogout = useCallback(async (ip_address) => {
        return AuditLogger.logLogout(
            user?.email,
            user?.id || user?.user_id,
            user?.role || user?.platform_role,
            ip_address
        );
    }, [user]);

    const logPasswordChange = useCallback(async (changed_by_admin = false) => {
        return AuditLogger.logPasswordChange(
            user?.email,
            user?.id || user?.user_id,
            user?.role || user?.platform_role,
            changed_by_admin
        );
    }, [user]);

    const logUserCreated = useCallback(async (new_user) => {
        return AuditLogger.logUserCreated(
            new_user,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logUserUpdated = useCallback(async (old_user, new_user) => {
        return AuditLogger.logUserUpdated(
            old_user,
            new_user,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logUserDeleted = useCallback(async (deleted_user) => {
        return AuditLogger.logUserDeleted(
            deleted_user,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logRoleChange = useCallback(async (target_email, target_id, old_role, new_role) => {
        return AuditLogger.logRoleChange(
            target_email,
            target_id,
            old_role,
            new_role,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logConfigChange = useCallback(async (config_key, old_value, new_value) => {
        return AuditLogger.logConfigChange(
            config_key,
            old_value,
            new_value,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logSettingsUpdate = useCallback(async (settings_type, changes) => {
        return AuditLogger.logSettingsUpdate(
            settings_type,
            changes,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logEntityCreated = useCallback(async (entity_type, entity_id, entity_data) => {
        return AuditLogger.logEntityCreated(
            entity_type,
            entity_id,
            entity_data,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logEntityUpdated = useCallback(async (entity_type, entity_id, old_data, new_data) => {
        return AuditLogger.logEntityUpdated(
            entity_type,
            entity_id,
            old_data,
            new_data,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logEntityDeleted = useCallback(async (entity_type, entity_id, entity_data) => {
        return AuditLogger.logEntityDeleted(
            entity_type,
            entity_id,
            entity_data,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logDataExport = useCallback(async (data_type, record_count) => {
        return AuditLogger.logDataExport(
            data_type,
            record_count,
            user?.email,
            user?.role || user?.platform_role
        );
    }, [user]);

    const logDataImport = useCallback(async (data_type, record_count, status = 'success') => {
        return AuditLogger.logDataImport(
            data_type,
            record_count,
            user?.email,
            user?.role || user?.platform_role,
            status
        );
    }, [user]);

    const logSecurityAlert = useCallback(async (alert_type, description, metadata = null) => {
        return AuditLogger.logSecurityAlert(
            alert_type,
            description,
            user?.email,
            user?.role || user?.platform_role,
            metadata
        );
    }, [user]);

    return {
        log,
        logLogin,
        logLogout,
        logPasswordChange,
        logUserCreated,
        logUserUpdated,
        logUserDeleted,
        logRoleChange,
        logConfigChange,
        logSettingsUpdate,
        logEntityCreated,
        logEntityUpdated,
        logEntityDeleted,
        logDataExport,
        logDataImport,
        logSecurityAlert
    };
}

export default useAuditLogger;