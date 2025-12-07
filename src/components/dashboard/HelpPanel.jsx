import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Search, 
    LayoutDashboard, 
    ArrowLeftRight, 
    Store, 
    CreditCard,
    Wallet,
    FileText,
    Settings,
    Users,
    Shield,
    BarChart3,
    Terminal,
    AlertTriangle,
    Repeat,
    Receipt,
    Globe,
    Key,
    Zap,
    CheckSquare,
    Palette,
    DollarSign,
    Percent,
    Building,
    ArrowUpDown,
    Database,
    Brain,
    Smartphone,
    Landmark,
    Monitor,
    UserCog,
    ChevronRight,
    ExternalLink,
    BookOpen,
    Lock,
    FileCheck,
    Scale,
    AlertCircle,
    ClipboardCheck,
    Network,
    Server,
    Eye,
    Activity,
    Fingerprint,
    ShieldCheck,
    Award,
    GraduationCap
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Platform Help Sections
const helpSections = [
    {
        category: 'Overview',
        icon: LayoutDashboard,
        items: [
            {
                title: 'Dashboard',
                icon: LayoutDashboard,
                description: 'Your central command center for monitoring payment operations.',
                content: `The Dashboard is your primary interface for monitoring and managing your payment processing operations in real-time. It provides a comprehensive overview of your business performance and operational health.

**Key Components:**

• **Live TPS Counter**: 
  - Displays transactions per second in real-time
  - Shows current TPS rate with trend indicators (up/down arrows)
  - Helps identify peak processing periods
  - Useful for capacity planning and infrastructure scaling
  - Normal TPS ranges vary by business size (small: 1-10, medium: 10-100, large: 100+)

• **Key Statistics Cards**:
  - **Today's Volume**: Total transaction amount processed today with percentage change vs yesterday
  - **Total Transactions**: Count of all transactions with growth metrics
  - **Success Rate**: Approval rate percentage - healthy rates are typically 95%+ for established merchants
  - **Active Merchants**: Number of merchants currently processing payments

• **Volume Charts**: 
  - Visualize transaction volume trends over customizable time periods (hourly, daily, weekly, monthly)
  - Identify peak processing times to optimize operations
  - Compare current period with historical data
  - Spot unusual patterns that may indicate issues or fraud

• **Success Rate Tracking**: 
  - Monitor approval rates in real-time
  - Identify declining success rates quickly to take corrective action
  - Compare success rates across payment methods and providers
  - Industry benchmark: 95-98% is considered healthy

• **Top Merchants Table**: 
  - View your highest-volume merchants at a glance
  - Monitor individual merchant performance
  - Quick access to merchant details
  - Identify which merchants drive the most revenue

• **Payment Methods Distribution**: 
  - Pie chart showing breakdown of payment types (Visa, Mastercard, Amex, etc.)
  - Helps optimize payment method offerings
  - Identify trending payment preferences

• **Payment Industry News**: 
  - Latest news from The Paypers and industry sources
  - Stay informed about regulatory changes
  - Learn about new payment technologies and trends

• **Live Exchange Rates**: 
  - Real-time currency rates for major currencies
  - Essential for multi-currency processing
  - Helps with pricing and settlement calculations

• **Business Metrics KPIs**:
  - **Chargeback Ratio**: Should be below 1% (Visa/Mastercard threshold)
  - **Decline Rate**: Percentage of declined transactions
  - **Fraud Rate**: Fraudulent transaction percentage
  - Color-coded indicators (green: healthy, amber: warning, red: critical)

**Best Practices:**
- Review dashboard daily at business start
- Set up alerts for critical metrics (high decline rate, unusual volume)
- Monitor TPS during peak periods
- Compare metrics week-over-week to identify trends
- Investigate any sudden changes in success rates
- Keep chargeback ratio below 0.9% (well below the 1% threshold)`,
                keywords: ['overview', 'statistics', 'volume', 'tps', 'real-time']
            },
            {
                title: 'Analytics',
                icon: BarChart3,
                description: 'Deep dive into your transaction data with advanced analytics.',
                content: `The Analytics page provides powerful business intelligence tools to analyze your payment processing data in depth. Use these insights to optimize operations, identify opportunities, and make data-driven decisions.

**Core Analytics Features:**

• **Transaction Trends Analysis**: 
  - Visualize transaction patterns over custom date ranges (day, week, month, quarter, year)
  - Compare multiple time periods side-by-side
  - Identify seasonal patterns and growth trends
  - Spot anomalies and unusual activity
  - Track metrics like average transaction value, volume, and frequency
  - Example use: Compare Q4 2024 vs Q4 2023 to measure holiday season growth

• **Geographic Analysis**: 
  - Interactive map showing transaction origins by country
  - Heatmap visualization of high-volume regions
  - Identify expansion opportunities in new markets
  - Monitor fraud patterns by geography
  - Useful for targeted marketing and regional strategy
  - Shows conversion rates by region

• **Time-based Analysis**: 
  - Hour-of-day distribution: Identify peak processing hours
  - Day-of-week patterns: Understand weekly transaction cycles
  - Month-over-month trends: Track business growth
  - Use insights for staffing decisions and system capacity planning
  - Example: If 80% of transactions occur between 2pm-8pm, ensure adequate support coverage

• **Multi-dimensional Filtering**:
  - Filter by merchant ID or name
  - Payment method breakdown (Visa, Mastercard, Amex, digital wallets)
  - Transaction status (approved, declined, pending, refunded)
  - Amount ranges (e.g., $0-$50, $50-$500, $500+)
  - Currency type
  - Combine multiple filters for precise analysis

• **Comparison Tools**: 
  - Period-over-period comparison (this month vs last month)
  - Year-over-year comparison (2024 vs 2023)
  - Benchmark against industry averages
  - Compare multiple merchants or payment methods
  - Growth rate calculations and projections

• **Cohort Analysis**:
  - Track merchant cohorts over time
  - Customer lifetime value calculations
  - Retention and churn metrics
  - First-time vs repeat transaction analysis

• **Export and Reporting**: 
  - Export data in CSV format for Excel analysis
  - Generate PDF reports with charts and tables
  - Schedule automated reports (daily, weekly, monthly)
  - API access for custom integrations
  - Pre-built templates for common reports

• **Key Performance Indicators**:
  - Approval rate trends
  - Average transaction value (ATV)
  - Transactions per customer
  - Revenue per merchant
  - Cost per transaction
  - Profit margins

**Practical Use Cases:**

1. **Identifying Growth Opportunities**: Use geographic analysis to find regions with high conversion but low volume - prime candidates for marketing investment

2. **Optimizing Success Rates**: Analyze decline reasons by payment method to identify which providers need optimization

3. **Fraud Detection**: Compare transaction patterns against historical baselines to spot anomalies

4. **Capacity Planning**: Use time-based analysis to predict peak loads and ensure infrastructure readiness

5. **Merchant Performance**: Identify top and bottom performing merchants to inform relationship management

6. **Revenue Optimization**: Analyze average ticket sizes to identify upselling opportunities

**Best Practices:**
- Set aside time weekly for analytics review
- Create custom dashboards for different stakeholder needs
- Use filters to drill down into specific issues
- Export data regularly for long-term trend analysis
- Compare actual performance against forecasts
- Share insights with relevant teams (sales, support, operations)`,
                keywords: ['analytics', 'reports', 'trends', 'data', 'insights']
            }
        ]
    },
    {
        category: 'Transactions',
        icon: ArrowLeftRight,
        items: [
            {
                title: 'Transactions',
                icon: ArrowLeftRight,
                description: 'View and manage all payment transactions.',
                content: `The Transactions page is your primary operational hub for monitoring and managing all payment transactions flowing through your platform. This is where you'll spend most of your time handling day-to-day payment operations.

**Core Functionality:**

• **Advanced Search & Filtering**:
  - Search by transaction ID, authorization code, or order reference
  - Filter by merchant name or ID
  - Amount range filters (e.g., transactions between $100-$500)
  - Status filters: Approved, Declined, Pending, Refunded, Voided
  - Date range picker with presets (today, last 7 days, last 30 days, custom)
  - Payment method filter (Visa, Mastercard, Amex, wallets, etc.)
  - Card type filter (credit, debit, prepaid)
  - Customer email or name search
  - Country/region filter for international analysis
  - Combine multiple filters for precise results

• **Transaction Details View**:
  Click any transaction row to see comprehensive details:
  - **Customer Information**: Name, email, billing address, IP address
  - **Payment Method**: Card brand, last 4 digits, card type, expiry
  - **Authorization Details**: Auth code, response code, processor reference
  - **Security Verification**: AVS result, CVV check, 3DS status and version
  - **Risk Assessment**: Fraud score, risk level, velocity check results
  - **Transaction Timeline**: Authorization time, capture time, settlement status
  - **Merchant Details**: Which merchant processed this transaction
  - **Metadata**: Custom fields, order ID, description

• **Transaction Actions**:
  - **Refund**: Issue full or partial refunds with reason codes
  - **Void**: Cancel transactions before settlement (must be same day)
  - **Capture**: For pre-authorized transactions, capture the funds
  - **Hold**: Place suspicious transactions on hold for review
  - **Notes**: Add internal notes for record keeping
  - All actions create audit trail entries

• **Bulk Operations**:
  - Export filtered transactions to CSV for reconciliation
  - Download transaction data for accounting systems
  - Generate batch reports for specific date ranges
  - Process multiple refunds simultaneously

• **Real-time Updates**:
  - Transaction list auto-refreshes every 30 seconds
  - WebSocket connection for instant updates
  - No need to manually refresh the page
  - Push notifications for critical transactions

• **Status Indicators**:
  - **Approved** (Green): Successfully authorized and captured
  - **Pending** (Yellow): Awaiting capture or settlement
  - **Declined** (Red): Authorization failed - see reason code
  - **Refunded** (Blue): Full or partial refund processed
  - **Voided** (Gray): Transaction cancelled before settlement

**Transaction Lifecycle:**

1. **Authorization**: Card validated, funds reserved (appears as Pending)
2. **Capture**: Funds marked for settlement (status: Approved)
3. **Settlement**: Funds transferred to merchant account (typically T+1 or T+2)
4. **Refund/Void**: Optional reversal of transaction

**Common Use Cases:**

1. **Investigating Customer Complaints**: Search by email or transaction ID to find the transaction, review details, and issue refund if needed

2. **Daily Reconciliation**: Export approved transactions for the day and match against bank deposits

3. **Fraud Investigation**: Filter high-risk transactions, review device fingerprints and IP addresses

4. **Dispute Preparation**: Locate disputed transactions and gather evidence (AVS, CVV, 3DS proof)

5. **Performance Monitoring**: Filter by merchant to review their transaction success rates

**Best Practices:**
- Check pending transactions daily and capture or void as needed
- Investigate declined transactions to identify patterns
- Use notes feature to document customer conversations
- Export transaction data weekly for bookkeeping
- Monitor for duplicate transactions (same amount, card, time)
- Review high-value transactions manually for fraud prevention`,
                keywords: ['transactions', 'payments', 'search', 'filter', 'refund', 'void']
            },
            {
                title: 'Settlements',
                icon: Receipt,
                description: 'Track and manage merchant settlements.',
                content: `The Settlements page manages the critical process of paying out merchants for their processed transactions. This is where gross transaction amounts are calculated, fees are deducted, and net amounts are prepared for bank transfer.

**Settlement Process Overview:**

Settlements typically occur on a T+1 or T+2 schedule:
- **T+0**: Same-day settlement (premium service, higher fees)
- **T+1**: Settlement next business day (most common)
- **T+2**: Settlement in two business days (standard)
- **T+7**: Weekly settlement (for high-risk merchants)

**Core Functionality:**

• **Settlement Batches**:
  - View all settlement batches with status indicators
  - **Pending**: Awaiting approval or processing
  - **Processing**: Currently being prepared for bank transfer
  - **Completed**: Funds sent to merchant
  - **Failed**: Settlement attempt failed (bank rejection, insufficient funds)
  - Each batch includes: Date range, merchant, gross amount, fees, net amount
  - Batch reference numbers for tracking and reconciliation

• **Detailed Settlement Reports**:
  Generate comprehensive reports showing:
  - **Gross Volume**: Total transaction amount processed
  - **Transaction Fees**: MDR (Merchant Discount Rate) charges
  - **Interchange Fees**: Cost of card processing
  - **Scheme Fees**: Visa/Mastercard network fees
  - **Chargeback Deductions**: Amounts held for chargebacks
  - **Refunds**: Deducted from settlement
  - **Rolling Reserves**: Percentage held for risk protection
  - **Adjustments**: Manual adjustments (credits/debits)
  - **Net Settlement**: Final amount to be paid
  - Transaction-by-transaction breakdown available

• **Reconciliation Tools**:
  - Match settlement batches with bank deposits
  - Upload bank statements (MT940, CSV, BAI2 formats)
  - Automatic matching based on amount and date
  - Flag discrepancies for investigation
  - Reconciliation status dashboard (matched, unmatched, pending)
  - Historical reconciliation records

• **Fee and Adjustment Management**:
  - Apply transaction fees based on pricing agreements
  - Add manual adjustments (e.g., technology fees, monthly fees)
  - Chargeback deductions automatically calculated
  - Rolling reserve calculations (e.g., 10% held for 180 days)
  - Reserve release scheduling
  - Currency conversion fees for multi-currency

• **Payment File Generation**:
  - **NACHA/ACH**: For US bank transfers
  - **SEPA**: For European bank transfers
  - **BACS**: For UK bank transfers
  - **Wire Transfer**: For international or large amounts
  - Files formatted per banking standards
  - Secure file transmission to banking partners
  - Confirmation of file receipt and processing

• **Settlement Schedule Configuration**:
  - Set individual merchant settlement schedules
  - Configure minimum payout thresholds (e.g., don't pay until $100 accumulated)
  - Set maximum payout amounts per settlement
  - Define reserve percentages and hold periods
  - Weekend/holiday handling rules
  - Automatic vs manual approval workflows

**Settlement Calculation Example:**

**Gross Volume**: $10,000
**Less Transaction Fees (2.5%)**: -$250
**Less Refunds**: -$500
**Less Chargebacks**: -$100
**Less Rolling Reserve (10%)**: -$1,000
**Plus Reserve Release**: +$800
**Less Monthly Fee**: -$50
**Net Settlement**: **$8,900**

**Settlement Workflow:**

1. **Batch Creation**: System automatically creates batch at end of settlement period
2. **Fee Calculation**: All fees and adjustments applied
3. **Reserve Hold**: Rolling reserve percentage held
4. **Approval**: Batch reviewed and approved (auto or manual)
5. **File Generation**: Payment file created in required format
6. **Bank Submission**: File sent to banking partner
7. **Confirmation**: Bank confirms receipt and processing
8. **Funding**: Merchant receives funds in bank account
9. **Notification**: Merchant receives settlement report via email

**Security and Compliance:**

- Dual approval required for settlements over $10,000
- All settlement actions logged in audit trail
- Segregation of duties (maker-checker)
- Secure file transmission (SFTP, encrypted)
- PCI DSS compliant (no card data in settlement files)

**Common Issues and Resolution:**

- **Failed Settlement**: Bank rejected due to invalid account details - verify merchant bank info
- **Reconciliation Mismatch**: Amount doesn't match - check for currency conversion or fees
- **Delayed Funding**: Holiday or weekend delay - communicate with merchant
- **Insufficient Balance**: PSP doesn't have funds - check reserve calculations
- **Reserve Disputes**: Merchant questions hold - explain terms and release schedule

**Best Practices:**
- Process settlements daily to maintain merchant cash flow
- Reconcile within 24 hours of bank confirmation
- Communicate settlement schedules clearly to merchants
- Review large settlements manually before processing
- Maintain adequate reserves for chargebacks
- Automate where possible to reduce manual errors
- Keep merchants informed with automated settlement notifications`,
                keywords: ['settlements', 'payouts', 'batches', 'reconciliation']
            },
            {
                title: 'Chargebacks',
                icon: Repeat,
                description: 'Handle chargeback cases and disputes.',
                content: `The Chargebacks page provides comprehensive tools for managing one of the most challenging aspects of payment processing. Effective chargeback management protects your revenue and helps merchants stay within card network thresholds.

**Understanding Chargebacks:**

A chargeback is a transaction reversal initiated by the cardholder's issuing bank. The merchant's account is debited, and funds are returned to the cardholder. Chargebacks were designed for consumer protection but are often abused (friendly fraud).

**Critical Thresholds:**
- **Standard**: 0.9% of transactions (aim to stay below this)
- **Early Warning**: 1.0% of transactions (monitoring programs triggered)
- **Excessive**: 1.5% of transactions (fines and potential termination)
- **Severe**: 2.0% or higher (likely merchant termination)

**Complete Case Management:**

• **Chargeback Dashboard**:
  - View all open, pending, won, and lost cases
  - Status indicators with color coding
  - Days remaining to respond prominently displayed
  - Filter by merchant, reason code, amount, date
  - Quick stats: Total cases, win rate, average case value
  - Alert banners for merchants approaching thresholds

• **Case Lifecycle Tracking**:
  1. **Received**: Chargeback notification received from acquirer
  2. **Under Review**: Case being analyzed for response viability
  3. **Evidence Gathering**: Collecting documents to fight the chargeback
  4. **Submitted**: Representment sent to issuer
  5. **Awaiting Decision**: Issuer reviewing evidence
  6. **Won**: Merchant prevails, funds returned
  7. **Lost**: Issuer sides with cardholder
  8. **Pre-Arbitration**: Case escalated beyond first chargeback
  9. **Arbitration**: Card network makes final binding decision

• **Response Workflow**:
  **Step 1 - Receive Notification**:
  - Email alert sent immediately to merchant and ops team
  - Case appears in dashboard with countdown timer
  - Reason code and description provided
  - Original transaction details attached
  
  **Step 2 - Analyze Viability**:
  - Review reason code and cardholder claim
  - Check transaction details (AVS, CVV, 3DS)
  - Assess win probability (our AI can help)
  - Decide: Accept (issue refund) or Fight (representment)
  
  **Step 3 - Gather Evidence**:
  - Proof of delivery (tracking, signature)
  - Customer communication (emails, chat logs)
  - Terms and conditions with customer acceptance
  - AVS and CVV match results
  - 3D Secure authentication proof
  - IP address and device fingerprint
  - Photographs of delivered product
  - Customer account history showing no prior complaints
  
  **Step 4 - Submit Representment**:
  - Upload all evidence documents
  - Write rebuttal letter addressing reason code
  - System packages evidence per card network requirements
  - Submit before deadline (typically 7-20 days)
  
  **Step 5 - Track Outcome**:
  - Monitor case status for issuer decision
  - Receive notification of outcome (30-90 days typical)
  - If won: Funds returned to merchant
  - If lost: Funds remain with cardholder, fees assessed

• **Document Management**:
  - Drag-and-drop file upload (PDF, JPG, PNG)
  - Support for multiple documents per case
  - Automatic file naming and organization
  - Preview documents before submission
  - Document checklist based on reason code
  - File size limits: 10MB per document, 50MB per case

• **Deadline Management**:
  - Countdown timer on each case showing days/hours remaining
  - Email reminders at 7 days, 3 days, and 1 day before deadline
  - Push notifications for urgent deadlines
  - Auto-escalation if no action taken within threshold
  - Deadline extensions can be requested (rarely granted)

• **Chargeback Analytics**:
  - **Chargeback Ratio Calculator**: Real-time ratio by merchant
  - **Reason Code Distribution**: See most common dispute reasons
  - **Win/Loss Rates**: Track representment success
  - **Financial Impact**: Total funds lost to chargebacks
  - **Trends**: Identify increasing chargeback merchants
  - **Benchmarking**: Compare against industry averages
  - **Forecasting**: Predict future chargeback volumes

• **Merchant Threshold Alerts**:
  - Automatic alerts when merchant approaches 0.9%
  - Escalating alerts at 1.0% and 1.5%
  - Merchant warning emails with action plans
  - Recommend mitigation strategies
  - Consider suspension for chronic offenders

**Common Reason Codes:**

**Fraud (No Authorization)**:
- Visa 10.4: Card-Absent Fraud
- MC 4863: Cardholder Doesn't Recognize
- **Win Strategy**: Prove 3DS authentication, AVS/CVV match, delivery confirmation

**Service/Merchandise Issues**:
- Visa 13.1: Merchandise/Services Not Received
- MC 4853: Goods Not Provided
- **Win Strategy**: Tracking showing delivery, signature, customer communication

**Processing Errors**:
- Visa 12.6: Duplicate Processing
- MC 4834: Duplicate Processing
- **Win Strategy**: Prove transactions were different (different dates, amounts, items)

**Cancelled Services**:
- Visa 13.7: Cancelled Merchandise/Services
- MC 4853: Goods/Services Cancelled
- **Win Strategy**: Terms showing no-refund policy, proof service still active

**Chargeback Prevention Strategies:**

1. **Clear Communication**:
   - Use recognizable billing descriptor
   - Send order confirmations immediately
   - Provide tracking information proactively
   - Make refund policy clear before purchase

2. **Strong Authentication**:
   - Implement 3D Secure 2.0 for liability shift
   - Verify AVS and CVV on all transactions
   - Use device fingerprinting for fraud detection

3. **Excellent Customer Service**:
   - Make refunds easy to obtain
   - Respond to customer inquiries within 24 hours
   - Resolve issues before they become chargebacks

4. **Delivery Confirmation**:
   - Require signature for high-value items
   - Use tracked shipping with insurance
   - Photograph items before shipping

5. **Documentation**:
   - Keep detailed records of all transactions
   - Save customer communication
   - Maintain terms and conditions with timestamps

**Financial Impact:**

Beyond the reversed transaction amount, chargebacks incur:
- **Chargeback Fee**: $20-$100 per case (non-refundable even if won)
- **Representment Fee**: Additional $15-$50 to fight
- **Arbitration Fee**: $500+ if escalated
- **Lost Product**: If physical goods shipped
- **Time Cost**: Hours spent gathering evidence
- **Potential Penalties**: Fines if exceeding thresholds
- **Account Termination**: Risk of losing processing ability

**Best Practices:**
- Respond to all chargebacks within 3 days of receipt
- Fight chargebacks you can win (fraud with 3DS, duplicate errors)
- Accept chargebacks for service issues (cheaper than fighting)
- Keep evidence organized and easily accessible
- Train merchants on chargeback prevention
- Monitor ratios weekly and take early action
- Use RDR (Rapid Dispute Resolution) when available to avoid formal chargebacks`,
                keywords: ['chargebacks', 'disputes', 'representment', 'evidence']
            },
            {
                title: 'Disputes',
                icon: AlertTriangle,
                description: 'Pre-chargeback dispute resolution.',
                content: `Early dispute resolution before chargebacks occur:

• **Retrieval Requests**: Respond to information requests from issuers
• **Pre-Arbitration**: Handle cases escalated beyond first chargeback
• **Dispute Prevention**: Implement alerts and prevention strategies
• **Communication**: Direct communication with issuing banks
• **Resolution Tracking**: Track outcomes and success rates`,
                keywords: ['disputes', 'retrievals', 'prevention', 'resolution']
            },
            {
                title: 'AI Dispute Resolution',
                icon: Brain,
                description: 'AI-powered dispute handling assistance.',
                content: `Leverage AI to improve dispute outcomes:

• **Smart Evidence Gathering**: AI suggests relevant evidence to include
• **Response Templates**: AI-generated response drafts based on reason codes
• **Win Probability**: Predict likelihood of winning based on case details
• **Pattern Detection**: Identify fraud patterns and friendly fraud
• **Recommendation Engine**: Get actionable recommendations for each case
• **Learning System**: System improves based on historical outcomes`,
                keywords: ['ai', 'artificial intelligence', 'automation', 'disputes']
            },
            {
                title: 'Recurring Payments & Subscriptions',
                icon: Repeat,
                description: 'Advanced subscription management with AI lifecycle capabilities.',
                content: `The Recurring Payments module provides enterprise-grade subscription billing and management with AI-powered lifecycle optimization, flexible billing configurations, and intelligent dunning management.

**Overview:**

Recurring payments are automated, periodic charges that enable subscription-based business models. This platform supports four primary plan types:

• **Subscription**: Fixed recurring charges (e.g., monthly SaaS fees)
• **Installment**: Fixed payment schedule to pay off a balance
• **Scheduled**: Custom payment schedules (e.g., quarterly, bi-annual)
• **Usage-Based**: Variable billing based on consumption metrics

**Core Features:**

• **Multi-Tab Interface**:
  - **Subscriptions Tab**: Create and manage all recurring payment plans
  - **AI Lifecycle Tab**: AI-driven churn prediction and retention automation
  - **Flexible Billing Tab**: Advanced billing configurations and proration
  - **Dunning Tab**: Failed payment recovery with customizable retry logic

• **Subscription Creation and Management**:
  - Create subscriptions for any merchant with full customer details
  - Configure frequency: Daily, weekly, monthly, quarterly, yearly, or custom intervals
  - Set interval counts (e.g., every 2 months, every 3 weeks)
  - Define total cycles for finite subscriptions or leave indefinite
  - Multi-currency support (USD, EUR, GBP, and more)
  - Automatic next payment date calculation based on frequency
  - Real-time status management: Active, Paused, Cancelled, Completed, Pending, Dunning
  - AI-managed flag for subscriptions under autonomous AI control

• **Payment Method Tokenization**:
  - Secure storage of payment method tokens
  - PCI-compliant card information handling
  - Support for multiple payment methods per customer
  - Automatic payment method expiration handling
  - Update payment method workflows

• **Lifecycle Tracking**:
  - Cycles completed vs total cycles monitoring
  - Total amount paid tracking
  - Last payment date and next payment date visibility
  - Failed payment count for risk assessment
  - Complete payment history per subscription

• **ISO 20022 Compliance**:
  - Structured payment data for recurring payments
  - Payment IDs and instruction IDs for traceability
  - Purpose code "SUBC" for subscription classification
  - End-to-end transaction identification

**AI Lifecycle Management:**

Transform subscription management with predictive analytics and automated retention strategies.

• **Churn Risk Prediction**:
  - **AI-Powered Analysis**: Machine learning models analyze multiple factors to predict churn probability
  - **Risk Scoring**: Each subscription receives a churn risk score from 0-1 (0% to 100%)
  - **Risk Factors Identification**: AI identifies 3-5 specific factors contributing to churn risk
  - **Real-Time Analysis**: Run churn analysis on-demand for all active subscriptions
  - **Multi-Factor Assessment**:
    * Customer engagement patterns
    * Payment history and failed payment count
    * Cycles completed vs expected lifecycle
    * Total amount paid and value realization
    * Frequency of customer support interactions
    * Usage patterns for usage-based subscriptions

• **Risk Segmentation**:
  - **High Risk (60%+ churn probability)**: Red alert, immediate action required
  - **Medium Risk (30-60% churn probability)**: Yellow warning, proactive retention
  - **Healthy (<30% churn probability)**: Green status, maintain engagement
  - Dashboard displays counts and breakdown by risk category

• **Automated Retention Offers**:
  - **AI Recommendation Engine**: AI suggests optimal retention offer type and value
  - **Offer Types**:
    * **Discount**: Percentage or fixed amount reduction (e.g., "20% off next 3 months")
    * **Free Trial Extension**: Additional free service period
    * **Feature Upgrade**: Access to premium features at current price
    * **Custom**: Tailored offers based on customer segment
  - **Offer Lifecycle**:
    * AI generates offer with 7-day expiration
    * One-click application from the interface
    * Automatic customer email notification with offer details
    * Tracking of applied offers and customer responses
  - **Personalization**: Offers tailored to individual customer behavior and value

• **Proactive Communication**:
  - Automated retention offer emails with personalized messaging
  - Professional email templates explaining the special offer
  - Clear call-to-action for customers to accept
  - Expiration urgency to drive timely response

• **Analytics and Insights**:
  - Total at-risk subscriptions count
  - Churn risk distribution visualization
  - Retention offer effectiveness tracking
  - Recovery rate monitoring
  - Financial impact of churn prevention

• **Best Practices**:
  - Run churn analysis weekly or monthly depending on subscription volume
  - Act on high-risk subscriptions within 24-48 hours
  - Test different retention offer types to optimize effectiveness
  - Monitor customer response to retention offers
  - Combine automated offers with personalized outreach for high-value customers
  - Use churn factors to improve product and service quality

**Flexible Billing Configuration:**

Advanced billing customization to support complex subscription scenarios and business models.

• **Proration Management**:
  - **Enable/Disable Proration**: Toggle prorated charges for partial billing periods
  - **Automatic Calculations**: System automatically calculates prorated amounts
  - **Use Cases**:
    * Mid-cycle plan upgrades/downgrades
    * Subscription start/end dates that don't align with billing cycles
    * Credit calculations for service interruptions
  - **Example Calculation**:
    * Full monthly amount: $100
    * Days remaining in month: 15 out of 30
    * Prorated charge: $50
    * Customer savings: $50
  - **Visual Examples**: Real-time proration calculation display in the UI
  - **Fairness**: Ensures customers only pay for service they receive

• **Custom Billing Cycles**:
  - **Billing Anchor Types**:
    * **Subscription Start Date**: Billing occurs on subscription anniversary
    * **Fixed Day of Month**: All customers billed on same day (e.g., 1st or 15th)
    * **Custom Schedule**: Define unique billing schedule per subscription
  - **Fixed Day Configuration**:
    * Select day of month (1-31) for billing
    * Automatic handling of months with fewer days (e.g., February 30 → Feb 28/29)
    * Consistent cash flow management for merchants
  - **Current Configuration Display**: Shows active billing settings and next billing date
  - **Change Management**: Preview impact of billing cycle changes before applying

• **Usage-Based Billing**:
  - **Metrics Tracking**:
    * **API Calls**: Charge based on API usage volume
    * **Transactions**: Bill per transaction processed
    * **Storage (GB)**: Charge for data storage consumption
    * **Bandwidth (GB)**: Bill for data transfer
    * **Active Users**: Charge per user seat or MAU
    * Custom metrics can be defined per business model
  - **Billing Triggers**:
    * **Threshold-Based**: Trigger billing when usage exceeds defined threshold
    * **Real-Time Monitoring**: Track usage against thresholds continuously
    * **Overage Billing**: Automatically bill for usage exceeding included allowance
  - **Billing Methods**:
    * **Per Unit**: Fixed price per unit consumed (e.g., $0.01 per API call)
    * **Tiered Pricing**: Different rates for different usage tiers
      - Example: 0-1000 calls: $0.02 each, 1001-5000: $0.015 each, 5000+: $0.01 each
    * **Volume Discounts**: Lower effective rate as volume increases
      - Example: Pay for highest tier rate across all usage
  - **Usage Examples**: UI displays billing calculations based on current configuration
  - **Predictable + Variable**: Combine base subscription fee with usage charges

• **Configuration Workflow**:
  1. Select subscription to configure billing
  2. Choose billing anchor type and set parameters
  3. Enable proration if needed for mid-cycle changes
  4. Define usage metrics and thresholds for usage-based billing
  5. Select billing method (per unit, tiered, volume)
  6. Preview billing examples and impacts
  7. Save configuration and apply to subscription
  8. Automatic application on next billing cycle

• **Business Value**:
  - Support diverse pricing models and customer segments
  - Align billing with value delivery (usage-based)
  - Reduce billing disputes with transparent proration
  - Improve cash flow predictability with fixed billing days
  - Scale pricing with customer growth and usage
  - Competitive differentiation through flexible billing options

**Dunning Management:**

Intelligent failed payment recovery system that maximizes collection rates while maintaining positive customer relationships.

• **What is Dunning?**:
  - **Definition**: Dunning is the automated process of recovering failed payments through systematic retry attempts and customer communications
  - **Importance**: Failed payments are the #1 cause of involuntary churn in subscription businesses
  - **Recovery Rates**: Proper dunning can recover 40-70% of failed payments
  - **Customer Experience**: Well-designed dunning maintains positive relationships while collecting payment

• **Dunning Workflow Overview**:
  1. Payment fails due to insufficient funds, expired card, or technical issue
  2. Subscription status changes to "dunning"
  3. Automatic retry scheduled based on retry policy
  4. Customer receives notification about failed payment
  5. System retries payment according to schedule
  6. Additional notifications sent before each retry
  7. If successful: Subscription returns to "active" status
  8. If all retries fail: Escalation or cancellation per policy

• **Retry Schedule Configuration**:
  - **Customizable Schedule**: Define exactly when to retry failed payments
  - **Standard Configuration**: Four retry attempts with configurable days between
  - **Example Default Schedule**:
    * First retry: 1 day after failure
    * Second retry: 3 days after first retry (4 days total)
    * Third retry: 7 days after second retry (11 days total)
    * Final retry: 14 days after third retry (25 days total)
  - **Flexibility**: Adjust intervals based on your business model and customer base
  - **Best Practices**:
    * Retry quickly at first (1-2 days) to catch temporary issues
    * Space out later retries to give customers time to resolve issues
    * Consider payday cycles (weekly, bi-weekly, monthly)
    * Balance recovery vs customer annoyance

• **Active Dunning Dashboard**:
  - **Real-Time View**: See all subscriptions currently in dunning status
  - **Key Information Per Subscription**:
    * Customer name and email
    * Subscription amount and currency
    * Failed payment count (total failures, not just current dunning cycle)
    * Current retry attempt number (e.g., "2 / 4")
    * Next scheduled retry date
    * Communications sent (timeline of notifications)
  - **Priority Indicators**: Red border for high-priority/high-value subscriptions
  - **Action Buttons**:
    * **Retry Now**: Immediately attempt payment outside regular schedule
    * Useful when customer confirms they've updated payment method
  - **Status Tracking**: Visual indication of dunning progression
  - **Bulk Operations**: View all failing subscriptions at once for proactive management

• **Communication Templates**:
  - **Three-Tier Email System**:
  
  **First Failure Notification**:
    * Subject: "Payment Failed - Action Required"
    * Tone: Friendly and helpful
    * Content: Informs customer of failure, provides update payment link
    * CTA: Update payment method
    * Timing: Sent immediately after first failure
  
  **Second Attempt Notification**:
    * Subject: "Second Notice - Payment Failed"
    * Tone: More urgent but still professional
    * Content: Reminds of previous failure, warns of potential service interruption
    * CTA: Update payment method urgently
    * Timing: Sent 1 day before second retry attempt
  
  **Final Warning Notification**:
    * Subject: "Final Notice - Subscription at Risk"
    * Tone: Serious and urgent
    * Content: Last chance before cancellation, 48-hour warning
    * CTA: Update immediately to avoid service interruption
    * Timing: Sent 1 day before final retry attempt

• **Template Customization**:
  - **Variable Placeholders**:
    * {{customer_name}}: Personalizes email with customer's name
    * {{amount}}: Shows specific amount that failed
    * {{payment_link}}: Secure link to update payment method
  - **Edit Subject and Body**: Full customization of all email content
  - **Brand Alignment**: Match email tone and messaging to your brand
  - **Multiple Languages**: Create templates for different languages/regions
  - **A/B Testing**: Test different messaging to optimize recovery rates

• **Dunning State Tracking**:
  - **Current Attempt**: Which retry attempt (1, 2, 3, 4) is active
  - **Next Retry Date**: When the next payment attempt will occur
  - **Communications Log**: Complete history of all notifications sent
    * Communication type (first failure, second attempt, final warning)
    * Timestamp of when sent
    * Template ID used
    * Delivery confirmation
  - **Escalation Status**: Flag for subscriptions that have moved to escalation
  - **Customer Interactions**: Track customer responses and payment method updates

• **Smart Retry Logic**:
  - **Decline Reason Analysis**: Adjust retry timing based on specific decline codes
    * Insufficient funds: Retry after typical payday
    * Expired card: No point retrying, request update immediately
    * Technical failure: Retry quickly
    * Fraud block: Contact customer before retry
  - **Time-of-Day Optimization**: Schedule retries for times with highest success rates
  - **Payment Method Fallback**: If customer has multiple payment methods, try alternates

• **Escalation Management**:
  - **Automatic Escalation**: Subscriptions escalated after all retries fail
  - **Escalation Actions**:
    * Suspend service/access
    * Assign to account manager for personal outreach
    * Offer payment plan or hardship options
    * Begin collection process
  - **Escalation Tracking**: Monitor subscriptions in escalation status
  - **Resolution Workflows**: Structured process for handling escalated cases

• **Analytics and Reporting**:
  - **Recovery Rates**: Track percentage of failed payments successfully recovered
  - **Optimal Retry Timing**: Analyze which retry intervals are most effective
  - **Communication Effectiveness**: Measure open rates and customer responses
  - **Financial Impact**: Calculate revenue saved through dunning
  - **Churn Attribution**: Identify involuntary vs voluntary churn
  - **Decline Reason Trends**: Monitor common payment failure reasons

• **Best Practices for Dunning Success**:
  - **Act Fast**: First retry within 24 hours captures ~60% of recoverable failures
  - **Clear Communication**: Explain exactly what happened and what customer needs to do
  - **Easy Fix**: Provide one-click payment method update links
  - **Maintain Service**: Consider grace period before service suspension
  - **Personal Touch**: High-value customers get personal outreach alongside automation
  - **Card Updater**: Use automatic card update services to prevent expiration failures
  - **Proactive Monitoring**: Send alerts before card expiration
  - **Testing**: Regularly test dunning emails and update links
  - **Optimize Schedule**: Use data to refine retry timing for your specific customer base

• **Preventing Dunning Issues**:
  - Verify payment method before subscription start
  - Send pre-billing reminders to customers
  - Implement automatic card updating services
  - Provide self-service payment method management
  - Monitor card expiration dates proactively
  - Educate customers about keeping payment info current

**Integration with Platform Features:**

• **Merchant Isolation**: Each merchant's subscriptions managed independently
• **Transaction Linking**: Every recurring payment creates a transaction record
• **Settlement Integration**: Recurring payments flow through standard settlement process
• **Reporting**: Recurring revenue reporting separate from one-time transactions
• **Analytics**: MRR (Monthly Recurring Revenue), churn rate, LTV calculations
• **API Access**: Full API support for creating and managing subscriptions programmatically

**Use Cases:**

• **SaaS Providers**: Monthly or annual software subscription billing
• **Membership Sites**: Recurring membership dues with multiple tiers
• **Content Platforms**: Subscription access to content libraries
• **Service Businesses**: Recurring service contracts (maintenance, support)
• **E-commerce**: Subscribe-and-save programs for consumable products
• **Utilities**: Monthly billing for services with variable usage
• **Education**: Course or training subscriptions with installment options
• **Healthcare**: Recurring treatment or wellness program payments

**Security and Compliance:**

• **PCI DSS Compliance**: Tokenized card storage, never store CVV
• **ISO 20022 Standards**: Structured payment data for cross-border subscriptions
• **SCA (3DS)**: Support for strong customer authentication on recurring payments
• **Data Privacy**: GDPR-compliant customer data handling
• **Audit Trail**: Complete history of all subscription changes and payments

**Operational Efficiency:**

• **Automation**: Reduces manual intervention for recurring billing
• **Scalability**: Handle thousands of subscriptions with minimal overhead
• **Cash Flow**: Predictable recurring revenue streams
• **Customer Lifetime Value**: Maximize LTV through retention and dunning
• **Reduced Churn**: AI lifecycle management proactively retains customers

This comprehensive recurring payments system transforms subscription management from a manual, error-prone process into an intelligent, automated revenue engine that maximizes customer lifetime value and minimizes involuntary churn.`,
                keywords: ['recurring', 'subscriptions', 'billing', 'ai lifecycle', 'churn', 'retention', 'dunning', 'proration', 'usage-based', 'flexible billing']
            }
        ]
    },
    {
        category: 'Onboarding',
        icon: CheckSquare,
        items: [
            {
                title: 'Merchant Onboarding',
                icon: Store,
                description: 'Onboard new merchants with automated KYC/KYB.',
                content: `Streamlined merchant onboarding process:

**10-Step Workflow:**
1. **Business Details**: Company information, MCC code, industry
2. **Company Structure**: Ownership, directors, UBOs based on entity type
3. **LEI Verification**: Legal Entity Identifier validation via GLEIF
4. **Contact Information**: Primary contacts and key personnel
5. **Document Upload**: KYC documents with validation
6. **KYB Verification**: Automated business verification via TheKYB
7. **AML Screening**: Anti-money laundering checks via AMLWatcher
8. **Bank Details**: Settlement account configuration with IBAN validation
9. **Pricing**: Fee structure and rate setup
10. **Review & Submit**: Final review and submission

• **Self-Service Portal**: Generate unique URLs for merchant self-onboarding
• **Status Tracking**: Real-time application status updates
• **Approval Workflow**: Multi-level approval for high-risk applications`,
                keywords: ['onboarding', 'kyc', 'kyb', 'aml', 'merchants', 'application']
            },
            {
                title: 'Acquirer Onboarding',
                icon: Landmark,
                description: 'Connect to acquiring banks and processors.',
                content: `Integrate with acquiring partners:

• **Bank Connections**: Set up connections to acquiring banks
• **Certification**: Manage certification requirements
• **BIN Configuration**: Configure BIN routing
• **Settlement Accounts**: Link bank accounts for settlements
• **API Integration**: Configure API credentials and endpoints
• **Testing**: Sandbox environment for integration testing`,
                keywords: ['acquirer', 'bank', 'processor', 'integration']
            },
            {
                title: 'APM Onboarding',
                icon: Smartphone,
                description: 'Add alternative payment methods.',
                content: `Integrate alternative payment methods:

• **Digital Wallets**: Apple Pay, Google Pay, Samsung Pay, PayPal
• **Bank Transfers**: ACH, SEPA, Faster Payments, BACS
• **Buy Now Pay Later**: Klarna, Affirm, Afterpay, ClearPay
• **Regional Methods**: iDEAL, Bancontact, POLi, GiroPay, Sofort
• **Cryptocurrency**: Bitcoin, Ethereum, stablecoin integrations
• **Real-Time Payments**: FedNow, RTP, Instant SEPA`,
                keywords: ['apm', 'alternative payments', 'wallets', 'bnpl']
            },
            {
                title: 'Approvals',
                icon: CheckSquare,
                description: 'Review and approve pending requests.',
                content: `Centralized approval management:

• **Pending Queue**: View all items awaiting approval
• **Request Types**: Merchant onboarding, terminal creation, user access
• **Workflow**: Multi-level approval based on risk and value
• **Audit Trail**: Complete history of all approvals and rejections
• **Bulk Actions**: Approve or reject multiple items at once
• **SLA Tracking**: Monitor approval turnaround times`,
                keywords: ['approvals', 'workflow', 'pending', 'review']
            }
        ]
    },
    {
        category: 'Merchants',
        icon: Store,
        items: [
            {
                title: 'All Merchants',
                icon: Store,
                description: 'Manage your merchant portfolio.',
                content: `Complete merchant management:

• **Merchant Directory**: View all merchants with status and key metrics
• **Merchant Details**: Full profile including:
  - Business information
  - Contact details
  - Processing volume
  - Fee structure
  - Risk level
  - LEI/vLEI status
• **Actions**: Activate, suspend, or terminate merchants
• **Performance**: Transaction volume and success rates
• **Documents**: Access uploaded KYC documents`,
                keywords: ['merchants', 'portfolio', 'management', 'profiles']
            },
            {
                title: 'Merchant MIDs',
                icon: CreditCard,
                description: 'Manage Merchant IDs and configurations.',
                content: `MID (Merchant ID) management:

• **MID Directory**: All MIDs across your platform
• **Configuration**: Terminal types, transaction types, currencies
• **Provider Mapping**: Link MIDs to payment providers
• **Status Management**: Activate, deactivate, or suspend MIDs
• **Fee Configuration**: Set processing fees per MID
• **Database Integration**: PostgreSQL-backed MID storage`,
                keywords: ['mid', 'merchant id', 'configuration', 'terminal']
            },
            {
                title: 'Terminals',
                icon: Terminal,
                description: 'Physical and virtual terminal management.',
                content: `Terminal lifecycle management:

• **Terminal Inventory**: Track all POS devices
• **Deployment**: Ship and activate terminals
• **Firmware**: Monitor and update firmware versions
• **Diagnostics**: View terminal health and connectivity
• **Reporting**: Per-terminal transaction reports
• **TMS Integration**: Terminal Management System connectivity`,
                keywords: ['terminals', 'pos', 'devices', 'hardware']
            },
            {
                title: 'Virtual Terminals',
                icon: Monitor,
                description: 'Web-based payment terminals.',
                content: `Virtual terminal configuration:

• **Create Terminals**: Set up web-based payment forms
• **Customization**: Branding and field configuration
• **Access Control**: User permissions per terminal
• **Transaction Types**: Sale, auth, refund, void capabilities
• **Limits**: Set daily and per-transaction limits
• **3DS Integration**: Secure customer authentication`,
                keywords: ['virtual terminal', 'web', 'moto', 'keyed']
            },
            {
                title: 'API Credentials',
                icon: Key,
                description: 'Manage API keys and authentication.',
                content: `Secure API credential management:

• **API Keys**: Generate and manage API keys
• **Webhooks**: Configure callback URLs
• **IP Whitelisting**: Restrict access by IP
• **Key Rotation**: Schedule automatic key rotation (PCI requirement)
• **Usage Logs**: Monitor API usage and errors
• **OAuth2**: OAuth 2.0 token-based authentication`,
                keywords: ['api', 'credentials', 'keys', 'authentication', 'webhooks']
            },
            {
                title: 'Merchant Users',
                icon: Users,
                description: 'Manage merchant portal users.',
                content: `Merchant user administration:

• **User Accounts**: Create and manage merchant users
• **Roles**: Admin, Manager, Operator, Viewer
• **Permissions**: Granular access control
• **Two-Factor Auth**: Enforce 2FA for security (PCI 8.4.2)
• **Activity Logs**: Track user actions for audit
• **Session Management**: Automatic timeout and lockout`,
                keywords: ['users', 'access', 'permissions', 'roles']
            }
        ]
    },
    {
        category: 'Finance',
        icon: Wallet,
        items: [
            {
                title: 'Balances',
                icon: Wallet,
                description: 'View PSP and merchant balances.',
                content: `Financial balance management:

• **PSP Balance**: Overall platform financial position
• **Merchant Balances**: Individual merchant balances
• **Reserve Funds**: Chargeback and rolling reserves
• **Pending Settlements**: Upcoming payouts
• **Historical Data**: Balance trends over time
• **Multi-Currency**: Support for multiple currencies`,
                keywords: ['balances', 'funds', 'reserves', 'money']
            },
            {
                title: 'Reports',
                icon: FileText,
                description: 'Generate financial reports.',
                content: `Comprehensive reporting suite:

• **Standard Reports**: Daily, weekly, monthly summaries
• **Custom Reports**: Build reports with custom parameters
• **Scheduled Reports**: Automate report generation
• **Export Formats**: CSV, PDF, Excel
• **Report Types**:
  - Transaction reports
  - Settlement reports
  - Chargeback reports
  - Fee reports
  - Merchant statements
• **PCI Compliance Reports**: Audit-ready documentation`,
                keywords: ['reports', 'export', 'statements', 'financial']
            },
            {
                title: 'Advanced Reports',
                icon: BarChart3,
                description: 'P&L and advanced financial analytics.',
                content: `Deep financial analysis:

• **P&L Statements**: Profit and loss by merchant, period
• **Fee Analysis**: Breakdown of all fee types
• **Volume Analysis**: Transaction volume trends
• **Success Rates**: Approval rate analytics
• **Chargeback Analysis**: Ratios and trends
• **Comparison**: Period-over-period comparisons
• **Margin Analysis**: Buy rate vs sell rate margins`,
                keywords: ['advanced reports', 'pnl', 'profit', 'loss', 'analytics']
            },
            {
                title: 'Payouts',
                icon: CreditCard,
                description: 'Process merchant payouts.',
                content: `Payout management:

• **Payout Queue**: Pending payouts awaiting processing
• **Batch Processing**: Process multiple payouts at once
• **Bank Files**: Generate NACHA/SEPA/BACS files
• **Status Tracking**: Track payout status in real-time
• **Confirmation**: Settlement confirmation reports
• **Dual Control**: Maker-checker approval workflow`,
                keywords: ['payouts', 'disbursements', 'bank transfer']
            },
            {
                title: 'Automated Payouts',
                icon: DollarSign,
                description: 'Configure automatic settlement.',
                content: `Automated settlement configuration:

• **Schedules**: Daily, weekly, or custom schedules
• **Rules**: Threshold-based or time-based triggers
• **Reserves**: Automatic reserve calculations
• **Notifications**: Email alerts for payouts
• **Exceptions**: Handle failed payouts automatically
• **Audit Trail**: Complete payout history`,
                keywords: ['automation', 'scheduled', 'automatic payouts']
            },
            {
                title: 'Reconciliation',
                icon: ArrowUpDown,
                description: 'Match transactions with bank records.',
                content: `Transaction reconciliation:

• **Import Files**: Upload bank statements (MT940, CSV, BAI2)
• **Auto-Match**: Automatic transaction matching
• **Exceptions**: Handle unmatched items
• **Reports**: Reconciliation status reports
• **Audit**: Complete reconciliation history
• **Daily Balancing**: Ensure transaction integrity`,
                keywords: ['reconciliation', 'matching', 'bank', 'statements']
            },
            {
                title: 'Payment Providers',
                icon: Building,
                description: 'Manage payment provider connections.',
                content: `Provider management:

• **Provider Directory**: All connected payment providers
• **Configuration**: API credentials and settings
• **Status**: Real-time provider availability
• **Routing**: Configure routing preferences
• **Fees**: Provider fee schedules
• **Health Monitoring**: Track uptime and latency`,
                keywords: ['providers', 'processors', 'gateways', 'acquirers']
            },
            {
                title: 'Buy Rates',
                icon: Percent,
                description: 'Configure provider buy rates.',
                content: `Buy rate management:

• **Rate Cards**: Provider pricing by card type, region
• **Interchange**: Track interchange rates
• **Scheme Fees**: Visa/Mastercard scheme fees
• **Effective Dates**: Rate change scheduling
• **History**: Rate change audit trail
• **IC++ Support**: Interchange plus plus pricing`,
                keywords: ['buy rates', 'interchange', 'pricing', 'costs']
            },
            {
                title: 'Merchant Pricing',
                icon: DollarSign,
                description: 'Set merchant fee structures.',
                content: `Merchant pricing configuration:

• **Pricing Models**: Flat rate, interchange++, tiered, blended
• **Fee Types**: Transaction fees, monthly fees, setup fees
• **MID-Level Pricing**: Different rates per MID
• **Margin Calculation**: Automatic margin calculations
• **Statements**: Generate merchant fee statements
• **Currency Conversion**: DCC and MCP fees`,
                keywords: ['pricing', 'fees', 'rates', 'margin', 'mdr']
            }
        ]
    },
    {
        category: 'Risk & Compliance',
        icon: Shield,
        items: [
            {
                title: 'Fraud Prevention',
                icon: Shield,
                description: 'Fraud detection and prevention tools.',
                content: `Comprehensive fraud prevention:

• **Risk Scoring**: Real-time transaction risk assessment
• **Rules Engine**: Configure fraud detection rules
• **Velocity Checks**: Monitor transaction patterns
• **Block Lists**: Manage blocked cards, IPs, emails
• **3D Secure**: Configure 3DS 2.0 authentication
• **Machine Learning**: AI-powered fraud detection
• **Alerts**: Real-time fraud alerts and notifications
• **Device Fingerprinting**: Track device characteristics`,
                keywords: ['fraud', 'risk', 'prevention', 'rules', '3ds']
            },
            {
                title: 'Compliance',
                icon: Users,
                description: 'Regulatory compliance management.',
                content: `Compliance and regulatory tools:

• **KYC Management**: Know Your Customer documentation
• **AML Monitoring**: Anti-money laundering screening
• **PCI DSS 4.0.1**: PCI compliance tracking
• **GDPR**: Data privacy management
• **Audit Logs**: Complete audit trail (PCI 10.x)
• **SAR Filing**: Suspicious activity reporting
• **Sanctions Screening**: OFAC, EU, UN sanctions lists`,
                keywords: ['compliance', 'kyc', 'aml', 'pci', 'gdpr', 'regulatory']
            }
        ]
    },
    {
        category: 'Configuration',
        icon: Settings,
        items: [
            {
                title: 'Smart Routing',
                icon: Zap,
                description: 'Intelligent transaction routing.',
                content: `Advanced transaction routing:

• **Routing Rules**: Configure routing based on:
  - Card type and BIN
  - Transaction amount
  - Currency
  - Geographic region
  - Time of day
• **Cascading**: Automatic failover to backup processors
• **Load Balancing**: Distribute volume across processors
• **Cost Optimization**: Route for lowest cost
• **Success Optimization**: Route for highest approval rates`,
                keywords: ['routing', 'smart', 'cascading', 'optimization']
            },
            {
                title: 'Payment Orchestration',
                icon: Globe,
                description: 'Multi-provider payment orchestration.',
                content: `Orchestration platform features:

• **Provider Management**: Connect multiple processors
• **Dynamic Routing**: Real-time routing decisions
• **Fallback Logic**: Automatic retry on decline
• **Tokenization**: Secure card storage (PCI scope reduction)
• **Network Tokens**: Visa/MC network tokenization
• **Unified API**: Single integration for all providers`,
                keywords: ['orchestration', 'providers', 'routing', 'tokens']
            },
            {
                title: 'User Management',
                icon: UserCog,
                description: 'Manage platform users and permissions.',
                content: `Platform user administration:

• **User Accounts**: Create and manage users
• **Roles**: 
  - Administrator: Full access
  - Editor: Modify data, limited settings
  - Viewer: Read-only access
• **Permissions**: Granular permission control with matrix editor
• **Password Policy**: Strong password requirements (PCI 8.3)
• **Activity Logs**: User action audit trail
• **Add User**: Invite new users with role assignment`,
                keywords: ['users', 'roles', 'permissions', 'access', 'admin']
            },
            {
                title: 'Audit Logs',
                icon: Shield,
                description: 'PCI-compliant activity logging.',
                content: `Complete audit trail (PCI DSS Requirement 10):

• **Event Categories**: Authentication, authorization, transactions, configuration
• **Severity Levels**: Info, warning, critical
• **PCI Relevant**: Flag events for compliance audits
• **Search & Filter**: Find specific events quickly
• **Export**: Download logs for external analysis
• **Retention**: Configurable retention periods (1-7 years)
• **Immutable**: Logs cannot be modified or deleted`,
                keywords: ['audit', 'logs', 'pci', 'compliance', 'tracking']
            },
            {
                title: 'Appearance',
                icon: Palette,
                description: 'Customize platform branding.',
                content: `White-label customization:

• **Branding**: Upload logo and favicon
• **Colors**: Customize color scheme
• **Themes**: Light and dark mode
• **Layout**: Sidebar preferences
• **Company Name**: Set your brand name`,
                keywords: ['branding', 'theme', 'colors', 'logo', 'customization']
            },
            {
                title: 'Settings',
                icon: Settings,
                description: 'Platform configuration settings.',
                content: `General platform settings:

• **Company Info**: PSP company details
• **Contact Info**: Support contact information
• **Licensing**: Payment license details
• **Currency Settings**: Configure display currencies
• **Notifications**: Email notification preferences
• **Integrations**: Third-party integrations`,
                keywords: ['settings', 'configuration', 'preferences']
            },
            {
                title: 'Database Setup',
                icon: Database,
                description: 'Configure database connections.',
                content: `Database management:

• **Connection Test**: Verify database connectivity
• **Schema Setup**: Initialize database tables
• **Migrations**: Run database migrations
• **Backup**: Database backup configuration
• **Encryption**: Data-at-rest encryption (PCI 3.5)`,
                keywords: ['database', 'postgresql', 'setup', 'connection']
            }
        ]
    }
];

