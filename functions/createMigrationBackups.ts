import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Phase 0: Create Entity Snapshots
 * Backs up all data from entities being deprecated
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const backupTimestamp = new Date().toISOString();
        const backups = [];

        // 1. Backup PaymentProcessor
        try {
            const processors = await base44.asServiceRole.entities.PaymentProcessor.list();
            if (processors.length > 0) {
                await base44.asServiceRole.entities.MigrationBackup.create({
                    entity_name: 'PaymentProcessor',
                    backup_timestamp: backupTimestamp,
                    record_count: processors.length,
                    snapshot_data: JSON.stringify(processors),
                    migration_phase: 'pre_migration',
                    created_by: user.email
                });
                backups.push({ entity: 'PaymentProcessor', count: processors.length });
            }
        } catch (err) {
            console.log('PaymentProcessor backup skipped:', err.message);
        }

        // 2. Backup OrchestrationRule
        try {
            const rules = await base44.asServiceRole.entities.OrchestrationRule.list();
            if (rules.length > 0) {
                await base44.asServiceRole.entities.MigrationBackup.create({
                    entity_name: 'OrchestrationRule',
                    backup_timestamp: backupTimestamp,
                    record_count: rules.length,
                    snapshot_data: JSON.stringify(rules),
                    migration_phase: 'pre_migration',
                    created_by: user.email
                });
                backups.push({ entity: 'OrchestrationRule', count: rules.length });
            }
        } catch (err) {
            console.log('OrchestrationRule backup skipped:', err.message);
        }

        // 3. Backup ProcessorConnectorConfig
        try {
            const configs = await base44.asServiceRole.entities.ProcessorConnectorConfig.list();
            if (configs.length > 0) {
                await base44.asServiceRole.entities.MigrationBackup.create({
                    entity_name: 'ProcessorConnectorConfig',
                    backup_timestamp: backupTimestamp,
                    record_count: configs.length,
                    snapshot_data: JSON.stringify(configs),
                    migration_phase: 'pre_migration',
                    created_by: user.email
                });
                backups.push({ entity: 'ProcessorConnectorConfig', count: configs.length });
            }
        } catch (err) {
            console.log('ProcessorConnectorConfig backup skipped:', err.message);
        }

        // 4. Backup billing-critical entities
        try {
            const pricingConfigs = await base44.asServiceRole.entities.ServicePricingConfig.list();
            await base44.asServiceRole.entities.MigrationBackup.create({
                entity_name: 'ServicePricingConfig',
                backup_timestamp: backupTimestamp,
                record_count: pricingConfigs.length,
                snapshot_data: JSON.stringify(pricingConfigs),
                migration_phase: 'pre_migration',
                created_by: user.email,
                is_billing_critical: true
            });
            backups.push({ entity: 'ServicePricingConfig', count: pricingConfigs.length, billing_critical: true });
        } catch (err) {
            console.log('ServicePricingConfig backup skipped:', err.message);
        }

        try {
            const usageMetrics = await base44.asServiceRole.entities.ServiceUsageMetric.list();
            await base44.asServiceRole.entities.MigrationBackup.create({
                entity_name: 'ServiceUsageMetric',
                backup_timestamp: backupTimestamp,
                record_count: usageMetrics.length,
                snapshot_data: JSON.stringify(usageMetrics),
                migration_phase: 'pre_migration',
                created_by: user.email,
                is_billing_critical: true
            });
            backups.push({ entity: 'ServiceUsageMetric', count: usageMetrics.length, billing_critical: true });
        } catch (err) {
            console.log('ServiceUsageMetric backup skipped:', err.message);
        }

        return Response.json({
            success: true,
            backup_timestamp: backupTimestamp,
            backups_created: backups,
            total_records: backups.reduce((sum, b) => sum + b.count, 0),
            rollback_instructions: 'Use rollbackPaymentSwitchMigration function with this timestamp'
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});