import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_id, domain, subdomain } = await req.json();

        // Get PSP details
        const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
        const psp = psps.find(p => p.id === psp_id);

        if (!psp) {
            return Response.json({ error: 'PSP not found' }, { status: 404 });
        }

        const results = {
            domain_configured: false,
            ssl_provisioned: false,
            dns_records: []
        };

        // For subdomain on fts.money (ez.fts.money)
        if (subdomain && !domain) {
            const subdomainName = `${subdomain}.fts.money`;
            
            // Call GoDaddy API to create DNS A record
            const godaddyKey = Deno.env.get('GODADDY_API_KEY');
            const godaddySecret = Deno.env.get('GODADDY_API_SECRET');

            if (!godaddyKey || !godaddySecret) {
                return Response.json({ 
                    error: 'GoDaddy API credentials not configured',
                    message: 'Contact FTS.Money admin to set up GODADDY_API_KEY and GODADDY_API_SECRET'
                }, { status: 500 });
            }

            // Create DNS A record pointing to FTS.Money infrastructure
            const dnsResponse = await fetch(
                'https://api.godaddy.com/v1/domains/fts.money/records/A/' + subdomain,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `sso-key ${godaddyKey}:${godaddySecret}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([
                        {
                            data: '104.21.0.0', // Cloudflare proxy IP (example)
                            ttl: 600
                        }
                    ])
                }
            );

            if (!dnsResponse.ok) {
                const error = await dnsResponse.text();
                throw new Error(`GoDaddy DNS creation failed: ${error}`);
            }

            results.domain_configured = true;
            results.dns_records.push({
                type: 'A',
                name: subdomain,
                value: '104.21.0.0',
                domain: 'fts.money'
            });

            // Auto-provision SSL via Let's Encrypt
            const sslResponse = await base44.functions.invoke('provisionSSL', {
                domain: subdomainName,
                psp_id: psp_id
            });

            results.ssl_provisioned = sslResponse.data.success;
            results.ssl_certificate_url = sslResponse.data.certificate_url;
        }

        // For custom domain (user's own domain)
        if (domain) {
            results.custom_domain_instructions = {
                message: 'Please add these DNS records to your domain registrar:',
                records: [
                    {
                        type: 'A',
                        name: '@',
                        value: '104.21.0.0',
                        ttl: 600
                    },
                    {
                        type: 'CNAME',
                        name: 'www',
                        value: domain,
                        ttl: 600
                    }
                ],
                verification_url: `https://fts.money/verify-domain?domain=${domain}&psp_id=${psp_id}`
            };

            // Queue SSL provisioning (will be triggered after DNS verification)
            await base44.asServiceRole.entities.PSPInstanceLog.create({
                psp_id: psp_id,
                psp_code: psp.psp_code,
                log_type: 'deployment',
                severity: 'medium',
                message: 'Custom domain pending DNS verification',
                details: {
                    domain,
                    status: 'awaiting_dns_propagation'
                },
                source: 'domain_provisioning'
            });
        }

        // Update PSP with domain configuration
        await base44.asServiceRole.entities.ProvisionedPSP.update(psp_id, {
            domain: domain || null,
            subdomain: subdomain || null,
            domain_configured_date: new Date().toISOString().split('T')[0],
            ssl_enabled: true
        });

        // Log the provisioning action
        await base44.asServiceRole.entities.PSPAuditTrail.create({
            psp_id: psp_id,
            psp_code: psp.psp_code,
            action: 'configuration_changed',
            field_changed: 'domain_provisioning',
            new_value: subdomain ? `${subdomain}.fts.money` : domain,
            user_email: user.email,
            user_role: user.role || 'user',
            metadata: results
        });

        return Response.json({ 
            success: true, 
            results,
            message: subdomain 
                ? `Subdomain ${subdomain}.fts.money provisioned successfully`
                : 'Custom domain configuration initiated. Please complete DNS setup.'
        });

    } catch (error) {
        console.error('Domain provisioning error:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});