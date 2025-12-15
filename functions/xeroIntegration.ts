import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';
const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, code, psp_id, refresh_token, endpoint, method = 'GET', data } = await req.json();
        
        const clientId = Deno.env.get('XERO_CLIENT_ID');
        const clientSecret = Deno.env.get('XERO_CLIENT_SECRET');
        const redirectUri = `${new URL(req.url).origin}/xero-callback`;

        // Generate OAuth authorization URL
        if (action === 'get_auth_url') {
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: clientId,
                redirect_uri: redirectUri,
                scope: 'offline_access accounting.transactions accounting.contacts accounting.settings openid profile email',
                state: psp_id || user.email
            });
            
            return Response.json({ 
                auth_url: `${XERO_AUTH_URL}?${params.toString()}` 
            });
        }

        // Exchange code for tokens
        if (action === 'exchange_code') {
            const tokenResponse = await fetch(XERO_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirectUri
                })
            });

            if (!tokenResponse.ok) {
                const error = await tokenResponse.text();
                return Response.json({ error: `Token exchange failed: ${error}` }, { status: 400 });
            }

            const tokens = await tokenResponse.json();

            // Get tenant/organization info
            const connectionsResponse = await fetch(XERO_CONNECTIONS_URL, {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            const connections = await connectionsResponse.json();

            // Store tokens in PSPSettings
            if (psp_id) {
                const settings = await base44.asServiceRole.entities.PSPSettings.filter({ psp_id });
                const xeroConfig = {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
                    tenant_id: connections[0]?.tenantId,
                    tenant_name: connections[0]?.tenantName,
                    connected_at: new Date().toISOString()
                };

                if (settings.length > 0) {
                    await base44.asServiceRole.entities.PSPSettings.update(settings[0].id, {
                        xero_config: xeroConfig
                    });
                } else {
                    await base44.asServiceRole.entities.PSPSettings.create({
                        psp_id,
                        xero_config: xeroConfig
                    });
                }
            }

            return Response.json({ 
                success: true, 
                tokens,
                connections 
            });
        }

        // Refresh access token
        if (action === 'refresh_token') {
            const tokenResponse = await fetch(XERO_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token
                })
            });

            if (!tokenResponse.ok) {
                return Response.json({ error: 'Token refresh failed' }, { status: 400 });
            }

            const tokens = await tokenResponse.json();

            // Update stored tokens
            if (psp_id) {
                const settings = await base44.asServiceRole.entities.PSPSettings.filter({ psp_id });
                if (settings.length > 0) {
                    const xeroConfig = settings[0].xero_config || {};
                    xeroConfig.access_token = tokens.access_token;
                    xeroConfig.refresh_token = tokens.refresh_token;
                    xeroConfig.expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

                    await base44.asServiceRole.entities.PSPSettings.update(settings[0].id, {
                        xero_config: xeroConfig
                    });
                }
            }

            return Response.json({ success: true, tokens });
        }

        // Make API call to Xero
        if (action === 'api_call') {
            // Get valid token
            const settings = await base44.asServiceRole.entities.PSPSettings.filter({ psp_id });
            if (!settings.length || !settings[0].xero_config) {
                return Response.json({ error: 'Xero not connected' }, { status: 400 });
            }

            let { access_token, refresh_token, expires_at, tenant_id } = settings[0].xero_config;

            // Refresh if expired
            if (new Date(expires_at) < new Date()) {
                const refreshResponse = await fetch(XERO_TOKEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                    },
                    body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: refresh_token
                    })
                });

                const tokens = await refreshResponse.json();
                access_token = tokens.access_token;
                refresh_token = tokens.refresh_token;

                // Update stored tokens
                const xeroConfig = settings[0].xero_config;
                xeroConfig.access_token = tokens.access_token;
                xeroConfig.refresh_token = tokens.refresh_token;
                xeroConfig.expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
                await base44.asServiceRole.entities.PSPSettings.update(settings[0].id, {
                    xero_config: xeroConfig
                });
            }

            // Make API call
            const apiUrl = `${XERO_API_BASE}${endpoint}`;
            const response = await fetch(apiUrl, {
                method,
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'xero-tenant-id': tenant_id,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: data ? JSON.stringify(data) : undefined
            });

            const result = await response.json();
            return Response.json({ success: true, data: result });
        }

        // Get connection status
        if (action === 'get_status') {
            const settings = await base44.asServiceRole.entities.PSPSettings.filter({ psp_id });
            if (!settings.length || !settings[0].xero_config) {
                return Response.json({ connected: false });
            }

            const { tenant_name, connected_at, expires_at } = settings[0].xero_config;
            return Response.json({ 
                connected: true,
                tenant_name,
                connected_at,
                token_expires_at: expires_at
            });
        }

        // Disconnect
        if (action === 'disconnect') {
            const settings = await base44.asServiceRole.entities.PSPSettings.filter({ psp_id });
            if (settings.length > 0) {
                await base44.asServiceRole.entities.PSPSettings.update(settings[0].id, {
                    xero_config: null
                });
            }
            return Response.json({ success: true });
        }

        // Sync transactions to Xero
        if (action === 'sync_transactions') {
            const { transaction_ids } = await req.json();
            const transactions = await base44.asServiceRole.entities.Transaction.filter({
                id: { $in: transaction_ids }
            });

            const invoices = transactions.map(txn => ({
                Type: 'ACCREC',
                Contact: {
                    Name: txn.customer_email || 'Unknown Customer'
                },
                LineItems: [{
                    Description: `Payment for ${txn.merchant_name}`,
                    Quantity: 1,
                    UnitAmount: txn.amount,
                    AccountCode: '200'
                }],
                Date: new Date(txn.created_date).toISOString().split('T')[0],
                DueDate: new Date(txn.created_date).toISOString().split('T')[0],
                Status: 'PAID',
                Reference: txn.id
            }));

            // Create invoices in Xero
            const result = await fetch(`${XERO_API_BASE}/Invoices`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'xero-tenant-id': tenant_id,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Invoices: invoices })
            });

            return Response.json({ success: true, result: await result.json() });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});