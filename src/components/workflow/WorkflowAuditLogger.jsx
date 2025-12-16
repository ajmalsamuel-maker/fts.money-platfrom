import { base44 } from '@/api/base44Client';

export const WorkflowAuditLogger = {
    async log(action, details, user) {
        try {
            const workflow = details.workflow || {};
            const auditEntry = {
                timestamp: new Date().toISOString(),
                action,
                user: user?.email || 'system',
                result: 'success',
                details: {
                    workflow_id: workflow.workflow_id || workflow.id,
                    workflow_name: workflow.workflow_name,
                    ...details
                }
            };

            // Update workflow audit trail
            if (workflow.id) {
                const existing = await base44.entities.WorkflowCompliance.list();
                const target = existing.find(w => w.id === workflow.id);
                
                if (target) {
                    const auditTrail = target.audit_trail || [];
                    auditTrail.push(auditEntry);
                    
                    await base44.entities.WorkflowCompliance.update(workflow.id, {
                        audit_trail: auditTrail.slice(-50) // Keep last 50 entries
                    });
                }
            }

            return auditEntry;
        } catch (error) {
            console.error('Audit logging failed:', error);
        }
    },

    async logCreate(workflow, user) {
        return this.log('workflow_created', { workflow }, user);
    },

    async logUpdate(workflow, changes, user) {
        return this.log('workflow_updated', { workflow, changes }, user);
    },

    async logDelete(workflow, user) {
        return this.log('workflow_deleted', { workflow }, user);
    },

    async logComplianceChange(workflow, standard, newValue, user) {
        return this.log('compliance_changed', {
            workflow,
            standard,
            newValue
        }, user);
    },

    async logBPMNUpload(workflow, url, user) {
        return this.log('bpmn_uploaded', { workflow, bpmn_url: url }, user);
    },

    async logTemplateCreate(template, user) {
        return this.log('template_created', { template }, user);
    },

    async logTemplateUpdate(template, user) {
        return this.log('template_updated', { template }, user);
    },

    async logApproval(workflow, approved, user) {
        return this.log('workflow_approved', {
            workflow,
            approved,
            approver: user?.email
        }, user);
    },

    async logExport(type, user) {
        return this.log('audit_exported', { export_type: type }, user);
    }
};