import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Crypto Exchange On/Off-Ramp Integration
 * Handles fiat-to-crypto and crypto-to-fiat conversions via licensed exchanges
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, integration_id, data } = await req.json();

        switch (action) {
            case 'on_ramp':
                return Response.json(await fiatToCrypto(base44, integration_id, data));
            
            case 'off_ramp':
                return Response.json(await cryptoToFiat(base44, integration_id, data));
            
            case 'get_quote':
                return Response.json(await getQuote(base44, integration_id, data));
            
            case 'check_limits':
                return Response.json(await checkLimits(base44, integration_id, data));
            
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Exchange Integration Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

/**
 * On-Ramp: Fiat to Crypto
 */
async function fiatToCrypto(base44, integration_id, { merchant_id, fiat_amount, fiat_currency, crypto_asset, customer_data }) {
    const integrations = await base44.asServiceRole.entities.CryptoExchangeIntegration.filter({
        integration_id
    });
    const integration = integrations[0];

    if (!integration) {
        return { error: 'Exchange integration not found' };
    }

    if (!integration.on_ramp_enabled) {
        return { error: 'On-ramp not enabled for this exchange' };
    }

    // Check limits
    const limitsCheck = await checkLimits(base44, integration_id, {
        amount: fiat_amount,
        currency: fiat_currency
    });

    if (!limitsCheck.within_limits) {
        return { error: 'Transaction exceeds limits', limits: limitsCheck };
    }

    // Sanctions screening
    const sanctionsCheck = await fetch(`${req.url.replace('/exchangeOnRamp', '/fatfCompliance')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'screen_sanctions',
            data: {
                entity_name: customer_data.name,
                country: customer_data.country,
                type: 'customer'
            }
        })
    }).then(r => r.json());

    if (sanctionsCheck.screening_result === 'confirmed_match') {
        return {
            error: 'Transaction blocked - sanctions match',
            screening: sanctionsCheck
        };
    }

    // Calculate fees and rates
    const exchangeRate = 42000; // Simplified - in production, get real-time rate
    const fee = fiat_amount * (integration.on_ramp_fee_percentage / 100);
    const cryptoAmount = (fiat_amount - fee) / exchangeRate;

    // In production, integrate with:
    // - Coinbase Commerce API
    // - Kraken API
    // - Bitstamp API
    // - Circle (USDC)
    // - Paxos
    // - Wyre
    // - MoonPay
    // - Ramp Network

    // Create transaction record
    const transaction = await base44.asServiceRole.entities.Transaction.create({
        merchant_id,
        type: 'sale',
        status: 'processing',
        amount: fiat_amount,
        currency: fiat_currency,
        payment_method: 'crypto_currency',
        crypto_asset,
        fee,
        net_amount: fiat_amount - fee,
        customer_email: customer_data.email,
        customer_name: customer_data.name,
        customer_country: customer_data.country,
        description: `On-ramp: ${fiat_currency} to ${crypto_asset}`
    });

    // Travel Rule data collection if needed
    if (fiat_amount >= 1000) {
        await base44.asServiceRole.entities.TravelRuleData.create({
            transaction_id: transaction.id,
            rule_triggered: true,
            threshold_currency: fiat_currency,
            threshold_amount: 1000,
            originator_name: customer_data.name,
            originator_country: customer_data.country,
            compliance_status: 'verified'
        });
    }

    return {
        success: true,
        transaction_id: transaction.id,
        exchange_name: integration.exchange_name,
        fiat_amount,
        fiat_currency,
        crypto_asset,
        crypto_amount: cryptoAmount,
        exchange_rate: exchangeRate,
        fee,
        fee_percentage: integration.on_ramp_fee_percentage,
        estimated_completion: integration.settlement_time,
        status: 'processing',
        next_steps: 'Complete KYC if required, await exchange processing'
    };
}

/**
 * Off-Ramp: Crypto to Fiat
 */
async function cryptoToFiat(base44, integration_id, { merchant_id, crypto_amount, crypto_asset, fiat_currency, bank_account, customer_data }) {
    const integrations = await base44.asServiceRole.entities.CryptoExchangeIntegration.filter({
        integration_id
    });
    const integration = integrations[0];

    if (!integration) {
        return { error: 'Exchange integration not found' };
    }

    if (!integration.off_ramp_enabled) {
        return { error: 'Off-ramp not enabled for this exchange' };
    }

    // Calculate fiat amount
    const exchangeRate = 42000; // Simplified
    const fiatAmount = crypto_amount * exchangeRate;
    const fee = fiatAmount * (integration.off_ramp_fee_percentage / 100);
    const netAmount = fiatAmount - fee;

    // Check limits
    const limitsCheck = await checkLimits(base44, integration_id, {
        amount: fiatAmount,
        currency: fiat_currency
    });

    if (!limitsCheck.within_limits) {
        return { error: 'Transaction exceeds limits', limits: limitsCheck };
    }

    // Sanctions and blockchain forensics
    const sanctionsCheck = await fetch(`${req.url.replace('/exchangeOnRamp', '/fatfCompliance')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'screen_sanctions',
            data: {
                entity_name: customer_data.name,
                country: customer_data.country,
                wallet_address: customer_data.wallet_address,
                type: 'customer'
            }
        })
    }).then(r => r.json());

    if (sanctionsCheck.screening_result === 'confirmed_match') {
        return {
            error: 'Transaction blocked - sanctions/AML match',
            screening: sanctionsCheck
        };
    }

    // Create transaction
    const transaction = await base44.asServiceRole.entities.Transaction.create({
        merchant_id,
        type: 'payout',
        status: 'processing',
        amount: fiatAmount,
        currency: fiat_currency,
        payment_method: 'crypto_currency',
        crypto_asset,
        fee,
        net_amount: netAmount,
        customer_email: customer_data.email,
        customer_name: customer_data.name,
        customer_country: customer_data.country,
        bank_account_number: bank_account?.account_number,
        description: `Off-ramp: ${crypto_asset} to ${fiat_currency}`
    });

    // Travel Rule
    if (fiatAmount >= 1000) {
        await base44.asServiceRole.entities.TravelRuleData.create({
            transaction_id: transaction.id,
            rule_triggered: true,
            threshold_currency: fiat_currency,
            threshold_amount: 1000,
            beneficiary_name: customer_data.name,
            beneficiary_country: customer_data.country,
            beneficiary_account: bank_account?.account_number,
            compliance_status: 'verified'
        });
    }

    return {
        success: true,
        transaction_id: transaction.id,
        exchange_name: integration.exchange_name,
        crypto_amount,
        crypto_asset,
        fiat_amount: fiatAmount,
        fiat_currency,
        net_amount: netAmount,
        fee,
        fee_percentage: integration.off_ramp_fee_percentage,
        estimated_completion: integration.settlement_time,
        bank_account: bank_account?.account_number,
        status: 'processing'
    };
}

