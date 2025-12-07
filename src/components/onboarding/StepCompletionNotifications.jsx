// Email notification templates for onboarding stage completion
import { base44 } from '@/api/base44Client';

export const sendStageCompletionEmail = async ({ 
    recipientEmail, 
    recipientName,
    businessName,
    stageName, 
    stageNumber, 
    totalStages,
    nextSteps,
    companyName = 'netXhub.tech',
    logoUrl = null,
    primaryColor = '#3b82f6',
    supportEmail = 'support@netxhub.tech'
}) => {
    const progressPercentage = Math.round((stageNumber / totalStages) * 100);
    
    try {
        await base44.integrations.Core.SendEmail({
            to: recipientEmail,
            subject: `✓ ${stageName} Completed - ${businessName} Onboarding`,
            body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${primaryColor}, #06b6d4); padding: 40px 20px; text-align: center;">
                            ${logoUrl ? `
                            <img src="${logoUrl}" alt="${companyName}" style="max-width: 150px; max-height: 60px; height: auto; width: auto; display: block; margin: 0 auto 20px auto;" />
                            ` : `
                            <div style="font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px;">${companyName}</div>
                            `}
                            <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
                            <h1 style="color: white; margin: 0; font-size: 24px;">Stage Completed!</h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Dear ${recipientName},
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Great progress! You've completed the <strong>${stageName}</strong> stage for <strong>${businessName}</strong>.
                            </p>
                            
                            <!-- Progress Bar -->
                            <div style="margin: 30px 0;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 14px; color: #64748b;">Onboarding Progress</span>
                                    <span style="font-size: 14px; font-weight: bold; color: ${primaryColor};">${progressPercentage}%</span>
                                </div>
                                <div style="background: #e2e8f0; border-radius: 10px; height: 12px; overflow: hidden;">
                                    <div style="background: linear-gradient(to right, ${primaryColor}, #06b6d4); height: 100%; width: ${progressPercentage}%; transition: width 0.3s;"></div>
                                </div>
                                <div style="margin-top: 8px; font-size: 12px; color: #64748b; text-align: center;">
                                    Step ${stageNumber} of ${totalStages} completed
                                </div>
                            </div>
                            
                            <!-- Next Steps -->
                            ${nextSteps ? `
                            <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid ${primaryColor};">
                                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">Next Steps</h3>
                                <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">${nextSteps}</p>
                            </div>
                            ` : ''}
                            
                            <p style="margin: 30px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                                Need assistance? Our team is here to help at any stage of the process.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">
                                Questions? Contact us at <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        });
        return true;
    } catch (error) {
        console.error('Failed to send stage completion email:', error);
        return false;
    }
};

export const getNextStepsText = (currentStage) => {
    const nextSteps = {
        1: 'Next, complete your company structure details including ownership information.',
        2: 'Proceed to LEI verification to establish your legal entity identifier.',
        3: 'Add contact information for key personnel at your organization.',
        4: 'Upload required documents for verification and compliance.',
        5: 'Complete KYB (Know Your Business) verification checks.',
        6: 'Complete AML (Anti-Money Laundering) screening.',
        7: 'Provide your banking details for settlement processing.',
        8: 'Review pricing and fee structure for your merchant account.',
        9: 'Review all information and submit your complete application.',
        10: 'Your application is complete! Our team will review and contact you within 2-3 business days.'
    };
    return nextSteps[currentStage] || 'Continue with the next stage of onboarding.';
};

export const sendApplicationSubmittedEmail = async ({
    recipientEmail,
    recipientName,
    businessName,
    merchantId,
    companyName = 'netXhub.tech',
    logoUrl = null,
    primaryColor = '#3b82f6',
    supportEmail = 'support@netxhub.tech'
}) => {
    try {
        await base44.integrations.Core.SendEmail({
            to: recipientEmail,
            subject: `Application Submitted - ${businessName}`,
            body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
                            ${logoUrl ? `
                            <img src="${logoUrl}" alt="${companyName}" style="max-width: 150px; max-height: 60px; height: auto; width: auto; display: block; margin: 0 auto 20px auto;" />
                            ` : `
                            <div style="font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px;">${companyName}</div>
                            `}
                            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                            <h1 style="color: white; margin: 0; font-size: 28px;">Application Complete!</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Dear ${recipientName},
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Congratulations! Your merchant application for <strong>${businessName}</strong> has been successfully submitted.
                            </p>
                            
                            <table width="100%" cellpadding="15" style="margin: 30px 0; background: #f0f9ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                                <tr>
                                    <td style="font-size: 14px; color: #475569;">Merchant ID:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; font-family: monospace; text-align: right;">${merchantId}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #475569;">Business:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; text-align: right;">${businessName}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #475569;">Review Time:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; text-align: right;">2-3 Business Days</td>
                                </tr>
                            </table>
                            
                            <div style="margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">What Happens Next</h3>
                                <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Compliance review of your application</li>
                                    <li>Verification of all submitted documents</li>
                                    <li>Final approval from our underwriting team</li>
                                    <li>API credentials and merchant portal access delivery</li>
                                </ol>
                            </div>
                            
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #475569;">
                                Best regards,<br/>
                                <strong>The ${companyName} Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">
                                Questions? <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        });
        return true;
    } catch (error) {
        console.error('Failed to send application submitted email:', error);
        return false;
    }
};