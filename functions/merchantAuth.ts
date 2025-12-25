import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Public endpoint - no authentication required
Deno.serve(async (req) => {
    // Set CORS headers for public access
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
        const { action, email, password, user_id, new_password, merchant_code } = body;

        if (action === 'login') {
            console.log('Login attempt for:', email, 'with merchant code:', merchant_code);
            
            // Query Base44 entities for merchant user
            const users = await base44.asServiceRole.entities.MerchantUser.filter({
                email: email,
                merchant_code: merchant_code,
                status: 'active'
            });

            console.log('Query result:', users?.length || 0, 'users found');

            if (!users || users.length === 0) {
                console.log('User not found');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            const user = users[0];
            console.log('User found:', user.email);

            // Check password - try both temp_password and password_hash
            const storedPassword = user.temp_password || user.password_hash;
            console.log('Comparing password - stored:', storedPassword ? 'exists' : 'missing', 'provided:', password ? 'exists' : 'missing');
            
            // Direct comparison (plain text passwords)
            if (storedPassword !== password) {
                console.log('Password mismatch - stored:', storedPassword, 'provided:', password);
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            // Get client IP address
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                       req.headers.get('x-real-ip') || 
                       'unknown';

            // Update last login with IP
            await base44.asServiceRole.entities.MerchantUser.update(user.id, {
                last_login: new Date().toISOString(),
                last_login_ip: ip
            });

            // Get merchant record for PSP code - CRITICAL: Every merchant MUST have psp_code
            const merchants = await base44.asServiceRole.entities.Merchant.filter({
                merchant_id: user.merchant_id
            });
            const merchant = merchants?.[0];
            
            console.log('🔍 merchantAuth: Merchant lookup result:', {
                merchant_id: user.merchant_id,
                found: !!merchant,
                psp_code: merchant?.psp_code || 'MISSING'
            });

            // Get PSP code (required for multi-tenancy)
            let pspCode = merchant?.psp_code;
            
            if (!pspCode) {
                // FALLBACK 1: Extract from merchant_code (format: PSP_MERCHANT or PSP-MERCHANT)
                if (user.merchant_code) {
                    const parts = user.merchant_code.split(/[-_]/);
                    if (parts.length > 1) {
                        pspCode = parts[0];
                        console.log('⚠️ merchantAuth: Extracted PSP code from merchant_code (FALLBACK):', pspCode);
                    }
                }
                
                // FALLBACK 2: If still no PSP code, this is a critical error
                if (!pspCode) {
                    console.error('❌ CRITICAL: Merchant has no PSP code. Multi-tenancy broken!', {
                        merchant_id: user.merchant_id,
                        merchant_code: user.merchant_code,
                        email: user.email
                    });
                    return Response.json({
                        success: false,
                        error: 'System configuration error. Please contact administrator.'
                    }, { status: 500 });
                }
            }

            // Create session token
            const session = {
                user_id: user.id,
                merchant_id: user.merchant_id,
                merchant_code: user.merchant_code,
                merchant_name: user.merchant_name,
                psp_code: pspCode,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                permissions: user.permissions,
                must_change_password: user.must_change_password,
                two_factor_enabled: user.two_factor_enabled,
                timestamp: Date.now()
            };
            
            console.log('🔑 merchantAuth: Session created with psp_code:', pspCode || 'STILL_MISSING');

            return Response.json({
                success: true,
                session,
                must_change_password: user.must_change_password
            });
        }

        if (action === 'validate') {
            // Validate session by email and merchant_code
            const { email: session_email, merchant_code: session_merchant_code } = body;
            const users = await base44.asServiceRole.entities.MerchantUser.filter({
                email: session_email,
                merchant_code: session_merchant_code,
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
            // Update password and clear must_change_password flag
            await base44.asServiceRole.entities.MerchantUser.update(user_id, {
                temp_password: new_password,
                must_change_password: false
            });

            return Response.json({ success: true });
        }

        return Response.json({ 
            success: false, 
            error: 'Invalid action' 
        }, { status: 400 });

    } catch (error) {
        console.error('Merchant auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});