import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        // Validate webhook signature
        const signature = req.headers.get('x-webhook-signature');
        const webhookSecret = Deno.env.get('ACQUIRER_WEBHOOK_SECRET');
        
        if (!webhookSecret || signature !== webhookSecret) {
            return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = await req.json();
        const { event_type, data } = payload;

        switch (event_type) {
            case 'transaction.approved':
                await handleTransactionApproved(base44, data);
                break;
            case 'transaction.declined':
                await handleTransactionDeclined(base44, data);
                break;
            case 'settlement.completed':
                await handleSettlement(base44, data);
                break;
            case 'chargeback.created':
                await handleChargeback(base44, data);
                break;
            default:
                console.log('Unhandled event type:', event_type);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Acquirer webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function handleTransactionApproved(base44, data) {
    await base44.asServiceRole.entities.Transaction.create({
        transaction_id: data.transaction_id,
        merchant_id: data.merchant_id,
        merchant_name: data.merchant_name,
        type: data.type || 'sale',
        status: 'approved',
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method,
        card_last_four: data.card_last_four,
        card_brand: data.card_brand,
        auth_code: data.auth_code,
        response_code: data.response_code
    });
}

async function handleTransactionDeclined(base44, data) {
    await base44.asServiceRole.entities.Transaction.create({
        transaction_id: data.transaction_id,
        merchant_id: data.merchant_id,
        type: 'sale',
        status: 'declined',
        amount: data.amount,
        currency: data.currency,
        response_code: data.response_code,
        response_message: data.decline_reason
    });
}

async function handleSettlement(base44, data) {
    await base44.asServiceRole.entities.Settlement.create({
        settlement_id: data.settlement_id,
        merchant_id: data.merchant_id,
        merchant_name: data.merchant_name,
        status: 'completed',
        gross_amount: data.gross_amount,
        fees: data.fees,
        net_amount: data.net_amount,
        currency: data.currency,
        transaction_count: data.transaction_count,
        payout_date: data.payout_date
    });
}

async function handleChargeback(base44, data) {
    await base44.asServiceRole.entities.Chargeback.create({
        chargeback_id: data.chargeback_id,
        transaction_id: data.transaction_id,
        merchant_id: data.merchant_id,
        card_network: data.card_network,
        reason_code: data.reason_code,
        amount: data.amount,
        currency: data.currency,
        status: 'received',
        chargeback_date: new Date().toISOString()
    });
}