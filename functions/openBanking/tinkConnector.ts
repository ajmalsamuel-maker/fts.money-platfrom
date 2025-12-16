import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { operation, payload, config } = await req.json();

        const clientId = config.client_id;
        const clientSecret = Deno.env.get(config.client_secret_reference || 'TINK_CLIENT_SECRET');
        const baseUrl = config.api_base_url || 'https://api.tink.com';

        if (!clientId || !clientSecret) {
            return Response.json({ 
                success: false, 
                error: 'Tink credentials not configured' 
            }, { status: 400 });
        }

        // Get access token
        const tokenResponse = await fetch(`${baseUrl}/api/v1/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: config.scopes?.join(' ') || 'accounts:read transactions:read payment:write'
            })
        });

        if (!tokenResponse.ok) {
            return Response.json({ 
                success: false, 
                error: 'Failed to authenticate with Tink' 
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
            
            case 'getCategories':
                result = await getCategories(baseUrl, access_token, payload);
                break;
            
            default:
                return Response.json({ 
                    success: false, 
                    error: `Operation ${operation} not supported by Tink connector` 
                }, { status: 400 });
        }

        return Response.json(result);

    } catch (error) {
        console.error('Tink Connector Error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

async function getAccountBalance(baseUrl, accessToken, payload) {
    const { user_id } = payload;
    
    const response = await fetch(`${baseUrl}/data/v2/accounts`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Tink-User-Id': user_id
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.accounts || [],
        provider: 'Tink'
    };
}

async function getTransactionHistory(baseUrl, accessToken, payload) {
    const { user_id, account_id, from, to } = payload;
    
    let url = `${baseUrl}/data/v2/transactions`;
    const params = new URLSearchParams();
    if (account_id) params.append('accountIdIn', account_id);
    if (from) params.append('bookedDateFrom', from);
    if (to) params.append('bookedDateTo', to);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Tink-User-Id': user_id
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.transactions || [],
        provider: 'Tink'
    };
}

async function initiatePayment(baseUrl, accessToken, payload) {
    const { amount, currency, beneficiary, reference, user_id } = payload;
    
    const response = await fetch(`${baseUrl}/api/v1/payments/requests`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Tink-User-Id': user_id
        },
        body: JSON.stringify({
            amount: {
                value: {
                    unscaledValue: Math.round(amount * 100),
                    scale: 2
                },
                currencyCode: currency || 'EUR'
            },
            recipientAccount: beneficiary,
            remittanceInformation: {
                value: reference || 'Payment'
            }
        })
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data,
        provider: 'Tink'
    };
}

async function getAuthUrl(config, payload) {
    const authUrl = new URL(`${config.api_base_url || 'https://link.tink.com'}/1.0/authorize`);
    authUrl.searchParams.append('client_id', config.client_id);
    authUrl.searchParams.append('redirect_uri', config.redirect_uri || payload.redirect_uri);
    authUrl.searchParams.append('scope', config.scopes?.join(',') || 'accounts:read,transactions:read');
    authUrl.searchParams.append('market', payload.market || 'GB');
    authUrl.searchParams.append('locale', payload.locale || 'en_US');
    authUrl.searchParams.append('state', payload.state || crypto.randomUUID());
    
    return {
        success: true,
        data: {
            auth_url: authUrl.toString()
        },
        provider: 'Tink'
    };
}

async function getCategories(baseUrl, accessToken, payload) {
    const { user_id } = payload;
    
    const response = await fetch(`${baseUrl}/data/v2/categories`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Tink-User-Id': user_id
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.categories || [],
        provider: 'Tink'
    };
}