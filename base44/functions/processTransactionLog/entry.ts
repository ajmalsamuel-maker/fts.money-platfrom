import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process uploaded anonymized transaction logs
 * Converts real transaction data into sanitized test datasets
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const { file_url, psp_code, dataset_name } = payload;

        if (!file_url || !psp_code) {
            return Response.json({ error: 'file_url and psp_code required' }, { status: 400 });
        }

        // Fetch the uploaded file
        const fileResponse = await fetch(file_url);
        const fileContent = await fileResponse.text();
        
        let transactions = [];
        
        // Parse CSV or JSON
        if (file_url.endsWith('.csv')) {
            const lines = fileContent.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx]?.trim();
                });
                transactions.push(row);
            }
        } else if (file_url.endsWith('.json')) {
            transactions = JSON.parse(fileContent);
        }

        // Anonymize and sanitize data
        const sanitizedData = transactions.map((txn, idx) => {
            // Mask card numbers (keep first 6 and last 4)
            const cardNumber = txn.card_number || txn.cardNumber || '';
            const maskedCard = cardNumber.length >= 10 
                ? `${cardNumber.substring(0, 6)}${'*'.repeat(cardNumber.length - 10)}${cardNumber.substring(cardNumber.length - 4)}`
                : cardNumber;

            return {
                card_number: maskedCard,
                card_brand: txn.card_brand || txn.cardBrand || 'unknown',
                amount: parseFloat(txn.amount) || 100,
                currency: txn.currency || 'USD',
                status: txn.status || 'approved',
                payment_method: txn.payment_method || txn.paymentMethod || 'card',
                customer_email: `anonymized_${idx + 1}@test.com`,
                anonymized: true,
                source: 'uploaded_log'
            };
        });

        // Create test dataset
        const dataset = await base44.entities.TestDataSet.create({
            psp_code: psp_code,
            dataset_name: dataset_name || `Uploaded Log ${new Date().toISOString()}`,
            dataset_type: 'mixed',
            data: sanitizedData,
            tags: ['uploaded', 'anonymized', 'real-data-based'],
            is_synthetic: false,
            purge_after_test: true
        });

        return Response.json({
            success: true,
            dataset_id: dataset.id,
            records_processed: sanitizedData.length,
            message: `Processed ${sanitizedData.length} transactions from log file`
        });

    } catch (error) {
        console.error('Error processing transaction log:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});