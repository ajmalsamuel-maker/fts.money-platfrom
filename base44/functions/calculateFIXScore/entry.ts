import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * FIX Score Calculation Algorithm
 * Calculates composite score based on transaction volume, service adoption, ESG metrics, and compliance
 * 
 * Score Breakdown:
 * - Transaction Volume: 0-300 points (30%)
 * - Service Adoption: 0-250 points (25%)
 * - ESG Metrics: 0-250 points (25%)
 * - Compliance/Security: 0-200 points (20%)
 * Total: 0-1000 points
 * 
 * Score Tiers:
 * - Bronze: 0-299
 * - Silver: 300-499
 * - Gold: 500-699
 * - Platinum: 700-899
 * - Diamond: 900-1000
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { merchant_id } = await req.json();

        if (!merchant_id) {
            return Response.json({ error: 'merchant_id required' }, { status: 400 });
        }

        // Fetch merchant data
        const merchants = await base44.asServiceRole.entities.Merchant.filter({ id: merchant_id });
        const merchant = merchants[0];

        if (!merchant) {
            return Response.json({ error: 'Merchant not found' }, { status: 404 });
        }

        // 1. TRANSACTION VOLUME SCORE (0-300 points)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await base44.asServiceRole.entities.Transaction.filter({
            merchant_id: merchant_id,
        });

        const recentTransactions = transactions.filter(t => 
            new Date(t.created_date) > thirtyDaysAgo && t.status === 'succeeded'
        );

        const monthlyVolume = recentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

        // Transaction score based on volume thresholds
        let transactionScore = 0;
        if (monthlyVolume >= 10000000) transactionScore = 300; // $10M+
        else if (monthlyVolume >= 5000000) transactionScore = 280;
        else if (monthlyVolume >= 1000000) transactionScore = 250;
        else if (monthlyVolume >= 500000) transactionScore = 200;
        else if (monthlyVolume >= 100000) transactionScore = 150;
        else if (monthlyVolume >= 50000) transactionScore = 100;
        else if (monthlyVolume >= 10000) transactionScore = 50;
        else transactionScore = (monthlyVolume / 10000) * 50;

        // 2. SERVICE ADOPTION SCORE (0-250 points)
        const servicesActive = [];
        
        // Check PSP services
        const pspInstances = await base44.asServiceRole.entities.ProvisionedPSP.filter({
            merchant_email: merchant.contact_email
        });
        if (pspInstances.length > 0) servicesActive.push('PSP');

        // Check RWA services
        const rwaAssets = await base44.asServiceRole.entities.RWAAsset.filter({
            issuer_email: merchant.contact_email
        });
        if (rwaAssets.length > 0) servicesActive.push('RWA');

        // Check Crypto Gateway
        const cryptoCustomers = await base44.asServiceRole.entities.CryptoGatewayCustomer.filter({
            merchant_id: merchant_id
        });
        if (cryptoCustomers.length > 0) servicesActive.push('Crypto');

        // Check ISO Gateway
        const isoCustomers = await base44.asServiceRole.entities.ISOGatewayCustomer.filter({
            merchant_email: merchant.contact_email
        });
        if (isoCustomers.length > 0) servicesActive.push('ISO_Gateway');

        // Check E-Invoicing
        const invoices = await base44.asServiceRole.entities.Invoice.filter({
            merchant_id: merchant_id
        });
        if (invoices.length > 0) servicesActive.push('E_Invoicing');

        // Service adoption score: 50 points per service (max 250)
        const serviceAdoptionScore = Math.min(servicesActive.length * 50, 250);

        // 3. ESG METRICS SCORE (0-250 points)
        let esgScore = 0;

        // Check green merchant status
        const greenMerchants = await base44.asServiceRole.entities.GreenMerchant.filter({
            merchant_id: merchant_id
        });
        const greenMerchant = greenMerchants[0];

        let carbonOffsetKg = 0;
        let nanoTasksSponsored = 0;
        let greenBondsInvested = 0;

        if (greenMerchant) {
            carbonOffsetKg = greenMerchant.total_co2_offset || 0;
            nanoTasksSponsored = greenMerchant.sponsored_tasks?.length || 0;
            
            // Carbon offset points (max 100)
            if (carbonOffsetKg >= 10000) esgScore += 100;
            else if (carbonOffsetKg >= 5000) esgScore += 80;
            else if (carbonOffsetKg >= 1000) esgScore += 60;
            else if (carbonOffsetKg >= 500) esgScore += 40;
            else esgScore += (carbonOffsetKg / 500) * 40;

            // NANO tasks sponsored (max 75)
            esgScore += Math.min(nanoTasksSponsored * 15, 75);
        }

        // Check ESG reports
        const esgReports = await base44.asServiceRole.entities.ESGReport.filter({
            entity_id: merchant_id,
            report_type: 'merchant'
        });

        if (esgReports.length > 0) {
            const latestReport = esgReports[0];
            if (latestReport.csrd_compliant) esgScore += 50; // CSRD compliance bonus
            esgScore += Math.min((latestReport.sustainability_score || 0) * 0.25, 25); // Sustainability score bonus
        }

        esgScore = Math.min(esgScore, 250);

        // 4. COMPLIANCE/SECURITY SCORE (0-200 points)
        let complianceScore = 0;

        // PCI compliance (50 points)
        const pciCompliance = await base44.asServiceRole.entities.PCICompliance.filter({
            merchant_id: merchant_id
        });
        const pciCompliant = pciCompliance.length > 0 && pciCompliance[0].status === 'compliant';
        if (pciCompliant) complianceScore += 50;

        // LEI verification (50 points)
        const leiVerified = merchant.lei_status === 'verified' || false;
        if (leiVerified) complianceScore += 50;

        // Uptime/reliability (50 points)
        const uptimePercentage = 99.5; // Mock - in production, calculate from monitoring data
        complianceScore += (uptimePercentage / 100) * 50;

        // Security score (50 points) - based on 2FA, encryption, etc.
        const securityScore = 45; // Mock - in production, calculate from security audits
        complianceScore += securityScore;

        complianceScore = Math.min(complianceScore, 200);

        // CALCULATE OVERALL SCORE
        const overallScore = Math.round(
            transactionScore + serviceAdoptionScore + esgScore + complianceScore
        );

        // Determine tier
        let scoreTier = 'bronze';
        if (overallScore >= 900) scoreTier = 'diamond';
        else if (overallScore >= 700) scoreTier = 'platinum';
        else if (overallScore >= 500) scoreTier = 'gold';
        else if (overallScore >= 300) scoreTier = 'silver';

        // Calculate next tier threshold
        const tierThresholds = { bronze: 300, silver: 500, gold: 700, platinum: 900, diamond: 1000 };
        const nextTierThreshold = tierThresholds[scoreTier] - overallScore;

        // Benefits unlocked based on tier
        const benefitsByTier = {
            bronze: ['Basic dashboard access', 'Standard support'],
            silver: ['Priority support', '5% discount on fees', 'NANO task visibility'],
            gold: ['Dedicated account manager', '10% discount on fees', 'Featured merchant listing', '1.5x consumer rewards'],
            platinum: ['VIP support', '15% discount on fees', 'Premium merchant badge', '2x consumer rewards', 'Early feature access'],
            diamond: ['White glove service', '20% discount on fees', 'Diamond merchant badge', '3x consumer rewards', 'Custom integrations', 'Executive sponsor']
        };

        const benefitsUnlocked = benefitsByTier[scoreTier];

        // Check for existing FIX score record
        const existingScores = await base44.asServiceRole.entities.FIXScore.filter({
            merchant_id: merchant_id
        });

        const scoreData = {
            merchant_id: merchant_id,
            merchant_email: merchant.contact_email,
            merchant_name: merchant.business_name,
            overall_score: overallScore,
            score_tier: scoreTier,
            transaction_score: Math.round(transactionScore),
            service_adoption_score: serviceAdoptionScore,
            esg_score: Math.round(esgScore),
            compliance_score: Math.round(complianceScore),
            monthly_transaction_volume: monthlyVolume,
            services_active: servicesActive,
            carbon_offset_kg: carbonOffsetKg,
            nano_tasks_sponsored: nanoTasksSponsored,
            green_bonds_invested: greenBondsInvested,
            pci_compliant: pciCompliant,
            lei_verified: leiVerified,
            uptime_percentage: uptimePercentage,
            industry_category: merchant.industry_category || 'general',
            benefits_unlocked: benefitsUnlocked,
            next_tier_threshold: nextTierThreshold > 0 ? nextTierThreshold : null,
            last_calculated: new Date().toISOString()
        };

        let savedScore;
        if (existingScores.length > 0) {
            // Update existing
            const prevScore = existingScores[0].overall_score || 0;
            scoreData.score_trend = overallScore > prevScore ? 'up' : overallScore < prevScore ? 'down' : 'stable';
            savedScore = await base44.asServiceRole.entities.FIXScore.update(existingScores[0].id, scoreData);
        } else {
            // Create new
            scoreData.score_trend = 'stable';
            savedScore = await base44.asServiceRole.entities.FIXScore.create(scoreData);
        }

        // Calculate ranks
        const allScores = await base44.asServiceRole.entities.FIXScore.list('-overall_score', 1000);
        const rankGlobal = allScores.findIndex(s => s.id === savedScore.id) + 1;
        
        const industryScores = allScores.filter(s => s.industry_category === scoreData.industry_category);
        const rankIndustry = industryScores.findIndex(s => s.id === savedScore.id) + 1;

        await base44.asServiceRole.entities.FIXScore.update(savedScore.id, {
            rank_global: rankGlobal,
            rank_industry: rankIndustry
        });

        return Response.json({
            success: true,
            fix_score: {
                ...savedScore,
                rank_global: rankGlobal,
                rank_industry: rankIndustry
            },
            breakdown: {
                transaction_volume: {
                    score: Math.round(transactionScore),
                    max: 300,
                    volume: monthlyVolume
                },
                service_adoption: {
                    score: serviceAdoptionScore,
                    max: 250,
                    services: servicesActive
                },
                esg_metrics: {
                    score: Math.round(esgScore),
                    max: 250,
                    carbon_offset: carbonOffsetKg,
                    tasks_sponsored: nanoTasksSponsored
                },
                compliance: {
                    score: Math.round(complianceScore),
                    max: 200,
                    pci_compliant: pciCompliant,
                    lei_verified: leiVerified
                }
            }
        });

    } catch (error) {
        console.error('FIX calculation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});