import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { action, email, password, user_id, new_password, transaction } = body;

        if (action === 'login') {
            console.log('VT Login attempt for:', email);
            
            const users = await base44.asServiceRole.entities.VirtualTerminalUser.filter({
                email: email,
                status: 'active'
            });

            console.log('Query result:', users?.length || 0, 'users');

            if (!users || users.length === 0) {
                console.log('User not found');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            const user = users[0];
            console.log('User found:', user.email);

            if (user.temp_password !== password) {
                console.log('Password mismatch');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            await base44.asServiceRole.entities.VirtualTerminalUser.update(user.id, {
                last_login: new Date().toISOString()
            });

            const session = {
                user_id: user.id,
                terminal_id: user.terminal_id,
                merchant_id: user.merchant_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                permissions: user.permissions,
                must_change_password: user.must_change_password,
                timestamp: Date.now()
            };

            return Response.json({
                success: true,
                session,
                must_change_password: user.must_change_password
            });
        }

        if (action === 'validate') {
            const { email: session_email } = body;
            const users = await base44.asServiceRole.entities.VirtualTerminalUser.filter({
                email: session_email,
                status: 'active'
            });

            if (!users || users.length === 0) {
                return Response.json({ 
                    success: false, 
                    error: 'Session expired' 
                }, { status: 401 });
            }

            return Response.json({
                success: true,
                user: users[0]
            });
        }

        if (action === 'change_password') {
            await base44.asServiceRole.entities.VirtualTerminalUser.update(user_id, {
                temp_password: new_password,
                must_change_password: false
            });

            return Response.json({ success: true });
        }

        if (action === 'processTransaction') {
            // Process transaction with service role to ensure visibility
            console.log('Processing VT transaction:', transaction);
            const createdTxn = await base44.asServiceRole.entities.Transaction.create(transaction);
            
            return Response.json({
                success: true,
                transaction: createdTxn
            });
        }

        return Response.json({ 
            success: false, 
            error: 'Invalid action' 
        }, { status: 400 });

    } catch (error) {
        console.error('VT auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});