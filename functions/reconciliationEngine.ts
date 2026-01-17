import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Reconciliation Engine
 * Matches bank files to transactions
 * Detects discrepancies
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { batch_id, bank_items } = await req.json();

        console.log(`🔍 Reconciliation: Processing batch ${batch_id}`);

        const batch = (await base44.asServiceRole.entities.ReconciliationBatch.filter({
            batch_id
        }))?.[0];

        if (!batch) {
            return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
        }

        // Get internal transaction records
        const internalItems = await base44.asServiceRole.entities.ReconciliationItem.filter({
            reconciliation_batch_id: batch.id,
            status: 'pending'
        });

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
                await base44.asServiceRole.entities.ReconciliationItem.update(bestMatch.id, {
                    bank_reference: bankItem.reference,
                    posted_date: bankItem.date,
                    status: 'matched',
                    match_type: bestScore > 90 ? 'exact' : 'fuzzy',
                    confidence_score: Math.min(bestScore / 100, 1)
                });

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

        await base44.asServiceRole.entities.ReconciliationBatch.update(batch.id, {
            reconciliation_status: status,
            discrepancy_amount: totalDiscrepancy,
            discrepancy_notes: discrepancies.length > 0 ? JSON.stringify(discrepancies) : null
        });

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
        console.error('Reconciliation error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});