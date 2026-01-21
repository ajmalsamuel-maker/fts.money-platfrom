import { base44 } from '@/api/base44Client';

/**
 * Phase 1: Compatibility Layer
 * Provides backward-compatible API for deprecated entities
 * Allows old code to continue working during migration
 */
export class PaymentSwitchAdapter {
    
    // ==================== PaymentProcessor → PaymentProvider ====================
    
    /**
     * Get processor by ID (maps to PaymentProvider)
     */
    static async getProcessor(id) {
        try {
            // First try to get from PaymentProcessor (if still exists)
            const processor = await base44.entities.PaymentProcessor.get(id);
            return processor;
        } catch {
            // Fallback: Try to find in PaymentProvider by legacy_processor_id
            const providers = await base44.entities.PaymentProvider.filter({
                legacy_processor_id: id
            });
            
            if (providers.length > 0) {
                return this.providerToProcessor(providers[0]);
            }
            
            throw new Error('Processor not found');
        }
    }
    
    /**
     * List all processors (maps to PaymentProvider)
     */
    static async listProcessors() {
        try {
            // First try old entity
            const processors = await base44.entities.PaymentProcessor.list();
            return processors;
        } catch {
            // Fallback: Get from PaymentProvider
            const providers = await base44.entities.PaymentProvider.list();
            return providers.map(p => this.providerToProcessor(p));
        }
    }
    
    /**
     * Convert PaymentProvider to PaymentProcessor format
     */
    static providerToProcessor(provider) {
        return {
            id: provider.legacy_processor_id || provider.id,
            processor_id: provider.id,
            name: provider.name,
            type: this.mapProviderTypeToProcessorType(provider.type),
            status: provider.status,
            supported_networks: provider.supported_currencies,
            supported_currencies: provider.supported_currencies,
            supported_countries: provider.supported_regions,
            base_fee_percentage: provider.base_fee_percentage,
            fixed_fee: provider.fixed_fee,
            success_rate: provider.success_rate,
            avg_response_time_ms: provider.avg_response_time_ms,
            priority: provider.priority,
            _migrated_from_provider: true
        };
    }
    
    static mapProviderTypeToProcessorType(providerType) {
        const mapping = {
            'card_scheme': 'network',
            'acquirer': 'acquirer',
            'bank': 'gateway',
            'wallet': 'gateway',
            'apm': 'gateway',
            'crypto': 'gateway'
        };
        return mapping[providerType] || 'gateway';
    }
    
    // ==================== ProcessorConnectorConfig → PSPConnectorAssignment ====================
    
    /**
     * Get connector config for PSP (maps to PSPConnectorAssignment)
     */
    static async getConnectorConfig(psp_code) {
        try {
            // First try old entity
            const configs = await base44.entities.ProcessorConnectorConfig.filter({ psp_code });
            return configs;
        } catch {
            // Fallback: Get from PSPConnectorAssignment
            const assignments = await base44.entities.PSPConnectorAssignment.filter({ psp_code });
            return assignments.map(a => this.assignmentToConfig(a));
        }
    }
    
    /**
     * Convert PSPConnectorAssignment to ProcessorConnectorConfig format
     */
    static assignmentToConfig(assignment) {
        return {
            id: assignment.legacy_config_id || assignment.id,
            psp_code: assignment.psp_code,
            connector_name: assignment.connector_id,
            status: assignment.status,
            mode: assignment.mode || 'sandbox',
            api_endpoint: assignment.api_endpoint,
            priority: assignment.priority,
            _migrated_from_assignment: true
        };
    }
    
    // ==================== OrchestrationRule → RoutingRule ====================
    
    /**
     * Get orchestration rule (maps to RoutingRule)
     */
    static async getOrchestrationRule(id) {
        try {
            // First try old entity
            const rule = await base44.entities.OrchestrationRule.get(id);
            return rule;
        } catch {
            // Fallback: Find in RoutingRule by legacy_orchestration_rule_id
            const rules = await base44.entities.RoutingRule.filter({
                legacy_orchestration_rule_id: id
            });
            
            if (rules.length > 0) {
                return this.routingToOrchestration(rules[0]);
            }
            
            throw new Error('Orchestration rule not found');
        }
    }
    
    /**
     * List orchestration rules (maps to RoutingRule with service_type filter)
     */
    static async listOrchestrationRules() {
        try {
            // First try old entity
            const rules = await base44.entities.OrchestrationRule.list();
            return rules;
        } catch {
            // Fallback: Get from RoutingRule with orchestration service type
            const rules = await base44.entities.RoutingRule.filter({
                rule_type: 'orchestration'
            });
            return rules.map(r => this.routingToOrchestration(r));
        }
    }
    
    /**
     * Convert RoutingRule to OrchestrationRule format
     */
    static routingToOrchestration(rule) {
        return {
            id: rule.legacy_orchestration_rule_id || rule.id,
            rule_id: rule.id,
            name: rule.name,
            description: rule.description,
            priority: rule.priority,
            status: rule.status,
            conditions: rule.conditions,
            primary_route: rule.primary_processor,
            fallback_routes: rule.fallback_processors,
            _migrated_from_routing: true
        };
    }
    
    // ==================== Migration Status Check ====================
    
    /**
     * Check if migration is in progress
     */
    static async isMigrationActive() {
        try {
            const migrationLogs = await base44.entities.MigrationLog?.filter({
                migration_type: 'payment_switch',
                status: 'in_progress'
            });
            return migrationLogs && migrationLogs.length > 0;
        } catch {
            return false;
        }
    }
    
    /**
     * Get migration mapping for entity
     */
    static async getMigrationMapping(entityName) {
        try {
            const logs = await base44.entities.MigrationLog.filter({
                migration_type: entityName.toLowerCase(),
                status: 'completed'
            });
            
            if (logs.length > 0) {
                return logs[0].mapping || {};
            }
            return {};
        } catch {
            return {};
        }
    }
}

export default PaymentSwitchAdapter;