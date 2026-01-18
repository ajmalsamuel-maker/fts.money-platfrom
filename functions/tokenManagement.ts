import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, card_data, token } = await req.json();

        if (action === 'tokenizeCard') {
            const token_id = `TOKEN-${Date.now()}`;
            
            await execute(
                `INSERT INTO tokenized_card (token_id, merchant_id, psp_code, card_last_four, card_brand, status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [token_id, merchant_id, psp_code, card_data.last_four, card_data.brand, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, token: token_id });
        }

        if (action === 'detokenize') {
            await execute(
                `UPDATE tokenized_card SET status = 'revoked', revoked_at = NOW() WHERE token_id = $1`,
                [token]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'getToken') {
            const token_record = await queryOne(
                `SELECT * FROM tokenized_card WHERE token_id = $1 AND status = 'active'`,
                [token]
            );

            await closeConnection();
            return Response.json({ success: true, token: token_record });
        }

        if (action === 'requestNetworkToken') {
            const net_token = `NETTOKEN-${Date.now()}`;
            
            await execute(
                `INSERT INTO network_token (network_token, tokenized_card_id, status, network)
                 VALUES ($1, $2, $3, $4)`,
                [net_token, token, 'pending', 'visa']
            );

            await closeConnection();
            return Response.json({ success: true, network_token: net_token });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Token management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});