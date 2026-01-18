import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, transaction_id, card_data } = await req.json();

        if (action === 'initiate3DS') {
            const challenge_id = `3DS-${Date.now()}`;
            
            await execute(
                `INSERT INTO three_ds_challenge (challenge_id, transaction_id, psp_code, status, created_date)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [challenge_id, transaction_id, psp_code, 'initiated']
            );

            await closeConnection();
            return Response.json({
                success: true,
                challenge_id,
                acs_url: 'https://acs.bank.com/acs',
                pareq: 'mock_pareq_token'
            });
        }

        if (action === 'generateOTP') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            await execute(
                `INSERT INTO otp (otp_code, merchant_id, psp_code, status, expires_at)
                 VALUES ($1, $2, $3, $4, NOW() + INTERVAL '10 minutes')`,
                [otp, merchant_id, psp_code, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, otp_sent: true });
        }

        if (action === 'verifyOTP') {
            const otp_record = await queryOne(
                `SELECT * FROM otp WHERE otp_code = $1 AND merchant_id = $2 AND status = 'active' AND expires_at > NOW()`,
                [req.json().otp, merchant_id]
            );

            if (!otp_record) {
                await closeConnection();
                return Response.json({ success: false, verified: false }, { status: 400 });
            }

            await execute(
                `UPDATE otp SET status = 'used' WHERE otp_code = $1`,
                [req.json().otp]
            );

            await closeConnection();
            return Response.json({ success: true, verified: true });
        }

        if (action === 'completeChallenges') {
            const challenge = await queryOne(
                `SELECT * FROM three_ds_challenge WHERE challenge_id = $1`,
                [req.json().challenge_id]
            );

            await execute(
                `UPDATE three_ds_challenge SET status = 'authenticated', authenticated_at = NOW() WHERE challenge_id = $1`,
                [req.json().challenge_id]
            );

            await closeConnection();
            return Response.json({ success: true, authenticated: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('3DS error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});