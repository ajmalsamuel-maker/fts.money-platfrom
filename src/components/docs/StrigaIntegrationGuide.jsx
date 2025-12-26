const StrigaIntegrationGuide = `# Striga Integration Guide
## EU Crypto Banking Infrastructure for FTS.Money

**Last Updated:** December 26, 2025

---

## Overview

Striga (acquired by Lightspark in October 2025) provides EU-compliant crypto banking infrastructure integrated into the FTS.Money Service Marketplace. This enables PSPs to offer:

- ✅ **Crypto Wallets**: Multi-chain custody (BTC, ETH, USDC, Lightning)
- ✅ **Virtual IBANs**: Named SEPA accounts with instant transfers
- ✅ **Card Issuing**: Virtual and physical cards backed by crypto
- ✅ **On/Off-Ramps**: Seamless crypto ↔ fiat conversion
- ✅ **Compliance**: VASP licensed, MiCA-ready, AML/KYC built-in

---

## Architecture

\`\`\`
FTS.Money Platform
├── Service Marketplace
│   └── Striga (Lightspark)
│       ├── Crypto Banking Platform ($1,500/mo)
│       └── Lightning Network ($500/mo)
│
├── Backend Functions
│   ├── strigaConnector.js (API wrapper)
│   └── seedStrigaService.js (marketplace setup)
│
├── Control Panel
│   └── Striga Service Management
│       ├── Subscriptions tracking
│       ├── Revenue monitoring
│       └── Usage analytics
│
└── PSP Portal
    └── Marketplace → Enable Striga services
\`\`\`

---

## For PSP Customers

### How to Enable Striga

1. **Log into PSP Portal**
2. **Navigate to Marketplace** or Service Catalog
3. **Find "Striga Crypto Banking Platform"**
4. **Click "Enable Service"**
5. **Complete KYC verification** (required by Striga)
6. **Start using** crypto wallets, IBANs, cards

### Available Features

**Crypto Banking Platform ($1,500/month):**
- Unlimited crypto wallets
- Named virtual IBANs
- Card issuing (virtual + physical)
- On/off-ramp infrastructure
- Full compliance (KYC/AML/Travel Rule)

**Lightning Network ($500/month):**
- Instant Bitcoin payments
- Lightning invoice management
- No node maintenance
- Enterprise infrastructure

---

## For Platform Administrators

### Initial Setup

**Step 1: Verify API Credentials**

Credentials are stored in platform secrets:
- \`STRIGA_APPLICATION_ID\`
- \`STRIGA_API_KEY\`
- \`STRIGA_API_SECRET\`
- \`STRIGA_UI_SECRET\`

**Step 2: Seed Marketplace**

Run the seed function to add Striga services:

\`\`\`bash
# Call seedStrigaService function
POST /api/functions/seedStrigaService
Authorization: Bearer <platform_admin_token>
\`\`\`

**Step 3: Monitor Dashboard**

Access: Control Panel → Striga Service Management

Tracks:
- Active subscriptions
- Monthly revenue
- Service usage
- Integration health

### API Connector Usage

The \`strigaConnector\` function provides methods for:

**User Management:**
\`\`\`javascript
// Create Striga user
await strigaConnector({ 
    action: 'createUser', 
    userData: { email, firstName, lastName, ... } 
});

// Start KYC
await strigaConnector({ 
    action: 'startKYC', 
    userId: 'usr_123' 
});
\`\`\`

**Wallet Operations:**
\`\`\`javascript
// Create crypto wallet
await strigaConnector({ 
    action: 'createWallet', 
    userId: 'usr_123', 
    currency: 'BTC' 
});

// Get balances
await strigaConnector({ 
    action: 'getBalance', 
    accountId: 'acc_123' 
});
\`\`\`

**Transactions:**
\`\`\`javascript
// Crypto withdrawal
await strigaConnector({ 
    action: 'withdrawCrypto', 
    walletId: 'wal_123',
    withdrawalData: { address, amount, currency }
});

// SEPA transfer
await strigaConnector({ 
    action: 'sepaTransfer', 
    accountId: 'acc_123',
    transferData: { beneficiaryName, iban, bic, amount }
});

// Exchange crypto ↔ fiat
await strigaConnector({ 
    action: 'exchange', 
    userId: 'usr_123',
    exchangeData: { from: 'BTC', to: 'EUR', amount }
});
\`\`\`

---

## Pricing Model

### For PSP Customers

**Crypto Banking Platform:**
- Monthly fee: $1,500
- KYC per user: $3
- Virtual card: $5
- Physical card: $15
- Crypto tx: 1.0%
- SEPA tx: 0.5%
- Exchange: 0.8%

**Lightning Network:**
- Monthly fee: $500
- Per payment: $0.01
- Fee: 0.5%

### For FTS.Money (Revenue Share)

Platform commission: **20%** of monthly fees
- Crypto Banking: $300/month per PSP
- Lightning: $100/month per PSP

---

## Compliance

### Licenses & Certifications

- ✅ **VASP License** (Estonia)
- ✅ **MiCA-Ready** (EU regulation)
- ✅ **AML/CFT Compliant**
- ✅ **Travel Rule** (crypto transfers)
- 🔄 **e-Money License** (in progress via Lightspark)

### Data Handling

- EU data residency
- GDPR compliant
- Encrypted at rest & transit
- Audit logs maintained

---

## Support & Resources

**Documentation:**
- Striga Docs: https://docs.striga.com
- Lightspark: https://www.lightspark.com

**Support:**
- Email: support@striga.com
- Portal: https://portal.striga.com

**FTS.Money Team:**
- Platform issues: platform-admin@fts.money
- Integration help: support@fts.money

---

## Roadmap

**Q1 2025:**
- ✅ Marketplace integration
- ✅ API connector
- ✅ Management dashboard

**Q2 2025:**
- 🔄 Enhanced reporting
- 🔄 Webhook support
- 🔄 Automated reconciliation

**Q3 2025:**
- 📋 MiCA license activation
- 📋 Additional crypto assets
- 📋 DeFi integrations

---

© 2025 FTS.Money. All rights reserved.
`;

export default StrigaIntegrationGuide;