import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Card Tokenization Function
 * Integrates with Spreedly and Basis Theory for EMV payment tokenization
 * Supports both providers with fallback logic
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            merchant_id, 
            customer_email, 
            customer_name,
            card_number, 
            expiry_month, 
            expiry_year, 
            cvv,
            billing_address,
            token_type = 'multi_use'
        } = await req.json();

        // Validate required fields
        if (!merchant_id || !customer_email || !card_number || !expiry_month || !expiry_year) {
            return Response.json({ 
                error: 'Missing required fields: merchant_id, customer_email, card_number, expiry_month, expiry_year' 
            }, { status: 400 });
        }

        const provider = Deno.env.get('TOKENIZATION_PROVIDER') || 'spreedly';
        const apiKey = Deno.env.get('TOKENIZATION_API_KEY');
        const environmentKey = Deno.env.get('TOKENIZATION_ENVIRONMENT_KEY');

        if (!apiKey) {
            return Response.json({ error: 'Tokenization provider not configured' }, { status: 500 });
        }

        let tokenResult;

        if (provider === 'spreedly') {
            // Spreedly Tokenization
            const spreedlyResponse = await fetch('https://core.spreedly.com/v1/payment_methods.json', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${environmentKey}:${apiKey}`)}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_method: {
                        credit_card: {
                            number: card_number,
                            month: expiry_month,
                            year: expiry_year,
                            verification_value: cvv,
                            first_name: customer_name?.split(' ')[0],
                            last_name: customer_name?.split(' ').slice(1).join(' '),
                            email: customer_email,
                            address_1: billing_address?.street,
                            city: billing_address?.city,
                            state: billing_address?.state,
                            zip: billing_address?.postal_code,
                            country: billing_address?.country
                        },
                        retained: token_type !== 'single_use'
                    }
                })
            });

            if (!spreedlyResponse.ok) {
                const error = await spreedlyResponse.json();
                return Response.json({ 
                    error: 'Spreedly tokenization failed', 
                    details: error 
                }, { status: 500 });
            }

            const spreedlyData = await spreedlyResponse.json();
            const paymentMethod = spreedlyData.transaction?.payment_method;

            tokenResult = {
                token: paymentMethod.token,
                card_brand: paymentMethod.card_type.toLowerCase(),
                card_last_four: paymentMethod.last_four_digits,
                card_bin: paymentMethod.first_six_digits,
                fingerprint: paymentMethod.fingerprint,
                token_provider: 'spreedly',
                metadata: {
                    payment_method_type: paymentMethod.payment_method_type,
                    storage_state: paymentMethod.storage_state
                }
            };

        } else if (provider === 'basistheory') {
            // Basis Theory Tokenization
            const basisTheoryResponse = await fetch('https://api.basistheory.com/tokens', {
                method: 'POST',
                headers: {
                    'BT-API-KEY': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'card',
                    data: {
                        number: card_number,
                        expiration_month: expiry_month,
                        expiration_year: expiry_year,
                        cvc: cvv
                    },
                    metadata: {
                        customer_email: customer_email,
                        customer_name: customer_name,
                        merchant_id: merchant_id
                    },
                    search_indexes: [customer_email],
                    fingerprint_expression: '{{ data.number }}',
                    mask: {
                        number: '{{ data.number | reveal_last: 4 }}',
                        expiration_month: '{{ data.expiration_month }}',
                        expiration_year: '{{ data.expiration_year }}'
                    },
                    deduplication: true
                })
            });

            if (!basisTheoryResponse.ok) {
                const error = await basisTheoryResponse.json();
                return Response.json({ 
                    error: 'Basis Theory tokenization failed', 
                    details: error 
                }, { status: 500 });
            }

            const basisTheoryData = await basisTheoryResponse.json();

            tokenResult = {
                token: basisTheoryData.id,
                card_brand: basisTheoryData.data?.brand?.toLowerCase() || 'unknown',
                card_last_four: basisTheoryData.data?.number,
                card_bin: basisTheoryData.data?.bin,
                fingerprint: basisTheoryData.fingerprint,
                token_provider: 'basistheory',
                metadata: {
                    token_type: basisTheoryData.type,
                    created_at: basisTheoryData.created_at
                }
            };
        } else {
            return Response.json({ error: 'Invalid tokenization provider' }, { status: 500 });
        }

        // Store tokenized card in database
        const tokenizedCard = await base44.asServiceRole.entities.TokenizedCard.create({
            merchant_id,
            customer_email,
            customer_name,
            token: tokenResult.token,
            token_provider: tokenResult.token_provider,
            token_type,
            card_brand: tokenResult.card_brand,
            card_last_four: tokenResult.card_last_four,
            card_bin: tokenResult.card_bin,
            expiry_month,
            expiry_year,
            billing_address,
            fingerprint: tokenResult.fingerprint,
            status: 'active',
            metadata: tokenResult.metadata
        });

        // Audit log for tokenization
        await base44.asServiceRole.entities.AuditLog.create({
            event_type: 'token_created',
            category: 'security',
            severity: 'info',
            user_id: user.id,
            user_email: user.email,
            target_entity: 'TokenizedCard',
            target_id: tokenizedCard.id,
            action: 'tokenize_card',
            description: `Card tokenized for customer ${customer_email} using ${provider}`,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            pci_relevant: true,
            retention_period: '7_years',
            metadata: {
                merchant_id,
                card_brand: tokenResult.card_brand,
                card_last_four: tokenResult.card_last_four
            }
        });

        return Response.json({
            success: true,
            tokenized_card: {
                id: tokenizedCard.id,
                token: tokenizedCard.token,
                card_brand: tokenizedCard.card_brand,
                card_last_four: tokenizedCard.card_last_four,
                token_provider: tokenizedCard.token_provider
            }
        });

    } catch (error) {
        console.error('Tokenization error:', error);
        return Response.json({ 
            error: 'Failed to tokenize card', 
            details: error.message 
        }, { status: 500 });
    }
});