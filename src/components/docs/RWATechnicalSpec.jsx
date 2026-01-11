export const RWATechnicalSpec = `# FTS.Money RWA Platform - Technical Specifications
**Version:** 2.0  
**Last Updated:** January 11, 2026  
**Status:** Active

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Smart Contract Specifications](#smart-contract-specifications)
4. [API Specifications](#api-specifications)
5. [Database Schema](#database-schema)
6. [Integration Architecture](#integration-architecture)
7. [Security & Compliance](#security-compliance)
8. [Technical Workflows](#technical-workflows)
9. [Infrastructure Requirements](#infrastructure-requirements)
10. [Implementation Phases](#implementation-phases)

---

## Executive Summary

### Platform Overview
FTS.Money RWA Platform is a whitelabel infrastructure enabling PSPs, fintechs, and asset managers to tokenize real-world assets on blockchain while maintaining regulatory compliance and seamless integration with existing payment rails.

### Key Technical Capabilities
- Multi-asset tokenization (Real Estate, Treasury Bills, Private Credit, Commodities)
- ERC-3643 compliant security tokens
- Multi-chain support (Ethereum, Polygon, Avalanche, Base)
- Automated compliance engine (KYC/AML/accreditation)
- Institutional-grade custody integration
- Oracle-based asset valuation
- Secondary market infrastructure
- ISO 20022 settlement integration

### Technology Stack Summary
\`\`\`
Frontend:     React, TypeScript, Web3.js, ethers.js
Backend:      Node.js/Deno, PostgreSQL, Redis
Blockchain:   Solidity 0.8.x, Hardhat, OpenZeppelin
Custody:      Fireblocks API, Copper.co API
Oracles:      Chainlink, Band Protocol
Compliance:   Chainalysis, Elliptic
Payment:      FTS.Money existing infrastructure
\`\`\`

---

## System Architecture

### High-Level Architecture

\`\`\`mermaid
graph TB
    subgraph "Frontend Layer"
        A[Asset Issuer Portal]
        B[Investor Portal]
        C[Admin Dashboard]
    end
    
    subgraph "API Gateway"
        D[REST API]
        E[GraphQL API]
        F[WebSocket API]
    end
    
    subgraph "Core Services"
        G[Tokenization Engine]
        H[Compliance Engine]
        I[Custody Manager]
        J[Oracle Aggregator]
        K[Settlement Engine]
    end
    
    subgraph "Blockchain Layer"
        L[Smart Contract Factory]
        M[Token Contracts ERC-3643]
        N[Transfer Validators]
        O[Oracle Contracts]
    end
    
    subgraph "External Integrations"
        P[Fireblocks Custody]
        Q[Chainlink Oracles]
        R[Chainalysis AML]
        S[FTS Payment Rails]
    end
    
    subgraph "Data Layer"
        T[PostgreSQL Primary]
        U[PostgreSQL Read Replicas]
        V[Redis Cache]
        W[IPFS Document Storage]
    end
    
    A --> D
    B --> D
    C --> D
    D --> G
    D --> H
    E --> G
    F --> K
    G --> L
    G --> I
    H --> R
    I --> P
    J --> Q
    K --> S
    L --> M
    M --> N
    M --> O
    G --> T
    H --> T
    T --> U
    T --> V
    G --> W
\`\`\`

### Component Architecture

#### 1. Tokenization Engine
**Responsibilities:**
- Asset tokenization workflow orchestration
- Smart contract deployment
- Token minting/burning
- Fractional ownership management
- Corporate actions (dividends, interest)

**Technical Stack:**
- Language: TypeScript/Node.js
- Framework: NestJS
- Queue: Bull (Redis-backed)
- State Machine: XState

**Key Modules:**
\`\`\`typescript
interface TokenizationEngine {
  // Asset onboarding
  validateAsset(asset: AssetSubmission): Promise<ValidationResult>;
  calculateTokenomics(asset: Asset, config: TokenConfig): Tokenomics;
  
  // Smart contract deployment
  deployTokenContract(asset: Asset, tokenomics: Tokenomics): Promise<ContractAddress>;
  configureCompliance(contract: ContractAddress, rules: ComplianceRules): Promise<void>;
  
  // Token lifecycle
  mintTokens(contract: ContractAddress, recipient: Address, amount: BigNumber): Promise<TxHash>;
  burnTokens(contract: ContractAddress, holder: Address, amount: BigNumber): Promise<TxHash>;
  
  // Corporate actions
  distributeDividends(contract: ContractAddress, amount: BigNumber): Promise<TxHash>;
  processInterestPayment(contract: ContractAddress, rate: number): Promise<TxHash>;
}
\`\`\`

#### 2. Compliance Engine
**Responsibilities:**
- KYC/AML verification
- Investor accreditation checks
- Transfer restriction enforcement
- Regulatory reporting
- Geographic restrictions

**Technical Stack:**
- Language: Go
- Framework: Gin
- Rules Engine: Drools (JVM interop)
- Document Processing: Tesseract OCR

**Compliance Rules Schema:**
\`\`\`json
{
  "ruleset_id": "us_reg_d_506c",
  "jurisdiction": "US",
  "regulation": "Regulation D - Rule 506(c)",
  "requirements": {
    "investor_type": ["accredited"],
    "verification_methods": ["income", "net_worth", "professional"],
    "holding_period": 365,
    "transfer_restrictions": {
      "allowed_jurisdictions": ["US"],
      "blocked_countries": ["CU", "IR", "KP", "SY"],
      "max_investors": 2000
    }
  }
}
\`\`\`

#### 3. Custody Manager
**Responsibilities:**
- Private key management
- Multi-sig wallet operations
- Transaction signing
- Asset custody verification
- Audit trail

**Integration Points:**
- **Fireblocks:** Primary custody for institutional assets
- **Copper.co:** Alternative custody for diversification
- **Hardware Security Modules (HSM):** On-premise key storage

**Security Architecture:**
\`\`\`
┌─────────────────────────────────────┐
│      Custody Manager Service        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Key Vault  │  │  Multi-Sig  │ │
│  │   (HSM)      │  │  Policies   │ │
│  └──────────────┘  └─────────────┘ │
│         │                 │         │
│         ▼                 ▼         │
│  ┌────────────────────────────┐   │
│  │   Transaction Approval      │   │
│  │   Workflow Engine           │   │
│  └────────────────────────────┘   │
│         │                          │
└─────────┼──────────────────────────┘
          ▼
    ┌─────────────┐
    │  Fireblocks │
    │     API     │
    └─────────────┘
\`\`\`

#### 4. Oracle Aggregator
**Responsibilities:**
- Real-time asset valuations
- Price feed aggregation
- Data quality verification
- Fallback mechanisms

**Oracle Providers:**
- **Chainlink:** Primary for crypto assets, commodities
- **Band Protocol:** Secondary for redundancy
- **Custom Oracles:** Real estate appraisals, private credit valuations

**Price Feed Architecture:**
\`\`\`solidity
interface IPriceFeed {
    function getLatestPrice(bytes32 assetId) external view returns (
        uint256 price,
        uint256 timestamp,
        uint256 confidence
    );
    
    function getHistoricalPrice(bytes32 assetId, uint256 timestamp) 
        external view returns (uint256 price);
}
\`\`\`

#### 5. Settlement Engine
**Responsibilities:**
- Trade settlement coordination
- Payment processing
- Delivery vs. Payment (DvP)
- ISO 20022 message generation
- Reconciliation

**Integration with FTS Payment Rails:**
\`\`\`typescript
interface SettlementEngine {
  // DvP settlement
  initiateSettlement(trade: Trade): Promise<SettlementId>;
  processPayment(settlementId: SettlementId, payment: PaymentDetails): Promise<PaymentStatus>;
  deliverTokens(settlementId: SettlementId): Promise<TxHash>;
  
  // ISO 20022 integration
  generateISO20022Message(settlement: Settlement): ISO20022Message;
  processIncomingPayment(message: ISO20022Message): Promise<void>;
}
\`\`\`

---

## Smart Contract Specifications

### 1. Asset Token Contract (ERC-3643)

**Standard:** ERC-3643 (T-REX Token)  
**Language:** Solidity ^0.8.20  
**Framework:** Hardhat

**Contract Structure:**
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@onchain-id/solidity/contracts/interface/IIdentity.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RWASecurityToken
 * @dev ERC-3643 compliant security token for real-world assets
 */
contract RWASecurityToken is ERC20, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Asset metadata
    struct AssetMetadata {
        string assetType;        // "real_estate", "treasury_bill", etc.
        string jurisdiction;     // ISO 3166-1 alpha-2
        uint256 totalValue;      // Asset value in USD (18 decimals)
        uint256 tokenizationDate;
        string ipfsDocumentHash; // Legal documents
        bool isActive;
    }
    
    AssetMetadata public assetMetadata;
    
    // Compliance & Identity
    mapping(address => IIdentity) public identityRegistry;
    mapping(address => bool) public frozenWallets;
    
    // Corporate actions
    uint256 public dividendPerToken;
    mapping(address => uint256) public lastDividendClaim;
    
    // Transfer restrictions
    mapping(address => mapping(address => bool)) public approvedTransfers;
    uint256 public maxInvestors;
    uint256 public currentInvestors;
    
    event TokensMinted(address indexed to, uint256 amount, uint256 timestamp);
    event TokensBurned(address indexed from, uint256 amount, uint256 timestamp);
    event DividendDistributed(uint256 totalAmount, uint256 perToken);
    event WalletFrozen(address indexed wallet, string reason);
    event ComplianceCheckFailed(address indexed from, address indexed to, string reason);
    
    constructor(
        string memory name,
        string memory symbol,
        AssetMetadata memory _metadata,
        uint256 _maxInvestors
    ) ERC20(name, symbol) {
        assetMetadata = _metadata;
        maxInvestors = _maxInvestors;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint new tokens (issuer only)
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(ISSUER_ROLE) 
        returns (bool) 
    {
        require(assetMetadata.isActive, "Asset inactive");
        require(!frozenWallets[to], "Wallet frozen");
        require(_isEligibleInvestor(to), "Not eligible");
        
        if (balanceOf(to) == 0) {
            require(currentInvestors < maxInvestors, "Max investors reached");
            currentInvestors++;
        }
        
        _mint(to, amount);
        emit TokensMinted(to, amount, block.timestamp);
        return true;
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(address from, uint256 amount) 
        external 
        onlyRole(ISSUER_ROLE) 
        returns (bool) 
    {
        _burn(from, amount);
        
        if (balanceOf(from) == 0 && currentInvestors > 0) {
            currentInvestors--;
        }
        
        emit TokensBurned(from, amount, block.timestamp);
        return true;
    }
    
    /**
     * @dev Override transfer with compliance checks
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0) && to != address(0)) {
            require(!frozenWallets[from], "Sender frozen");
            require(!frozenWallets[to], "Recipient frozen");
            require(_isTransferAllowed(from, to, amount), "Transfer not allowed");
        }
    }
    
    /**
     * @dev Check if transfer is compliant
     */
    function _isTransferAllowed(
        address from,
        address to,
        uint256 amount
    ) internal view returns (bool) {
        // Check identity verification
        if (address(identityRegistry[to]) == address(0)) {
            return false;
        }
        
        // Check approved transfer (for restricted securities)
        if (approvedTransfers[from][to] == false && from != address(0)) {
            return false;
        }
        
        // Check max investors
        if (balanceOf(to) == 0 && currentInvestors >= maxInvestors) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Check investor eligibility
     */
    function _isEligibleInvestor(address investor) 
        internal 
        view 
        returns (bool) 
    {
        return address(identityRegistry[investor]) != address(0);
    }
    
    /**
     * @dev Distribute dividends to all holders
     */
    function distributeDividends(uint256 totalAmount) 
        external 
        onlyRole(ISSUER_ROLE) 
    {
        require(totalSupply() > 0, "No tokens issued");
        dividendPerToken = totalAmount / totalSupply();
        emit DividendDistributed(totalAmount, dividendPerToken);
    }
    
    /**
     * @dev Claim dividends
     */
    function claimDividends() external returns (uint256) {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No tokens held");
        
        uint256 owed = balance * (dividendPerToken - lastDividendClaim[msg.sender]);
        require(owed > 0, "No dividends owed");
        
        lastDividendClaim[msg.sender] = dividendPerToken;
        
        // Transfer from dividend pool (implementation depends on payment method)
        return owed;
    }
    
    /**
     * @dev Freeze wallet (compliance action)
     */
    function freezeWallet(address wallet, string calldata reason) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        frozenWallets[wallet] = true;
        emit WalletFrozen(wallet, reason);
    }
    
    /**
     * @dev Register investor identity
     */
    function registerIdentity(address investor, IIdentity identity) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        identityRegistry[investor] = identity;
    }
    
    /**
     * @dev Approve specific transfer (for restricted transfers)
     */
    function approveTransfer(address from, address to) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        approvedTransfers[from][to] = true;
    }
}
\`\`\`

### 2. Asset Factory Contract

\`\`\`solidity
/**
 * @title RWAAssetFactory
 * @dev Factory for deploying new RWA tokens
 */
contract RWAAssetFactory is Ownable {
    address public immutable complianceEngine;
    address public immutable feeCollector;
    uint256 public tokenizationFee;
    
    mapping(bytes32 => address) public assetTokens;
    address[] public allAssets;
    
    event AssetTokenized(
        bytes32 indexed assetId,
        address indexed tokenAddress,
        string assetType,
        uint256 totalValue
    );
    
    constructor(
        address _complianceEngine,
        address _feeCollector,
        uint256 _tokenizationFee
    ) {
        complianceEngine = _complianceEngine;
        feeCollector = _feeCollector;
        tokenizationFee = _tokenizationFee;
    }
    
    /**
     * @dev Deploy new asset token
     */
    function tokenizeAsset(
        string memory name,
        string memory symbol,
        RWASecurityToken.AssetMetadata memory metadata,
        uint256 maxInvestors
    ) external payable returns (address) {
        require(msg.value >= tokenizationFee, "Insufficient fee");
        
        bytes32 assetId = keccak256(abi.encodePacked(
            metadata.assetType,
            metadata.jurisdiction,
            block.timestamp
        ));
        
        require(assetTokens[assetId] == address(0), "Asset already exists");
        
        // Deploy new token contract
        RWASecurityToken token = new RWASecurityToken(
            name,
            symbol,
            metadata,
            maxInvestors
        );
        
        assetTokens[assetId] = address(token);
        allAssets.push(address(token));
        
        // Grant compliance role to engine
        token.grantRole(token.COMPLIANCE_ROLE(), complianceEngine);
        
        // Transfer ownership to sender
        token.transferOwnership(msg.sender);
        
        // Send fee to collector
        payable(feeCollector).transfer(msg.value);
        
        emit AssetTokenized(assetId, address(token), metadata.assetType, metadata.totalValue);
        
        return address(token);
    }
    
    function getAssetCount() external view returns (uint256) {
        return allAssets.length;
    }
}
\`\`\`

### 3. Oracle Price Feed Contract

\`\`\`solidity
/**
 * @title RWAOracleFeed
 * @dev Aggregates price data from multiple oracles
 */
contract RWAOracleFeed is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence; // 0-100
        address source;
    }
    
    mapping(bytes32 => PriceData[]) public priceHistory;
    mapping(bytes32 => uint256) public latestPriceIndex;
    
    uint256 public constant MIN_CONFIDENCE = 80;
    uint256 public constant MAX_PRICE_AGE = 24 hours;
    
    event PriceUpdated(
        bytes32 indexed assetId,
        uint256 price,
        uint256 confidence,
        address indexed source
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Update price from oracle
     */
    function updatePrice(
        bytes32 assetId,
        uint256 price,
        uint256 confidence
    ) external onlyRole(ORACLE_ROLE) {
        require(confidence >= MIN_CONFIDENCE, "Confidence too low");
        
        PriceData memory newPrice = PriceData({
            price: price,
            timestamp: block.timestamp,
            confidence: confidence,
            source: msg.sender
        });
        
        priceHistory[assetId].push(newPrice);
        latestPriceIndex[assetId] = priceHistory[assetId].length - 1;
        
        emit PriceUpdated(assetId, price, confidence, msg.sender);
    }
    
    /**
     * @dev Get latest validated price
     */
    function getLatestPrice(bytes32 assetId) 
        external 
        view 
        returns (uint256 price, uint256 timestamp) 
    {
        uint256 index = latestPriceIndex[assetId];
        require(priceHistory[assetId].length > 0, "No price data");
        
        PriceData memory latest = priceHistory[assetId][index];
        require(block.timestamp - latest.timestamp <= MAX_PRICE_AGE, "Price too old");
        
        return (latest.price, latest.timestamp);
    }
}
\`\`\`

---

## API Specifications

### REST API Endpoints

**Base URL:** \`https://api.fts.money/v1/rwa\`

#### Asset Management

\`\`\`http
POST /assets/tokenize
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "asset_type": "real_estate",
  "asset_details": {
    "property_address": "123 Main St, New York, NY",
    "appraisal_value": 5000000,
    "appraisal_date": "2025-12-01",
    "legal_description": "Lot 5, Block 3..."
  },
  "tokenization_config": {
    "total_supply": 5000,
    "price_per_token": 1000,
    "min_investment": 1000,
    "max_investors": 500
  },
  "compliance_rules": {
    "jurisdiction": "US",
    "regulation": "Reg D 506(c)",
    "accredited_only": true,
    "holding_period_days": 365
  },
  "documents": [
    {
      "type": "appraisal",
      "ipfs_hash": "Qm..."
    },
    {
      "type": "legal_opinion",
      "ipfs_hash": "Qm..."
    }
  ]
}

Response 201:
{
  "asset_id": "ast_abc123",
  "token_contract": "0x1234...5678",
  "deployment_tx": "0xabcd...ef01",
  "status": "deployed",
  "tokenization_fee": 5000,
  "estimated_gas": 0.05
}
\`\`\`

\`\`\`http
GET /assets/{asset_id}

Response 200:
{
  "asset_id": "ast_abc123",
  "token_contract": "0x1234...5678",
  "asset_type": "real_estate",
  "status": "active",
  "total_supply": 5000,
  "tokens_issued": 3500,
  "tokens_available": 1500,
  "current_price": 1050,
  "total_value": 5250000,
  "investor_count": 287,
  "yield_rate": 0.065,
  "next_dividend_date": "2026-01-15",
  "compliance_status": "compliant",
  "created_at": "2025-12-01T10:00:00Z"
}
\`\`\`

#### Investor Management

\`\`\`http
POST /investors/register
Content-Type: application/json

{
  "email": "investor@example.com",
  "full_name": "John Doe",
  "country": "US",
  "investor_type": "accredited",
  "verification_documents": [
    {
      "type": "proof_of_income",
      "file_url": "https://..."
    }
  ]
}

Response 201:
{
  "investor_id": "inv_xyz789",
  "status": "pending_verification",
  "onchain_identity": null,
  "verification_deadline": "2025-12-10T00:00:00Z"
}
\`\`\`

\`\`\`http
GET /investors/{investor_id}/portfolio

Response 200:
{
  "investor_id": "inv_xyz789",
  "total_invested": 50000,
  "current_value": 52500,
  "total_return": 0.05,
  "holdings": [
    {
      "asset_id": "ast_abc123",
      "token_balance": 50,
      "purchase_price": 50000,
      "current_value": 52500,
      "unrealized_gain": 2500,
      "yield_earned": 1625,
      "next_dividend": 325
    }
  ]
}
\`\`\`

#### Trading & Orders

\`\`\`http
POST /orders/create
Content-Type: application/json

{
  "asset_id": "ast_abc123",
  "order_type": "buy",
  "quantity": 10,
  "price_per_token": 1050,
  "payment_method": "bank_transfer",
  "payment_currency": "USD"
}

Response 201:
{
  "order_id": "ord_def456",
  "status": "pending_payment",
  "total_amount": 10500,
  "payment_instructions": {
    "iban": "GB...",
    "reference": "ORD-DEF456",
    "amount": 10500,
    "deadline": "2025-12-30T23:59:59Z"
  }
}
\`\`\`

\`\`\`http
POST /orders/{order_id}/settle

Response 200:
{
  "order_id": "ord_def456",
  "settlement_status": "completed",
  "tokens_delivered": 10,
  "tx_hash": "0x9876...5432",
  "settled_at": "2025-12-29T15:30:00Z"
}
\`\`\`

#### Corporate Actions

\`\`\`http
POST /assets/{asset_id}/dividends/distribute
Content-Type: application/json
Authorization: Bearer {issuer_token}

{
  "total_amount": 50000,
  "payment_date": "2026-01-15",
  "payment_method": "automatic",
  "currency": "USD"
}

Response 202:
{
  "dividend_id": "div_ghi789",
  "status": "scheduled",
  "recipients_count": 287,
  "amount_per_token": 10,
  "total_amount": 50000,
  "payment_date": "2026-01-15"
}
\`\`\`

### GraphQL API

\`\`\`graphql
type Asset {
  id: ID!
  assetType: AssetType!
  tokenContract: String!
  name: String!
  symbol: String!
  totalSupply: BigInt!
  tokensIssued: BigInt!
  currentPrice: Float!
  totalValue: Float!
  yieldRate: Float
  status: AssetStatus!
  investors: [Investor!]!
  priceHistory: [PricePoint!]!
  dividends: [Dividend!]!
  documents: [Document!]!
  createdAt: DateTime!
}

type Query {
  asset(id: ID!): Asset
  assets(
    filter: AssetFilter
    orderBy: AssetOrderBy
    limit: Int
    offset: Int
  ): [Asset!]!
  
  investor(id: ID!): Investor
  investorPortfolio(investorId: ID!): Portfolio!
  
  marketStats: MarketStats!
}

type Mutation {
  tokenizeAsset(input: TokenizeAssetInput!): Asset!
  registerInvestor(input: RegisterInvestorInput!): Investor!
  createOrder(input: CreateOrderInput!): Order!
  distributeDividends(input: DistributeDividendsInput!): Dividend!
}

type Subscription {
  priceUpdated(assetId: ID!): PriceUpdate!
  orderStatusChanged(orderId: ID!): OrderStatusUpdate!
  dividendDistributed(assetId: ID!): DividendNotification!
}
\`\`\`

---

## Database Schema

### Core Entities

\`\`\`sql
-- RWA Assets
CREATE TABLE rwa_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psp_id VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- real_estate, treasury_bill, etc.
    token_contract_address VARCHAR(42) NOT NULL UNIQUE,
    token_name VARCHAR(100) NOT NULL,
    token_symbol VARCHAR(10) NOT NULL,
    chain_id INT NOT NULL,
    
    -- Asset details
    total_supply DECIMAL(38, 18) NOT NULL,
    tokens_issued DECIMAL(38, 18) DEFAULT 0,
    price_per_token DECIMAL(18, 2) NOT NULL,
    total_value DECIMAL(18, 2) NOT NULL,
    
    -- Compliance
    jurisdiction VARCHAR(2) NOT NULL, -- ISO 3166-1
    regulation_type VARCHAR(50) NOT NULL,
    max_investors INT NOT NULL,
    current_investors INT DEFAULT 0,
    accredited_only BOOLEAN DEFAULT true,
    holding_period_days INT DEFAULT 0,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, active, matured, liquidated
    compliance_status VARCHAR(20) DEFAULT 'compliant',
    
    -- Financial
    yield_rate DECIMAL(5, 4), -- Annual yield
    next_distribution_date DATE,
    
    -- Metadata
    ipfs_document_hash VARCHAR(100),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_psp FOREIGN KEY (psp_id) REFERENCES provisioned_psp(psp_id)
);

CREATE INDEX idx_rwa_assets_psp ON rwa_assets(psp_id);
CREATE INDEX idx_rwa_assets_status ON rwa_assets(status);
CREATE INDEX idx_rwa_assets_type ON rwa_assets(asset_type);

-- RWA Investors
CREATE TABLE rwa_investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psp_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    
    -- Compliance
    investor_type VARCHAR(20) NOT NULL, -- accredited, qualified, retail
    country VARCHAR(2) NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    kyc_verified_at TIMESTAMPTZ,
    kyc_provider VARCHAR(50),
    kyc_reference_id VARCHAR(100),
    
    -- Blockchain identity
    wallet_address VARCHAR(42),
    onchain_identity_contract VARCHAR(42),
    identity_verified BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    frozen BOOLEAN DEFAULT false,
    frozen_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(psp_id, email)
);

CREATE INDEX idx_rwa_investors_psp ON rwa_investors(psp_id);
CREATE INDEX idx_rwa_investors_wallet ON rwa_investors(wallet_address);
CREATE INDEX idx_rwa_investors_status ON rwa_investors(kyc_status);

-- RWA Holdings
CREATE TABLE rwa_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES rwa_assets(id),
    investor_id UUID NOT NULL REFERENCES rwa_investors(id),
    
    token_balance DECIMAL(38, 18) NOT NULL DEFAULT 0,
    average_purchase_price DECIMAL(18, 2) NOT NULL,
    total_invested DECIMAL(18, 2) NOT NULL,
    total_dividends_earned DECIMAL(18, 2) DEFAULT 0,
    
    first_purchase_date TIMESTAMPTZ,
    last_transaction_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(asset_id, investor_id)
);

CREATE INDEX idx_rwa_holdings_asset ON rwa_holdings(asset_id);
CREATE INDEX idx_rwa_holdings_investor ON rwa_holdings(investor_id);

-- RWA Orders
CREATE TABLE rwa_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    psp_id VARCHAR(255) NOT NULL,
    asset_id UUID NOT NULL REFERENCES rwa_assets(id),
    investor_id UUID NOT NULL REFERENCES rwa_investors(id),
    
    order_type VARCHAR(10) NOT NULL, -- buy, sell
    quantity DECIMAL(38, 18) NOT NULL,
    price_per_token DECIMAL(18, 2) NOT NULL,
    total_amount DECIMAL(18, 2) NOT NULL,
    
    -- Payment
    payment_method VARCHAR(50) NOT NULL,
    payment_currency VARCHAR(3) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_reference VARCHAR(100),
    payment_received_at TIMESTAMPTZ,
    
    -- Settlement
    settlement_status VARCHAR(20) DEFAULT 'pending',
    settlement_tx_hash VARCHAR(66),
    settled_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rwa_orders_asset ON rwa_orders(asset_id);
CREATE INDEX idx_rwa_orders_investor ON rwa_orders(investor_id);
CREATE INDEX idx_rwa_orders_status ON rwa_orders(status);

-- RWA Dividends
CREATE TABLE rwa_dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES rwa_assets(id),
    
    total_amount DECIMAL(18, 2) NOT NULL,
    amount_per_token DECIMAL(18, 8) NOT NULL,
    payment_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL,
    
    -- Distribution
    status VARCHAR(20) DEFAULT 'scheduled',
    recipients_count INT NOT NULL,
    distributed_amount DECIMAL(18, 2) DEFAULT 0,
    distribution_tx_hash VARCHAR(66),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rwa_dividends_asset ON rwa_dividends(asset_id);
CREATE INDEX idx_rwa_dividends_status ON rwa_dividends(status);

-- RWA Transactions (blockchain events)
CREATE TABLE rwa_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES rwa_assets(id),
    
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- mint, burn, transfer
    
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    amount DECIMAL(38, 18) NOT NULL,
    
    gas_used BIGINT,
    gas_price DECIMAL(18, 0),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rwa_transactions_asset ON rwa_transactions(asset_id);
CREATE INDEX idx_rwa_transactions_hash ON rwa_transactions(tx_hash);

-- RWA Price History
CREATE TABLE rwa_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES rwa_assets(id),
    
    price DECIMAL(18, 2) NOT NULL,
    source VARCHAR(50) NOT NULL, -- oracle, trade, manual
    confidence_score INT, -- 0-100
    
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rwa_price_asset_time ON rwa_price_history(asset_id, timestamp DESC);

-- RWA Documents
CREATE TABLE rwa_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES rwa_assets(id),
    
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    ipfs_hash VARCHAR(100) NOT NULL,
    file_url TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(255),
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rwa_documents_asset ON rwa_documents(asset_id);
\`\`\`

---

## Integration Architecture

### 1. Fireblocks Custody Integration

\`\`\`typescript
import { FireblocksSDK } from 'fireblocks-sdk';

interface FireblocksConfig {
  apiKey: string;
  privateKeyPath: string;
  baseUrl: string;
}

class FireblocksCustodyService {
  private fireblocks: FireblocksSDK;
  
  constructor(config: FireblocksConfig) {
    this.fireblocks = new FireblocksSDK(
      config.privateKeyPath,
      config.apiKey,
      config.baseUrl
    );
  }
  
  /**
   * Create new vault for asset
   */
  async createAssetVault(assetId: string, assetType: string): Promise<string> {
    const vault = await this.fireblocks.createVaultAccount({
      name: \`RWA-\${assetType}-\${assetId}\`,
      hiddenOnUI: false,
      customerRefId: assetId
    });
    
    return vault.id;
  }
  
  /**
   * Sign token mint transaction
   */
  async signMintTransaction(
    vaultId: string,
    tokenContract: string,
    recipient: string,
    amount: string
  ): Promise<string> {
    const tx = await this.fireblocks.createTransaction({
      operation: 'CONTRACT_CALL',
      source: {
        type: 'VAULT_ACCOUNT',
        id: vaultId
      },
      destination: {
        type: 'EXTERNAL_WALLET',
        address: tokenContract
      },
      assetId: 'ETH',
      amount: '0',
      note: \`Mint \${amount} tokens to \${recipient}\`,
      extraParameters: {
        contractCallData: this.encodeMintData(recipient, amount)
      }
    });
    
    return tx.id;
  }
  
  private encodeMintData(recipient: string, amount: string): string {
    // ABI encode mint(address,uint256)
    const iface = new ethers.utils.Interface([
      'function mint(address to, uint256 amount)'
    ]);
    return iface.encodeFunctionData('mint', [recipient, amount]);
  }
}
\`\`\`

### 2. Chainlink Oracle Integration

\`\`\`typescript
import { ethers } from 'ethers';

interface OracleConfig {
  chainlinkNodeUrl: string;
  jobId: string;
  oracleContract: string;
  privateKey: string;
}

class ChainlinkOracleService {
  private provider: ethers.providers.Provider;
  private wallet: ethers.Wallet;
  private oracleContract: ethers.Contract;
  
  constructor(config: OracleConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(config.chainlinkNodeUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // RWAOracleFeed contract
    this.oracleContract = new ethers.Contract(
      config.oracleContract,
      ORACLE_ABI,
      this.wallet
    );
  }
  
  /**
   * Request real estate appraisal
   */
  async requestRealEstatePrice(
    assetId: string,
    propertyAddress: string
  ): Promise<string> {
    const tx = await this.oracleContract.requestData(
      ethers.utils.formatBytes32String(assetId),
      propertyAddress,
      'real_estate_valuation'
    );
    
    await tx.wait();
    return tx.hash;
  }
  
  /**
   * Fulfill oracle request (called by Chainlink node)
   */
  async fulfillPrice(
    assetId: string,
    price: number,
    confidence: number
  ): Promise<void> {
    const priceWei = ethers.utils.parseUnits(price.toString(), 8);
    
    await this.oracleContract.updatePrice(
      ethers.utils.formatBytes32String(assetId),
      priceWei,
      confidence
    );
  }
}
\`\`\`

### 3. FTS Payment Rails Integration

\`\`\`typescript
import { base44 } from '@/api/base44Client';

class RWAPaymentService {
  /**
   * Process order payment via FTS rails
   */
  async processOrderPayment(orderId: string): Promise<PaymentResult> {
    const order = await this.getOrder(orderId);
    
    // Create payment transaction via FTS
    const payment = await base44.entities.Transaction.create({
      psp_code: order.psp_id,
      merchant_id: 'RWA_PLATFORM',
      type: 'sale',
      amount: order.total_amount,
      currency: order.payment_currency,
      payment_method: order.payment_method,
      description: \`RWA Order \${order.order_number}\`,
      metadata: {
        rwa_order_id: orderId,
        asset_id: order.asset_id,
        investor_id: order.investor_id
      }
    });
    
    return {
      transactionId: payment.id,
      status: payment.status,
      paymentReference: payment.transaction_id
    };
  }
  
  /**
   * Distribute dividends via ISO 20022
   */
  async distributeDividends(dividendId: string): Promise<void> {
    const dividend = await this.getDividend(dividendId);
    const recipients = await this.getDividendRecipients(dividendId);
    
    for (const recipient of recipients) {
      // Generate ISO 20022 payment
      const iso20022Message = this.generateISO20022Payment(
        dividend,
        recipient
      );
      
      // Send via FTS ISO Gateway
      await base44.functions.invoke('iso20022Handler', {
        message: iso20022Message,
        direction: 'outbound'
      });
    }
  }
  
  private generateISO20022Payment(
    dividend: Dividend,
    recipient: Recipient
  ): ISO20022Message {
    return {
      GrpHdr: {
        MsgId: \`DIV-\${dividend.id}\`,
        CreDtTm: new Date().toISOString()
      },
      PmtInf: {
        PmtInfId: \`DIVPMT-\${dividend.id}-\${recipient.id}\`,
        PmtMtd: 'TRF',
        ReqdExctnDt: dividend.payment_date,
        Dbtr: {
          Nm: 'FTS.Money RWA Platform',
          Id: { OrgId: { LEI: process.env.PLATFORM_LEI } }
        },
        CdtTrfTxInf: [{
          PmtId: {
            EndToEndId: \`E2E-\${recipient.id}\`
          },
          Amt: {
            InstdAmt: {
              Ccy: dividend.currency,
              value: recipient.amount
            }
          },
          Cdtr: {
            Nm: recipient.name,
            PstlAdr: recipient.address
          },
          CdtrAcct: {
            Id: { IBAN: recipient.iban }
          }
        }]
      }
    };
  }
}
\`\`\`

---

## Security & Compliance

### Security Architecture

**1. Smart Contract Security**
- OpenZeppelin audited contracts
- Multi-sig admin operations
- Time-locked upgrades
- Pausable functionality
- Reentrancy guards

**2. Key Management**
- Hardware Security Modules (HSM)
- Fireblocks MPC wallet technology
- Multi-approval workflows
- Key rotation policies

**3. Access Control**
- Role-Based Access Control (RBAC)
- Multi-factor authentication
- IP whitelisting for admin
- API key rotation

**4. Data Security**
- End-to-end encryption
- At-rest encryption (AES-256)
- In-transit encryption (TLS 1.3)
- PII anonymization

### Compliance Framework

**KYC/AML Requirements**
\`\`\`typescript
interface ComplianceCheck {
  // Identity verification
  verifyIdentity(investor: Investor): Promise<VerificationResult>;
  
  // AML screening
  screenAML(investor: Investor): Promise<AMLResult>;
  
  // Sanctions check
  checkSanctions(investor: Investor): Promise<SanctionsResult>;
  
  // Accreditation verification (US)
  verifyAccreditation(investor: Investor): Promise<AccreditationResult>;
  
  // Source of funds
  verifySourceOfFunds(investor: Investor, amount: number): Promise<SOFResult>;
}
\`\`\`

**Regulatory Reporting**
- Transaction reporting (MiFID II, EMIR)
- Beneficial ownership (FATF)
- Tax reporting (FATCA, CRS)
- Audit trail (immutable logs)

---

## Technical Workflows

### 1. Asset Tokenization Workflow

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant API
    participant TokenEngine
    participant Compliance
    participant Blockchain
    participant Custody
    
    Issuer->>API: POST /assets/tokenize
    API->>Compliance: Validate issuer
    Compliance-->>API: Approved
    
    API->>TokenEngine: Create tokenization job
    TokenEngine->>Custody: Create vault
    Custody-->>TokenEngine: Vault ID
    
    TokenEngine->>Blockchain: Deploy token contract
    Blockchain-->>TokenEngine: Contract address
    
    TokenEngine->>Blockchain: Configure compliance rules
    TokenEngine->>Blockchain: Mint initial supply
    
    TokenEngine->>API: Tokenization complete
    API-->>Issuer: Asset token created
\`\`\`

### 2. Investment Workflow

\`\`\`mermaid
sequenceDiagram
    participant Investor
    participant Portal
    participant Compliance
    participant Payment
    participant Settlement
    participant Blockchain
    
    Investor->>Portal: Select asset & amount
    Portal->>Compliance: Check eligibility
    Compliance-->>Portal: Approved
    
    Investor->>Portal: Create order
    Portal->>Payment: Generate payment instructions
    Payment-->>Investor: Bank details
    
    Investor->>Payment: Transfer funds
    Payment->>Settlement: Payment received
    
    Settlement->>Compliance: Final check
    Compliance-->>Settlement: Approved
    
    Settlement->>Blockchain: Transfer tokens
    Blockchain-->>Investor: Tokens delivered
\`\`\`

### 3. Dividend Distribution Workflow

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant System
    participant Blockchain
    participant Payment
    participant Investors
    
    Issuer->>System: Schedule dividend
    System->>Blockchain: Read token holders
    Blockchain-->>System: Holder addresses & balances
    
    System->>System: Calculate per-holder amount
    System->>Blockchain: Distribute on-chain
    
    loop For each investor
        System->>Payment: Create ISO 20022 payment
        Payment->>Investors: Transfer funds
    end
    
    System->>Blockchain: Record distribution
    System->>Issuer: Distribution complete
\`\`\`

---

## Infrastructure Requirements

### Compute Resources

**Production Environment:**
- API Servers: 4x c5.2xlarge (AWS)
- Background Workers: 2x c5.xlarge
- Database: db.r5.2xlarge (PostgreSQL)
- Cache: cache.r5.large (Redis)
- Blockchain Nodes: 2x c5.4xlarge (Ethereum full nodes)

**Estimated Costs:**
- Compute: $3,000/month
- Storage: $500/month
- Blockchain gas: $2,000-10,000/month (variable)
- Custody (Fireblocks): $5,000/month
- Oracles (Chainlink): $1,000/month
- **Total: $11,500-19,500/month**

### Blockchain Infrastructure

**Supported Networks:**
- Ethereum Mainnet (primary)
- Polygon (scalability)
- Avalanche (alternative)
- Base (L2 for lower fees)

**Node Requirements:**
- Geth/Erigon full nodes
- Archive node for historical data
- Redundant RPC endpoints

### Storage Requirements

**Database:**
- PostgreSQL 14+ with TimescaleDB
- Multi-AZ deployment
- Point-in-time recovery
- Daily backups retained 30 days

**Document Storage:**
- IPFS for legal documents
- Pinata/Infura pinning service
- S3 for off-chain backups

---

## Implementation Phases

### Phase 1: Foundation (Months 1-3)

**Deliverables:**
- Smart contract development (ERC-3643)
- Core API endpoints
- Database schema
- Admin dashboard (basic)

**Milestones:**
- Week 4: Smart contracts deployed to testnet
- Week 8: API integration tests passing
- Week 12: Internal demo ready

**Team:**
- 2x Blockchain Engineers
- 2x Backend Engineers
- 1x DevOps Engineer
- 1x Product Manager

**Cost:** $180K

### Phase 2: Compliance & Custody (Months 4-6)

**Deliverables:**
- Fireblocks integration
- KYC/AML workflows
- Compliance engine
- Investor portal

**Milestones:**
- Week 16: Fireblocks custody live
- Week 20: KYC flow complete
- Week 24: Beta testing with 10 investors

**Team:**
- +1 Compliance Engineer
- +1 Frontend Engineer
- +1 QA Engineer

**Cost:** $220K

### Phase 3: Trading & Settlement (Months 7-9)

**Deliverables:**
- Order management system
- Payment integration (FTS rails)
- Settlement engine (DvP)
- Secondary market

**Milestones:**
- Week 28: Order book functional
- Week 32: ISO 20022 integration
- Week 36: First live trade

**Team:**
- +1 Payment Integration Engineer

**Cost:** $200K

### Phase 4: Oracle & Automation (Months 10-12)

**Deliverables:**
- Chainlink oracle integration
- Automated dividend distribution
- Corporate actions automation
- Public API v1.0

**Milestones:**
- Week 40: Oracle price feeds live
- Week 44: Dividend automation tested
- Week 48: Platform launch

**Team:**
- (Same team)

**Cost:** $180K

**Total Implementation Cost: $780K**  
**Timeline: 12 months**

---

## Success Metrics

### Technical KPIs
- Smart contract deployment: <5 minutes
- Transaction confirmation: <2 minutes (avg)
- API response time: <200ms (p95)
- System uptime: >99.9%
- Gas optimization: <$50 per tokenization

### Business KPIs
- Assets tokenized: 20+ in Year 1
- Total AUM: $500M in Year 1
- Platform revenue: $2.5M in Year 1
- Investor registrations: 5,000+

---

---

**Document Information**
- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Owner:** RWA Engineering Team
- **Contact:** engineering@fts.money

© 2026 FTS.Money. All rights reserved.
`;