// PCI DSS 4.0.1 Compliance Knowledge Base
const pciDssContent = [
    {
        category: 'Build and Maintain a Secure Network',
        icon: Network,
        items: [
            {
                title: 'Requirement 1: Network Security Controls',
                icon: Shield,
                description: 'Install and maintain network security controls.',
                content: `**PCI DSS 4.0.1 Requirement 1**: Network Security Controls

This platform implements:

• **1.1 Network Security Policies**: Documented security policies and procedures
• **1.2 Network Security Controls Configuration**:
  - Firewall and router configurations reviewed quarterly
  - All inbound/outbound traffic restricted to necessary communications
  - Cardholder data environment (CDE) isolated from public networks

• **1.3 Network Access Restricted**:
  - DMZ implementation between internet and systems storing cardholder data
  - Anti-spoofing measures implemented
  - Outbound traffic from CDE limited to authorized destinations

• **1.4 Network Connections**:
  - Personal firewall software on all portable computing devices
  - Network segmentation to reduce scope

• **1.5 Risks to CDE Addressed**:
  - Trusted and untrusted networks identified and documented`,
                keywords: ['firewall', 'network', 'security', 'dmz', 'segmentation']
            },
            {
                title: 'Requirement 2: Secure Configurations',
                icon: Settings,
                description: 'Apply secure configurations to all system components.',
                content: `**PCI DSS 4.0.1 Requirement 2**: Secure Configurations

This platform implements:

• **2.1 Secure Configuration Processes**:
  - Configuration standards for all system components
  - Default passwords changed before deployment
  - Unnecessary services disabled

• **2.2 System Components Configured Securely**:
  - Only necessary services, protocols, daemons enabled
  - Security parameters configured to prevent misuse
  - System hardening based on industry standards (CIS benchmarks)

• **2.3 Wireless Environments Secured**:
  - Strong encryption for wireless authentication and transmission
  - Default wireless settings changed

**Implementation in Platform:**
  - All API endpoints use TLS 1.2+
  - Database connections encrypted
  - Session tokens rotated automatically
  - Secure headers implemented (CSP, HSTS, X-Frame-Options)`,
                keywords: ['configuration', 'hardening', 'encryption', 'tls', 'secure']
            }
        ]
    },
    {
        category: 'Protect Account Data',
        icon: Lock,
        items: [
            {
                title: 'Requirement 3: Protect Stored Account Data',
                icon: Database,
                description: 'Protect stored account data.',
                content: `**PCI DSS 4.0.1 Requirement 3**: Protect Stored Account Data

This platform implements:

• **3.1 Account Data Storage Minimized**:
  - Data retention policies implemented
  - Cardholder data purged when no longer needed
  - Quarterly review of stored data

• **3.2 Sensitive Authentication Data Not Stored**:
  - Full track data never stored after authorization
  - CVV/CVC never stored
  - PIN data never stored

• **3.3 Primary Account Number (PAN) Protected**:
  - PAN displayed only with first 6 and last 4 digits
  - Full PAN accessible only on need-to-know basis

• **3.4 PAN Rendered Unreadable**:
  - One-way hashing (SHA-256 with salt)
  - Truncation
  - Index tokens (tokenization)
  - Strong cryptography with key management

• **3.5 - 3.7 Cryptographic Key Management**:
  - Key management procedures documented
  - Cryptographic keys stored securely
  - Key rotation procedures in place`,
                keywords: ['storage', 'encryption', 'pan', 'tokenization', 'cvv']
            },
            {
                title: 'Requirement 4: Protect Data in Transit',
                icon: Globe,
                description: 'Protect cardholder data during transmission.',
                content: `**PCI DSS 4.0.1 Requirement 4**: Protect Data in Transit

This platform implements:

• **4.1 Strong Cryptography Protocols**:
  - TLS 1.2 or higher for all data transmission
  - SSL and early TLS disabled
  - Strong cipher suites only

• **4.2 PAN Protected During Transmission**:
  - End-to-end encryption
  - Never sent via end-user messaging (email, SMS)
  - Point-to-point encryption (P2PE) for card-present

**Platform Implementation:**
  - All API calls require HTTPS
  - Certificate validation enforced
  - HSTS enabled with preload
  - Perfect Forward Secrecy (PFS) enabled
  - Certificate transparency monitoring`,
                keywords: ['transmission', 'tls', 'encryption', 'https', 'transit']
            }
        ]
    },
    {
        category: 'Maintain a Vulnerability Management Program',
        icon: AlertCircle,
        items: [
            {
                title: 'Requirement 5: Protect Against Malware',
                icon: Shield,
                description: 'Protect all systems against malware.',
                content: `**PCI DSS 4.0.1 Requirement 5**: Malware Protection

This platform implements:

• **5.1 Processes to Protect Against Malware**:
  - Anti-malware solutions deployed
  - Regular malware scans
  - Malware definitions updated automatically

• **5.2 Malware Prevented or Detected**:
  - Active monitoring and alerting
  - Behavioral analysis
  - Automatic quarantine

• **5.3 Anti-Malware Mechanisms Active**:
  - Anti-malware cannot be disabled by users
  - Logs retained and reviewed

• **5.4 Anti-Phishing Mechanisms**:
  - Email security controls
  - URL filtering
  - User awareness training`,
                keywords: ['malware', 'antivirus', 'protection', 'security']
            },
            {
                title: 'Requirement 6: Secure Systems and Software',
                icon: Server,
                description: 'Develop and maintain secure systems and software.',
                content: `**PCI DSS 4.0.1 Requirement 6**: Secure Development

This platform implements:

• **6.1 Security Vulnerabilities Identified and Addressed**:
  - Vulnerability scanning monthly
  - Critical vulnerabilities patched within 30 days
  - CVE monitoring

• **6.2 Bespoke and Custom Software Secured**:
  - Secure development lifecycle (SDLC)
  - Code reviews for security
  - OWASP Top 10 addressed

• **6.3 Security Vulnerabilities Identified and Addressed**:
  - Penetration testing annually
  - Web application firewall (WAF) deployed

• **6.4 Public-Facing Web Applications Protected**:
  - Input validation
  - Output encoding
  - SQL injection prevention
  - XSS prevention

• **6.5 Changes Managed Securely**:
  - Change management procedures
  - Testing before production deployment
  - Rollback procedures`,
                keywords: ['development', 'sdlc', 'vulnerabilities', 'patching', 'owasp']
            }
        ]
    },
    {
        category: 'Implement Strong Access Control',
        icon: Fingerprint,
        items: [
            {
                title: 'Requirement 7: Restrict Access',
                icon: Lock,
                description: 'Restrict access to system components and data.',
                content: `**PCI DSS 4.0.1 Requirement 7**: Access Restriction

This platform implements:

• **7.1 Access Limited to Business Need**:
  - Role-based access control (RBAC)
  - Least privilege principle
  - Access requests require approval

• **7.2 Access Appropriately Defined**:
  - Access control systems in place
  - Default deny-all setting
  - Access based on job classification

• **7.3 Access Managed via Access Control System**:
  - Centralized access management
  - Regular access reviews
  - Automatic access revocation on role change

**Platform Implementation:**
  - Three-tier role system (Admin, Editor, Viewer)
  - Permission matrix with granular controls
  - Access logged in audit trail`,
                keywords: ['access control', 'rbac', 'least privilege', 'authorization']
            },
            {
                title: 'Requirement 8: Identify Users and Authenticate',
                icon: Users,
                description: 'Identify users and authenticate access.',
                content: `**PCI DSS 4.0.1 Requirement 8**: User Authentication

This platform implements:

• **8.1 User Identification Processes**:
  - Unique user IDs for all users
  - No shared or generic accounts
  - User lifecycle management

• **8.2 User Identification Managed**:
  - Immediate revocation on termination
  - Inactive accounts disabled after 90 days
  - Access reviewed quarterly

• **8.3 Strong Authentication**:
  - Minimum 12-character passwords (8.3.6)
  - Complexity requirements
  - Password history (last 4 passwords)
  - Account lockout after 10 failed attempts

• **8.4 Multi-Factor Authentication**:
  - MFA required for all admin access (8.4.2)
  - MFA required for remote access
  - MFA for all access to CDE

• **8.5 MFA Systems Configured**:
  - MFA cannot be bypassed
  - At least two different authentication factors

• **8.6 Authentication Mechanisms**:
  - Session timeout after 15 minutes of inactivity
  - Secure session tokens
  - Session invalidation on logout`,
                keywords: ['authentication', 'mfa', '2fa', 'password', 'identity']
            },
            {
                title: 'Requirement 9: Physical Access',
                icon: Building,
                description: 'Restrict physical access to cardholder data.',
                content: `**PCI DSS 4.0.1 Requirement 9**: Physical Security

For cloud-hosted platforms:

• **9.1 Physical Access Controls**:
  - Data center physical security
  - Visitor management
  - Badge access systems

• **9.2 Physical Access Managed**:
  - Access logs maintained
  - Video surveillance
  - Visitor escorts required

• **9.3 Physical Access Authorized**:
  - Access authorization process
  - Access reviews

• **9.4 Media Physically Secured**:
  - Media storage secure
  - Media disposal procedures
  - Encryption of portable media

• **9.5 Point of Interaction (POI) Devices**:
  - Device inventory maintained
  - Periodic inspection
  - Tamper-evident controls`,
                keywords: ['physical', 'data center', 'access', 'media']
            }
        ]
    },
    {
        category: 'Monitor and Test Networks',
        icon: Activity,
        items: [
            {
                title: 'Requirement 10: Log and Monitor Access',
                icon: Eye,
                description: 'Log and monitor all access to network resources.',
                content: `**PCI DSS 4.0.1 Requirement 10**: Logging and Monitoring

This platform implements:

• **10.1 Audit Trail Processes**:
  - All access to cardholder data logged
  - All administrative actions logged
  - Centralized log management

• **10.2 Audit Logs Implemented**:
  - User access to cardholder data
  - Actions by administrators
  - Invalid access attempts
  - Changes to audit logs
  - Creation/deletion of system objects

• **10.3 Audit Logs Protected**:
  - Logs cannot be modified
  - Access to logs limited
  - Logs backed up to secure location

• **10.4 Audit Logs Reviewed**:
  - Daily log review
  - Automated alerting on anomalies
  - Correlation of events

• **10.5 Audit Log Retention**:
  - 1 year retention minimum
  - 3 months immediately available
  - Secure archive for older logs

• **10.6 Time Synchronization**:
  - NTP time synchronization
  - Consistent timestamps across systems

• **10.7 Failures Detected and Reported**:
  - Critical security control failures detected
  - Immediate alert on failures
  - Response procedures documented

**Platform Implementation:**
  - Comprehensive Audit Logs page
  - PCI-relevant event flagging
  - 7-year retention for PCI events
  - Real-time alerting for critical events`,
                keywords: ['logging', 'monitoring', 'audit', 'siem', 'alerts']
            },
            {
                title: 'Requirement 11: Test Security Regularly',
                icon: CheckSquare,
                description: 'Test security of systems and networks regularly.',
                content: `**PCI DSS 4.0.1 Requirement 11**: Security Testing

This platform implements:

• **11.1 Wireless Access Points Identified**:
  - Quarterly wireless scans
  - Rogue AP detection

• **11.2 Vulnerabilities Identified and Addressed**:
  - Internal vulnerability scans quarterly
  - External ASV scans quarterly
  - Scans after significant changes

• **11.3 External and Internal Penetration Testing**:
  - Annual penetration testing
  - After significant infrastructure changes
  - Network and application layer testing

• **11.4 Intrusion Detection/Prevention**:
  - IDS/IPS at network perimeter
  - Alerts on suspicious activity
  - Regular signature updates

• **11.5 Network Intrusions Detected**:
  - File integrity monitoring (FIM)
  - Critical file monitoring
  - Configuration change detection

• **11.6 Unauthorized Changes Detected**:
  - Change detection mechanisms
  - Weekly comparisons
  - Alert on unauthorized changes`,
                keywords: ['testing', 'penetration', 'vulnerability', 'scanning', 'ids']
            }
        ]
    },
    {
        category: 'Maintain an Information Security Policy',
        icon: FileCheck,
        items: [
            {
                title: 'Requirement 12: Information Security Policy',
                icon: FileText,
                description: 'Support security with organizational policies.',
                content: `**PCI DSS 4.0.1 Requirement 12**: Security Policies

This platform supports:

• **12.1 Information Security Policy**:
  - Comprehensive security policy
  - Annual review and update
  - Executive approval

• **12.2 Acceptable Use Policies**:
  - Documented acceptable use
  - Employee acknowledgment
  - Regular training

• **12.3 Risks Formally Identified**:
  - Annual risk assessment
  - Risk treatment plans
  - Targeted risk analysis for new technologies

• **12.4 PCI DSS Responsibilities**:
  - Roles and responsibilities defined
  - Quarterly reviews of compliance

• **12.5 PCI DSS Scope Documented**:
  - Annual scope validation
  - Scope documented with diagram
  - All in-scope systems identified

• **12.6 Security Awareness Program**:
  - Security awareness training
  - Annual training for all personnel
  - Phishing awareness

• **12.7 Personnel Screened**:
  - Background checks for CDE access
  - Pre-employment screening

• **12.8 Third-Party Service Providers**:
  - TPSP list maintained
  - Due diligence before engagement
  - Written agreements
  - Monitor TPSP PCI compliance

• **12.9 TPSPs Support Customer Compliance**:
  - Responsibilities clearly defined
  - Compliance attestations obtained

• **12.10 Incident Response Plan**:
  - Documented incident response plan
  - Annual testing
  - 24/7 monitoring and response
  - Containment and eradication procedures`,
                keywords: ['policy', 'security', 'training', 'incident', 'tpsp']
            }
        ]
    }
];

