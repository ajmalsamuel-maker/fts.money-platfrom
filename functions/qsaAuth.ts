import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, access_token } = await req.json();

        if (!email || !access_token) {
            return Response.json({ 
                success: false, 
                error: 'Email and access token required' 
            }, { status: 400 });
        }

        // Find QSA user by email and token
        const qsaUsers = await base44.asServiceRole.entities.QSAUser.filter({
            qsa_email: email,
            access_token: access_token
        });

        if (!qsaUsers || qsaUsers.length === 0) {
            // Log failed attempt
            await base44.asServiceRole.entities.QSAAccessLog.create({
                qsa_email: email,
                action_type: 'login',
                status: 'failed',
                details: 'Invalid credentials'
            });

            return Response.json({ 
                success: false, 
                error: 'Invalid credentials' 
            }, { status: 401 });
        }

        const qsaUser = qsaUsers[0];

        // Check if token is expired
        const tokenExpiry = new Date(qsaUser.token_expires);
        const now = new Date();

        if (tokenExpiry < now) {
            // Update status to expired
            await base44.asServiceRole.entities.QSAUser.update(qsaUser.id, {
                status: 'expired'
            });

            // Log failed attempt
            await base44.asServiceRole.entities.QSAAccessLog.create({
                qsa_email: email,
                action_type: 'login',
                status: 'failed',
                details: 'Access token expired'
            });

            return Response.json({ 
                success: false, 
                error: 'Access token has expired. Please contact the administrator.' 
            }, { status: 401 });
        }

        // Check if access is revoked
        if (qsaUser.status === 'revoked') {
            // Log failed attempt
            await base44.asServiceRole.entities.QSAAccessLog.create({
                qsa_email: email,
                action_type: 'login',
                status: 'unauthorized',
                details: 'Access revoked'
            });

            return Response.json({ 
                success: false, 
                error: 'Your access has been revoked. Please contact the administrator.' 
            }, { status: 403 });
        }

        // Update last login and increment count
        await base44.asServiceRole.entities.QSAUser.update(qsaUser.id, {
            last_login: new Date().toISOString(),
            login_count: (qsaUser.login_count || 0) + 1
        });

        // Log successful login
        await base44.asServiceRole.entities.QSAAccessLog.create({
            qsa_email: email,
            action_type: 'login',
            status: 'success',
            session_id: crypto.randomUUID(),
            details: `Logged in successfully`
        });

        return Response.json({
            success: true,
            qsa_user: {
                email: qsaUser.qsa_email,
                name: qsaUser.qsa_name,
                company: qsaUser.qsa_company,
                permissions: qsaUser.permissions,
                token_expires: qsaUser.token_expires
            }
        });

    } catch (error) {
        console.error('QSA auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});