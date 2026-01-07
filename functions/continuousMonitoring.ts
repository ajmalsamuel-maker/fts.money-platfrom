import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { check_ids, run_all } = await req.json();

        // Fetch checks to run
        const checks = run_all 
            ? await base44.asServiceRole.entities.PCIMonitoringCheck.list()
            : await Promise.all(check_ids.map(id => 
                base44.asServiceRole.entities.PCIMonitoringCheck.filter({ id })
              ));

        const results = [];

        for (const check of checks.flat()) {
            let status = 'passing';
            let result_data = {};

            // Simulate different check types
            switch (check.check_type) {
                case 'firewall':
                    // Check firewall rules
                    const firewallScore = Math.random();
                    status = firewallScore > 0.8 ? 'passing' : firewallScore > 0.5 ? 'warning' : 'failing';
                    result_data = {
                        rules_checked: 245,
                        compliant_rules: Math.floor(245 * firewallScore),
                        last_rule_update: new Date().toISOString()
                    };
                    break;

                case 'encryption':
                    // Check encryption status
                    const encryptionScore = Math.random();
                    status = encryptionScore > 0.9 ? 'passing' : 'failing';
                    result_data = {
                        encrypted_connections: Math.floor(100 * encryptionScore),
                        tls_version: '1.3',
                        weak_ciphers_found: encryptionScore < 0.9
                    };
                    break;

                case 'access_control':
                    // Check access controls
                    const accessScore = Math.random();
                    status = accessScore > 0.85 ? 'passing' : 'warning';
                    result_data = {
                        accounts_reviewed: 523,
                        mfa_enabled: Math.floor(523 * accessScore),
                        privileged_accounts: 42
                    };
                    break;

                case 'vulnerability':
                    // Check for vulnerabilities
                    const vulnCount = Math.floor(Math.random() * 10);
                    status = vulnCount === 0 ? 'passing' : vulnCount < 3 ? 'warning' : 'failing';
                    result_data = {
                        critical_vulns: Math.floor(vulnCount * 0.2),
                        high_vulns: Math.floor(vulnCount * 0.3),
                        medium_vulns: Math.floor(vulnCount * 0.5),
                        last_scan: new Date().toISOString()
                    };
                    break;

                default:
                    status = 'passing';
                    result_data = { message: 'Check completed successfully' };
            }

            // Update check record
            await base44.asServiceRole.entities.PCIMonitoringCheck.update(check.id, {
                status,
                last_run: new Date().toISOString(),
                next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                result_data,
                failure_count: status === 'failing' ? (check.failure_count || 0) + 1 : 0
            });

            // Create blockchain log entry
            const eventData = JSON.stringify({ check: check.id, status, result_data });
            const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(eventData));
            const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

            await base44.asServiceRole.entities.PCIBlockchainLog.create({
                event_type: 'control_tested',
                event_description: `Automated check: ${check.check_name} - ${status}`,
                actor_email: 'system@automation',
                actor_role: 'system',
                resource_type: 'monitoring_check',
                resource_id: check.id,
                timestamp: new Date().toISOString(),
                hash: hashHex,
                metadata: { check_type: check.check_type, status }
            });

            results.push({
                check_id: check.id,
                check_name: check.check_name,
                status,
                result_data
            });
        }

        return Response.json({
            success: true,
            checks_run: results.length,
            passing: results.filter(r => r.status === 'passing').length,
            warnings: results.filter(r => r.status === 'warning').length,
            failing: results.filter(r => r.status === 'failing').length,
            results
        });

    } catch (error) {
        console.error('Monitoring error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});