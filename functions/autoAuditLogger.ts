import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated Audit Logger for Entity Changes
 * Triggered automatically on entity create/update/delete events
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        const { event, data, old_data } = payload;
        
        // Skip if this is the AuditLog entity itself to prevent infinite loops
        if (event.entity_name === 'AuditLog') {
            return Response.json({ success: true, skipped: true });
        }
        
        // Determine severity based on event type
        const severity = event.type === 'delete' ? 'critical' : 
                        event.type === 'update' ? 'info' : 'info';
        
        // Determine retention period based on entity type
        const financialEntities = ['Transaction', 'Settlement', 'Chargeback', 'Payout', 'Refund', 'Invoice'];
        const complianceEntities = ['Merchant', 'MerchantUser', 'PSPSettings', 'ProvisionedPSP', 'BusinessEInvoicingOrganization'];
        const retention_period = financialEntities.includes(event.entity_name) ? '7_years' :
                                complianceEntities.includes(event.entity_name) ? '3_years' : '1_year';
        
        // Determine category
        const categoryMap = {
            'Transaction': 'transaction',
            'Merchant': 'merchant',
            'MerchantUser': 'user_management',
            'Terminal': 'terminal',
            'Settlement': 'settlement',
            'Chargeback': 'chargeback',
            'ProvisionedPSP': 'configuration',
            'PSPSettings': 'configuration',
            'AppUser': 'user_management',
            'Invoice': 'transaction',
            'Customer': 'merchant'
        };
        const category = categoryMap[event.entity_name] || 'system';
        
        // Build description
        const description = `${event.entity_name} ${event.type}d${data?.name ? ` - ${data.name}` : ''}${data?.email ? ` (${data.email})` : ''}`;
        
        // Create audit log entry
        await base44.asServiceRole.entities.AuditLog.create({
            event_type: `${event.entity_name.toLowerCase()}_${event.type}d`,
            category,
            severity,
            target_entity: event.entity_name,
            target_id: event.entity_id,
            action: `${event.type}_${event.entity_name.toLowerCase()}`,
            description,
            old_value: old_data ? JSON.stringify(old_data) : null,
            new_value: data ? JSON.stringify(data) : null,
            user_email: data?.created_by || data?.updated_by || 'system',
            user_role: 'system_automation',
            status: 'success',
            retention_period,
            metadata: {
                automated: true,
                source: 'entity_automation',
                entity_name: event.entity_name,
                event_id: event.entity_id
            }
        });
        
        return Response.json({ success: true });
    } catch (error) {
        console.error('Auto audit logging failed:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});