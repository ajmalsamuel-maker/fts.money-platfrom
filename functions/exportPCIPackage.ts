import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch all PCI data
        const [requirements, evidence, findings, controls, policies, audits] = await Promise.all([
            base44.asServiceRole.entities.PCIRequirement.list(),
            base44.asServiceRole.entities.PCIEvidence.list('-created_date', 500),
            base44.asServiceRole.entities.PCIFinding.list(),
            base44.asServiceRole.entities.PCIControl.list(),
            base44.asServiceRole.entities.PCIPolicy.list(),
            base44.asServiceRole.entities.PCIAuditLog.list()
        ]);

        // Generate comprehensive PDF report
        const doc = new jsPDF();
        let yPos = 20;

        // Title Page
        doc.setFontSize(24);
        doc.text('PCI DSS Level 1 Compliance Package', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Total Requirements: ${requirements.length}`, 20, yPos);
        yPos += 7;
        doc.text(`Evidence Documents: ${evidence.length}`, 20, yPos);
        yPos += 7;
        doc.text(`Control Tests: ${controls.length}`, 20, yPos);
        yPos += 7;
        doc.text(`Active Policies: ${policies.filter(p => p.status === 'active').length}`, 20, yPos);
        yPos += 7;
        doc.text(`Open Findings: ${findings.filter(f => f.status === 'open').length}`, 20, yPos);

        // Executive Summary
        doc.addPage();
        yPos = 20;
        doc.setFontSize(18);
        doc.text('Executive Summary', 20, yPos);
        yPos += 15;

        doc.setFontSize(10);
        const totalReqs = requirements.length;
        const completedReqs = requirements.filter(r => r.compliance_status === 'completed').length;
        const compliance = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

        doc.text(`Overall Compliance: ${compliance}%`, 20, yPos);
        yPos += 7;
        doc.text(`Completed Requirements: ${completedReqs} of ${totalReqs}`, 20, yPos);
        yPos += 7;
        
        const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
        const highFindings = findings.filter(f => f.severity === 'high' && f.status === 'open').length;
        
        doc.text(`Critical Findings: ${criticalFindings}`, 20, yPos);
        yPos += 7;
        doc.text(`High Findings: ${highFindings}`, 20, yPos);

        // Requirements Section
        doc.addPage();
        yPos = 20;
        doc.setFontSize(18);
        doc.text('PCI DSS Requirements Status', 20, yPos);
        yPos += 15;

        doc.setFontSize(9);
        requirements.slice(0, 12).forEach((req) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(10);
            doc.text(`${req.requirement_number}: ${req.requirement_title}`, 20, yPos);
            yPos += 6;
            
            doc.setFontSize(8);
            doc.text(`Status: ${req.compliance_status} | Progress: ${req.completion_percentage || 0}%`, 25, yPos);
            yPos += 6;
            
            if (req.responsible_party) {
                doc.text(`Responsible: ${req.responsible_party}`, 25, yPos);
                yPos += 6;
            }
            yPos += 3;
        });

        // Evidence Section
        doc.addPage();
        yPos = 20;
        doc.setFontSize(18);
        doc.text('Evidence Documents', 20, yPos);
        yPos += 15;

        doc.setFontSize(8);
        evidence.slice(0, 50).forEach((item) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(`Req ${item.requirement_number}: ${item.title}`, 20, yPos);
            yPos += 5;
            doc.text(`Type: ${item.evidence_type} | Status: ${item.status}`, 25, yPos);
            yPos += 5;
            if (item.file_url) {
                doc.text(`URL: ${item.file_url.substring(0, 80)}`, 25, yPos);
                yPos += 5;
            }
            yPos += 2;
        });

        // Findings Section
        doc.addPage();
        yPos = 20;
        doc.setFontSize(18);
        doc.text('Findings & Gaps', 20, yPos);
        yPos += 15;

        doc.setFontSize(9);
        findings.forEach((finding) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(10);
            doc.text(`[${finding.severity.toUpperCase()}] ${finding.finding_title}`, 20, yPos);
            yPos += 6;
            
            doc.setFontSize(8);
            doc.text(`Req: ${finding.requirement_number} | Status: ${finding.status}`, 25, yPos);
            yPos += 5;
            
            if (finding.finding_description) {
                const description = finding.finding_description.substring(0, 100);
                doc.text(description, 25, yPos);
                yPos += 5;
            }
            yPos += 3;
        });

        // Control Testing Section
        doc.addPage();
        yPos = 20;
        doc.setFontSize(18);
        doc.text('Control Test Results', 20, yPos);
        yPos += 15;

        doc.setFontSize(9);
        controls.forEach((control) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(`${control.control_name} - ${control.test_result}`, 20, yPos);
            yPos += 5;
            doc.text(`Type: ${control.test_type} | Tested: ${control.test_date || 'N/A'}`, 25, yPos);
            yPos += 5;
            yPos += 2;
        });

        // Policies Section
        doc.addPage();
        yPos = 20;
        doc.setFontSize(18);
        doc.text('Active Policies', 20, yPos);
        yPos += 15;

        doc.setFontSize(9);
        policies.filter(p => p.status === 'active').forEach((policy) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(`${policy.policy_name} (v${policy.version || '1.0'})`, 20, yPos);
            yPos += 5;
            doc.text(`Category: ${policy.policy_category} | Status: ${policy.status}`, 25, yPos);
            yPos += 5;
            yPos += 2;
        });

        // Generate PDF
        const pdfBytes = doc.output('arraybuffer');
        const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

        return Response.json({
            success: true,
            message: 'PCI compliance package generated',
            pdf_base64: pdfBase64,
            stats: {
                requirements: requirements.length,
                evidence: evidence.length,
                findings: findings.length,
                controls: controls.length,
                policies: policies.length
            }
        });

    } catch (error) {
        console.error('Export failed:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});