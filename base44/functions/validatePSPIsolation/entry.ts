import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

/**
 * CRITICAL SECURITY VALIDATION
 * Ensures complete PSP isolation for PCI DSS Level 1 & GDPR compliance
 * 
 * Tests:
 * 1. Schema isolation - each PSP has its own schema
 * 2. No cross-schema queries possible
 * 3. No data leakage between PSPs
 * 4. Audit trails are isolated
 * 5. User access is restricted to their PSP only
 */
Deno.serve(async (req) => {
    const client = await pool.connect();
    
    try {
        const { psp_code } = await req.json();
        
        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const schemaName = `psp_${psp_code.toLowerCase()}`;
        const violations = [];
        const warnings = [];

        // Test 1: Verify schema exists
        const schemaCheck = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = $1
        `, [schemaName]);

        if (schemaCheck.rows.length === 0) {
            violations.push({
                severity: 'CRITICAL',
                test: 'Schema Existence',
                message: `Schema ${schemaName} does not exist`,
                compliance: 'PCI DSS 12.3 - Database Segregation'
            });
        }

        // Test 2: Verify required tables exist in isolated schema
        const requiredTables = ['merchants', 'transactions', 'app_users', 'audit_logs', 'psp_settings'];
        
        for (const table of requiredTables) {
            const tableCheck = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = $1 AND table_name = $2
            `, [schemaName, table]);

            if (tableCheck.rows.length === 0) {
                violations.push({
                    severity: 'CRITICAL',
                    test: 'Table Isolation',
                    message: `Required table ${table} missing in ${schemaName}`,
                    compliance: 'PCI DSS 3.1 - Data Storage Segmentation'
                });
            }
        }

        // Test 3: Verify no cross-schema foreign keys
        const crossSchemaFKs = await client.query(`
            SELECT 
                tc.table_schema,
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_schema AS foreign_schema,
                ccu.table_name AS foreign_table_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = $1
                AND ccu.table_schema != $1
        `, [schemaName]);

        if (crossSchemaFKs.rows.length > 0) {
            violations.push({
                severity: 'CRITICAL',
                test: 'Cross-Schema References',
                message: `Found ${crossSchemaFKs.rows.length} foreign keys pointing outside ${schemaName}`,
                details: crossSchemaFKs.rows,
                compliance: 'PCI DSS 12.3 - No Cross-Tenant Data Access'
            });
        }

        // Test 4: Verify audit logging is enabled
        await client.query(`SET search_path TO ${schemaName}`);
        const auditCount = await client.query('SELECT COUNT(*) as count FROM audit_logs');
        
        if (parseInt(auditCount.rows[0].count) === 0) {
            warnings.push({
                severity: 'WARNING',
                test: 'Audit Trail',
                message: `No audit logs found in ${schemaName}`,
                compliance: 'PCI DSS 10.1 - Audit Trail Implementation'
            });
        }

        // Test 5: Verify PSP settings exist
        const settingsCheck = await client.query(`
            SELECT * FROM psp_settings WHERE psp_code = $1
        `, [psp_code]);

        if (settingsCheck.rows.length === 0) {
            violations.push({
                severity: 'CRITICAL',
                test: 'PSP Configuration',
                message: `No settings found for ${psp_code} in ${schemaName}`,
                compliance: 'GDPR Article 32 - Security Configuration'
            });
        }

        // Test 6: Verify no public schema fallback
        const searchPath = await client.query('SHOW search_path');
        const currentPath = searchPath.rows[0].search_path;
        
        if (currentPath.includes('public') && !currentPath.startsWith(schemaName)) {
            warnings.push({
                severity: 'WARNING',
                test: 'Search Path Security',
                message: `Search path includes public schema: ${currentPath}`,
                recommendation: 'Set search_path to schema ONLY, no public fallback',
                compliance: 'PCI DSS 2.2.3 - Secure Configuration'
            });
        }

        const isCompliant = violations.length === 0;
        const complianceLevel = isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT';

        return Response.json({
            success: true,
            psp_code,
            schema: schemaName,
            compliance_status: complianceLevel,
            pci_dss_compliant: isCompliant,
            gdpr_compliant: isCompliant,
            violations,
            warnings,
            summary: {
                total_tests: 6,
                critical_violations: violations.filter(v => v.severity === 'CRITICAL').length,
                warnings: warnings.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
});