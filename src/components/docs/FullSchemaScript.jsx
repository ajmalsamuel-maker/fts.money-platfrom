export const FULL_SCHEMA_SCRIPT = `/**
 * Base44 Schema Export Script
 * 
 * Exports all Base44 entities to PostgreSQL DDL for migration
 * 
 * Usage:
 *   node export-schema.js
 * 
 * Output:
 *   database/schemas/pci-scope.sql - PCI scope tables
 *   database/schemas/operational.sql - Non-PCI scope tables
 *   database/schemas/indexes.sql - All indexes
 *   database/schemas/constraints.sql - Foreign keys and constraints
 */

import { base44 } from '@/api/base44Client';
import fs from 'fs';
import path from 'path';

// PCI Scope entities (contain cardholder data)
const PCI_SCOPE_ENTITIES = [
    'Transaction',
    'SavedCard',
    'TravelRuleData',
    'SanctionsScreening',
];

// Non-PCI Scope entities (operational data)
const OPERATIONAL_ENTITIES = [
    'Merchant',
    'MerchantMID',
    'BankMID',
    'PaymentProvider',
    'RoutingRule',
    'MIDRoutingRule',
    'Settlement',
    'Chargeback',
    'Dispute',
    'Terminal',
    'VirtualTerminal',
    'MerchantUser',
    'User',
    'AuditLog',
    'PSPSettings',
    'ThemeSettings',
    'MerchantPricing',
    'BuyRate',
    'BIN',
    'EmailTemplate',
    'ReceiptTemplate',
    'BlockchainConnector',
    'CryptoExchangeIntegration',
    'SuspiciousActivityReport',
];

// JSON Schema to PostgreSQL type mapping
const TYPE_MAPPING = {
    'string': 'TEXT',
    'number': 'NUMERIC',
    'integer': 'INTEGER',
    'boolean': 'BOOLEAN',
    'array': 'JSONB',
    'object': 'JSONB',
};

// Special format mappings
const FORMAT_MAPPING = {
    'date': 'DATE',
    'date-time': 'TIMESTAMP WITH TIME ZONE',
    'email': 'TEXT',
    'uri': 'TEXT',
    'uuid': 'UUID',
};

/**
 * Convert JSON Schema type to PostgreSQL type
 */
function jsonSchemaToPostgresType(property) {
    // Check format first
    if (property.format && FORMAT_MAPPING[property.format]) {
        return FORMAT_MAPPING[property.format];
    }
    
    // Check enum (use TEXT with CHECK constraint)
    if (property.enum) {
        return 'TEXT';
    }
    
    // Check type
    const type = property.type;
    return TYPE_MAPPING[type] || 'TEXT';
}

/**
 * Generate CREATE TABLE statement from entity schema
 */
function generateCreateTable(entityName, schema) {
    const tableName = entityName.toLowerCase();
    let sql = \`-- Table: \${entityName}\\n\`;
    sql += \`CREATE TABLE IF NOT EXISTS \${tableName} (\\n\`;
    
    // Built-in fields (always present)
    sql += \`    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\\n\`;
    sql += \`    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,\\n\`;
    sql += \`    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,\\n\`;
    sql += \`    created_by TEXT,\\n\`;
    
    // Schema properties
    const properties = schema.properties || {};
    
    for (const [propName, propSchema] of Object.entries(properties)) {
        const columnName = propName.toLowerCase();
        const dataType = jsonSchemaToPostgresType(propSchema);
        const notNull = schema.required?.includes(propName) ? ' NOT NULL' : '';
        const defaultValue = propSchema.default ? \` DEFAULT '\${propSchema.default}'\` : '';
        
        sql += \`    \${columnName} \${dataType}\${defaultValue}\${notNull},\\n\`;
    }
    
    // Remove last comma
    sql = sql.slice(0, -2) + '\\n';
    sql += \`);\\n\\n\`;
    
    // Add comments
    if (schema.description) {
        sql += \`COMMENT ON TABLE \${tableName} IS '\${schema.description.replace(/'/g, "''")}';\\n\\n\`;
    }
    
    sql += '\\n';
    return sql;
}

/**
 * Generate CHECK constraints for enum fields
 */
function generateCheckConstraints(entityName, schema) {
    const tableName = entityName.toLowerCase();
    let sql = '';
    
    const properties = schema.properties || {};
    
    for (const [propName, propSchema] of Object.entries(properties)) {
        if (propSchema.enum) {
            const columnName = propName.toLowerCase();
            const values = propSchema.enum.map(v => \`'\${v}'\`).join(', ');
            sql += \`ALTER TABLE \${tableName} ADD CONSTRAINT \${tableName}_\${columnName}_check \\n\`;
            sql += \`    CHECK (\${columnName} IN (\${values}));\\n\\n\`;
        }
    }
    
    return sql;
}

/**
 * Generate indexes for common query patterns
 */
function generateIndexes(entityName, schema) {
    const tableName = entityName.toLowerCase();
    let sql = \`-- Indexes for \${entityName}\\n\`;
    
    // Always index created_date and updated_date
    sql += \`CREATE INDEX idx_\${tableName}_created_date ON \${tableName}(created_date DESC);\\n\`;
    sql += \`CREATE INDEX idx_\${tableName}_updated_date ON \${tableName}(updated_date DESC);\\n\`;
    
    // Index foreign key fields
    const properties = schema.properties || {};
    for (const [propName] of Object.entries(properties)) {
        if (propName.endsWith('_id') || propName.includes('merchant')) {
            const columnName = propName.toLowerCase();
            sql += \`CREATE INDEX idx_\${tableName}_\${columnName} ON \${tableName}(\${columnName});\\n\`;
        }
    }
    
    // Index status fields
    if (properties.status) {
        sql += \`CREATE INDEX idx_\${tableName}_status ON \${tableName}(status);\\n\`;
    }
    
    sql += '\\n';
    return sql;
}

/**
 * Generate table partitioning for large tables
 */
function generatePartitioning(entityName) {
    if (entityName !== 'Transaction') return '';
    
    const tableName = entityName.toLowerCase();
    let sql = \`-- Partitioning for \${entityName}\\n\`;
    sql += \`-- Convert to partitioned table (requires data migration)\\n\\n\`;
    sql += \`CREATE TABLE \${tableName}_new (\\n\`;
    sql += \`    LIKE \${tableName} INCLUDING ALL\\n\`;
    sql += \`) PARTITION BY RANGE (created_date);\\n\\n\`;
    
    return sql;
}

/**
 * Main export function
 */
async function exportSchema() {
    console.log('Starting schema export...\\n');
    
    // Create output directory
    const outputDir = path.join(process.cwd(), 'database', 'schemas');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let pciScopeSql = '';
    let operationalSql = '';
    let indexesSql = '';
    let constraintsSql = '';
    
    // Add header
    const header = \`-- Generated on \${new Date().toISOString()}\\n\`;
    
    // Export PCI Scope entities
    console.log('Exporting PCI Scope entities...');
    for (const entityName of PCI_SCOPE_ENTITIES) {
        try {
            const schema = await base44.entities[entityName].schema();
            console.log(\`  ✓ \${entityName}\`);
            
            pciScopeSql += generateCreateTable(entityName, schema);
            constraintsSql += generateCheckConstraints(entityName, schema);
            indexesSql += generateIndexes(entityName, schema);
        } catch (error) {
            console.log(\`  ✗ \${entityName} - \${error.message}\`);
        }
    }
    
    // Export Operational entities
    console.log('\\nExporting Operational entities...');
    for (const entityName of OPERATIONAL_ENTITIES) {
        try {
            const schema = await base44.entities[entityName].schema();
            console.log(\`  ✓ \${entityName}\`);
            
            operationalSql += generateCreateTable(entityName, schema);
            constraintsSql += generateCheckConstraints(entityName, schema);
            indexesSql += generateIndexes(entityName, schema);
        } catch (error) {
            console.log(\`  ✗ \${entityName} - \${error.message}\`);
        }
    }
    
    // Write files
    console.log('\\nWriting SQL files...');
    fs.writeFileSync(path.join(outputDir, 'pci-scope.sql'), pciScopeSql);
    fs.writeFileSync(path.join(outputDir, 'operational.sql'), operationalSql);
    fs.writeFileSync(path.join(outputDir, 'indexes.sql'), indexesSql);
    fs.writeFileSync(path.join(outputDir, 'constraints.sql'), constraintsSql);
    
    console.log('\\n✓ Schema export complete!');
    console.log(\`\\nFiles created in \${outputDir}:\`);
    console.log('  - pci-scope.sql');
    console.log('  - operational.sql');
    console.log('  - indexes.sql');
    console.log('  - constraints.sql');
}

// Run export
exportSchema().catch(console.error);
`;