// ISO Standards Knowledge Base
const isoContent = [
    {
        category: 'ISO/IEC 27001:2022',
        icon: ShieldCheck,
        items: [
            {
                title: 'Information Security Management System',
                icon: Shield,
                description: 'ISO 27001 ISMS framework overview.',
                content: `**ISO/IEC 27001:2022**: Information Security Management

This platform aligns with ISO 27001 requirements:

**Context of the Organization (Clause 4)**:
• Understanding the organization and its context
• Interested parties' needs and expectations
• ISMS scope definition
• ISMS processes established

**Leadership (Clause 5)**:
• Management commitment demonstrated
• Information security policy established
• Roles, responsibilities, and authorities assigned

**Planning (Clause 6)**:
• Risk assessment process defined
• Risk treatment applied
• Information security objectives set
• Changes planned and controlled

**Support (Clause 7)**:
• Resources provided
• Competence ensured
• Awareness program implemented
• Communication processes defined
• Documented information controlled

**Operation (Clause 8)**:
• Operational planning and control
• Information security risk assessment
• Risk treatment plan implementation

**Performance Evaluation (Clause 9)**:
• Monitoring, measurement, analysis, evaluation
• Internal audits conducted
• Management reviews performed

**Improvement (Clause 10)**:
• Nonconformities addressed
• Continual improvement pursued`,
                keywords: ['iso27001', 'isms', 'security', 'management', 'framework']
            },
            {
                title: 'Annex A Controls',
                icon: ClipboardCheck,
                description: 'ISO 27001 Annex A security controls.',
                content: `**ISO 27001:2022 Annex A Controls** (93 Controls in 4 Themes)

**Organizational Controls (37 controls)**:
• 5.1 - Policies for information security
• 5.2 - Information security roles and responsibilities
• 5.3 - Segregation of duties
• 5.7 - Threat intelligence
• 5.15 - Access control
• 5.23 - Information security for cloud services
• 5.29 - Information security during disruption
• 5.30 - ICT readiness for business continuity

**People Controls (8 controls)**:
• 6.1 - Screening
• 6.2 - Terms and conditions of employment
• 6.3 - Information security awareness, education and training
• 6.5 - Responsibilities after termination

**Physical Controls (14 controls)**:
• 7.1 - Physical security perimeters
• 7.4 - Physical security monitoring
• 7.8 - Equipment siting and protection
• 7.10 - Storage media

**Technological Controls (34 controls)**:
• 8.1 - User end point devices
• 8.5 - Secure authentication
• 8.9 - Configuration management
• 8.12 - Data leakage prevention
• 8.15 - Logging
• 8.16 - Monitoring activities
• 8.24 - Use of cryptography
• 8.28 - Secure coding`,
                keywords: ['controls', 'annex a', 'security controls', 'implementation']
            }
        ]
    },
    {
        category: 'ISO/IEC 20000-1:2018',
        icon: Activity,
        items: [
            {
                title: 'IT Service Management System',
                icon: Server,
                description: 'ISO 20000 SMS for IT services.',
                content: `**ISO/IEC 20000-1:2018**: Service Management System

This platform implements service management practices:

**Service Portfolio (Clause 8.2)**:
• Service catalog maintained
• Service descriptions documented
• Service level agreements (SLAs) defined

**Relationship and Agreement (Clause 8.3)**:
• Business relationship management
• Supplier management
• Service level management

**Supply and Demand (Clause 8.4)**:
• Capacity management
• Demand management
• Service continuity management

**Service Design, Build and Transition (Clause 8.5)**:
• Change management
• Service design and transition
• Release and deployment management

**Resolution and Fulfillment (Clause 8.6)**:
• Incident management
• Service request management
• Problem management

**Service Assurance (Clause 8.7)**:
• Service availability management
• Service continuity management
• Information security management`,
                keywords: ['iso20000', 'itil', 'service management', 'itsm']
            },
            {
                title: 'Workflow Management',
                icon: Zap,
                description: 'ISO 20000 workflow and process management.',
                content: `**Workflow Management Best Practices**

This platform implements ISO 20000-aligned workflows:

**Change Management**:
• All changes logged and tracked
• Risk assessment for each change
• CAB (Change Advisory Board) review for major changes
• Post-implementation review

**Incident Management**:
• Incident logging and categorization
• Priority assignment (P1-P4)
• Escalation procedures
• Resolution tracking
• Root cause analysis

**Problem Management**:
• Problem identification from recurring incidents
• Known error database
• Workaround documentation
• Permanent fix implementation

**Release Management**:
• Release planning and scheduling
• Testing requirements
• Deployment procedures
• Rollback procedures

**Configuration Management**:
• Configuration item (CI) inventory
• Relationship mapping
• Baseline management
• Configuration audits

**Knowledge Management**:
• Knowledge base articles
• Self-service portal
• FAQ documentation
• Training materials`,
                keywords: ['workflow', 'change', 'incident', 'problem', 'release']
            }
        ]
    },
    {
        category: 'Industry Standards',
        icon: Award,
        items: [
            {
                title: 'Card Scheme Requirements',
                icon: CreditCard,
                description: 'Visa, Mastercard, and other scheme requirements.',
                content: `**Card Scheme Compliance Requirements**

**Visa Core Rules**:
• Registration with Visa as a payment facilitator
• Annual PCI DSS validation
• Chargeback thresholds: 
  - Standard: 1.00% of transactions
  - Excessive: 1.50% of transactions
• Fraud thresholds monitored
• VFMP (Visa Fraud Monitoring Program) compliance

**Mastercard Standards**:
• Registration as a Payment Facilitator or SDP
• Quarterly network access device compliance
• Chargeback thresholds:
  - Standard: 1.00% of transactions
  - Excessive: 1.50% of transactions
• ECP (Excessive Chargeback Program) monitoring
• MATCH list compliance

**3D Secure 2.0**:
• EMV 3DS protocol support
• SCA (Strong Customer Authentication) for EU
• Challenge and frictionless flows
• Device fingerprinting
• Risk-based authentication

**Network Tokenization**:
• Visa Token Service (VTS)
• Mastercard Digital Enablement Service (MDES)
• Token lifecycle management
• Token requestor registration`,
                keywords: ['visa', 'mastercard', '3ds', 'tokens', 'scheme']
            },
            {
                title: 'Regional Regulations',
                icon: Globe,
                description: 'Regional payment regulations and compliance.',
                content: `**Regional Regulatory Compliance**

**PSD2 / PSD3 (Europe)**:
• Strong Customer Authentication (SCA)
• Open Banking API compliance
• TPP (Third Party Provider) registration
• Transaction monitoring requirements
• Consumer protection rules

**GDPR (Europe)**:
• Data subject rights
• Consent management
• Data Processing Agreements
• Privacy by design
• 72-hour breach notification

**UK Payment Services Regulations**:
• FCA authorization/registration
• Safeguarding requirements
• Consumer duty obligations

**US Regulations**:
• State money transmitter licenses
• FinCEN registration (MSB)
• OFAC sanctions compliance
• Reg E consumer protections
• Nacha Operating Rules

**APAC Regulations**:
• MAS (Singapore) Payment Services Act
• Hong Kong SVFAS
• Australia AFSL/APRA
• Japan Payment Services Act

**AML/CFT Requirements**:
• Customer due diligence (CDD)
• Enhanced due diligence (EDD)
• Suspicious activity reporting (SAR)
• Transaction monitoring
• Sanctions screening`,
                keywords: ['psd2', 'gdpr', 'aml', 'regulations', 'compliance']
            }
        ]
    },
    {
        category: 'Industry Knowledge',
        icon: GraduationCap,
        items: [
            {
                title: 'Payment Processing Basics',
                icon: CreditCard,
                description: 'How card payments work.',
                content: `**Card Payment Processing Flow**

**Authorization Flow**:
1. **Cardholder** presents card at POS or online
2. **Merchant** sends authorization request
3. **Acquirer** receives and forwards to network
4. **Card Network** (Visa/MC) routes to issuer
5. **Issuer** approves/declines based on:
   - Available credit/funds
   - Fraud rules
   - Card status
6. **Response** travels back through chain
7. **Merchant** receives approval code

**Clearing and Settlement**:
1. **Batch Close**: Merchant submits daily batch
2. **Clearing**: Network calculates interchange
3. **Settlement**: Funds transferred between banks
4. **Funding**: Acquirer pays merchant (T+1, T+2)

**Key Participants**:
• **Cardholder**: Consumer using the card
• **Merchant**: Business accepting payment
• **Acquirer**: Merchant's bank
• **Issuer**: Card-issuing bank
• **Card Network**: Visa, Mastercard, etc.
• **PSP/Payment Facilitator**: Platform like this one

**Fee Types**:
• **Interchange**: Paid to issuer (~1.5-2.5%)
• **Scheme Fees**: Paid to card network (~0.1-0.3%)
• **Acquirer Markup**: Processing margin
• **MDR**: Total merchant discount rate`,
                keywords: ['processing', 'authorization', 'settlement', 'interchange']
            },
            {
                title: 'Chargeback Management',
                icon: AlertTriangle,
                description: 'Understanding and managing chargebacks.',
                content: `**Chargeback Process and Management**

**Chargeback Lifecycle**:
1. **Retrieval/RDR**: Information request (optional)
2. **First Chargeback**: Issuer files dispute
3. **Representment**: Merchant contests with evidence
4. **Pre-Arbitration**: Second-level dispute
5. **Arbitration**: Network makes final decision

**Common Reason Codes**:

**Visa**:
• 10.4 - Fraud - Card Absent Environment
• 11.1 - Card Recovery Bulletin
• 12.6 - Duplicate Processing
• 13.1 - Merchandise/Services Not Received
• 13.7 - Cancelled Merchandise/Services

**Mastercard**:
• 4837 - No Cardholder Authorization
• 4853 - Goods/Services Not Provided
• 4863 - Cardholder Doesn't Recognize

**Evidence to Fight Chargebacks**:
• Proof of delivery (signed receipt, tracking)
• Customer communication records
• IP address and device fingerprint
• AVS/CVV verification results
• 3DS authentication proof
• Terms and conditions acceptance

**Prevention Strategies**:
• Clear billing descriptors
• Excellent customer service
• Easy refund process
• Fraud screening
• Address verification
• 3D Secure implementation`,
                keywords: ['chargebacks', 'disputes', 'reason codes', 'evidence']
            },
            {
                title: 'Risk and Fraud',
                icon: Shield,
                description: 'Fraud types and prevention strategies.',
                content: `**Fraud Types and Prevention**

**Card-Not-Present (CNP) Fraud**:
• Stolen card credentials used online
• Account takeover attacks
• Phishing and social engineering

**Card-Present Fraud**:
• Counterfeit cards (skimming)
• Lost/stolen physical cards
• Card-present fallback fraud

**Friendly Fraud**:
• Customer disputes legitimate purchase
• Buyer's remorse
• Family fraud

**First-Party Fraud**:
• Cardholder's own fraud
• Never intends to pay
• Identity manipulation

**Prevention Tools**:

**Velocity Checks**:
• Transaction frequency limits
• Amount thresholds
• Card usage patterns

**Device Fingerprinting**:
• Browser characteristics
• Device ID tracking
• Behavioral analysis

**Address Verification (AVS)**:
• Billing address matching
• Postal code verification

**Card Security Code (CVV/CVC)**:
• 3-4 digit code verification
• Not stored (PCI requirement)

**3D Secure 2.0**:
• Risk-based authentication
• Liability shift to issuer
• Reduced fraud rates

**Machine Learning**:
• Real-time scoring
• Pattern recognition
• Adaptive rules`,
                keywords: ['fraud', 'risk', 'prevention', 'avs', 'cvv', '3ds']
            },
            {
                title: 'Industry Glossary',
                icon: BookOpen,
                description: 'Common payment industry terms.',
                content: `**Payment Industry Glossary**

**A-D**:
• **ACH**: Automated Clearing House
• **Acquirer**: Bank that processes card payments for merchants
• **AVS**: Address Verification Service
• **BIN**: Bank Identification Number (first 6-8 digits)
• **Chargeback**: Transaction reversal by issuer
• **CNP**: Card Not Present transaction
• **CVV/CVC**: Card Verification Value/Code

**E-I**:
• **EMV**: Europay, Mastercard, Visa (chip cards)
• **FBO**: For Benefit Of (account structure)
• **Interchange**: Fee paid to card issuer
• **ISO**: Independent Sales Organization
• **Issuer**: Bank that issues cards to consumers

**M-P**:
• **MCC**: Merchant Category Code
• **MDR**: Merchant Discount Rate
• **MID**: Merchant Identification Number
• **P2PE**: Point-to-Point Encryption
• **PAN**: Primary Account Number
• **PayFac**: Payment Facilitator
• **PCI DSS**: Payment Card Industry Data Security Standard
• **PSP**: Payment Service Provider

**R-T**:
• **RDR**: Rapid Dispute Resolution
• **Representment**: Merchant's dispute response
• **SCA**: Strong Customer Authentication
• **Settlement**: Movement of funds between parties
• **TID**: Terminal Identification Number
• **Tokenization**: Replacing PAN with token

**V-Z**:
• **VFMP**: Visa Fraud Monitoring Program
• **3DS**: 3D Secure (authentication protocol)
• **4-party model**: Cardholder, Merchant, Issuer, Acquirer`,
                keywords: ['glossary', 'terms', 'definitions', 'acronyms']
            }
        ]
    }
];

