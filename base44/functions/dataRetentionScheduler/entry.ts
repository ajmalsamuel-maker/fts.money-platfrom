import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This function can be called manually or via cron
        const { action, dry_run = false } = await req.json();

        if (action === 'enforce_retention_policies') {
            const policies = await base44.asServiceRole.entities.DataRetentionPolicy.filter({ 
                status: 'active',
                auto_delete_enabled: true 
            });

            const executionLog = {
                execution_id: `RET-${Date.now()}`,
                execution_date: new Date().toISOString(),
                dry_run,
                policies_processed: 0,
                total_records_deleted: 0,
                total_records_archived: 0,
                results: []
            };

            for (const policy of policies) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);

                console.log(`Processing policy: ${policy.policy_name}, cutoff: ${cutoffDate.toISOString()}`);

                for (const entityName of policy.applies_to_entities || []) {
                    try {
                        // Get records older than retention period
                        const oldRecords = await base44.asServiceRole.entities[entityName].filter({
                            created_date: { $lt: cutoffDate.toISOString() }
                        });

                        if (oldRecords.length === 0) {
                            executionLog.results.push({
                                policy: policy.policy_name,
                                entity: entityName,
                                action: 'no_records',
                                count: 0
                            });
                            continue;
                        }

                        if (dry_run) {
                            executionLog.results.push({
                                policy: policy.policy_name,
                                entity: entityName,
                                action: 'would_delete',
                                count: oldRecords.length,
                                sample_ids: oldRecords.slice(0, 5).map(r => r.id)
                            });
                            continue;
                        }

                        // Archive before delete
                        if (policy.archive_before_delete) {
                            // In production, upload to S3/cold storage
                            const archiveData = {
                                policy_id: policy.id,
                                policy_name: policy.policy_name,
                                entity: entityName,
                                archived_date: new Date().toISOString(),
                                records: oldRecords,
                                archive_location: policy.archive_location || 'cold_storage'
                            };

                            // Log archive action
                            console.log(`Archived ${oldRecords.length} records from ${entityName}`);
                            
                            executionLog.total_records_archived += oldRecords.length;
                            executionLog.results.push({
                                policy: policy.policy_name,
                                entity: entityName,
                                action: 'archived',
                                count: oldRecords.length
                            });
                        }

                        // Delete records
                        for (const record of oldRecords) {
                            await base44.asServiceRole.entities[entityName].delete(record.id);
                        }

                        executionLog.total_records_deleted += oldRecords.length;
                        executionLog.results.push({
                            policy: policy.policy_name,
                            entity: entityName,
                            action: 'deleted',
                            count: oldRecords.length
                        });

                        // Log to audit trail
                        await base44.asServiceRole.entities.PSPAuditTrail.create({
                            psp_id: 'platform',
                            psp_code: 'PLATFORM',
                            action: 'data_retention_enforced',
                            field_changed: entityName,
                            old_value: `${oldRecords.length} records`,
                            new_value: 'deleted',
                            user_email: 'system@fts.money',
                            user_role: 'system',
                            metadata: {
                                policy_name: policy.policy_name,
                                retention_period_days: policy.retention_period_days,
                                execution_id: executionLog.execution_id
                            }
                        });

                    } catch (error) {
                        console.error(`Error processing ${entityName}:`, error);
                        executionLog.results.push({
                            policy: policy.policy_name,
                            entity: entityName,
                            action: 'error',
                            error: error.message
                        });
                    }
                }

                executionLog.policies_processed++;
            }

            executionLog.completed_date = new Date().toISOString();

            return Response.json({ 
                success: true, 
                execution_log: executionLog
            });
        }

        // Get retention execution history
        if (action === 'get_execution_history') {
            const auditLogs = await base44.asServiceRole.entities.PSPAuditTrail.filter({
                action: 'data_retention_enforced'
            });

            return Response.json({ 
                success: true, 
                history: auditLogs.slice(0, 50) 
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Data retention scheduler error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});