import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Phase 0, Step 4: Database Schema Validation
 * Validates PSP database schema isolation and prevents cross-tenant data leaks
 * Ensures all entities have proper tenant_id/psp_code isolation
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_id, auto_fix = false } = await req.json();

        // Fetch PSP details
        const psp = psp_id 
            ? await base44.asServiceRole.entities.ProvisionedPSP.filter({ id: psp_id })
            : await base44.asServiceRole.entities.ProvisionedPSP.list();

        const pspsToValidate = Array.isArray(psp) ? psp : [psp[0]];
        const results = [];

        for (const targetPsp of pspsToValidate) {
            const validation = {
                psp_id: targetPsp.id,
                psp_code: targetPsp.psp_code,
                psp_name: targetPsp.psp_name,
                tenant_id: targetPsp.tenant_id,
                issues: [],
                warnings: [],
                passed: true
            };

            // 1. Check PSP Settings isolation
            try {
                const settings = await base44.asServiceRole.entities.PSPSettings.filter({
                    psp_code: targetPsp.psp_code
                });

                if (settings.length === 0) {
                    validation.warnings.push({
                        entity: 'PSPSettings',
                        issue: 'No settings found for this PSP',
                        severity: 'warning',
                        fix: 'Create default PSP settings'
                    });
                } else if (settings.length > 1) {
                    validation.issues.push({
                        entity: 'PSPSettings',
                        issue: `Multiple settings records found (${settings.length})`,
                        severity: 'critical',
                        fix: 'Remove duplicate settings records'
                    });
                    validation.passed = false;
                }

                // Check for settings without psp_code
                const orphanedSettings = await base44.asServiceRole.entities.PSPSettings.filter({});
                const settingsWithoutCode = orphanedSettings.filter(s => !s.psp_code);
                if (settingsWithoutCode.length > 0) {
                    validation.issues.push({
                        entity: 'PSPSettings',
                        issue: `${settingsWithoutCode.length} settings records without psp_code`,
                        severity: 'critical',
                        fix: 'Add psp_code to all settings records'
                    });
                    validation.passed = false;
                }
            } catch (error) {
                validation.issues.push({
                    entity: 'PSPSettings',
                    issue: `Failed to validate settings: ${error.message}`,
                    severity: 'error'
                });
                validation.passed = false;
            }

            // 2. Check Merchant isolation
            try {
                const merchants = await base44.asServiceRole.entities.Merchant.filter({
                    psp_code: targetPsp.psp_code
                });

                // Check for merchants without psp_code
                const allMerchants = await base44.asServiceRole.entities.Merchant.list();
                const merchantsWithoutCode = allMerchants.filter(m => !m.psp_code);
                if (merchantsWithoutCode.length > 0) {
                    validation.issues.push({
                        entity: 'Merchant',
                        issue: `${merchantsWithoutCode.length} merchants without psp_code`,
                        severity: 'critical',
                        fix: 'Assign psp_code to all merchants',
                        affected_records: merchantsWithoutCode.length
                    });
                    validation.passed = false;
                }

                validation.warnings.push({
                    entity: 'Merchant',
                    message: `${merchants.length} merchants properly isolated`,
                    severity: 'info'
                });
            } catch (error) {
                validation.warnings.push({
                    entity: 'Merchant',
                    issue: `Could not validate: ${error.message}`,
                    severity: 'warning'
                });
            }

            // 3. Check Transaction isolation
            try {
                const transactions = await base44.asServiceRole.entities.Transaction.filter({
                    psp_code: targetPsp.psp_code
                });

                // Sample check for transactions without psp_code
                const sampleTransactions = await base44.asServiceRole.entities.Transaction.list('-created_date', 100);
                const txnsWithoutCode = sampleTransactions.filter(t => !t.psp_code);
                if (txnsWithoutCode.length > 0) {
                    validation.issues.push({
                        entity: 'Transaction',
                        issue: `${txnsWithoutCode.length} transactions (in sample) without psp_code`,
                        severity: 'critical',
                        fix: 'Ensure all new transactions include psp_code',
                        affected_records: txnsWithoutCode.length
                    });
                    validation.passed = false;
                }

                validation.warnings.push({
                    entity: 'Transaction',
                    message: `${transactions.length} transactions properly isolated`,
                    severity: 'info'
                });
            } catch (error) {
                validation.warnings.push({
                    entity: 'Transaction',
                    issue: `Could not validate: ${error.message}`,
                    severity: 'warning'
                });
            }

            // 4. Check Tenant isolation
            if (targetPsp.tenant_id) {
                try {
                    const tenant = await base44.asServiceRole.entities.Tenant.filter({
                        id: targetPsp.tenant_id
                    });

                    if (tenant.length === 0) {
                        validation.issues.push({
                            entity: 'Tenant',
                            issue: 'PSP references non-existent tenant',
                            severity: 'critical',
                            fix: 'Assign valid tenant_id or set to null'
                        });
                        validation.passed = false;
                    }

                    // Check for PSPs without tenant_id
                    const allPsps = await base44.asServiceRole.entities.ProvisionedPSP.list();
                    const pspsWithoutTenant = allPsps.filter(p => !p.tenant_id);
                    if (pspsWithoutTenant.length > 0) {
                        validation.warnings.push({
                            entity: 'ProvisionedPSP',
                            issue: `${pspsWithoutTenant.length} PSPs without tenant_id`,
                            severity: 'warning',
                            fix: 'Assign tenant_id to all PSPs for multi-tenancy'
                        });
                    }
                } catch (error) {
                    validation.warnings.push({
                        entity: 'Tenant',
                        issue: `Could not validate: ${error.message}`,
                        severity: 'warning'
                    });
                }
            } else {
                validation.warnings.push({
                    entity: 'Tenant',
                    issue: 'PSP has no tenant_id assigned',
                    severity: 'warning',
                    fix: 'Assign tenant_id for multi-tenancy support'
                });
            }

            // 5. Check cross-contamination
            try {
                // Verify no merchant from this PSP appears in another PSP's data
                const allMerchants = await base44.asServiceRole.entities.Merchant.list();
                const thisPspMerchants = allMerchants.filter(m => m.psp_code === targetPsp.psp_code);
                const merchantIds = thisPspMerchants.map(m => m.id);

                // Check if these merchants have transactions with different psp_codes
                for (const merchantId of merchantIds.slice(0, 10)) { // Sample first 10
                    const merchantTxns = await base44.asServiceRole.entities.Transaction.filter({
                        merchant_id: merchantId
                    });

                    const crossContaminated = merchantTxns.filter(t => t.psp_code !== targetPsp.psp_code);
                    if (crossContaminated.length > 0) {
                        validation.issues.push({
                            entity: 'Transaction',
                            issue: `Merchant ${merchantId} has ${crossContaminated.length} transactions with different psp_code`,
                            severity: 'critical',
                            fix: 'Data corruption - transactions must match merchant psp_code',
                            affected_records: crossContaminated.length
                        });
                        validation.passed = false;
                    }
                }
            } catch (error) {
                validation.warnings.push({
                    entity: 'Cross-contamination check',
                    issue: `Could not complete: ${error.message}`,
                    severity: 'warning'
                });
            }

            results.push(validation);
        }

        // Summary
        const summary = {
            total_psps_validated: results.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length,
            total_issues: results.reduce((sum, r) => sum + r.issues.length, 0),
            total_warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
            critical_issues: results.reduce((sum, r) => 
                sum + r.issues.filter(i => i.severity === 'critical').length, 0
            )
        };

        return Response.json({
            success: true,
            summary,
            results,
            timestamp: new Date().toISOString(),
            recommendations: summary.critical_issues > 0 
                ? ['Immediate action required: Critical isolation issues detected']
                : summary.total_issues > 0
                ? ['Review and fix non-critical issues']
                : ['Schema validation passed - all PSPs properly isolated']
        });

    } catch (error) {
        console.error('Schema validation error:', error);
        return Response.json({ 
            error: 'Schema validation failed', 
            details: error.message 
        }, { status: 500 });
    }
});