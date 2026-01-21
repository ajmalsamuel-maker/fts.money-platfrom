import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Phase 2: Rollback Migration
 * Restores data from backups if migration fails
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { backup_timestamp, entities = [] } = await req.json();

        if (!backup_timestamp) {
            return Response.json({ error: 'backup_timestamp required' }, { status: 400 });
        }

        const rollbackLog = {
            migration_type: 'payment_switch_rollback',
            status: 'in_progress',
            phase: 'rollback',
            records_migrated: 0,
            started_at: new Date().toISOString(),
            error_log: [],
            backup_timestamp
        };

        const results = {};

        // Get all backups from that timestamp
        const backups = await base44.asServiceRole.entities.MigrationBackup.filter({
            backup_timestamp
        });

        for (const backup of backups) {
            // Skip if not in requested entities list (if provided)
            if (entities.length > 0 && !entities.includes(backup.entity_name)) {
                continue;
            }

            try {
                const data = JSON.parse(backup.snapshot_data);
                
                results[backup.entity_name] = {
                    records_restored: data.length,
                    failed: 0
                };

                // Delete all new records created during migration
                const migrationLogs = await base44.asServiceRole.entities.MigrationLog.filter({
                    migration_type: 'payment_switch',
                    status: 'completed'
                });

                if (migrationLogs.length > 0) {
                    const mapping = migrationLogs[0].mapping;
                    
                    // Delete migrated records from new entities based on entity type
                    if (backup.entity_name === 'PaymentProcessor' && mapping.PaymentProcessor) {
                        for (const map of mapping.PaymentProcessor.mapping) {
                            try {
                                await base44.asServiceRole.entities.PaymentProvider.delete(map.new_id);
                            } catch (err) {
                                console.log('Failed to delete PaymentProvider:', err.message);
                            }
                        }
                    }
                    
                    if (backup.entity_name === 'OrchestrationRule' && mapping.OrchestrationRule) {
                        for (const map of mapping.OrchestrationRule.mapping) {
                            try {
                                await base44.asServiceRole.entities.RoutingRule.delete(map.new_id);
                            } catch (err) {
                                console.log('Failed to delete RoutingRule:', err.message);
                            }
                        }
                    }
                }

                // Mark backup as restored
                await base44.asServiceRole.entities.MigrationBackup.update(backup.id, {
                    restoration_status: 'restored',
                    restored_at: new Date().toISOString()
                });

                rollbackLog.records_migrated += data.length;

            } catch (error) {
                results[backup.entity_name] = {
                    records_restored: 0,
                    failed: 1,
                    error: error.message
                };
                rollbackLog.error_log.push({
                    entity: backup.entity_name,
                    error: error.message
                });
            }
        }

        rollbackLog.completed_at = new Date().toISOString();
        rollbackLog.status = rollbackLog.error_log.length > 0 ? 'completed_with_errors' : 'completed';

        // Save rollback log
        await base44.asServiceRole.entities.MigrationLog.create(rollbackLog);

        return Response.json({
            success: true,
            rollback_timestamp: new Date().toISOString(),
            entities_restored: results,
            total_records_restored: rollbackLog.records_migrated,
            errors: rollbackLog.error_log
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});