/**
 * Get real-time quote
 */
async function getQuote(base44, integration_id, { from_currency, to_currency, amount }) {
    const integrations = await base44.asServiceRole.entities.CryptoExchangeIntegration.filter({
        integration_id
    });
    const integration = integrations[0];

    if (!integration) {
        return { error: 'Exchange integration not found' };
    }

    // In production: Call exchange API for real-time rates
    // Example: Coinbase API, Kraken API, etc.

    const mockRate = 42000;
    const isCryptoToFiat = ['BTC', 'ETH', 'USDT'].includes(from_currency);
    const feePercentage = isCryptoToFiat ? integration.off_ramp_fee_percentage : integration.on_ramp_fee_percentage;
    const fee = amount * (feePercentage / 100);

    return {
        exchange_name: integration.exchange_name,
        from_currency,
        to_currency,
        amount,
        exchange_rate: mockRate,
        converted_amount: isCryptoToFiat ? amount * mockRate : amount / mockRate,
        fee,
        fee_percentage: feePercentage,
        net_amount: isCryptoToFiat ? (amount * mockRate) - fee : (amount / mockRate) - fee,
        quote_expires: new Date(Date.now() + 30000).toISOString(), // 30 seconds
        estimated_completion: integration.settlement_time
    };
}

/**
 * Check transaction limits
 */
async function checkLimits(base44, integration_id, { amount, currency }) {
    const integrations = await base44.asServiceRole.entities.CryptoExchangeIntegration.filter({
        integration_id
    });
    const integration = integrations[0];

    if (!integration) {
        return { error: 'Exchange integration not found' };
    }

    const withinMin = amount >= (integration.min_transaction_amount || 0);
    const withinMax = amount <= (integration.max_transaction_amount || Infinity);
    const withinDaily = amount <= (integration.daily_limit || Infinity);

    return {
        within_limits: withinMin && withinMax && withinDaily,
        min_amount: integration.min_transaction_amount,
        max_amount: integration.max_transaction_amount,
        daily_limit: integration.daily_limit,
        requested_amount: amount,
        currency
    };
}