export default function HelpPanel({ open, onOpenChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeTab, setActiveTab] = useState('platform');

    const filterItems = (sections) => sections.map(section => ({
        ...section,
        items: section.items.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(section => section.items.length > 0);

    const filteredPlatformSections = filterItems(helpSections);
    const filteredPciSections = filterItems(pciDssContent);
    const filteredIsoSections = filterItems(isoContent);

    const currentSections = activeTab === 'platform' ? filteredPlatformSections : 
                           activeTab === 'pci' ? filteredPciSections : filteredIsoSections;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Help Center & Knowledge Base
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="platform" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Platform Guide
                        </TabsTrigger>
                        <TabsTrigger value="pci" className="gap-2">
                            <Shield className="h-4 w-4" />
                            PCI DSS 4.0.1
                        </TabsTrigger>
                        <TabsTrigger value="iso" className="gap-2">
                            <Award className="h-4 w-4" />
                            ISO & Industry
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-4 h-[60vh] mt-4">
                        {/* Left Panel - Navigation */}
                        <div className="w-1/3 border-r pr-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search help topics..."
                                    className="pl-10"
                                />
                            </div>

                            <ScrollArea className="h-[calc(100%-60px)]">
                                <div className="space-y-4">
                                    {currentSections.map((section, idx) => {
                                        const SectionIcon = section.icon;
                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-600">
                                                    <SectionIcon className="h-4 w-4" />
                                                    {section.category}
                                                </div>
                                                <div className="space-y-1 ml-6">
                                                    {section.items.map((item, itemIdx) => {
                                                        const ItemIcon = item.icon;
                                                        const isSelected = selectedItem?.title === item.title;
                                                        return (
                                                            <button
                                                                key={itemIdx}
                                                                onClick={() => setSelectedItem(item)}
                                                                className={cn(
                                                                    "w-full text-left p-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                                                                    isSelected 
                                                                        ? "bg-blue-100 text-blue-700" 
                                                                        : "hover:bg-slate-100 text-slate-700"
                                                                )}
                                                            >
                                                                <ItemIcon className="h-4 w-4 flex-shrink-0" />
                                                                <span className="truncate">{item.title}</span>
                                                                <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0 opacity-50" />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Right Panel - Content */}
                        <div className="w-2/3 pl-4">
                            <ScrollArea className="h-full">
                                {selectedItem ? (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            {React.createElement(selectedItem.icon, { className: "h-6 w-6 text-blue-600" })}
                                            <div>
                                                <h3 className="text-xl font-semibold text-slate-900">{selectedItem.title}</h3>
                                                <p className="text-sm text-slate-500">{selectedItem.description}</p>
                                            </div>
                                        </div>

                                        <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-semibold">
                                            {selectedItem.content.split('\n').map((line, i) => {
                                                // Helper function to render text with bold formatting
                                                const renderTextWithBold = (text) => {
                                                    const parts = text.split(/(\*\*[^*]+\*\*)/g);
                                                    return parts.map((part, j) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                                                        }
                                                        return <span key={j}>{part}</span>;
                                                    });
                                                };
                                                
                                                // Main section headers (e.g., **PCI DSS 4.0.1 Requirement 1**)
                                                if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) {
                                                    return (
                                                        <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200">
                                                            {line.slice(2, -2)}
                                                        </h3>
                                                    );
                                                }
                                                
                                                // Subsection headers with colons (e.g., **1.1 Network Security Policies**: text)
                                                if (line.match(/^\*\*[^*]+\*\*:/)) {
                                                    const match = line.match(/^\*\*([^*]+)\*\*:\s*(.*)/);
                                                    if (match) {
                                                        return (
                                                            <div key={i} className="my-3">
                                                                <h4 className="font-semibold text-slate-900 text-base mb-1">{match[1]}:</h4>
                                                                {match[2] && <p className="text-slate-600 leading-relaxed">{renderTextWithBold(match[2])}</p>}
                                                            </div>
                                                        );
                                                    }
                                                }
                                                
                                                // Bold bullet points with optional text (e.g., • **Item**: description)
                                                if (line.startsWith('• **')) {
                                                    const match = line.match(/^• \*\*([^*]+)\*\*:?\s*(.*)/);
                                                    if (match) {
                                                        return (
                                                            <div key={i} className="flex gap-2 my-2">
                                                                <span className="text-slate-600 flex-shrink-0">•</span>
                                                                <div className="text-slate-600">
                                                                    <span className="font-semibold text-slate-900">{match[1]}</span>
                                                                    {match[2] && <span>: {renderTextWithBold(match[2])}</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                }
                                                
                                                // Regular bullet points
                                                if (line.startsWith('• ') || line.startsWith('- ')) {
                                                    return (
                                                        <div key={i} className="flex gap-2 my-1.5">
                                                            <span className="text-slate-600 flex-shrink-0">{line[0]}</span>
                                                            <span className="text-slate-600 leading-relaxed">{renderTextWithBold(line.slice(2))}</span>
                                                        </div>
                                                    );
                                                }
                                                
                                                // Numbered lists
                                                if (line.trim().match(/^\d+\./)) {
                                                    return (
                                                        <div key={i} className="my-1.5 ml-1">
                                                            <span className="text-slate-600 leading-relaxed">{renderTextWithBold(line)}</span>
                                                        </div>
                                                    );
                                                }
                                                
                                                // Regular paragraphs - handle inline bold
                                                if (line.trim()) {
                                                    return (
                                                        <p key={i} className="my-2.5 text-slate-700 leading-relaxed">
                                                            {renderTextWithBold(line)}
                                                        </p>
                                                    );
                                                }
                                                
                                                // Empty lines
                                                return <div key={i} className="h-2" />;
                                            })}
                                        </div>

                                        <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
                                            {selectedItem.keywords.map((keyword, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">
                                        <div className="text-center">
                                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>Select a topic to view help content</p>
                                            <p className="text-sm mt-1">Or use search to find what you need</p>
                                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                <Badge variant="outline">PCI DSS 4.0.1</Badge>
                                                <Badge variant="outline">ISO 27001:2022</Badge>
                                                <Badge variant="outline">ISO 20000-1:2018</Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}