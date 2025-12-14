import { base44 } from '@/api/base44Client';

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
        await base44.asServiceRole.entities.PSPAuditTrail.create({
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
    } catch (error) {
        console.error('Failed to log audit action:', error);
    }
}