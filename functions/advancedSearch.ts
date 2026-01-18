import { query, queryOne, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, search_term, filters } = await req.json();

        if (action === 'searchTransactions') {
            let sql = `SELECT * FROM transaction WHERE psp_code = $1`;
            const params = [psp_code];
            let paramIndex = 2;

            if (search_term) {
                sql += ` AND (transaction_id ILIKE $${paramIndex} OR merchant_transaction_id ILIKE $${paramIndex} OR customer_email ILIKE $${paramIndex})`;
                params.push(`%${search_term}%`);
                paramIndex++;
            }

            if (filters?.status) {
                sql += ` AND status = $${paramIndex}`;
                params.push(filters.status);
                paramIndex++;
            }

            if (filters?.min_amount) {
                sql += ` AND amount >= $${paramIndex}`;
                params.push(filters.min_amount);
                paramIndex++;
            }

            if (filters?.date_from) {
                sql += ` AND created_date >= $${paramIndex}`;
                params.push(filters.date_from);
                paramIndex++;
            }

            sql += ` ORDER BY created_date DESC LIMIT 100`;

            const results = await query(sql, params);

            await closeConnection();
            return Response.json({ success: true, results });
        }

        if (action === 'facetedSearch') {
            const [status_facets, payment_method_facets, amount_ranges] = await Promise.all([
                query(`SELECT status, COUNT(*) as count FROM transaction WHERE psp_code = $1 GROUP BY status`, [psp_code]),
                query(`SELECT payment_method, COUNT(*) as count FROM transaction WHERE psp_code = $1 GROUP BY payment_method`, [psp_code]),
                query(`SELECT 
                        COUNT(CASE WHEN amount < 100 THEN 1 END) as under_100,
                        COUNT(CASE WHEN amount >= 100 AND amount < 1000 THEN 1 END) as 100_to_1k,
                        COUNT(CASE WHEN amount >= 1000 THEN 1 END) as over_1k
                       FROM transaction WHERE psp_code = $1`, [psp_code])
            ]);

            await closeConnection();
            return Response.json({
                success: true,
                facets: {
                    status: status_facets,
                    payment_method: payment_method_facets,
                    amount_ranges: amount_ranges[0]
                }
            });
        }

        if (action === 'fullTextSearch') {
            const results = await query(
                `SELECT * FROM transaction WHERE psp_code = $1 AND (
                    to_tsvector('english', customer_email) @@ plainto_tsquery('english', $2) OR
                    to_tsvector('english', merchant_name) @@ plainto_tsquery('english', $2)
                ) ORDER BY created_date DESC LIMIT 50`,
                [psp_code, search_term]
            );

            await closeConnection();
            return Response.json({ success: true, results });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Search error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});