import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { 
            qsa_email, 
            report_title, 
            selected_requirements, 
            selected_findings, 
            selected_reports,
            include_evidence_summary 
        } = await req.json();

        if (!qsa_email) {
            return Response.json({ error: 'QSA email required' }, { status: 400 });
        }

        // Fetch data based on selections
        const requirements = selected_requirements?.length > 0 
            ? await Promise.all(selected_requirements.map(id => 
                base44.asServiceRole.entities.PCIRequirement.filter({ id })
              ))
            : [];

        const findings = selected_findings?.length > 0
            ? await Promise.all(selected_findings.map(id =>
                base44.asServiceRole.entities.PCIFinding.filter({ id })
              ))
            : [];

        const uploadedReports = selected_reports?.length > 0
            ? await Promise.all(selected_reports.map(id =>
                base44.asServiceRole.entities.QSAUploadedReport.filter({ id })
              ))
            : [];

        // Compile context for LLM
        const requirementsContext = requirements.flat().map(r => 
            `Requirement ${r.requirement_number}: ${r.requirement_title} - Status: ${r.compliance_status}, ${r.completion_percentage}% complete`
        ).join('\n');

        const findingsContext = findings.flat().map(f =>
            `Finding: ${f.finding_title}\nSeverity: ${f.severity}\nDescription: ${f.finding_description}\nStatus: ${f.status}\nReq: ${f.requirement_number}`
        ).join('\n\n');

        const reportsContext = uploadedReports.flat().map(r =>
            `Report: ${r.report_title}\nType: ${r.report_type}\nDescription: ${r.description || 'N/A'}`
        ).join('\n\n');

        // Generate report using LLM
        const prompt = `You are a Qualified Security Assessor (QSA) writing a professional PCI DSS compliance audit report.

Generate a comprehensive, well-structured audit report based on the following data:

REQUIREMENTS ASSESSED:
${requirementsContext || 'None selected'}

KEY FINDINGS:
${findingsContext || 'None selected'}

UPLOADED REPORTS:
${reportsContext || 'None selected'}

Please generate a professional QSA audit report with the following sections:
1. Executive Summary
2. Scope and Methodology
3. Requirements Assessment Summary
4. Key Findings and Observations
5. Risk Analysis
6. Recommendations
7. Conclusion

Use formal audit language, be specific with requirement references, and provide actionable recommendations.`;

        const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    executive_summary: { type: "string" },
                    scope_methodology: { type: "string" },
                    requirements_summary: { type: "string" },
                    key_findings: { type: "string" },
                    risk_analysis: { type: "string" },
                    recommendations: { type: "string" },
                    conclusion: { type: "string" }
                }
            }
        });

        // Log the generation
        await base44.asServiceRole.entities.QSAAccessLog.create({
            qsa_email,
            action_type: 'upload_report',
            details: `Generated AI report: ${report_title}`,
            status: 'success'
        });

        return Response.json({
            success: true,
            report: {
                title: report_title,
                generated_at: new Date().toISOString(),
                content: llmResponse,
                requirements_count: requirements.flat().length,
                findings_count: findings.flat().length
            }
        });

    } catch (error) {
        console.error('Report generation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});