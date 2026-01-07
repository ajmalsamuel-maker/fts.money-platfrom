import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workflow_type, trigger_data } = await req.json();

        let workflow;

        switch (workflow_type) {
            case 'remediation':
                // Auto-create remediation workflow for new finding
                const finding = trigger_data.finding;
                workflow = await base44.asServiceRole.entities.PCIWorkflow.create({
                    workflow_name: `Remediate: ${finding.finding_title}`,
                    workflow_type: 'remediation',
                    trigger: 'finding_created',
                    status: 'active',
                    current_step: 1,
                    steps: [
                        { step: 1, action: 'Assess impact', assignee: 'security@company.com', status: 'pending' },
                        { step: 2, action: 'Develop fix', assignee: 'engineering@company.com', status: 'pending' },
                        { step: 3, action: 'Test solution', assignee: 'qa@company.com', status: 'pending' },
                        { step: 4, action: 'Deploy fix', assignee: 'devops@company.com', status: 'pending' },
                        { step: 5, action: 'Verify compliance', assignee: 'compliance@company.com', status: 'pending' }
                    ],
                    assigned_to: 'security@company.com',
                    priority: finding.severity === 'critical' ? 'critical' : 'high',
                    related_finding_id: finding.id,
                    related_requirement: finding.requirement_number,
                    sla_hours: finding.severity === 'critical' ? 24 : 72,
                    sla_status: 'on_track',
                    due_date: new Date(Date.now() + (finding.severity === 'critical' ? 24 : 72) * 60 * 60 * 1000).toISOString().split('T')[0]
                });

                // Send notifications
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: 'security@company.com',
                    subject: `New Critical Remediation Workflow: ${finding.finding_title}`,
                    body: `A new remediation workflow has been created for finding: ${finding.finding_title}\n\nSeverity: ${finding.severity}\nDue Date: ${workflow.due_date}\n\nPlease assess the impact and proceed to the next step.`
                });
                break;

            case 'evidence_approval':
                // Auto-create approval workflow for evidence
                const evidence = trigger_data.evidence;
                workflow = await base44.asServiceRole.entities.PCIWorkflow.create({
                    workflow_name: `Approve Evidence: ${evidence.title}`,
                    workflow_type: 'evidence_approval',
                    trigger: 'evidence_uploaded',
                    status: 'active',
                    current_step: 1,
                    steps: [
                        { step: 1, action: 'Initial review', assignee: 'compliance@company.com', status: 'pending' },
                        { step: 2, action: 'Technical validation', assignee: 'security@company.com', status: 'pending' },
                        { step: 3, action: 'Final approval', assignee: user.email, status: 'pending' }
                    ],
                    assigned_to: 'compliance@company.com',
                    priority: 'medium',
                    sla_hours: 48,
                    sla_status: 'on_track',
                    due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
                break;

            case 'policy_review':
                // Annual policy review workflow
                workflow = await base44.asServiceRole.entities.PCIWorkflow.create({
                    workflow_name: 'Annual Policy Review',
                    workflow_type: 'policy_review',
                    trigger: 'scheduled',
                    status: 'active',
                    current_step: 1,
                    steps: [
                        { step: 1, action: 'Review all policies', assignee: 'compliance@company.com', status: 'pending' },
                        { step: 2, action: 'Update policies', assignee: 'legal@company.com', status: 'pending' },
                        { step: 3, action: 'Distribute for attestation', assignee: 'hr@company.com', status: 'pending' },
                        { step: 4, action: 'Track attestations', assignee: 'compliance@company.com', status: 'pending' }
                    ],
                    assigned_to: 'compliance@company.com',
                    priority: 'high',
                    sla_hours: 720,
                    sla_status: 'on_track',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
                break;

            default:
                return Response.json({ error: 'Unknown workflow type' }, { status: 400 });
        }

        return Response.json({
            success: true,
            workflow_id: workflow.id,
            workflow_name: workflow.workflow_name,
            assigned_to: workflow.assigned_to,
            due_date: workflow.due_date
        });

    } catch (error) {
        console.error('Workflow error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});