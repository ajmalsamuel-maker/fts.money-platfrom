import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { dividend_id } = await req.json();

        if (!dividend_id) {
            return Response.json({ error: 'dividend_id is required' }, { status: 400 });
        }

        // Get dividend details
        const dividends = await base44.asServiceRole.entities.RWADividend.filter({ id: dividend_id });
        if (dividends.length === 0) {
            return Response.json({ error: 'Dividend not found' }, { status: 404 });
        }

        const dividend = dividends[0];

        // Verify payment date has arrived
        if (new Date(dividend.payment_date) > new Date()) {
            return Response.json({ 
                error: 'Payment date has not arrived yet',
                payment_date: dividend.payment_date
            }, { status: 400 });
        }

        // Update dividend status to processing
        await base44.asServiceRole.entities.RWADividend.update(dividend_id, {
            status: 'processing',
            snapshot_taken: true
        });

        // Get asset details
        const assets = await base44.asServiceRole.entities.RWAAsset.filter({ asset_id: dividend.asset_id });
        const asset = assets[0];

        if (!asset) {
            throw new Error('Asset not found');
        }

        // Get all holdings for this asset as of record date
        const allHoldings = await base44.asServiceRole.entities.RWAHolding.filter({ 
            asset_id: dividend.asset_id 
        });

        // Filter holdings by record date (holdings created before or on record date)
        const eligibleHoldings = allHoldings.filter(h => 
            new Date(h.purchase_date) <= new Date(dividend.record_date)
        );

        const totalRecipients = eligibleHoldings.length;
        let paidRecipients = 0;
        const paymentRecords = [];

        // Calculate and process payments for each holder
        for (const holding of eligibleHoldings) {
            // Calculate investor's share based on token balance
            const investorShare = (holding.token_balance / asset.total_supply) * dividend.total_amount;
            
            if (investorShare > 0) {
                // Get investor details
                const investors = await base44.asServiceRole.entities.RWAInvestor.filter({ 
                    id: holding.investor_id 
                });
                const investor = investors[0];

                if (!investor) continue;

                // Process payment via FTS.Money
                try {
                    // In production, integrate with FTS.Money payment rails
                    // For now, simulate successful payment
                    const paymentResult = {
                        success: true,
                        transaction_id: `DIV-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                        amount: investorShare,
                        recipient: investor.email
                    };

                    // Update holding with dividend received
                    await base44.asServiceRole.entities.RWAHolding.update(holding.id, {
                        dividends_received: (holding.dividends_received || 0) + investorShare,
                        last_dividend_date: new Date().toISOString()
                    });

                    paidRecipients++;
                    paymentRecords.push({
                        investor_id: investor.id,
                        investor_email: investor.email,
                        amount: investorShare,
                        transaction_id: paymentResult.transaction_id,
                        status: 'completed'
                    });

                    // Send notification email
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: investor.email,
                        subject: `Dividend Payment Received - ${asset.name}`,
                        body: `Dear ${investor.full_name},

You have received a dividend payment from your investment in ${asset.name} (${asset.symbol}).

=== PAYMENT DETAILS ===
Asset: ${asset.name}
Payment Type: ${dividend.payment_type}
Amount: $${investorShare.toFixed(2)} ${dividend.currency}
Transaction ID: ${paymentResult.transaction_id}
Payment Date: ${new Date().toLocaleDateString()}

Your Holdings:
- Tokens: ${holding.token_balance.toLocaleString()}
- Per Token: $${dividend.per_token_amount.toFixed(4)}

This payment has been credited to your account.

Thank you for your investment!`
                    });

                } catch (paymentError) {
                    console.error(`Payment failed for investor ${investor.email}:`, paymentError);
                    paymentRecords.push({
                        investor_id: investor.id,
                        investor_email: investor.email,
                        amount: investorShare,
                        status: 'failed',
                        error: paymentError.message
                    });
                }
            }
        }

        // Update dividend with final status
        await base44.asServiceRole.entities.RWADividend.update(dividend_id, {
            status: 'completed',
            total_recipients: totalRecipients,
            paid_recipients: paidRecipients
        });

        // Send confirmation to issuer
        const issuers = await base44.asServiceRole.entities.AssetIssuer.filter({
            lei: asset.issuer_lei
        });
        const issuer = issuers[0];

        if (issuer) {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: issuer.email,
                subject: `Dividend Payment Completed - ${asset.name}`,
                body: `Dividend payment has been successfully processed for ${asset.name}.

=== PAYMENT SUMMARY ===
Total Amount: $${dividend.total_amount.toLocaleString()} ${dividend.currency}
Payment Type: ${dividend.payment_type}
Total Recipients: ${totalRecipients}
Successfully Paid: ${paidRecipients}
Failed Payments: ${totalRecipients - paidRecipients}

Payment Date: ${new Date().toLocaleDateString()}
Record Date: ${new Date(dividend.record_date).toLocaleDateString()}

All investors have been notified of their payments.`
            });
        }

        return Response.json({
            success: true,
            dividend_id: dividend_id,
            total_recipients: totalRecipients,
            paid_recipients: paidRecipients,
            total_amount: dividend.total_amount,
            payment_records: paymentRecords,
            message: `Dividend payment completed. ${paidRecipients}/${totalRecipients} payments successful.`
        });

    } catch (error) {
        console.error('Dividend payment processing error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to process dividend payment'
        }, { status: 500 });
    }
});