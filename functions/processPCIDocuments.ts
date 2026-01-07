import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.app_role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { file_urls, batch_name } = await req.json();

        if (!file_urls || !Array.isArray(file_urls)) {
            return Response.json({ error: 'file_urls array is required' }, { status: 400 });
        }

        const results = [];
        let processedCount = 0;

        for (const fileUrl of file_urls) {
            try {
                console.log(`Processing document ${processedCount + 1}/${file_urls.length}: ${fileUrl}`);

                // Use LLM to extract PCI compliance content
                const analysis = await base44.integrations.Core.InvokeLLM({
                    prompt: `Analyze this PCI DSS compliance document and extract:
                    1. Document title and version
                    2. Main compliance requirement(s) covered
                    3. Key policies and procedures
                    4. Technical controls required
                    5. Audit/validation steps
                    6. Roles and responsibilities
                    7. Implementation guidelines
                    
                    Structure the output in a clear, organized format suitable for platform documentation.`,
                    file_urls: [fileUrl],
                    response_json_schema: {
                        type: "object",
                        properties: {
                            document_title: { type: "string" },
                            version: { type: "string" },
                            pci_requirement: { type: "string" },
                            category: { 
                                type: "string",
                                enum: ["security_policy", "technical_control", "audit_procedure", "training", "network_security", "access_control", "data_protection", "monitoring", "testing", "other"]
                            },
                            policies: { type: "array", items: { type: "string" } },
                            technical_controls: { type: "array", items: { type: "string" } },
                            audit_steps: { type: "array", items: { type: "string" } },
                            roles: { type: "array", items: { type: "string" } },
                            implementation_guide: { type: "string" },
                            priority: { 
                                type: "string",
                                enum: ["critical", "high", "medium", "low"]
                            }
                        }
                    }
                });

                // Store in database
                const docRecord = await base44.asServiceRole.entities.PCIDocument.create({
                    batch_name: batch_name || 'PCI Compliance Upload',
                    source_file_url: fileUrl,
                    document_title: analysis.document_title,
                    version: analysis.version,
                    pci_requirement: analysis.pci_requirement,
                    category: analysis.category,
                    policies: analysis.policies,
                    technical_controls: analysis.technical_controls,
                    audit_steps: analysis.audit_steps,
                    roles: analysis.roles,
                    implementation_guide: analysis.implementation_guide,
                    priority: analysis.priority,
                    status: 'processed',
                    processed_by: user.email
                });

                results.push({
                    file_url: fileUrl,
                    success: true,
                    document_id: docRecord.id,
                    title: analysis.document_title,
                    category: analysis.category
                });

                processedCount++;

            } catch (error) {
                console.error(`Error processing ${fileUrl}:`, error);
                results.push({
                    file_url: fileUrl,
                    success: false,
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            total_documents: file_urls.length,
            processed: processedCount,
            failed: file_urls.length - processedCount,
            results: results,
            message: `Processed ${processedCount} of ${file_urls.length} PCI compliance documents`
        });

    } catch (error) {
        console.error('Error in batch processing:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});