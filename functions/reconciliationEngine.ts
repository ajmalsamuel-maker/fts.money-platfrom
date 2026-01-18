import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

/**
 * Reconciliation Engine
 * Matches bank files to transactions
 * Detects discrepancies
 */
Deno.serve(async (req) => {
    try {
        const { batch_id, bank_items } = await req.json();

        console.log(`🔍 Reconciliation: Processing batch ${batch_id}`);

        const batch = await queryOne(
            `SELECT * FROM reconciliation_batch WHERE batch_id = $1`,
            [batch_id]
        );

        if (!batch) {
            await closeConnection();
            return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
        }

        // Get internal transaction records
        const internalItems = await query(
            `SELECT * FROM reconciliation_item WHERE transaction_id IN (SELECT id FROM transaction WHERE batch_id = $1) AND status = 'pending'`,
            [batch_id]
        );

        let matched = 0;
        let unmatched = 0;
        const discrepancies = [];

        // Match each bank item to internal record
        for (const bankItem of bank_items) {
            let bestMatch = null;
            let bestScore = 0;

            // Find best matching internal item
            for (const internalItem of internalItems) {
                let score = 0;

                // Exact amount match
                if (bankItem.amount === internalItem.amount) {
                    score += 50;
                }

                // Amount within 1%
                if (Math.abs(bankItem.amount - internalItem.amount) / internalItem.amount < 0.01) {
                    score += 30;
                }

                // Date match
                if (bankItem.date === internalItem.posted_date) {
                    score += 30;
                }

                // Reference/ID match
                if (bankItem.reference && internalItem.bank_reference === bankItem.reference) {
                    score += 20;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = internalItem;
                }
            }

            if (bestMatch && bestScore > 50) {
                // Good match
                await execute(
                    `UPDATE reconciliation_item SET bank_reference = $1, posted_date = $2, status = 'matched', match_type = $3, confidence_score = $4 WHERE id = $5`,
                    [bankItem.reference, bankItem.date, bestScore > 90 ? 'exact' : 'fuzzy', Math.min(bestScore / 100, 1), bestMatch.id]
                );

                matched++;
                console.log(`✓ Matched: ${bankItem.reference} - ${bankItem.amount}`);
            } else {
                // No match found
                unmatched++;
                discrepancies.push({
                    type: 'missing_internal',
                    bank_item: bankItem.reference,
                    amount: bankItem.amount
                });

                console.log(`❌ Unmatched bank item: ${bankItem.reference}`);
            }
        }

        // Check for internal items not matched to bank
        for (const internalItem of internalItems) {
            const foundMatch = bank_items.some(bi => bi.reference === internalItem.bank_reference);
            if (!foundMatch) {
                discrepancies.push({
                    type: 'missing_bank',
                    internal_id: internalItem.transaction_id,
                    amount: internalItem.amount
                });
            }
        }

        // Update batch status
        const status = discrepancies.length === 0 ? 'reconciled' : 'discrepancy';
        const totalDiscrepancy = discrepancies.reduce((sum, d) => sum + d.amount, 0);

        await execute(
            `UPDATE reconciliation_batch SET reconciliation_status = $1, discrepancy_amount = $2, discrepancy_notes = $3 WHERE id = $4`,
            [status, totalDiscrepancy, discrepancies.length > 0 ? JSON.stringify(discrepancies) : null, batch.id]
        );

        await closeConnection();
        console.log(`📊 Reconciliation complete: ${matched} matched, ${unmatched} unmatched, ${discrepancies.length} discrepancies`);

        return Response.json({
            success: true,
            batch_id,
            matched,
            unmatched,
            discrepancies,
            status,
            total_discrepancy: totalDiscrepancy
        });

    } catch (error) {
        await closeConnection();
        console.error('Reconciliation error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});