const UserJourneyMapsDoc = `# User Journey Maps
## End-to-End Workflows Across FTS.Money Platform

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Product Documentation  

---

## Table of Contents

1. [PSP Operator Journey](#psp-operator-journey)
2. [Merchant Journey](#merchant-journey)
3. [ISO Gateway Customer Journey](#iso-gateway-customer-journey)
4. [Crypto Customer Journey](#crypto-customer-journey)
5. [RWA Issuer Journey](#rwa-issuer-journey)
6. [Investor Journey](#investor-journey)

---

## PSP Operator Journey

### From Signup to First Transaction

\`\`\`mermaid
journey
    title PSP Operator - Day 1 to First Transaction
    section Discovery
      Visit FTS.Money website: 5: Operator
      Watch demo video: 5: Operator
      Sign up for Community Portal: 5: Operator
    section Configuration
      Choose PSP tier: 4: Operator
      Configure payment methods: 4: Operator
      Set up branding: 5: Operator
      Submit KYB documents: 3: Operator
    section Deployment
      Wait for provisioning: 3: Operator
      Receive access credentials: 5: Operator
      Explore PSP Portal: 5: Operator
    section First Merchant
      Invite test merchant: 4: Operator
      Merchant completes onboarding: 4: Merchant
      Configure merchant pricing: 4: Operator
    section First Transaction
      Process test payment: 5: Operator
      View in dashboard: 5: Operator
      Receive settlement: 5: Operator
\`\`\`

**Timeline:** 48-72 hours from signup to first transaction

---

## Merchant Journey

### Onboarding to Regular Processing

\`\`\`mermaid
journey
    title Merchant - Onboarding to Active Processing
    section Invitation
      Receive invite email: 5: Merchant
      Click onboarding link: 5: Merchant
      Create merchant account: 4: Merchant
    section KYB Process
      Submit business info: 3: Merchant
      Upload verification docs: 3: Merchant
      Wait for approval: 2: Merchant
      Approval received: 5: Merchant
    section Integration
      Access API documentation: 4: Merchant
      Generate API keys: 5: Merchant
      Integrate payment form: 3: Developer
      Test in sandbox: 4: Developer
    section Go Live
      Switch to production: 5: Merchant
      Process first real payment: 5: Merchant
      Monitor transactions: 5: Merchant
      Receive first settlement: 5: Merchant
\`\`\`

---

## ISO Gateway Customer Journey

### Legacy System Integration

\`\`\`mermaid
sequenceDiagram
    participant Customer as Bank IT Team
    participant Sales as FTS Sales
    participant Portal as ISO Gateway Portal
    participant Support as Technical Support
    participant System as Legacy System
    
    Customer->>Sales: Inquiry about ISO translation
    Sales->>Customer: Demo & proposal
    Customer->>Sales: Sign contract
    
    Sales->>Portal: Provision customer account
    Portal->>Customer: Access credentials
    
    Customer->>Portal: Login to portal
    Portal->>Customer: Display setup wizard
    
    Customer->>Portal: Configure source (ISO 8583)
    Customer->>Portal: Configure target (ISO 20022)
    Customer->>Portal: Define connection (TCP/IP)
    
    Portal->>Support: Request test support
    Support->>Customer: Schedule test session
    
    Customer->>System: Connect to FTS gateway
    System->>Portal: Send test message
    Portal->>Portal: Translate message
    Portal->>Customer: Return translated result
    
    Customer->>Support: Approve for production
    Support->>Portal: Enable production mode
    
    Customer->>System: Route live traffic
    System->>Portal: Process live messages
\`\`\`

**Timeline:** 1-2 weeks from contract to production

---

## Crypto Customer Journey

### From Registration to First Crypto Transaction

\`\`\`mermaid
journey
    title Crypto Customer - Complete Onboarding
    section Registration
      Sign up for Crypto Gateway: 5: Customer
      Verify email address: 5: Customer
    section Identity Verification
      Submit KYC documents: 3: Customer
      Wait for verification: 2: Customer
      KYC approved: 5: Customer
    section Wallet Setup
      Create multi-chain wallet: 5: Customer
      Generate BTC address: 5: Customer
      Generate ETH address: 5: Customer
      Set up 2FA: 4: Customer
    section First Deposit
      Deposit via bank transfer: 4: Customer
      Funds arrive in EUR balance: 5: Customer
      Exchange EUR to BTC: 5: Customer
    section Advanced Features
      Request virtual IBAN: 4: Customer
      Order virtual Visa card: 5: Customer
      Card issued instantly: 5: Customer
      Make first card payment: 5: Customer
\`\`\`

---

## RWA Issuer Journey

### Asset Tokenization Process

\`\`\`mermaid
stateDiagram-v2
    [*] --> Registration
    Registration --> LEI_Verification
    LEI_Verification --> Document_Upload
    Document_Upload --> Compliance_Review
    Compliance_Review --> Approved
    Compliance_Review --> Rejected
    
    Approved --> Asset_Submission
    Asset_Submission --> Asset_Review
    Asset_Review --> Tokenization
    Tokenization --> Smart_Contract_Deploy
    Smart_Contract_Deploy --> Fundraising_Open
    
    Fundraising_Open --> Investor_KYC
    Investor_KYC --> Token_Purchase
    Token_Purchase --> Fully_Subscribed
    Fully_Subscribed --> Trading_Enabled
    
    Trading_Enabled --> Dividend_Distribution
    Dividend_Distribution --> [*]
    
    note right of LEI_Verification
        6-month grace period
        if no LEI yet
    end note
\`\`\`

---

## Investor Journey

### Discovery to Portfolio Management

\`\`\`mermaid
journey
    title Investor - Browse to Investment
    section Discovery
      Browse asset marketplace: 5: Investor
      Filter by asset type: 5: Investor
      Read asset details: 4: Investor
      Download offering docs: 4: Investor
    section Onboarding
      Create investor account: 5: Investor
      Submit KYC documents: 3: Investor
      Wait for verification: 2: Investor
      KYC approved - Tier 1: 5: Investor
    section First Investment
      Select real estate asset: 5: Investor
      Review terms: 4: Investor
      Confirm purchase: 5: Investor
      Receive security tokens: 5: Investor
    section Portfolio Management
      View portfolio dashboard: 5: Investor
      Track asset value: 5: Investor
      Receive quarterly dividend: 5: Investor
      List tokens for sale: 4: Investor
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default UserJourneyMapsDoc;