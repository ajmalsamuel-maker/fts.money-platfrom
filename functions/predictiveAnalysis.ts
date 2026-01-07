import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch historical data
        const [requirements, findings, controls] = await Promise.all([
            base44.asServiceRole.entities.PCIRequirement.list(),
            base44.asServiceRole.entities.PCIFinding.list(),
            base44.asServiceRole.entities.PCIControl.list()
        ]);

        // Calculate current compliance score
        const totalReqs = requirements.length;
        const completedReqs = requirements.filter(r => r.compliance_status === 'completed').length;
        const currentScore = (completedReqs / totalReqs) * 100;

        // Analyze trends
        const openFindings = findings.filter(f => f.status === 'open').length;
        const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
        const failedControls = controls.filter(c => c.test_result === 'failed').length;

        // Generate predictions using AI
        const prompt = `You are a PCI DSS compliance analyst. Based on the following data, generate predictions:

Current Compliance Score: ${currentScore.toFixed(1)}%
Open Findings: ${openFindings} (${criticalFindings} critical)
Failed Controls: ${failedControls}
Total Requirements: ${totalReqs}

Generate 5 predictions:
1. Predicted compliance score in 30 days
2. Estimated time to full compliance
3. Risk of audit failure
4. Likelihood of new critical findings
5. Audit readiness assessment

Provide confidence scores (0-100) and specific recommendations for each.`;

        const aiAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    compliance_forecast: {
                        type: "object",
                        properties: {
                            predicted_score: { type: "number" },
                            confidence: { type: "number" },
                            recommendations: { type: "array", items: { type: "string" } }
                        }
                    },
                    time_to_compliance: {
                        type: "object",
                        properties: {
                            estimated_days: { type: "number" },
                            confidence: { type: "number" },
                            blockers: { type: "array", items: { type: "string" } }
                        }
                    },
                    audit_risk: {
                        type: "object",
                        properties: {
                            risk_level: { type: "string" },
                            probability: { type: "number" },
                            mitigation_steps: { type: "array", items: { type: "string" } }
                        }
                    },
                    finding_forecast: {
                        type: "object",
                        properties: {
                            predicted_critical_findings: { type: "number" },
                            confidence: { type: "number" },
                            high_risk_areas: { type: "array", items: { type: "string" } }
                        }
                    },
                    audit_readiness: {
                        type: "object",
                        properties: {
                            readiness_score: { type: "number" },
                            confidence: { type: "number" },
                            gaps: { type: "array", items: { type: "string" } }
                        }
                    }
                }
            }
        });

        // Store predictions in database
        const predictions = [];

        // Compliance Score Prediction
        predictions.push(await base44.asServiceRole.entities.PCIPredictiveAnalytics.create({
            prediction_type: 'compliance_score',
            prediction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidence_score: aiAnalysis.compliance_forecast.confidence,
            predicted_value: `${aiAnalysis.compliance_forecast.predicted_score}%`,
            current_value: `${currentScore.toFixed(1)}%`,
            risk_level: aiAnalysis.compliance_forecast.predicted_score > 90 ? 'low' : 'medium',
            recommendations: aiAnalysis.compliance_forecast.recommendations,
            historical_data: { current_score: currentScore, open_findings: openFindings }
        }));

        // Audit Risk Prediction
        predictions.push(await base44.asServiceRole.entities.PCIPredictiveAnalytics.create({
            prediction_type: 'audit_readiness',
            prediction_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidence_score: aiAnalysis.audit_readiness.confidence,
            predicted_value: `${aiAnalysis.audit_readiness.readiness_score}% ready`,
            current_value: `${currentScore.toFixed(1)}%`,
            risk_level: aiAnalysis.audit_risk.risk_level,
            recommendations: aiAnalysis.audit_risk.mitigation_steps,
            historical_data: { failed_controls: failedControls, critical_findings: criticalFindings }
        }));

        return Response.json({
            success: true,
            current_state: {
                compliance_score: currentScore,
                open_findings: openFindings,
                critical_findings: criticalFindings,
                failed_controls: failedControls
            },
            predictions: aiAnalysis,
            stored_predictions: predictions.length
        });

    } catch (error) {
        console.error('Prediction error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});