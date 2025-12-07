// Email Templates for Merchant Onboarding
// Customizable templates that use PSP settings and theme

export const getOnboardingInvitationEmail = ({ 
    recipientEmail, 
    onboardingUrl, 
    companyName = 'netXhub.tech',
    logoUrl = null,
    primaryColor = '#3b82f6',
    supportEmail = 'support@netxhub.tech'
}) => {
    return {
        subject: `Your Merchant Onboarding Invitation - ${companyName}`,
        htmlBody: `
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
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${primaryColor}, #06b6d4); padding: 40px 20px; text-align: center;">
                            ${logoUrl ? `
                            <img src="${logoUrl}" alt="${companyName}" style="max-width: 150px; max-height: 60px; margin-bottom: 20px;" />
                            ` : `
                            <div style="font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px;">${companyName}</div>
                            `}
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: normal;">Welcome!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Merchant Onboarding Invitation</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                You have been invited to complete your merchant application with <strong>${companyName}</strong>.
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                This secure onboarding link is valid for <strong>12 hours</strong>.
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${onboardingUrl}" style="background: ${primaryColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                                            Start Onboarding Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Access Methods -->
                            <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 6px; border-left: 4px solid ${primaryColor};">
                                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">Alternative Access Methods</h3>
                                
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;"><strong>Option 1:</strong> Click the button above</p>
                                
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;"><strong>Option 2:</strong> Copy and paste this link:</p>
                                <div style="background: white; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; font-family: monospace; color: #64748b; margin-bottom: 15px;">
                                    ${onboardingUrl}
                                </div>
                                
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;"><strong>Option 3:</strong> Scan QR Code with mobile device</p>
                                <div style="background: white; padding: 15px; border-radius: 4px; text-align: center;">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(onboardingUrl)}" alt="QR Code" style="max-width: 200px; height: auto;" />
                                </div>
                            </div>
                            
                            <!-- Important Notice -->
                            <div style="margin: 30px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Important:</strong> This invitation link expires in 12 hours. If you need a new invitation, please contact our support team.
                                </p>
                            </div>
                            
                            <!-- What to Expect -->
                            <div style="margin: 30px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">What to Expect</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Complete business details and verification</li>
                                    <li>KYB (Know Your Business) verification</li>
                                    <li>AML screening and compliance checks</li>
                                    <li>Bank account setup</li>
                                    <li>Receive API credentials upon approval</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                                Estimated completion time: <strong>15-20 minutes</strong><br/>
                                Review time: <strong>2-3 business days</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">
                                Need assistance? Contact us at <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #94a3b8;">
                                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                                This is an automated message. If you didn't request this invitation, please ignore this email or contact <a href="mailto:${supportEmail}" style="color: ${primaryColor};">${supportEmail}</a>
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="https://netxhub.tech/privacy" style="color: #64748b; text-decoration: none; font-size: 11px; margin: 0 10px;">Privacy Policy</a>
                                <a href="https://netxhub.tech/terms" style="color: #64748b; text-decoration: none; font-size: 11px; margin: 0 10px;">Terms of Service</a>
                                <a href="https://netxhub.tech/support" style="color: #64748b; text-decoration: none; font-size: 11px; margin: 0 10px;">Support</a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        textBody: `
Welcome to ${companyName} - Merchant Onboarding Invitation

You have been invited to complete your merchant application.

This secure onboarding link is valid for 12 hours:
${onboardingUrl}

What to Expect:
- Complete business details and verification
- KYB (Know Your Business) verification
- AML screening and compliance checks
- Bank account setup
- Receive API credentials upon approval

Estimated completion time: 15-20 minutes
Review time: 2-3 business days

Need assistance? Contact us at ${supportEmail}

© ${new Date().getFullYear()} ${companyName}. All rights reserved.

Privacy Policy: https://netxhub.tech/privacy
Terms of Service: https://netxhub.tech/terms

If you didn't request this invitation, please ignore this email.
        `
    };
};

export const getApplicationReceivedEmail = ({
    recipientName,
    recipientEmail,
    businessName,
    merchantId,
    companyName = 'netXhub.tech',
    logoUrl = null,
    primaryColor = '#3b82f6',
    supportEmail = 'support@netxhub.tech'
}) => {
    return {
        subject: `Merchant Application Received - ${companyName}`,
        htmlBody: `
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
                        <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
                            ${logoUrl ? `
                            <img src="${logoUrl}" alt="${companyName}" style="max-width: 150px; max-height: 60px; height: auto; width: auto; display: block; margin: 0 auto 20px auto;" />
                            ` : `
                            <div style="font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px;">${companyName}</div>
                            `}
                            <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
                            <h1 style="color: white; margin: 0; font-size: 28px;">Application Received!</h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Dear ${recipientName},
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Your merchant application for <strong>${businessName}</strong> has been successfully submitted and is now under review.
                            </p>
                            
                            <!-- Application Details -->
                            <table width="100%" cellpadding="15" style="margin: 30px 0; background: #f0f9ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                                <tr>
                                    <td style="font-size: 14px; color: #475569; padding-bottom: 5px;">Merchant ID:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; font-family: monospace; text-align: right; padding-bottom: 5px;">${merchantId}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #475569; padding-bottom: 5px;">Business Name:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; text-align: right; padding-bottom: 5px;">${businessName}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #475569; padding-bottom: 5px;">Submitted:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; text-align: right; padding-bottom: 5px;">${new Date().toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #475569;">Review Time:</td>
                                    <td style="font-size: 14px; color: #1e293b; font-weight: bold; text-align: right;">2-3 Business Days</td>
                                </tr>
                            </table>
                            
                            <!-- Next Steps -->
                            <div style="margin: 30px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">What Happens Next</h3>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                            <div style="display: inline-block; width: 30px; height: 30px; background: ${primaryColor}; color: white; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold;">1</div>
                                            <span style="font-size: 14px; color: #334155;">KYB Verification Review</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                            <div style="display: inline-block; width: 30px; height: 30px; background: ${primaryColor}; color: white; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold;">2</div>
                                            <span style="font-size: 14px; color: #334155;">AML Screening Confirmation</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                            <div style="display: inline-block; width: 30px; height: 30px; background: ${primaryColor}; color: white; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold;">3</div>
                                            <span style="font-size: 14px; color: #334155;">Compliance Team Approval</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0;">
                                            <div style="display: inline-block; width: 30px; height: 30px; background: ${primaryColor}; color: white; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold;">4</div>
                                            <span style="font-size: 14px; color: #334155;">API Credentials & Portal Access Delivery</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                                You will receive your API credentials and merchant portal access once your application is approved. We'll keep you updated throughout the process.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; font-size: 16px; line-height: 1.6; color: #334155;">
                                Thank you for choosing ${companyName}!
                            </p>
                            
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #475569;">
                                Best regards,<br/>
                                <strong>The ${companyName} Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">
                                Questions? Contact us at <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #94a3b8;">
                                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="https://netxhub.tech/privacy" style="color: #64748b; text-decoration: none; font-size: 11px; margin: 0 10px;">Privacy Policy</a>
                                <a href="https://netxhub.tech/terms" style="color: #64748b; text-decoration: none; font-size: 11px; margin: 0 10px;">Terms of Service</a>
                                <a href="https://netxhub.tech/support" style="color: #64748b; text-decoration: none; font-size: 11px; margin: 0 10px;">Support</a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        textBody: `
Dear ${recipientName},

Your merchant application for ${businessName} has been successfully submitted and is now under review.

Merchant ID: ${merchantId}
Business Name: ${businessName}
Submitted: ${new Date().toLocaleString()}
Estimated Review Time: 2-3 Business Days

What Happens Next:
1. KYB Verification Review
2. AML Screening Confirmation
3. Compliance Team Approval
4. API Credentials & Portal Access Delivery

You will receive your API credentials and merchant portal access once your application is approved.

Thank you for choosing ${companyName}!

Best regards,
The ${companyName} Team

Questions? Contact us at ${supportEmail}

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
Privacy Policy: https://netxhub.tech/privacy
Terms of Service: https://netxhub.tech/terms
        `
    };
};