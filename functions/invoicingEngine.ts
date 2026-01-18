import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, invoice_id, period_start, period_end } = await req.json();

        if (action === 'generateInvoice') {
            const invoiceNum = `INV-${Date.now()}`;

            // Get transactions for period
            const transactions = await query(
                `SELECT * FROM transaction WHERE merchant_id = $1 AND created_date >= $2 AND created_date <= $3`,
                [merchant_id, period_start, period_end]
            );

            const gross = transactions.reduce((sum, t) => sum + t.amount, 0);
            const fees = transactions.reduce((sum, t) => sum + (t.fee || 0), 0);

            // Create invoice
            await execute(
                `INSERT INTO invoice (invoice_number, merchant_id, psp_code, period_start, period_end, total_amount, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [invoiceNum, merchant_id, psp_code, period_start, period_end, gross - fees, 'draft']
            );

            // Add line items
            const fees_line = await queryOne(
                `INSERT INTO invoice_line_item (invoice_number, description, amount, quantity, unit_price)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [invoiceNum, 'Processing Fees', fees, 1, fees]
            );

            await closeConnection();
            return Response.json({ success: true, invoice_number: invoiceNum });
        }

        if (action === 'finalizeInvoice') {
            await execute(
                `UPDATE invoice SET status = 'issued' WHERE invoice_number = $1`,
                [invoice_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'listInvoices') {
            const invoices = await query(
                `SELECT * FROM invoice WHERE merchant_id = $1 AND psp_code = $2 ORDER BY created_date DESC`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, invoices });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Invoicing error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});