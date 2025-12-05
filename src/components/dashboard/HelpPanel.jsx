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
    BookOpen
} from 'lucide-react';
import { cn } from "@/lib/utils";

const helpSections = [
    {
        category: 'Overview',
        icon: LayoutDashboard,
        items: [
            {
                title: 'Dashboard',
                icon: LayoutDashboard,
                description: 'Your central command center for monitoring payment operations.',
                content: `The Dashboard provides a real-time overview of your payment processing operations:

• **Live TPS Counter**: Monitor transactions per second in real-time with trend indicators
• **Key Statistics**: Today's volume, total transactions, success rate, and active merchants
• **Volume Charts**: Visual representation of transaction volume over time
• **Success Rate**: Track approval rates and identify issues quickly
• **Top Merchants**: See your highest-volume merchants at a glance
• **Payment Methods**: Distribution of payment types being processed
• **Payment News**: Stay updated with latest industry news from The Paypers
• **Exchange Rates**: Live currency rates for major currencies
• **Business Metrics**: Key KPIs including chargeback ratio, decline rate, and fraud rate`,
                keywords: ['overview', 'statistics', 'volume', 'tps', 'real-time']
            },
            {
                title: 'Analytics',
                icon: BarChart3,
                description: 'Deep dive into your transaction data with advanced analytics.',
                content: `The Analytics page offers comprehensive data analysis:

• **Transaction Trends**: Analyze patterns over custom date ranges
• **Geographic Analysis**: See where your transactions originate
• **Time-based Analysis**: Identify peak processing times
• **Comparison Tools**: Compare performance across periods
• **Export Options**: Download reports in CSV or PDF format
• **Custom Filters**: Filter by merchant, payment method, status, and more`,
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
                content: `The Transactions page is your primary tool for transaction management:

• **Search & Filter**: Find transactions by ID, amount, merchant, status, date range
• **Transaction Details**: Click any transaction to see full details including:
  - Customer information
  - Payment method details
  - Authorization codes
  - 3DS status
  - Risk scores
• **Actions**: Refund, void, or capture transactions
• **Export**: Download transaction data for reconciliation
• **Real-time Updates**: Transactions appear immediately as they're processed`,
                keywords: ['transactions', 'payments', 'search', 'filter', 'refund', 'void']
            },
            {
                title: 'Settlements',
                icon: Receipt,
                description: 'Track and manage merchant settlements.',
                content: `Manage the settlement process for your merchants:

• **Settlement Batches**: View pending and completed settlement batches
• **Settlement Reports**: Generate detailed settlement reports
• **Reconciliation**: Match settlements with bank deposits
• **Adjustments**: Apply fees, chargebacks, and reserves
• **Payment Files**: Generate NACHA/SEPA files for bank transfers
• **Settlement Schedule**: Configure T+1, T+2, or custom settlement periods`,
                keywords: ['settlements', 'payouts', 'batches', 'reconciliation']
            },
            {
                title: 'Chargebacks',
                icon: Repeat,
                description: 'Handle chargeback cases and disputes.',
                content: `Complete chargeback lifecycle management:

• **Case Management**: Track all chargeback cases from receipt to resolution
• **Response Workflow**: 
  - Receive notification
  - Gather evidence
  - Submit representment
  - Track outcome
• **Document Upload**: Attach evidence and supporting documents
• **Deadline Tracking**: Never miss a response deadline
• **Analytics**: Monitor chargeback ratios by merchant, reason code, and card type
• **Alerts**: Get notified when merchants approach threshold limits`,
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
3. **LEI Verification**: Legal Entity Identifier validation
4. **Contact Information**: Primary contacts and key personnel
5. **Document Upload**: KYC documents with validation
6. **KYB Verification**: Automated business verification via TheKYB
7. **AML Screening**: Anti-money laundering checks via AMLWatcher
8. **Bank Details**: Settlement account configuration
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
• **API Integration**: Configure API credentials and endpoints`,
                keywords: ['acquirer', 'bank', 'processor', 'integration']
            },
            {
                title: 'APM Onboarding',
                icon: Smartphone,
                description: 'Add alternative payment methods.',
                content: `Integrate alternative payment methods:

• **Digital Wallets**: Apple Pay, Google Pay, PayPal
• **Bank Transfers**: ACH, SEPA, Faster Payments
• **Buy Now Pay Later**: Klarna, Affirm, Afterpay
• **Regional Methods**: iDEAL, Bancontact, POLi, and more
• **Cryptocurrency**: Bitcoin, Ethereum integrations`,
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
• **Bulk Actions**: Approve or reject multiple items at once`,
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
• **Fee Configuration**: Set processing fees per MID`,
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
• **Reporting**: Per-terminal transaction reports`,
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
• **Transaction Types**: Sale, auth, refund capabilities
• **Limits**: Set daily and per-transaction limits`,
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
• **Key Rotation**: Schedule automatic key rotation
• **Usage Logs**: Monitor API usage and errors`,
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
• **Two-Factor Auth**: Enforce 2FA for security
• **Activity Logs**: Track user actions`,
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
• **Historical Data**: Balance trends over time`,
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
  - Merchant statements`,
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
• **Comparison**: Period-over-period comparisons`,
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
• **Confirmation**: Settlement confirmation reports`,
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
• **Exceptions**: Handle failed payouts automatically`,
                keywords: ['automation', 'scheduled', 'automatic payouts']
            },
            {
                title: 'Reconciliation',
                icon: ArrowUpDown,
                description: 'Match transactions with bank records.',
                content: `Transaction reconciliation:

• **Import Files**: Upload bank statements
• **Auto-Match**: Automatic transaction matching
• **Exceptions**: Handle unmatched items
• **Reports**: Reconciliation status reports
• **Audit**: Complete reconciliation history`,
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
• **Fees**: Provider fee schedules`,
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
• **History**: Rate change audit trail`,
                keywords: ['buy rates', 'interchange', 'pricing', 'costs']
            },
            {
                title: 'Merchant Pricing',
                icon: DollarSign,
                description: 'Set merchant fee structures.',
                content: `Merchant pricing configuration:

• **Pricing Models**: Flat rate, interchange++, tiered
• **Fee Types**: Transaction fees, monthly fees, setup fees
• **MID-Level Pricing**: Different rates per MID
• **Margin Calculation**: Automatic margin calculations
• **Statements**: Generate merchant fee statements`,
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
• **3D Secure**: Configure 3DS authentication
• **Machine Learning**: AI-powered fraud detection
• **Alerts**: Real-time fraud alerts and notifications`,
                keywords: ['fraud', 'risk', 'prevention', 'rules', '3ds']
            },
            {
                title: 'Compliance',
                icon: Users,
                description: 'Regulatory compliance management.',
                content: `Compliance and regulatory tools:

• **KYC Management**: Know Your Customer documentation
• **AML Monitoring**: Anti-money laundering screening
• **PCI Compliance**: PCI-DSS compliance tracking
• **GDPR**: Data privacy management
• **Audit Logs**: Complete audit trail
• **SAR Filing**: Suspicious activity reporting`,
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
• **Tokenization**: Secure card storage
• **Network Tokens**: Visa/MC network tokenization`,
                keywords: ['orchestration', 'providers', 'routing', 'tokens']
            },
            {
                title: 'User Management',
                icon: UserCog,
                description: 'Manage platform users and permissions.',
                content: `Platform user administration:

• **User Accounts**: Create and manage users
• **Roles**: 
  - Super Admin: Full access
  - Admin: Administrative access
  - Compliance Officer: Compliance functions
  - Operations: Day-to-day operations
  - Finance: Financial reports and payouts
  - Support: Read-only transaction access
  - Viewer: Dashboard only
• **Permissions**: Granular permission control
• **SSO**: Single sign-on integration
• **Activity Logs**: User action audit trail`,
                keywords: ['users', 'roles', 'permissions', 'access', 'admin']
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
• **Backup**: Database backup configuration`,
                keywords: ['database', 'postgresql', 'setup', 'connection']
            }
        ]
    }
];

export default function HelpPanel({ open, onOpenChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const filteredSections = helpSections.map(section => ({
        ...section,
        items: section.items.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(section => section.items.length > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Help Center
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 h-[60vh]">
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
                                {filteredSections.map((section, idx) => {
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

                                    <div className="prose prose-sm max-w-none">
                                        {selectedItem.content.split('\n').map((line, i) => {
                                            if (line.startsWith('**') && line.endsWith('**')) {
                                                return <h4 key={i} className="font-semibold text-slate-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                                            }
                                            if (line.startsWith('• **')) {
                                                const [title, ...rest] = line.substring(4).split('**:');
                                                return (
                                                    <p key={i} className="ml-4 my-1">
                                                        <span className="font-medium text-slate-800">• {title}:</span>
                                                        <span className="text-slate-600">{rest.join('')}</span>
                                                    </p>
                                                );
                                            }
                                            if (line.startsWith('• ') || line.startsWith('- ')) {
                                                return <p key={i} className="ml-4 my-1 text-slate-600">{line}</p>;
                                            }
                                            if (line.trim().match(/^\d+\./)) {
                                                return <p key={i} className="ml-4 my-1 text-slate-600">{line}</p>;
                                            }
                                            if (line.trim()) {
                                                return <p key={i} className="my-2 text-slate-700">{line}</p>;
                                            }
                                            return <br key={i} />;
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
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}