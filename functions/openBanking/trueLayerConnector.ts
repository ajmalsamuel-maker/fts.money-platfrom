import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { operation, payload, config } = await req.json();

        const clientId = config.client_id;
        const clientSecret = config.client_secret;
        const baseUrl = config.api_base_url || 'https://api.truelayer.com';

        if (!clientId || !clientSecret) {
            return Response.json({ 
                success: false, 
                error: 'TrueLayer credentials not configured' 
            }, { status: 400 });
        }

        // Get access token (simplified - in production, implement token caching)
        const tokenResponse = await fetch(`${baseUrl}/connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: config.scopes?.join(' ') || 'info accounts balance transactions payments'
            })
        });

        if (!tokenResponse.ok) {
            return Response.json({ 
                success: false, 
                error: 'Failed to authenticate with TrueLayer' 
            }, { status: 401 });
        }

        const { access_token } = await tokenResponse.json();

        // Route operations
        let result;
        switch (operation) {
            case 'getAccountBalance':
                result = await getAccountBalance(baseUrl, access_token, payload);
                break;
            
            case 'getTransactionHistory':
                result = await getTransactionHistory(baseUrl, access_token, payload);
                break;
            
            case 'initiatePayment':
                result = await initiatePayment(baseUrl, access_token, payload);
                break;
            
            case 'getAuthUrl':
                result = await getAuthUrl(config, payload);
                break;
            
            default:
                return Response.json({ 
                    success: false, 
                    error: `Operation ${operation} not supported by TrueLayer connector` 
                }, { status: 400 });
        }

        return Response.json(result);

    } catch (error) {
        console.error('TrueLayer Connector Error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

async function getAccountBalance(baseUrl, accessToken, payload) {
    const { account_id } = payload;
    
    const response = await fetch(`${baseUrl}/data/v1/accounts/${account_id}/balance`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.results?.[0] || data,
        provider: 'TrueLayer'
    };
}

async function getTransactionHistory(baseUrl, accessToken, payload) {
    const { account_id, from, to } = payload;
    
    let url = `${baseUrl}/data/v1/accounts/${account_id}/transactions`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.results || [],
        provider: 'TrueLayer'
    };
}

async function initiatePayment(baseUrl, accessToken, payload) {
    const { amount, currency, beneficiary, reference } = payload;
    
    const response = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount_in_minor: Math.round(amount * 100),
            currency: currency || 'GBP',
            payment_method: {
                type: 'bank_transfer',
                provider_selection: {
                    type: 'user_selected'
                },
                beneficiary: beneficiary
            },
            user: {
                id: payload.user_id
            },
            metadata: {
                reference: reference
            }
        })
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data,
        provider: 'TrueLayer'
    };
}

async function getAuthUrl(config, payload) {
    const authUrl = new URL('https://auth.truelayer.com');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', config.client_id);
    authUrl.searchParams.append('redirect_uri', config.redirect_uri || payload.redirect_uri);
    authUrl.searchParams.append('scope', config.scopes?.join(' ') || 'info accounts balance transactions');
    authUrl.searchParams.append('state', payload.state || crypto.randomUUID());
    
    return {
        success: true,
        data: {
            auth_url: authUrl.toString()
        },
        provider: 'TrueLayer'
    };
}