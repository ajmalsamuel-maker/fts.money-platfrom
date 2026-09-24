import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, step, data } = await req.json();

        if (action === 'initiate') {
            const workflowId = `OBW-${Date.now()}`;
            await execute(
                `INSERT INTO merchant_onboarding_workflow (workflow_id, merchant_id, psp_code, current_step, status)
                 VALUES ($1, $2, $3, $4, $5)`,
                [workflowId, merchant_id, psp_code, 'kyb_verification', 'in_progress']
            );

            await closeConnection();
            return Response.json({ success: true, workflow_id: workflowId });
        }

        if (action === 'completeStep') {
            const workflow = await queryOne(
                `SELECT * FROM merchant_onboarding_workflow WHERE merchant_id = $1`,
                [merchant_id]
            );

            if (!workflow) {
                await closeConnection();
                return Response.json({ error: 'Workflow not found' }, { status: 404 });
            }

            // Store step data
            await execute(
                `INSERT INTO workflow_execution (workflow_id, step, status, data, psp_code)
                 VALUES ($1, $2, $3, $4, $5)`,
                [workflow.workflow_id, step, 'completed', JSON.stringify(data), psp_code]
            );

            // Determine next step
            const nextStep = getNextStep(step);
            const isComplete = nextStep === null;

            await execute(
                `UPDATE merchant_onboarding_workflow SET current_step = $1, status = $2, updated_date = NOW() WHERE id = $3`,
                [nextStep || 'complete', isComplete ? 'completed' : 'in_progress', workflow.id]
            );

            if (isComplete) {
                await execute(
                    `UPDATE merchant SET status = 'approved', updated_date = NOW() WHERE id = $1`,
                    [merchant_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, next_step: nextStep, workflow_complete: isComplete });
        }

        if (action === 'getStatus') {
            const workflow = await queryOne(
                `SELECT * FROM merchant_onboarding_workflow WHERE merchant_id = $1`,
                [merchant_id]
            );

            await closeConnection();
            return Response.json({ success: true, workflow });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Onboarding error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getNextStep(currentStep) {
    const steps = ['kyb_verification', 'aml_screening', 'document_upload', 'bank_details', 'review'];
    const nextIndex = steps.indexOf(currentStep) + 1;
    return nextIndex < steps.length ? steps[nextIndex] : null;
}