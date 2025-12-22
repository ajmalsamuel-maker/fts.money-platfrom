// Comprehensive Module Catalog with Business Logic, Dependencies, and Compliance
// PCI DSS, GDPR, ISO 27001, ISO 20022, FATF compliant

export const MODULE_DEFINITIONS = {
  // CORE MODULES (Always included)
  'core_dashboard': {
    module_id: 'core_dashboard',
    module_name: 'Dashboard & Analytics',
    module_category: 'core',
    description: 'Core dashboard with real-time metrics and analytics',
    icon: 'LayoutDashboard',
    subscription_tier: 'free',
    pricing_model: { type: 'included' },
    menu_items: [
      { group: 'overview', label: 'dashboard', path: 'Dashboard', icon: 'LayoutDashboard', permission: 'VIEW_DASHBOARD' },
      { group: 'overview', label: 'analytics', path: 'Analytics', icon: 'BarChart3', permission: 'VIEW_ANALYTICS' },
      { group: 'overview', label: 'realTimeMonitor', path: 'RealTimeMonitor', icon: 'Zap', permission: 'VIEW_DASHBOARD' }
    ],
    dependencies: [],
    features: ['dashboard', 'basic_analytics'],
    compliance_requirements: ['PCI_DSS', 'GDPR', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'core_transactions': {
    module_id: 'core_transactions',
    module_name: 'Transaction Management',
    module_category: 'core',
    description: 'View and manage all payment transactions',
    icon: 'ArrowLeftRight',
    subscription_tier: 'free',
    pricing_model: { type: 'included' },
    menu_items: [
      { group: 'transactions', label: 'allTransactions', path: 'Transactions', icon: 'ArrowLeftRight', permission: 'VIEW_TRANSACTIONS' },
      { group: 'transactions', label: 'refunds', path: 'Refunds', icon: 'DollarSign', permission: 'VIEW_TRANSACTIONS' },
      { group: 'transactions', label: 'settlements', path: 'Settlements', icon: 'Receipt', permission: 'VIEW_SETTLEMENTS' }
    ],
    dependencies: [],
    features: ['transactions', 'refunds', 'settlements'],
    compliance_requirements: ['PCI_DSS', 'GDPR', 'ISO_20022'],
    data_isolation_required: true,
    is_active: true
  },

  'core_merchants': {
    module_id: 'core_merchants',
    module_name: 'Merchant Management',
    module_category: 'core',
    description: 'Manage merchant accounts and onboarding',
    icon: 'Store',
    subscription_tier: 'free',
    pricing_model: { type: 'included' },
    menu_items: [
      { group: 'merchants', label: 'allMerchants', path: 'Merchants', icon: 'Store', permission: 'VIEW_MERCHANTS' },
      { group: 'merchants', label: 'merchantAnalytics', path: 'MerchantAnalytics', icon: 'BarChart3', permission: 'VIEW_MERCHANTS' },
      { group: 'merchants', label: 'merchantUsers', path: 'MerchantUsers', icon: 'Users', permission: 'VIEW_USERS' },
      { group: 'merchants', label: 'merchantOnboarding', path: 'MerchantOnboarding', icon: 'Store', permission: 'VIEW_ONBOARDING' },
      { group: 'merchants', label: 'approvals', path: 'Approvals', icon: 'CheckSquare', permission: 'APPROVE_ONBOARDING' }
    ],
    dependencies: [],
    features: ['merchants', 'onboarding', 'merchant_users'],
    compliance_requirements: ['PCI_DSS', 'GDPR', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'core_system': {
    module_id: 'core_system',
    module_name: 'System Settings',
    module_category: 'core',
    description: 'User management and system configuration',
    icon: 'Settings',
    subscription_tier: 'free',
    pricing_model: { type: 'included' },
    menu_items: [
      { group: 'system', label: 'userManagement', path: 'UserManagement', icon: 'UserCog', permission: 'VIEW_USERS' },
      { group: 'system', label: 'generalSettings', path: 'Settings', icon: 'Settings', permission: 'VIEW_SETTINGS' },
      { group: 'system', label: 'appearance', path: 'Appearance', icon: 'Palette', permission: 'VIEW_APPEARANCE' }
    ],
    dependencies: [],
    features: ['user_management', 'settings'],
    compliance_requirements: ['GDPR', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  // PAYMENT PROCESSING MODULES
  'payment_gateways': {
    module_id: 'payment_gateways',
    module_name: 'Payment Gateway Integration',
    module_category: 'payments',
    description: 'Connect to payment processors and gateways',
    icon: 'CreditCard',
    subscription_tier: 'starter',
    pricing_model: { type: 'fixed_monthly', base_price: 99 },
    menu_items: [
      { group: 'connections', label: 'paymentGateways', path: 'PaymentGateways', icon: 'CreditCard', permission: 'VIEW_SETTINGS' }
    ],
    dependencies: ['core_transactions'],
    features: ['payment_gateways', 'gateway_management'],
    compliance_requirements: ['PCI_DSS', 'ISO_20022'],
    data_isolation_required: true,
    is_active: true
  },

  'crypto_payments': {
    module_id: 'crypto_payments',
    module_name: 'Cryptocurrency Payments',
    module_category: 'payments',
    description: 'Accept Bitcoin, Ethereum, and other cryptocurrencies',
    icon: 'Coins',
    subscription_tier: 'professional',
    pricing_model: { type: 'per_transaction', transaction_fee: 0.015 },
    menu_items: [
      { group: 'transactions', label: 'cryptoTransactions', path: 'CryptoTransactions', icon: 'Coins', permission: 'VIEW_TRANSACTIONS' },
      { group: 'connections', label: 'cryptoExchanges', path: 'ExchangeIntegrations', icon: 'TrendingUp', permission: 'VIEW_SETTINGS' },
      { group: 'connections', label: 'blockchainNodes', path: 'BlockchainConnectors', icon: 'Coins', permission: 'VIEW_SETTINGS' }
    ],
    dependencies: ['core_transactions'],
    features: ['crypto_payments', 'blockchain_integration'],
    compliance_requirements: ['FATF', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  'alternative_payments': {
    module_id: 'alternative_payments',
    module_name: 'Alternative Payment Methods',
    module_category: 'payments',
    description: 'Wallets, bank transfers, BNPL, and local payment methods',
    icon: 'Smartphone',
    subscription_tier: 'professional',
    pricing_model: { type: 'fixed_monthly', base_price: 149 },
    menu_items: [
      { group: 'connections', label: 'alternativePayments', path: 'APMOnboarding', icon: 'Smartphone', permission: 'VIEW_ONBOARDING' }
    ],
    dependencies: ['payment_gateways'],
    features: ['apm', 'local_payment_methods'],
    compliance_requirements: ['PCI_DSS', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  // ORCHESTRATION & ROUTING
  'smart_routing': {
    module_id: 'smart_routing',
    module_name: 'AI Smart Routing',
    module_category: 'advanced',
    description: 'AI-powered payment routing for optimal success rates',
    icon: 'Brain',
    subscription_tier: 'enterprise',
    pricing_model: { type: 'usage_based', base_price: 499 },
    menu_items: [
      { group: 'orchestration', label: 'aiSmartRouting', path: 'SmartOrchestration', icon: 'Brain', permission: 'VIEW_ROUTING' },
      { group: 'orchestration', label: 'routingRules', path: 'PaymentOrchestration', icon: 'Zap', permission: 'VIEW_ORCHESTRATION' }
    ],
    dependencies: ['payment_gateways'],
    features: ['smart_routing', 'ai_optimization'],
    compliance_requirements: ['PCI_DSS', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'mid_routing': {
    module_id: 'mid_routing',
    module_name: 'MID Routing & Load Balancing',
    module_category: 'payments',
    description: 'Distribute transactions across multiple MIDs',
    icon: 'ArrowUpDown',
    subscription_tier: 'professional',
    pricing_model: { type: 'fixed_monthly', base_price: 199 },
    menu_items: [
      { group: 'orchestration', label: 'midRouting', path: 'MIDRouting', icon: 'ArrowUpDown', permission: 'VIEW_BALANCES' },
      { group: 'orchestration', label: 'bankMIDs', path: 'BankMIDs', icon: 'Landmark', permission: 'VIEW_BALANCES' },
      { group: 'merchants', label: 'merchantMIDs', path: 'MerchantMIDs', icon: 'CreditCard', permission: 'VIEW_MERCHANTS' }
    ],
    dependencies: ['payment_gateways'],
    features: ['mid_routing', 'load_balancing'],
    compliance_requirements: ['PCI_DSS'],
    data_isolation_required: true,
    is_active: true
  },

  // RISK & COMPLIANCE
  'fraud_prevention': {
    module_id: 'fraud_prevention',
    module_name: 'Fraud Prevention & 3DS',
    module_category: 'risk_compliance',
    description: 'AI fraud detection and 3D Secure authentication',
    icon: 'Shield',
    subscription_tier: 'professional',
    pricing_model: { type: 'per_transaction', transaction_fee: 0.005 },
    menu_items: [
      { group: 'riskCompliance', label: 'fraudPrevention', path: 'FraudPrevention', icon: 'Shield', permission: 'VIEW_FRAUD_PREVENTION' },
      { group: 'riskCompliance', label: 'fraudMonitoring', path: 'FraudMonitoring', icon: 'AlertTriangle', permission: 'VIEW_FRAUD_PREVENTION' },
      { group: 'riskCompliance', label: '3DSecure', path: 'ThreeDSecure', icon: 'Shield', permission: 'VIEW_FRAUD_PREVENTION' }
    ],
    dependencies: ['core_transactions'],
    features: ['fraud_detection', '3ds', 'risk_scoring'],
    compliance_requirements: ['PCI_DSS', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'compliance_suite': {
    module_id: 'compliance_suite',
    module_name: 'Compliance & AML',
    module_category: 'risk_compliance',
    description: 'PCI DSS, FATF AML, and compliance monitoring',
    icon: 'Scale',
    subscription_tier: 'professional',
    pricing_model: { type: 'fixed_monthly', base_price: 299 },
    menu_items: [
      { group: 'riskCompliance', label: 'complianceDashboard', path: 'Compliance', icon: 'Scale', permission: 'VIEW_COMPLIANCE' },
      { group: 'riskCompliance', label: 'pciCompliance', path: 'PCICompliance', icon: 'Shield', permission: 'VIEW_COMPLIANCE' },
      { group: 'riskCompliance', label: 'fatfAML', path: 'FATFCompliance', icon: 'Shield', permission: 'VIEW_COMPLIANCE' }
    ],
    dependencies: ['core_merchants'],
    features: ['compliance_monitoring', 'aml_screening', 'kyb'],
    compliance_requirements: ['PCI_DSS', 'FATF', 'GDPR', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'chargeback_management': {
    module_id: 'chargeback_management',
    module_name: 'Chargeback & Dispute Management',
    module_category: 'risk_compliance',
    description: 'Manage chargebacks, disputes, and representments',
    icon: 'Repeat',
    subscription_tier: 'starter',
    pricing_model: { type: 'fixed_monthly', base_price: 79 },
    menu_items: [
      { group: 'transactions', label: 'chargebacks', path: 'Chargebacks', icon: 'Repeat', permission: 'VIEW_CHARGEBACKS' },
      { group: 'transactions', label: 'disputes', path: 'Disputes', icon: 'AlertTriangle', permission: 'VIEW_DISPUTES' }
    ],
    dependencies: ['core_transactions'],
    features: ['chargeback_management', 'dispute_resolution'],
    compliance_requirements: ['PCI_DSS', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  // PAYOUT & FINANCE
  'payout_management': {
    module_id: 'payout_management',
    module_name: 'Payout Management',
    module_category: 'payouts',
    description: 'Manage merchant payouts and settlements',
    icon: 'Wallet',
    subscription_tier: 'starter',
    pricing_model: { type: 'per_transaction', transaction_fee: 0.005 },
    menu_items: [
      { group: 'finance', label: 'balances', path: 'Balances', icon: 'Wallet', permission: 'VIEW_BALANCES' },
      { group: 'finance', label: 'fiatPayouts', path: 'Payouts', icon: 'CreditCard', permission: 'VIEW_PAYOUTS' },
      { group: 'finance', label: 'reconciliation', path: 'Reconciliation', icon: 'ArrowUpDown', permission: 'VIEW_BALANCES' }
    ],
    dependencies: ['core_transactions'],
    features: ['payouts', 'settlements', 'reconciliation'],
    compliance_requirements: ['PCI_DSS', 'GDPR', 'ISO_20022'],
    data_isolation_required: true,
    is_active: true
  },

  'payout_orchestration': {
    module_id: 'payout_orchestration',
    module_name: 'Payout Orchestration',
    module_category: 'payouts',
    description: 'Multi-rail payout routing and optimization',
    icon: 'Zap',
    subscription_tier: 'enterprise',
    pricing_model: { type: 'usage_based', base_price: 399 },
    menu_items: [
      { group: 'finance', label: 'payoutOrchestration', path: 'PayoutOrchestration', icon: 'Zap', permission: 'VIEW_PAYOUTS' },
      { group: 'finance', label: 'instantPayments', path: 'InstantPayments', icon: 'Zap', permission: 'VIEW_PAYOUTS' }
    ],
    dependencies: ['payout_management'],
    features: ['payout_routing', 'instant_payouts'],
    compliance_requirements: ['ISO_20022', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  'crypto_payouts': {
    module_id: 'crypto_payouts',
    module_name: 'Cryptocurrency Payouts',
    module_category: 'payouts',
    description: 'Pay merchants in cryptocurrency',
    icon: 'Coins',
    subscription_tier: 'enterprise',
    pricing_model: { type: 'per_transaction', transaction_fee: 0.02 },
    menu_items: [
      { group: 'finance', label: 'cryptoPayouts', path: 'CryptoPayouts', icon: 'Coins', permission: 'VIEW_PAYOUTS' }
    ],
    dependencies: ['payout_management', 'crypto_payments'],
    features: ['crypto_payouts'],
    compliance_requirements: ['FATF', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  // PRICING & BILLING
  'pricing_engine': {
    module_id: 'pricing_engine',
    module_name: 'Merchant Pricing Engine',
    module_category: 'advanced',
    description: 'Dynamic pricing, fee configuration, and invoicing',
    icon: 'DollarSign',
    subscription_tier: 'professional',
    pricing_model: { type: 'per_merchant', base_price: 5 },
    menu_items: [
      { group: 'finance', label: 'merchantPricing', path: 'MerchantPricing', icon: 'Percent', permission: 'VIEW_BALANCES' },
      { group: 'finance', label: 'feeTypeManagement', path: 'FeeTypeManagement', icon: 'Tag', permission: 'VIEW_BALANCES' },
      { group: 'finance', label: 'invoices', path: 'Invoices', icon: 'FileText', permission: 'VIEW_BALANCES' }
    ],
    dependencies: ['core_merchants', 'core_transactions'],
    features: ['dynamic_pricing', 'fee_management', 'invoicing'],
    compliance_requirements: ['GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  'usage_metering': {
    module_id: 'usage_metering',
    module_name: 'Usage Metering & Billing',
    module_category: 'advanced',
    description: 'Track usage and generate invoices',
    icon: 'Activity',
    subscription_tier: 'enterprise',
    pricing_model: { type: 'fixed_monthly', base_price: 199 },
    menu_items: [
      { group: 'finance', label: 'usageMetering', path: 'UsageMeteringSystem', icon: 'Activity', permission: 'VIEW_BALANCES' },
      { group: 'finance', label: 'invoiceGenerator', path: 'MerchantInvoiceGenerator', icon: 'FileText', permission: 'VIEW_BALANCES' }
    ],
    dependencies: ['pricing_engine'],
    features: ['usage_tracking', 'automated_billing'],
    compliance_requirements: ['GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  // MERCHANT FEATURES
  'merchant_onboarding_workflow': {
    module_id: 'merchant_onboarding_workflow',
    module_name: 'Advanced Merchant Onboarding',
    module_category: 'merchants',
    description: '10-step merchant onboarding with KYB/KYC, AML screening, document verification, risk assessment, and approval workflow',
    icon: 'Globe',
    subscription_tier: 'professional',
    pricing_model: { type: 'per_merchant', base_price: 15 },
    menu_items: [
      { group: 'merchants', label: 'merchantOnboarding', path: 'MerchantOnboarding', icon: 'Store', permission: 'VIEW_ONBOARDING' },
      { group: 'merchants', label: 'selfServicePortal', path: 'MerchantSelfOnboarding', icon: 'Globe', permission: 'VIEW_ONBOARDING' },
      { group: 'merchants', label: 'approvals', path: 'Approvals', icon: 'CheckSquare', permission: 'APPROVE_ONBOARDING' }
    ],
    dependencies: ['core_merchants', 'compliance_suite'],
    features: [
      'multi_step_onboarding',
      'kyb_verification',
      'kyc_verification', 
      'aml_screening',
      'lei_verification',
      'document_upload',
      'risk_assessment',
      'approval_workflow',
      'self_service_portal',
      'automated_notifications',
      'compliance_checks'
    ],
    compliance_requirements: ['PCI_DSS', 'GDPR', 'ISO_27001', 'FATF'],
    data_isolation_required: true,
    is_active: true,
    is_beta: false
  },

  'merchant_portal': {
    module_id: 'merchant_portal',
    module_name: 'Merchant Portal Builder',
    module_category: 'merchants',
    description: 'White-label merchant dashboards',
    icon: 'Palette',
    subscription_tier: 'professional',
    pricing_model: { type: 'fixed_monthly', base_price: 249 },
    menu_items: [
      { group: 'merchants', label: 'portalBuilder', path: 'MerchantPortalBuilder', icon: 'Palette', permission: 'VIEW_SETTINGS' }
    ],
    dependencies: ['core_merchants'],
    features: ['merchant_portal', 'white_label'],
    compliance_requirements: ['GDPR', 'ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'sub_merchants': {
    module_id: 'sub_merchants',
    module_name: 'Sub-Merchant Management',
    module_category: 'merchants',
    description: 'Manage marketplace and platform sub-merchants',
    icon: 'Building2',
    subscription_tier: 'enterprise',
    pricing_model: { type: 'per_merchant', base_price: 3 },
    menu_items: [
      { group: 'merchants', label: 'subMerchants', path: 'SubMerchants', icon: 'Building2', permission: 'VIEW_MERCHANTS' }
    ],
    dependencies: ['core_merchants'],
    features: ['sub_merchants', 'marketplace'],
    compliance_requirements: ['PCI_DSS', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  // TERMINALS
  'virtual_terminal': {
    module_id: 'virtual_terminal',
    module_name: 'Virtual Terminal',
    module_category: 'payments',
    description: 'Browser-based payment terminal',
    icon: 'Monitor',
    subscription_tier: 'starter',
    pricing_model: { type: 'fixed_monthly', base_price: 49 },
    menu_items: [
      { group: 'terminals', label: 'virtualTerminals', path: 'VirtualTerminals', icon: 'Monitor', permission: 'VIEW_TERMINALS' }
    ],
    dependencies: ['core_transactions'],
    features: ['virtual_terminal'],
    compliance_requirements: ['PCI_DSS'],
    data_isolation_required: true,
    is_active: true
  },

  'physical_terminals': {
    module_id: 'physical_terminals',
    module_name: 'Physical Terminal Management',
    module_category: 'payments',
    description: 'Manage POS terminals and devices',
    icon: 'Terminal',
    subscription_tier: 'professional',
    pricing_model: { type: 'per_merchant', base_price: 10 },
    menu_items: [
      { group: 'terminals', label: 'physicalTerminals', path: 'Terminals', icon: 'Terminal', permission: 'VIEW_TERMINALS' }
    ],
    dependencies: ['core_transactions'],
    features: ['pos_terminals'],
    compliance_requirements: ['PCI_DSS'],
    data_isolation_required: true,
    is_active: true
  },

  // CUSTOMER & PRODUCTS
  'customer_management': {
    module_id: 'customer_management',
    module_name: 'Customer Management',
    module_category: 'merchants',
    description: 'Customer profiles and payment methods',
    icon: 'Users',
    subscription_tier: 'starter',
    pricing_model: { type: 'fixed_monthly', base_price: 29 },
    menu_items: [
      { group: 'customers', label: 'allCustomers', path: 'Customers', icon: 'Users', permission: 'VIEW_TRANSACTIONS' },
      { group: 'customers', label: 'paymentMethods', path: 'PaymentMethods', icon: 'CreditCard', permission: 'VIEW_TRANSACTIONS' }
    ],
    dependencies: ['core_transactions'],
    features: ['customer_vault', 'saved_cards'],
    compliance_requirements: ['PCI_DSS', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  'products_subscriptions': {
    module_id: 'products_subscriptions',
    module_name: 'Products & Subscriptions',
    module_category: 'merchants',
    description: 'Product catalog, recurring billing, payment links',
    icon: 'Building',
    subscription_tier: 'professional',
    pricing_model: { type: 'fixed_monthly', base_price: 99 },
    menu_items: [
      { group: 'products', label: 'productCatalog', path: 'Products', icon: 'Building', permission: 'VIEW_MERCHANTS' },
      { group: 'products', label: 'subscriptions', path: 'Subscriptions', icon: 'Repeat', permission: 'VIEW_MERCHANTS' },
      { group: 'products', label: 'paymentLinks', path: 'PaymentLinks', icon: 'FileText', permission: 'VIEW_MERCHANTS' },
      { group: 'products', label: 'invoicing', path: 'Invoicing', icon: 'FileText', permission: 'VIEW_MERCHANTS' }
    ],
    dependencies: ['core_transactions', 'customer_management'],
    features: ['products', 'subscriptions', 'payment_links'],
    compliance_requirements: ['PCI_DSS', 'GDPR'],
    data_isolation_required: true,
    is_active: true
  },

  // DEVELOPER TOOLS
  'api_management': {
    module_id: 'api_management',
    module_name: 'API & Developer Tools',
    module_category: 'integrations',
    description: 'API keys, webhooks, and developer documentation',
    icon: 'Key',
    subscription_tier: 'starter',
    pricing_model: { type: 'included' },
    menu_items: [
      { group: 'developers', label: 'apiKeys', path: 'APIKeys', icon: 'Key', permission: 'VIEW_SETTINGS' },
      { group: 'developers', label: 'webhooks', path: 'Webhooks', icon: 'Zap', permission: 'VIEW_SETTINGS' },
      { group: 'developers', label: 'apiLogs', path: 'APILogs', icon: 'FileText', permission: 'VIEW_SETTINGS' },
      { group: 'developers', label: 'documentation', path: 'Documentation', icon: 'FileText', permission: 'VIEW_DASHBOARD' }
    ],
    dependencies: [],
    features: ['api_access', 'webhooks'],
    compliance_requirements: ['ISO_27001'],
    data_isolation_required: true,
    is_active: true
  },

  'advanced_features': {
    module_id: 'advanced_features',
    module_name: 'Advanced Features',
    module_category: 'advanced',
    description: 'Network tokenization, account updater, smart retry',
    icon: 'CreditCard',
    subscription_tier: 'enterprise',
    pricing_model: { type: 'usage_based', base_price: 299 },
    menu_items: [
      { group: 'riskCompliance', label: 'networkTokenization', path: 'NetworkTokenization', icon: 'CreditCard', permission: 'VIEW_FRAUD_PREVENTION' },
      { group: 'riskCompliance', label: 'accountUpdater', path: 'AccountUpdater', icon: 'Repeat', permission: 'VIEW_FRAUD_PREVENTION' },
      { group: 'riskCompliance', label: 'smartRetry', path: 'SmartRetry', icon: 'Repeat', permission: 'VIEW_FRAUD_PREVENTION' }
    ],
    dependencies: ['core_transactions'],
    features: ['network_tokenization', 'account_updater', 'smart_retry'],
    compliance_requirements: ['PCI_DSS'],
    data_isolation_required: true,
    is_active: true
  }
};

export const MODULE_CATEGORIES = {
  core: { label: 'Core Features', color: 'blue' },
  payments: { label: 'Payment Processing', color: 'green' },
  payouts: { label: 'Payouts & Settlement', color: 'purple' },
  merchants: { label: 'Merchant Management', color: 'orange' },
  risk_compliance: { label: 'Risk & Compliance', color: 'red' },
  analytics: { label: 'Analytics & Reporting', color: 'cyan' },
  integrations: { label: 'Integrations', color: 'indigo' },
  advanced: { label: 'Advanced Features', color: 'pink' }
};