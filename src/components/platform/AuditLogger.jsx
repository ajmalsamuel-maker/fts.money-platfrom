
import { base44 } from '@/api/base44Client';
import { AuditLogger } from '@/components/audit/AuditLogger';

export async function logAuditAction({
    psp_id,
    psp_code,
    action,
    field_changed = null,
    old_value = null,
    new_value = null,
    user_email,
    user_role,
    ip_address = null,
    metadata = null
}) {
    try {
        // Log to PSPAuditTrail for PSP-specific audit
        await base44.entities.PSPAuditTrail.create({
            psp_id,
            psp_code,
            action,
            field_changed,
            old_value: old_value ? String(old_value) : null,
            new_value: new_value ? String(new_value) : null,
            user_email,
            user_role,
            ip_address,
            metadata
        });

        // Log to PSPInstanceLog for instance-level tracking
        await base44.entities.PSPInstanceLog.create({
            psp_id,
            psp_code,
            log_type: 'configuration',
            severity: 'medium',
            message: `${action}: ${field_changed || 'PSP Configuration'}`,
            details: {
                action,
                field_changed,
                old_value,
                new_value,
                metadata
            },
            source: 'admin',
            user_email
        });

        // Log to global AuditLog for platform-wide compliance
        await AuditLogger.logConfigChange({
            target_entity: 'ProvisionedPSP',
            target_id: psp_id,
            field_changed: field_changed || 'configuration',
            old_value: old_value ? String(old_value) : null,
            new_value: new_value ? String(new_value) : null,
            description: `PSP ${psp_code}: ${action}`,
            metadata: { psp_id, psp_code, action, ...metadata }
        });
    } catch (error) {
        console.error('Failed to log audit action:', error);
    }
}
