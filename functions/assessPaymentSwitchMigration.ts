import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Phase 0: Pre-Migration Assessment
 * Scans all dependencies and generates migration compatibility report
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const assessment = {
            timestamp: new Date().toISOString(),
            entities_to_migrate: [],
            pages_affected: [],
            billing_dependencies: [],
            data_counts: {},
            risks: [],
            recommendations: []
        };

        // 1. Count records in deprecated entities
        const paymentProcessors = await base44.asServiceRole.entities.PaymentProcessor.list();
        const orchestrationRules = await base44.asServiceRole.entities.OrchestrationRule?.list() || [];
        const processorConfigs = await base44.asServiceRole.entities.ProcessorConnectorConfig?.list() || [];

        assessment.data_counts = {
            PaymentProcessor: paymentProcessors.length,
            OrchestrationRule: orchestrationRules.length,
            ProcessorConnectorConfig: processorConfigs.length
        };

        // 2. Identify entities to migrate
        if (paymentProcessors.length > 0) {
            assessment.entities_to_migrate.push({
                entity: 'PaymentProcessor',
                count: paymentProcessors.length,
                target: 'PaymentProvider',
                strategy: 'merge_or_create'
            });
        }

        if (orchestrationRules.length > 0) {
            assessment.entities_to_migrate.push({
                entity: 'OrchestrationRule',
                count: orchestrationRules.length,
                target: 'RoutingRule',
                strategy: 'convert_with_service_type'
            });
        }

        if (processorConfigs.length > 0) {
            assessment.entities_to_migrate.push({
                entity: 'ProcessorConnectorConfig',
                count: processorConfigs.length,
                target: 'PSPConnectorAssignment',
                strategy: 'migrate_with_psp_mapping'
            });
        }

        // 3. Check billing dependencies
        const pricingConfigs = await base44.asServiceRole.entities.ServicePricingConfig?.list() || [];
        const usageMetrics = await base44.asServiceRole.entities.ServiceUsageMetric?.list() || [];

        assessment.billing_dependencies = [
            {
                entity: 'ServicePricingConfig',
                count: pricingConfigs.length,
                risk_level: pricingConfigs.length > 0 ? 'HIGH' : 'LOW',
                mitigation: 'Update provider references via mapping table'
            },
            {
                entity: 'ServiceUsageMetric',
                count: usageMetrics.length,
                risk_level: usageMetrics.length > 0 ? 'HIGH' : 'LOW',
                mitigation: 'Preserve legacy IDs in metadata'
            }
        ];

        // 4. Identify affected pages
        assessment.pages_affected = [
            { page: 'PaymentProviderManagement', action: 'MERGE → FTSConnectorManagement' },
            { page: 'PaymentOrchestration', action: 'MERGE → FTSConnectorManagement' },
            { page: 'SmartOrchestration', action: 'MERGE → FTSConnectorManagement' },
            { page: 'PaymentGateways', action: 'KEEP (PSP-level config)' },
            { page: 'FTSConnectorManagement', action: 'ENHANCE (add merged features)' }
        ];

        // 5. Risk assessment
        assessment.risks = [
            {
                risk: 'Billing disruption',
                severity: 'HIGH',
                probability: 'LOW',
                mitigation: 'Use adapter layer + dual-write period'
            },
            {
                risk: 'Transaction routing failures',
                severity: 'HIGH',
                probability: 'MEDIUM',
                mitigation: 'Gradual rollout with feature flags'
            },
            {
                risk: 'Data loss during migration',
                severity: 'CRITICAL',
                probability: 'LOW',
                mitigation: 'Complete entity snapshots + rollback plan'
            }
        ];

        // 6. Recommendations
        assessment.recommendations = [
            '1. Create MigrationBackup entity snapshots (1-2 hours)',
            '2. Implement PaymentSwitchAdapter for backward compatibility (4-6 hours)',
            '3. Run migration scripts with dry-run mode first (2-3 hours)',
            '4. Enable dual-write for 7 days to ensure stability',
            '5. Schedule migration during low-traffic window',
            '6. Have rollback plan ready (30-minute restore time)'
        ];

        // 7. Migration readiness score
        const totalRecords = Object.values(assessment.data_counts).reduce((sum, count) => sum + count, 0);
        const highRiskDependencies = assessment.billing_dependencies.filter(d => d.risk_level === 'HIGH').length;
        
        assessment.readiness_score = {
            records_to_migrate: totalRecords,
            high_risk_dependencies: highRiskDependencies,
            estimated_duration_hours: Math.ceil(totalRecords / 100) + 8, // 8 hours baseline
            recommended_start: totalRecords > 1000 ? 'Weekend during low traffic' : 'Any time with monitoring',
            go_no_go: totalRecords < 5000 && highRiskDependencies < 3 ? 'GO' : 'NEEDS_REVIEW'
        };

        return Response.json({
            success: true,
            assessment,
            next_steps: [
                'Review assessment report',
                'Create entity snapshots (Phase 0 complete)',
                'Proceed to Phase 1: Compatibility Layer'
            ]
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});