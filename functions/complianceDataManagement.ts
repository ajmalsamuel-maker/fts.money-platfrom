import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, entity_type, data, filters } = await req.json();

        // GDPR Data Subject Request Handling
        if (action === 'create_dsar') {
            const dsar = await base44.asServiceRole.entities.DataSubjectRequest.create({
                ...data,
                request_id: `DSAR-${Date.now()}`,
                request_date: new Date().toISOString(),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                status: 'pending',
                verification_status: 'pending'
            });

            // Log access control
            await base44.asServiceRole.entities.AccessControlLog.create({
                user_id: user.id,
                user_email: user.email,
                action: 'dsar_created',
                resource_accessed: `DSAR-${dsar.id}`,
                resource_type: 'entity',
                access_granted: true,
                ip_address: req.headers.get('x-forwarded-for') || 'unknown'
            });

            return Response.json({ success: true, data: dsar });
        }

        // Data Export for DSAR (Right to Access)
        if (action === 'export_user_data') {
            const { user_id } = data;

            // Fetch all user data across entities
            const transactions = await base44.asServiceRole.entities.Transaction.filter({ customer_id: user_id });
            const consents = await base44.asServiceRole.entities.GDPRConsent.filter({ user_id });
            const accessLogs = await base44.asServiceRole.entities.AccessControlLog.filter({ user_id });
            
            const exportData = {
                user_id,
                export_date: new Date().toISOString(),
                personal_data: {
                    email: user.email,
                    full_name: user.full_name
                },
                transactions: transactions,
                consents: consents,
                access_logs: accessLogs.slice(0, 100) // Last 100 access logs
            };

            // In production, upload to secure storage and return URL
            return Response.json({ 
                success: true, 
                data: exportData,
                message: 'Data exported successfully' 
            });
        }

        // Data Erasure (Right to be Forgotten)
        if (action === 'erase_user_data') {
            const { user_id, dsar_id } = data;

            // Anonymize rather than delete (to maintain transaction integrity)
            const transactions = await base44.asServiceRole.entities.Transaction.filter({ customer_id: user_id });
            
            for (const txn of transactions) {
                await base44.asServiceRole.entities.Transaction.update(txn.id, {
                    customer_email: 'anonymized@deleted.user',
                    customer_name: 'Deleted User',
                    billing_address: null,
                    shipping_address: null
                });
            }

            // Delete consents
            const consents = await base44.asServiceRole.entities.GDPRConsent.filter({ user_id });
            for (const consent of consents) {
                await base44.asServiceRole.entities.GDPRConsent.delete(consent.id);
            }

            // Update DSAR status
            const dsars = await base44.asServiceRole.entities.DataSubjectRequest.filter({ request_id: dsar_id });
            if (dsars.length > 0) {
                await base44.asServiceRole.entities.DataSubjectRequest.update(dsars[0].id, {
                    status: 'completed',
                    completed_date: new Date().toISOString()
                });
            }

            return Response.json({ 
                success: true, 
                message: 'User data erased/anonymized successfully' 
            });
        }

        // Auto-delete expired data based on retention policies
        if (action === 'apply_retention_policies') {
            const policies = await base44.asServiceRole.entities.DataRetentionPolicy.filter({ 
                status: 'active',
                auto_delete_enabled: true 
            });

            const results = [];

            for (const policy of policies) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);

                // Apply to each entity in policy
                for (const entityName of policy.applies_to_entities || []) {
                    try {
                        const records = await base44.asServiceRole.entities[entityName].filter({
                            created_date: { $lt: cutoffDate.toISOString() }
                        });

                        if (policy.archive_before_delete) {
                            // Archive logic here
                            results.push({
                                policy: policy.policy_name,
                                entity: entityName,
                                action: 'archived',
                                count: records.length
                            });
                        }

                        // Delete records
                        for (const record of records) {
                            await base44.asServiceRole.entities[entityName].delete(record.id);
                        }

                        results.push({
                            policy: policy.policy_name,
                            entity: entityName,
                            action: 'deleted',
                            count: records.length
                        });
                    } catch (error) {
                        results.push({
                            policy: policy.policy_name,
                            entity: entityName,
                            error: error.message
                        });
                    }
                }
            }

            return Response.json({ success: true, results });
        }

        // Log security incident
        if (action === 'log_security_incident') {
            const incident = await base44.asServiceRole.entities.SecurityIncident.create({
                incident_id: `SEC-${Date.now()}`,
                ...data,
                incident_date: data.incident_date || new Date().toISOString(),
                reported_date: new Date().toISOString(),
                status: 'open'
            });

            // Check if data breach
            if (data.data_breach) {
                await base44.asServiceRole.entities.DataBreachIncident.create({
                    incident_id: `BREACH-${Date.now()}`,
                    incident_date: data.incident_date,
                    discovered_date: new Date().toISOString(),
                    incident_type: data.incident_category,
                    severity: data.severity,
                    status: 'open'
                });
            }

            return Response.json({ success: true, data: incident });
        }

        // Check certifications expiring soon
        if (action === 'check_expiring_certifications') {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            const expiring = await base44.asServiceRole.entities.ComplianceCertification.filter({
                expiry_date: { $lte: thirtyDaysFromNow.toISOString() },
                status: 'active'
            });

            return Response.json({ success: true, data: expiring });
        }

        // List compliance data
        if (action === 'list') {
            const entityMap = {
                'dsar': 'DataSubjectRequest',
                'consents': 'GDPRConsent',
                'breaches': 'DataBreachIncident',
                'incidents': 'SecurityIncident',
                'certifications': 'ComplianceCertification',
                'retention_policies': 'DataRetentionPolicy',
                'pias': 'PrivacyImpactAssessment',
                'access_logs': 'AccessControlLog'
            };

            const entityName = entityMap[entity_type];
            if (!entityName) {
                return Response.json({ error: 'Invalid entity type' }, { status: 400 });
            }

            const records = await base44.asServiceRole.entities[entityName].filter(filters || {});
            return Response.json({ success: true, data: records });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Compliance data management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});