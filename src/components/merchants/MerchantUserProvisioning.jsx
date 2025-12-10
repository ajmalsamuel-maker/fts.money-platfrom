import { base44 } from '@/api/base44Client';

/**
 * Automatically creates merchant user accounts when a merchant is created/approved
 * Sends welcome emails with portal access credentials
 */
export async function createMerchantUsers(merchantData, contacts) {
    const createdUsers = [];
    
    // Generate temporary password
    const generateTempPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    // Create user for each contact
    for (const contact of contacts) {
        const tempPassword = generateTempPassword();
        
        try {
            // Create MerchantUser record
            const user = await base44.entities.MerchantUser.create({
                merchant_id: merchantData.id,
                merchant_code: merchantData.merchant_code,
                merchant_name: merchantData.business_name,
                email: contact.email,
                full_name: contact.full_name,
                role: contact.is_primary ? 'admin' : 'operator',
                status: 'pending',
                phone: contact.phone,
                temp_password: tempPassword,
                must_change_password: true,
                permissions: contact.is_primary 
                    ? ['view_dashboard', 'view_transactions', 'manage_users', 'view_reports', 'manage_settings']
                    : ['view_dashboard', 'view_transactions'],
            });

            createdUsers.push(user);

            // Send welcome email
            await sendWelcomeEmail(user, tempPassword, merchantData);

        } catch (error) {
            console.error(`Failed to create user for ${contact.email}:`, error);
        }
    }

    return createdUsers;
}

async function sendWelcomeEmail(user, tempPassword, merchantData) {
    const portalUrl = 'https://portal.yourpsp.com'; // Update with your merchant portal URL
    
    const emailBody = `
Welcome to PaymentHub Merchant Portal!

Hello ${user.full_name},

Your merchant account has been created successfully. You can now access your merchant portal to manage transactions, view reports, and monitor your payment activity.

Merchant: ${merchantData.business_name}
Merchant ID: ${merchantData.merchant_id}

Login Details:
Portal URL: ${portalUrl}
Merchant Code: ${merchantData.merchant_code}
Email: ${user.email}
Temporary Password: ${tempPassword}

IMPORTANT: You will be required to change your password upon first login.

Your Role: ${user.role === 'admin' ? 'Administrator' : 'Operator'}

${user.role === 'admin' ? `
As an administrator, you have full access to:
- View and manage all transactions
- Generate reports and statements
- Manage user accounts
- Configure payment settings
- View settlements and payouts
` : `
As an operator, you can:
- View transactions
- Process payments via virtual terminal
- View basic reports
`}

Need Help?
If you have any questions or need assistance, please contact our support team.

Best regards,
PaymentHub Team
    `.trim();

    try {
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Welcome to PaymentHub Merchant Portal - Login Credentials',
            body: emailBody
        });
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw error;
    }
}

/**
 * Creates users when merchant status changes to 'active'
 */
export async function provisionUsersOnApproval(merchantId, merchantData, contacts) {
    // Check if users already exist
    const existingUsers = await base44.entities.MerchantUser.filter({
        merchant_id: merchantId
    });

    if (existingUsers.length > 0) {
        console.log('Users already provisioned for this merchant');
        return existingUsers;
    }

    // Create new users
    return await createMerchantUsers(merchantData, contacts);
}