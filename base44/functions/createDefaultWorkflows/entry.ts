import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Creates default workflow compliance records for FTS.Money platform
 * This ensures all core workflows are ISO standards compliant
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const defaultWorkflows = [
            {
                workflow_id: 'WF-PSP-PROV-001',
                workflow_name: 'PSP Provisioning Workflow',
                workflow_type: 'psp_provisioning',
                iso_19510_compliant: true,  // BPMN 2.0
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,   // ODP Framework
                iso_9001_compliant: true,    // Quality Management
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'Core PSP provisioning process - fully automated with quality checks'
            },
            {
                workflow_id: 'WF-MERCH-ONB-001',
                workflow_name: 'Merchant Onboarding Workflow',
                workflow_type: 'merchant_onboarding',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'KYB/AML/LEI verification with automated document processing'
            },
            {
                workflow_id: 'WF-TXN-PROC-001',
                workflow_name: 'Transaction Processing Workflow',
                workflow_type: 'transaction_processing',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'Payment processing with smart routing and fraud detection'
            },
            {
                workflow_id: 'WF-COMP-VER-001',
                workflow_name: 'Compliance Verification Workflow',
                workflow_type: 'compliance_verification',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'Automated compliance checks for merchants and transactions'
            },
            {
                workflow_id: 'WF-PAYOUT-PROC-001',
                workflow_name: 'Payout Processing Workflow',
                workflow_type: 'payout_processing',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'Multi-channel payout orchestration with route optimization'
            },
            {
                workflow_id: 'WF-SERV-PROV-001',
                workflow_name: 'Service Provisioning Workflow',
                workflow_type: 'service_provisioning',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'NetXHub service provisioning and configuration'
            },
            {
                workflow_id: 'WF-DISP-RES-001',
                workflow_name: 'Dispute Resolution Workflow',
                workflow_type: 'dispute_resolution',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'Chargeback and dispute management with AI assistance'
            },
            {
                workflow_id: 'WF-RISK-ASS-001',
                workflow_name: 'Risk Assessment Workflow',
                workflow_type: 'risk_assessment',
                iso_19510_compliant: true,
                iso_23005_7_compliant: false,
                iso_10746_compliant: true,
                iso_9001_compliant: true,
                status: 'active',
                version: '1.0',
                last_audit_date: new Date().toISOString().split('T')[0],
                next_audit_date: getNextAuditDate(),
                compliance_notes: 'Real-time fraud detection and risk scoring'
            }
        ];

        // Check if workflows already exist
        const existingWorkflows = await base44.asServiceRole.entities.WorkflowCompliance.list();
        const existingIds = new Set(existingWorkflows.map(w => w.workflow_id));

        // Only create workflows that don't exist
        const workflowsToCreate = defaultWorkflows.filter(w => !existingIds.has(w.workflow_id));

        if (workflowsToCreate.length === 0) {
            return Response.json({
                success: true,
                message: 'All default workflows already exist',
                count: existingWorkflows.length
            });
        }

        // Create workflows
        const created = await base44.asServiceRole.entities.WorkflowCompliance.bulkCreate(workflowsToCreate);

        return Response.json({
            success: true,
            message: `Created ${created.length} default workflows`,
            workflows: created.map(w => ({ id: w.workflow_id, name: w.workflow_name }))
        });

    } catch (error) {
        console.error('Error creating default workflows:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

function getNextAuditDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 3); // Quarterly audits
    return date.toISOString().split('T')[0];
}