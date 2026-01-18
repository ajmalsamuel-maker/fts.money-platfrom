import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, card_data, amount, currency } = await req.json();

        if (action === 'processManualEntry') {
            const txnId = `VT-${Date.now()}`;

            // Tokenize card
            const token = await tokenizeCard(card_data);

            // Create transaction
            await execute(
                `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, currency, payment_method, card_last_four, status, type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [txnId, merchant_id, psp_code, amount, currency || 'USD', 'card', card_data.card_number.slice(-4), 'processing', 'sale']
            );

            // Score transaction
            const riskScore = await calculateRiskScore({ amount, payment_method: 'card_manual' });

            if (riskScore < 60) {
                await execute(
                    `UPDATE transaction SET status = 'approved' WHERE transaction_id = $1`,
                    [txnId]
                );
            }

            await closeConnection();
            return Response.json({ success: true, transaction_id: txnId, token });
        }

        if (action === 'getTerminalConfig') {
            const config = await queryOne(
                `SELECT * FROM merchant_checkout_config WHERE merchant_id = $1`,
                [merchant_id]
            );

            await closeConnection();
            return Response.json({ success: true, config });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Virtual terminal error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function tokenizeCard(cardData) {
    return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function calculateRiskScore(data) {
    // Basic risk calculation
    return data.amount > 5000 ? 45 : 20;
}