import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { operation, payload, config } = await req.json();

        const apiKey = Deno.env.get(config.api_key_reference || 'BRANKAS_API_KEY');
        const baseUrl = config.api_base_url || 'https://api.brankas.com';

        if (!apiKey) {
            return Response.json({ 
                success: false, 
                error: 'Brankas API key not configured' 
            }, { status: 400 });
        }

        // Route operations
        let result;
        switch (operation) {
            case 'getAccountBalance':
                result = await getAccountBalance(baseUrl, apiKey, payload);
                break;
            
            case 'getTransactionHistory':
                result = await getTransactionHistory(baseUrl, apiKey, payload);
                break;
            
            case 'initiatePayment':
                result = await initiatePayment(baseUrl, apiKey, payload);
                break;
            
            case 'getAuthUrl':
                result = await getAuthUrl(config, payload);
                break;
            
            case 'getBanks':
                result = await getBanks(baseUrl, apiKey, payload);
                break;
            
            default:
                return Response.json({ 
                    success: false, 
                    error: `Operation ${operation} not supported by Brankas connector` 
                }, { status: 400 });
        }

        return Response.json(result);

    } catch (error) {
        console.error('Brankas Connector Error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

async function getAccountBalance(baseUrl, apiKey, payload) {
    const { account_id, bank_code, country } = payload;
    
    const response = await fetch(`${baseUrl}/v1/${country || 'ph'}/accounts/${account_id}/balance`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Bank-Code': bank_code
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data,
        provider: 'Brankas'
    };
}

async function getTransactionHistory(baseUrl, apiKey, payload) {
    const { account_id, bank_code, country, from, to } = payload;
    
    let url = `${baseUrl}/v1/${country || 'ph'}/accounts/${account_id}/transactions`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Bank-Code': bank_code
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.transactions || [],
        provider: 'Brankas'
    };
}

async function initiatePayment(baseUrl, apiKey, payload) {
    const { amount, currency, beneficiary, reference, bank_code, country } = payload;
    
    const response = await fetch(`${baseUrl}/v1/${country || 'ph'}/payments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-Bank-Code': bank_code
        },
        body: JSON.stringify({
            amount: amount,
            currency: currency || 'PHP',
            beneficiary: beneficiary,
            reference: reference || 'Payment',
            payment_method: 'direct_debit'
        })
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data,
        provider: 'Brankas'
    };
}

async function getAuthUrl(config, payload) {
    const { country, bank_code } = payload;
    const authUrl = new URL(`${config.api_base_url || 'https://api.brankas.com'}/v1/${country || 'ph'}/auth`);
    authUrl.searchParams.append('client_id', config.client_id);
    authUrl.searchParams.append('redirect_uri', config.redirect_uri || payload.redirect_uri);
    authUrl.searchParams.append('bank_code', bank_code);
    authUrl.searchParams.append('state', payload.state || crypto.randomUUID());
    
    return {
        success: true,
        data: {
            auth_url: authUrl.toString()
        },
        provider: 'Brankas'
    };
}

async function getBanks(baseUrl, apiKey, payload) {
    const { country } = payload;
    
    const response = await fetch(`${baseUrl}/v1/${country || 'ph'}/banks`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    const data = await response.json();
    
    return {
        success: response.ok,
        data: data.banks || [],
        provider: 'Brankas'
    };
}