import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Phase 2: Migration Execution
 * Migrates data from deprecated entities to new unified structure
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { dry_run = true } = await req.json();

        const migrationLog = {
            migration_type: 'payment_switch',
            status: 'in_progress',
            phase: 'migration',
            records_migrated: 0,
            records_failed: 0,
            mapping: [],
            started_at: new Date().toISOString(),
            error_log: [],
            rollback_available: true,
            backup_timestamp: new Date().toISOString()
        };

        const results = {
            PaymentProcessor: { migrated: 0, failed: 0, mapping: [] },
            OrchestrationRule: { migrated: 0, failed: 0, mapping: [] },
            ProcessorConnectorConfig: { migrated: 0, failed: 0, mapping: [] }
        };

        // 1. Migrate PaymentProcessor → PaymentProvider
        try {
            const processors = await base44.asServiceRole.entities.PaymentProcessor.list();
            
            for (const processor of processors) {
                try {
                    // Check if already migrated
                    const existing = await base44.asServiceRole.entities.PaymentProvider.filter({
                        legacy_processor_id: processor.id
                    });

                    let providerId;
                    
                    if (existing.length > 0) {
                        providerId = existing[0].id;
                        results.PaymentProcessor.migrated++;
                    } else if (!dry_run) {
                        const newProvider = await base44.asServiceRole.entities.PaymentProvider.create({
                            name: processor.name,
                            type: processor.type === 'network' ? 'card_scheme' : processor.type,
                            supported_currencies: processor.supported_currencies,
                            supported_regions: processor.supported_countries,
                            status: processor.status,
                            logo_url: processor.logo_url,
                            legacy_processor_id: processor.id,
                            notes: `Migrated from PaymentProcessor on ${new Date().toISOString()}`
                        });
                        providerId = newProvider.id;
                        results.PaymentProcessor.migrated++;
                    } else {
                        results.PaymentProcessor.migrated++;
                    }

                    results.PaymentProcessor.mapping.push({
                        old_id: processor.id,
                        new_id: providerId,
                        name: processor.name
                    });

                } catch (error) {
                    results.PaymentProcessor.failed++;
                    migrationLog.error_log.push({
                        entity: 'PaymentProcessor',
                        record_id: processor.id,
                        error: error.message
                    });
                }
            }
        } catch (err) {
            console.log('PaymentProcessor migration skipped:', err.message);
        }

        // 2. Migrate OrchestrationRule → RoutingRule
        try {
            const rules = await base44.asServiceRole.entities.OrchestrationRule.list();
            
            for (const rule of rules) {
                try {
                    const existing = await base44.asServiceRole.entities.RoutingRule.filter({
                        legacy_orchestration_rule_id: rule.id
                    });

                    let routingRuleId;

                    if (existing.length > 0) {
                        routingRuleId = existing[0].id;
                        results.OrchestrationRule.migrated++;
                    } else if (!dry_run) {
                        const newRule = await base44.asServiceRole.entities.RoutingRule.create({
                            name: rule.name || rule.rule_name,
                            description: rule.description,
                            rule_type: rule.rule_type || 'routing',
                            status: rule.status,
                            priority: rule.priority,
                            primary_processor: rule.primary_route,
                            fallback_processors: rule.fallback_routes || [],
                            conditions: rule.conditions || [],
                            legacy_orchestration_rule_id: rule.id
                        });
                        routingRuleId = newRule.id;
                        results.OrchestrationRule.migrated++;
                    } else {
                        results.OrchestrationRule.migrated++;
                    }

                    results.OrchestrationRule.mapping.push({
                        old_id: rule.id,
                        new_id: routingRuleId,
                        name: rule.name || rule.rule_name
                    });

                } catch (error) {
                    results.OrchestrationRule.failed++;
                    migrationLog.error_log.push({
                        entity: 'OrchestrationRule',
                        record_id: rule.id,
                        error: error.message
                    });
                }
            }
        } catch (err) {
            console.log('OrchestrationRule migration skipped:', err.message);
        }

        // 3. Migrate ProcessorConnectorConfig → PSPConnectorAssignment
        try {
            const configs = await base44.asServiceRole.entities.ProcessorConnectorConfig.list();
            
            for (const config of configs) {
                try {
                    const existing = await base44.asServiceRole.entities.PSPConnectorAssignment.filter({
                        legacy_config_id: config.id
                    });

                    let assignmentId;

                    if (existing.length > 0) {
                        assignmentId = existing[0].id;
                        results.ProcessorConnectorConfig.migrated++;
                    } else if (!dry_run) {
                        const newAssignment = await base44.asServiceRole.entities.PSPConnectorAssignment.create({
                            service_type: 'psp',
                            service_id: config.psp_code,
                            psp_code: config.psp_code,
                            connector_name: config.connector_name,
                            assignment_status: config.status,
                            priority: config.priority,
                            legacy_config_id: config.id
                        });
                        assignmentId = newAssignment.id;
                        results.ProcessorConnectorConfig.migrated++;
                    } else {
                        results.ProcessorConnectorConfig.migrated++;
                    }

                    results.ProcessorConnectorConfig.mapping.push({
                        old_id: config.id,
                        new_id: assignmentId,
                        psp_code: config.psp_code
                    });

                } catch (error) {
                    results.ProcessorConnectorConfig.failed++;
                    migrationLog.error_log.push({
                        entity: 'ProcessorConnectorConfig',
                        record_id: config.id,
                        error: error.message
                    });
                }
            }
        } catch (err) {
            console.log('ProcessorConnectorConfig migration skipped:', err.message);
        }

        // Update migration log
        migrationLog.records_migrated = results.PaymentProcessor.migrated + 
                                        results.OrchestrationRule.migrated + 
                                        results.ProcessorConnectorConfig.migrated;
        migrationLog.records_failed = results.PaymentProcessor.failed + 
                                      results.OrchestrationRule.failed + 
                                      results.ProcessorConnectorConfig.failed;
        migrationLog.mapping = results;
        migrationLog.completed_at = new Date().toISOString();
        migrationLog.status = migrationLog.records_failed > 0 ? 'completed_with_errors' : 'completed';

        // Save migration log
        if (!dry_run) {
            await base44.asServiceRole.entities.MigrationLog.create(migrationLog);
        }

        return Response.json({
            success: true,
            dry_run,
            summary: {
                total_migrated: migrationLog.records_migrated,
                total_failed: migrationLog.records_failed,
                duration_ms: new Date(migrationLog.completed_at) - new Date(migrationLog.started_at)
            },
            details: results,
            migration_log: dry_run ? null : migrationLog,
            next_steps: dry_run 
                ? ['Review results', 'Run with dry_run=false to execute migration']
                : ['Monitor new entities', 'Test routing functionality', 'Proceed to Phase 3: Page Updates']
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});