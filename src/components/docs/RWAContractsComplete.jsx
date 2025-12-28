// UNIVERSAL RWA SMART CONTRACTS - COMPLETE SUITE
// Asset-agnostic architecture with pluggable extensions

export const RWA_CONTRACTS = {
  
  // ============================================================================
  // 1. CORE: Universal Security Token (ERC-3643 Base)
  // ============================================================================
  
  RWASecurityToken: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title RWASecurityToken
 * @notice Universal ERC-3643 compliant security token for ALL asset types
 * @dev Asset-agnostic core with pluggable extensions
 */
contract RWASecurityToken is 
    ERC20Upgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ========== ROLES ==========
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    
    // ========== CORE STRUCTURES ==========
    
    struct AssetMetadata {
        AssetType assetType;
        string assetClass;
        bytes32 assetId;
        address extensionModule;
        uint256 totalValue;
        string jurisdiction;
        bytes32 issuerLEI;
        uint256 issuanceDate;
        UniversalAssetState state;
    }
    
    enum AssetType {
        REAL_ESTATE,
        TREASURY_BILL,
        PRIVATE_CREDIT,
        COMMODITY,
        EQUITY,
        CORPORATE_BOND,
        MUNICIPAL_BOND,
        ABS,
        FUND_SHARE,
        CARBON_CREDIT
    }
    
    enum UniversalAssetState {
        PENDING_TOKENIZATION,
        ACTIVE,
        MATURED,
        DEFAULTED,
        REDEEMED,
        LIQUIDATED,
        SUSPENDED
    }
    
    // ========== STATE VARIABLES ==========
    
    AssetMetadata public asset;
    
    // Identity & Compliance
    IIdentityRegistry public identityRegistry;
    IComplianceEngine public complianceEngine;
    IvLEIVerifier public vleiVerifier;
    
    // Valuation & Pricing
    IValuationAdapter public valuationAdapter;
    IPriceOracle public primaryOracle;
    IPriceOracle public backupOracle;
    uint256 public maxPriceDeviation; // Basis points
    uint256 public maxPriceStaleness; // Seconds
    
    // Cashflow & Corporate Actions
    ICashflowSchedule public cashflowSchedule;
    CorporateAction[] public corporateActions;
    
    // Redemption
    RedemptionConfig public redemptionConfig;
    
    // Custody
    CustodyArrangement public custodyInfo;
    
    // Risk Management
    RiskProfile public riskProfile;
    
    // Transfer Restrictions
    mapping(address => uint256) public lockupEnd;
    mapping(address => bool) public frozen;
    
    // Extensible metadata
    mapping(string => bytes) public customFields;
    
    // Audit trail
    AuditEntry[] public immutableAudit;
    
    // Emergency controls
    bool public emergencyPaused;
    string public emergencyReason;
    uint256 public emergencyTimestamp;
    
    // ========== ADDITIONAL STRUCTURES ==========
    
    struct RedemptionConfig {
        bool isRedeemable;
        RedemptionType redemptionType;
        uint256 redemptionDate;
        uint256 noticePeriod;
        uint256 redemptionFee;
        bool partialRedemptionAllowed;
        uint256 minimumRedemption;
    }
    
    enum RedemptionType {
        FIXED_MATURITY,
        ON_DEMAND,
        ASSET_SALE_TRIGGERED,
        PRO_RATA_AMORTIZING,
        CALLABLE
    }
    
    struct CustodyArrangement {
        address custodian;
        CustodyType custodyType;
        string offChainReference;
        bool verified;
        uint256 verificationDate;
    }
    
    enum CustodyType {
        SMART_CONTRACT,
        FIREBLOCKS_MPC,
        BANK_CUSTODIAN,
        TITLE_COMPANY,
        WAREHOUSE_RECEIPT,
        LEGAL_TRUST
    }
    
    struct RiskProfile {
        uint256 riskRating;
        uint256 loanToValue;
        uint256 defaultProbability;
        bool insured;
        address insuranceProvider;
        uint256 recoveryRate;
        uint256 lastAssessment;
    }
    
    struct CorporateAction {
        uint256 actionId;
        CorporateActionType actionType;
        uint256 announcementDate;
        uint256 executionDate;
        bytes actionData;
        bool executed;
        address initiator;
    }
    
    enum CorporateActionType {
        DIVIDEND,
        COUPON,
        STOCK_SPLIT,
        REVERSE_SPLIT,
        MERGER,
        ACQUISITION,
        CONVERSION,
        CALLABLE_REDEMPTION,
        RIGHTS_ISSUE,
        SPIN_OFF,
        PRINCIPAL_PAYMENT,
        INTEREST_PAYMENT
    }
    
    struct AuditEntry {
        uint256 entryId;
        address actor;
        string action;
        bytes32 dataHash;
        uint256 timestamp;
        bytes32 previousHash;
    }
    
    // ========== EVENTS ==========
    
    event AssetTokenized(bytes32 indexed assetId, AssetType assetType, uint256 totalValue);
    event ComplianceCheckPerformed(address indexed from, address indexed to, bool passed);
    event TokensLocked(address indexed holder, uint256 until);
    event TokensRedeemed(address indexed holder, uint256 amount, uint256 value);
    event CorporateActionAnnounced(uint256 indexed actionId, CorporateActionType actionType);
    event CorporateActionExecuted(uint256 indexed actionId);
    event EmergencyPaused(string reason, uint256 timestamp);
    event EmergencyUnpaused(uint256 timestamp);
    event ValuationUpdated(uint256 oldValue, uint256 newValue, uint256 timestamp);
    event AssetStateChanged(UniversalAssetState oldState, UniversalAssetState newState);
    event AuditRecorded(uint256 indexed entryId, address actor, string action);
    
    // ========== MODIFIERS ==========
    
    modifier onlyCompliant(address from, address to, uint256 amount) {
        require(complianceEngine.canTransfer(from, to, amount), "Transfer not compliant");
        _;
    }
    
    modifier notFrozen(address account) {
        require(!frozen[account], "Account frozen");
        _;
    }
    
    modifier whenNotEmergencyPaused() {
        require(!emergencyPaused, "Emergency pause active");
        _;
    }
    
    // ========== INITIALIZATION ==========
    
    function initialize(
        string memory name_,
        string memory symbol_,
        AssetMetadata memory assetData_,
        address identityRegistry_,
        address complianceEngine_,
        address admin_
    ) external initializer {
        __ERC20_init(name_, symbol_);
        __Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        asset = assetData_;
        identityRegistry = IIdentityRegistry(identityRegistry_);
        complianceEngine = IComplianceEngine(complianceEngine_);
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(ISSUER_ROLE, admin_);
        _grantRole(COMPLIANCE_ROLE, admin_);
        
        maxPriceDeviation = 500; // 5%
        maxPriceStaleness = 1 hours;
        
        _recordAudit(admin_, "TOKEN_INITIALIZED", abi.encode(assetData_));
        
        emit AssetTokenized(assetData_.assetId, assetData_.assetType, assetData_.totalValue);
    }
    
    // ========== ERC-3643 COMPLIANCE ==========
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused whenNotEmergencyPaused {
        // Skip checks for minting/burning
        if (from == address(0) || to == address(0)) {
            super._beforeTokenTransfer(from, to, amount);
            return;
        }
        
        // Check frozen status
        require(!frozen[from], "Sender frozen");
        require(!frozen[to], "Recipient frozen");
        
        // Check lockup
        require(block.timestamp >= lockupEnd[from], "Tokens locked");
        
        // Check identity verification
        require(identityRegistry.isVerified(from), "Sender not verified");
        require(identityRegistry.isVerified(to), "Recipient not verified");
        
        // Check compliance rules
        require(complianceEngine.canTransfer(from, to, amount), "Transfer not compliant");
        
        // Check vLEI if required
        if (address(vleiVerifier) != address(0)) {
            bytes32 senderLEI = identityRegistry.getLEI(from);
            bytes32 recipientLEI = identityRegistry.getLEI(to);
            require(vleiVerifier.isValid(senderLEI), "Sender vLEI invalid");
            require(vleiVerifier.isValid(recipientLEI), "Recipient vLEI invalid");
        }
        
        _recordAudit(from, "TRANSFER", abi.encode(to, amount));
        emit ComplianceCheckPerformed(from, to, true);
        
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // ========== ISSUANCE ==========
    
    function mint(address to, uint256 amount) 
        external 
        onlyRole(ISSUER_ROLE) 
        whenNotPaused 
    {
        require(identityRegistry.isVerified(to), "Recipient not verified");
        require(asset.state == UniversalAssetState.ACTIVE, "Asset not active");
        
        _mint(to, amount);
        _recordAudit(msg.sender, "MINT", abi.encode(to, amount));
    }
    
    function burn(address from, uint256 amount) 
        external 
        onlyRole(ISSUER_ROLE) 
    {
        _burn(from, amount);
        _recordAudit(msg.sender, "BURN", abi.encode(from, amount));
    }
    
    // ========== REDEMPTION ==========
    
    function redeemTokens(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(redemptionConfig.isRedeemable, "Asset not redeemable");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        if (redemptionConfig.redemptionType == RedemptionType.FIXED_MATURITY) {
            require(block.timestamp >= redemptionConfig.redemptionDate, "Not matured");
        }
        
        if (!redemptionConfig.partialRedemptionAllowed) {
            require(amount == balanceOf(msg.sender), "Must redeem all tokens");
        }
        
        require(amount >= redemptionConfig.minimumRedemption, "Below minimum");
        
        uint256 value = calculateRedemptionValue(amount);
        uint256 fee = (value * redemptionConfig.redemptionFee) / 10000;
        uint256 netValue = value - fee;
        
        _burn(msg.sender, amount);
        
        // Initiate payment (via extension or oracle)
        _initiateRedemptionPayment(msg.sender, netValue);
        
        _recordAudit(msg.sender, "REDEEM", abi.encode(amount, netValue));
        emit TokensRedeemed(msg.sender, amount, netValue);
    }
    
    function calculateRedemptionValue(uint256 amount) public view returns (uint256) {
        if (address(valuationAdapter) != address(0)) {
            uint256 totalValue = valuationAdapter.getCurrentValue();
            return (totalValue * amount) / totalSupply();
        }
        return (asset.totalValue * amount) / totalSupply();
    }
    
    // ========== CORPORATE ACTIONS ==========
    
    function announceCorporateAction(
        CorporateActionType actionType,
        uint256 executionDate,
        bytes calldata actionData
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        require(executionDate > block.timestamp, "Invalid execution date");
        
        uint256 actionId = corporateActions.length;
        corporateActions.push(CorporateAction({
            actionId: actionId,
            actionType: actionType,
            announcementDate: block.timestamp,
            executionDate: executionDate,
            actionData: actionData,
            executed: false,
            initiator: msg.sender
        }));
        
        _recordAudit(msg.sender, "CORPORATE_ACTION_ANNOUNCED", abi.encode(actionId, actionType));
        emit CorporateActionAnnounced(actionId, actionType);
        
        return actionId;
    }
    
    function executeCorporateAction(uint256 actionId) 
        external 
        onlyRole(AGENT_ROLE) 
        nonReentrant 
    {
        require(actionId < corporateActions.length, "Invalid action");
        CorporateAction storage action = corporateActions[actionId];
        require(!action.executed, "Already executed");
        require(block.timestamp >= action.executionDate, "Too early");
        
        if (action.actionType == CorporateActionType.DIVIDEND) {
            _executeDividend(action.actionData);
        } else if (action.actionType == CorporateActionType.COUPON) {
            _executeCoupon(action.actionData);
        } else if (action.actionType == CorporateActionType.STOCK_SPLIT) {
            _executeStockSplit(action.actionData);
        } else if (action.actionType == CorporateActionType.PRINCIPAL_PAYMENT) {
            _executePrincipalPayment(action.actionData);
        }
        
        action.executed = true;
        
        _recordAudit(msg.sender, "CORPORATE_ACTION_EXECUTED", abi.encode(actionId));
        emit CorporateActionExecuted(actionId);
    }
    
    function _executeDividend(bytes memory data) internal {
        (uint256 totalAmount, uint256 recordDate) = abi.decode(data, (uint256, uint256));
        
        // Distribution logic handled by cashflow schedule
        if (address(cashflowSchedule) != address(0)) {
            cashflowSchedule.recordPayment(
                totalAmount,
                ICashflowSchedule.PaymentType.DIVIDEND,
                recordDate
            );
        }
    }
    
    function _executeCoupon(bytes memory data) internal {
        (uint256 totalAmount, uint256 recordDate) = abi.decode(data, (uint256, uint256));
        
        if (address(cashflowSchedule) != address(0)) {
            cashflowSchedule.recordPayment(
                totalAmount,
                ICashflowSchedule.PaymentType.COUPON,
                recordDate
            );
        }
    }
    
    function _executeStockSplit(bytes memory data) internal {
        uint256 ratio = abi.decode(data, (uint256));
        require(ratio > 1, "Invalid split ratio");
        
        // Implement split logic
        // Note: This would require iterating holders or using snapshot
    }
    
    function _executePrincipalPayment(bytes memory data) internal {
        (uint256 totalAmount, bool isFinal) = abi.decode(data, (uint256, bool));
        
        if (address(cashflowSchedule) != address(0)) {
            cashflowSchedule.recordPayment(
                totalAmount,
                ICashflowSchedule.PaymentType.PRINCIPAL,
                block.timestamp
            );
        }
        
        if (isFinal) {
            asset.state = UniversalAssetState.MATURED;
        }
    }
    
    // ========== EMERGENCY CONTROLS ==========
    
    function emergencyPause(string calldata reason) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        emergencyPaused = true;
        emergencyReason = reason;
        emergencyTimestamp = block.timestamp;
        
        _recordAudit(msg.sender, "EMERGENCY_PAUSE", abi.encode(reason));
        emit EmergencyPaused(reason, block.timestamp);
    }
    
    function emergencyUnpause() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        emergencyPaused = false;
        
        _recordAudit(msg.sender, "EMERGENCY_UNPAUSE", "");
        emit EmergencyUnpaused(block.timestamp);
    }
    
    function freezeAccount(address account) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        frozen[account] = true;
        _recordAudit(msg.sender, "ACCOUNT_FROZEN", abi.encode(account));
    }
    
    function unfreezeAccount(address account) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        frozen[account] = false;
        _recordAudit(msg.sender, "ACCOUNT_UNFROZEN", abi.encode(account));
    }
    
    // ========== VALUATION & PRICING ==========
    
    function getCurrentValue() external view returns (uint256) {
        if (address(valuationAdapter) != address(0)) {
            return valuationAdapter.getCurrentValue();
        }
        return asset.totalValue;
    }
    
    function getTokenPrice() external view returns (uint256) {
        uint256 totalValue = this.getCurrentValue();
        uint256 supply = totalSupply();
        return supply > 0 ? (totalValue * 1e18) / supply : 0;
    }
    
    function updateValuation(uint256 newValue) 
        external 
        onlyRole(AGENT_ROLE) 
    {
        require(newValue > 0, "Invalid valuation");
        
        uint256 oldValue = asset.totalValue;
        asset.totalValue = newValue;
        
        _recordAudit(msg.sender, "VALUATION_UPDATED", abi.encode(oldValue, newValue));
        emit ValuationUpdated(oldValue, newValue, block.timestamp);
    }
    
    // ========== STATE MANAGEMENT ==========
    
    function transitionState(UniversalAssetState newState) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        UniversalAssetState oldState = asset.state;
        require(_canTransitionTo(oldState, newState), "Invalid state transition");
        
        asset.state = newState;
        
        _recordAudit(msg.sender, "STATE_CHANGED", abi.encode(oldState, newState));
        emit AssetStateChanged(oldState, newState);
    }
    
    function _canTransitionTo(
        UniversalAssetState from,
        UniversalAssetState to
    ) internal pure returns (bool) {
        if (from == UniversalAssetState.PENDING_TOKENIZATION) {
            return to == UniversalAssetState.ACTIVE;
        }
        if (from == UniversalAssetState.ACTIVE) {
            return to == UniversalAssetState.MATURED || 
                   to == UniversalAssetState.DEFAULTED ||
                   to == UniversalAssetState.SUSPENDED;
        }
        if (from == UniversalAssetState.SUSPENDED) {
            return to == UniversalAssetState.ACTIVE ||
                   to == UniversalAssetState.LIQUIDATED;
        }
        return false;
    }
    
    // ========== AUDIT TRAIL ==========
    
    function _recordAudit(
        address actor,
        string memory action,
        bytes memory data
    ) internal {
        bytes32 previousHash = immutableAudit.length > 0 
            ? immutableAudit[immutableAudit.length - 1].previousHash
            : bytes32(0);
            
        bytes32 dataHash = keccak256(data);
        bytes32 currentHash = keccak256(abi.encode(
            previousHash,
            actor,
            action,
            dataHash,
            block.timestamp
        ));
        
        immutableAudit.push(AuditEntry({
            entryId: immutableAudit.length,
            actor: actor,
            action: action,
            dataHash: dataHash,
            timestamp: block.timestamp,
            previousHash: currentHash
        }));
        
        emit AuditRecorded(immutableAudit.length - 1, actor, action);
    }
    
    function verifyAuditChain() external view returns (bool) {
        if (immutableAudit.length == 0) return true;
        
        for (uint i = 1; i < immutableAudit.length; i++) {
            AuditEntry memory current = immutableAudit[i];
            AuditEntry memory previous = immutableAudit[i-1];
            
            bytes32 expectedHash = keccak256(abi.encode(
                previous.previousHash,
                current.actor,
                current.action,
                current.dataHash,
                current.timestamp
            ));
            
            if (current.previousHash != expectedHash) {
                return false;
            }
        }
        
        return true;
    }
    
    // ========== EXTENSIBILITY ==========
    
    function setCustomField(string calldata key, bytes calldata value) 
        external 
        onlyRole(ISSUER_ROLE) 
    {
        customFields[key] = value;
        _recordAudit(msg.sender, "CUSTOM_FIELD_SET", abi.encode(key));
    }
    
    function getCustomField(string calldata key) 
        external 
        view 
        returns (bytes memory) 
    {
        return customFields[key];
    }
    
    // ========== SETTERS ==========
    
    function setValuationAdapter(address adapter) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        valuationAdapter = IValuationAdapter(adapter);
    }
    
    function setCashflowSchedule(address schedule) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        cashflowSchedule = ICashflowSchedule(schedule);
    }
    
    function setRedemptionConfig(RedemptionConfig calldata config) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        redemptionConfig = config;
    }
    
    function setLockup(address holder, uint256 until) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        lockupEnd[holder] = until;
        emit TokensLocked(holder, until);
    }
    
    // ========== INTERNAL HELPERS ==========
    
    function _initiateRedemptionPayment(address recipient, uint256 amount) internal {
        // This would integrate with payment rails (ISO 20022, Striga, etc.)
        // Implementation depends on asset type and custody arrangement
    }
    
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {}
    
    // ========== VIEW FUNCTIONS ==========
    
    function getAssetInfo() external view returns (AssetMetadata memory) {
        return asset;
    }
    
    function getCustodyInfo() external view returns (CustodyArrangement memory) {
        return custodyInfo;
    }
    
    function getRiskProfile() external view returns (RiskProfile memory) {
        return riskProfile;
    }
    
    function getAuditTrailLength() external view returns (uint256) {
        return immutableAudit.length;
    }
}

// ========== INTERFACES ==========

interface IIdentityRegistry {
    function isVerified(address account) external view returns (bool);
    function getLEI(address account) external view returns (bytes32);
}

interface IComplianceEngine {
    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
}

interface IvLEIVerifier {
    function isValid(bytes32 lei) external view returns (bool);
    function verifyCredential(bytes32 lei, bytes calldata proof) external view returns (bool);
}

interface IValuationAdapter {
    function getCurrentValue() external view returns (uint256);
    function getLastValuationDate() external view returns (uint256);
    function isStale() external view returns (bool);
}

interface IPriceOracle {
    function getPrice() external view returns (uint256);
    function getLastUpdate() external view returns (uint256);
}

interface ICashflowSchedule {
    enum PaymentType { COUPON, DIVIDEND, RENT, INTEREST, PRINCIPAL, REDEMPTION }
    function recordPayment(uint256 amount, PaymentType pType, uint256 date) external;
}
`,

  // ============================================================================
  // 2. ASSET-SPECIFIC EXTENSIONS
  // ============================================================================

  RealEstateExtension: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RealEstateExtension {
    struct PropertyDetails {
        string physicalAddress;
        string city;
        string state;
        string country;
        string postalCode;
        
        uint256 squareFootage;
        PropertyType propertyType;
        PropertySubtype subtype;
        uint256 yearBuilt;
        
        bytes32 deedHash;           // IPFS hash of title deed
        bytes32 titleInsuranceHash; // IPFS hash of title insurance
        string parcelNumber;        // APN/Tax ID
        
        uint256 purchasePrice;
        uint256 currentAppraisal;
        uint256 lastAppraisalDate;
        address appraiser;
        
        uint256 annualGrossRent;
        uint256 annualNetIncome;
        uint256 occupancyRate;      // Basis points
        
        bool hasActiveLease;
        uint256 leaseExpiryDate;
    }
    
    enum PropertyType {
        RESIDENTIAL,
        COMMERCIAL,
        INDUSTRIAL,
        MIXED_USE,
        LAND
    }
    
    enum PropertySubtype {
        SINGLE_FAMILY,
        MULTI_FAMILY,
        APARTMENT_COMPLEX,
        OFFICE,
        RETAIL,
        WAREHOUSE,
        HOTEL,
        PARKING,
        AGRICULTURAL,
        VACANT_LAND
    }
    
    mapping(bytes32 => PropertyDetails) public properties;
    mapping(bytes32 => Lease[]) public leases;
    mapping(bytes32 => MaintenanceRecord[]) public maintenanceHistory;
    
    struct Lease {
        address tenant;
        uint256 monthlyRent;
        uint256 startDate;
        uint256 endDate;
        uint256 securityDeposit;
        bool active;
    }
    
    struct MaintenanceRecord {
        uint256 date;
        string description;
        uint256 cost;
        string contractor;
    }
    
    function registerProperty(
        bytes32 assetId,
        PropertyDetails calldata details
    ) external {
        properties[assetId] = details;
    }
    
    function updateAppraisal(
        bytes32 assetId,
        uint256 newValue,
        address appraiser
    ) external {
        PropertyDetails storage prop = properties[assetId];
        prop.currentAppraisal = newValue;
        prop.lastAppraisalDate = block.timestamp;
        prop.appraiser = appraiser;
    }
    
    function addLease(bytes32 assetId, Lease calldata lease) external {
        leases[assetId].push(lease);
    }
    
    function calculateNOI(bytes32 assetId) external view returns (uint256) {
        PropertyDetails memory prop = properties[assetId];
        return prop.annualNetIncome;
    }
    
    function calculateCapRate(bytes32 assetId) external view returns (uint256) {
        PropertyDetails memory prop = properties[assetId];
        if (prop.currentAppraisal == 0) return 0;
        return (prop.annualNetIncome * 10000) / prop.currentAppraisal; // Basis points
    }
}
`,

  TreasuryBillExtension: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TreasuryBillExtension {
    struct TBillDetails {
        string cusip;               // 9-character CUSIP
        string isin;                // 12-character ISIN
        
        uint256 parValue;           // Face value at maturity
        uint256 issuePrice;         // Discounted purchase price
        uint256 issueDate;
        uint256 maturityDate;
        uint256 term;               // Days (28, 91, 182, 364)
        
        uint256 discountRate;       // Basis points
        uint256 yieldRate;          // Basis points
        
        string auctionDate;
        string auctionType;         // "competitive" or "non-competitive"
        
        address custodian;          // Bank or broker
        string dtcNumber;           // DTC participant number
    }
    
    mapping(bytes32 => TBillDetails) public tbills;
    
    function registerTBill(
        bytes32 assetId,
        TBillDetails calldata details
    ) external {
        require(details.maturityDate > details.issueDate, "Invalid dates");
        require(details.issuePrice < details.parValue, "Invalid discount");
        tbills[assetId] = details;
    }
    
    function calculateYield(bytes32 assetId) external view returns (uint256) {
        TBillDetails memory tb = tbills[assetId];
        uint256 discount = tb.parValue - tb.issuePrice;
        uint256 daysToMaturity = (tb.maturityDate - tb.issueDate) / 1 days;
        
        // Yield = (Discount / Purchase Price) * (360 / Days) * 10000
        return (discount * 360 * 10000) / (tb.issuePrice * daysToMaturity);
    }
    
    function getCurrentValue(bytes32 assetId) external view returns (uint256) {
        TBillDetails memory tb = tbills[assetId];
        
        if (block.timestamp >= tb.maturityDate) {
            return tb.parValue;
        }
        
        uint256 daysRemaining = (tb.maturityDate - block.timestamp) / 1 days;
        uint256 totalDays = (tb.maturityDate - tb.issueDate) / 1 days;
        
        // Linear accrual
        uint256 accruedValue = tb.issuePrice + 
            ((tb.parValue - tb.issuePrice) * (totalDays - daysRemaining)) / totalDays;
            
        return accruedValue;
    }
    
    function isMatured(bytes32 assetId) external view returns (bool) {
        return block.timestamp >= tbills[assetId].maturityDate;
    }
}
`,

  PrivateCreditExtension: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PrivateCreditExtension {
    struct LoanDetails {
        address borrower;
        bytes32 borrowerLEI;
        
        uint256 principalAmount;
        uint256 outstandingPrincipal;
        uint256 interestRate;           // Basis points annually
        uint256 originationDate;
        uint256 maturityDate;
        
        AmortizationType amortizationType;
        uint256 paymentFrequency;       // Seconds between payments
        
        CollateralType collateralType;
        uint256 collateralValue;
        uint256 loanToValue;            // Basis points
        
        CreditRating rating;
        uint256 defaultProbability;     // Basis points
        
        bool inDefault;
        uint256 defaultDate;
        uint256 recoveryRate;           // Basis points
        
        PaymentScheduleEntry[] schedule;
    }
    
    enum AmortizationType {
        INTEREST_ONLY,
        AMORTIZING,
        BALLOON,
        BULLET
    }
    
    enum CollateralType {
        REAL_ESTATE,
        ACCOUNTS_RECEIVABLE,
        INVENTORY,
        EQUIPMENT,
        INTELLECTUAL_PROPERTY,
        CORPORATE_GUARANTEE,
        UNSECURED
    }
    
    enum CreditRating {
        AAA, AA, A, BBB, BB, B, CCC, CC, C, D
    }
    
    struct PaymentScheduleEntry {
        uint256 dueDate;
        uint256 principalDue;
        uint256 interestDue;
        uint256 totalDue;
        bool paid;
        uint256 paidDate;
        uint256 paidAmount;
    }
    
    mapping(bytes32 => LoanDetails) public loans;
    
    function registerLoan(
        bytes32 assetId,
        LoanDetails calldata details
    ) external {
        loans[assetId] = details;
        _generatePaymentSchedule(assetId);
    }
    
    function _generatePaymentSchedule(bytes32 assetId) internal {
        LoanDetails storage loan = loans[assetId];
        
        if (loan.amortizationType == AmortizationType.AMORTIZING) {
            _generateAmortizingSchedule(assetId);
        } else if (loan.amortizationType == AmortizationType.INTEREST_ONLY) {
            _generateInterestOnlySchedule(assetId);
        } else if (loan.amortizationType == AmortizationType.BALLOON) {
            _generateBalloonSchedule(assetId);
        }
    }
    
    function _generateAmortizingSchedule(bytes32 assetId) internal {
        LoanDetails storage loan = loans[assetId];
        
        uint256 numPayments = (loan.maturityDate - loan.originationDate) / loan.paymentFrequency;
        uint256 periodicRate = loan.interestRate / (365 days / loan.paymentFrequency);
        
        // Calculate payment amount (standard amortization formula)
        uint256 payment = _calculatePayment(
            loan.principalAmount,
            periodicRate,
            numPayments
        );
        
        uint256 balance = loan.principalAmount;
        uint256 dueDate = loan.originationDate + loan.paymentFrequency;
        
        for (uint i = 0; i < numPayments; i++) {
            uint256 interest = (balance * periodicRate) / 10000;
            uint256 principal = payment - interest;
            
            loan.schedule.push(PaymentScheduleEntry({
                dueDate: dueDate,
                principalDue: principal,
                interestDue: interest,
                totalDue: payment,
                paid: false,
                paidDate: 0,
                paidAmount: 0
            }));
            
            balance -= principal;
            dueDate += loan.paymentFrequency;
        }
    }
    
    function _generateInterestOnlySchedule(bytes32 assetId) internal {
        LoanDetails storage loan = loans[assetId];
        
        uint256 numPayments = (loan.maturityDate - loan.originationDate) / loan.paymentFrequency;
        uint256 periodicRate = loan.interestRate / (365 days / loan.paymentFrequency);
        uint256 interestPayment = (loan.principalAmount * periodicRate) / 10000;
        
        uint256 dueDate = loan.originationDate + loan.paymentFrequency;
        
        for (uint i = 0; i < numPayments; i++) {
            bool isFinal = (i == numPayments - 1);
            
            loan.schedule.push(PaymentScheduleEntry({
                dueDate: dueDate,
                principalDue: isFinal ? loan.principalAmount : 0,
                interestDue: interestPayment,
                totalDue: isFinal ? loan.principalAmount + interestPayment : interestPayment,
                paid: false,
                paidDate: 0,
                paidAmount: 0
            }));
            
            dueDate += loan.paymentFrequency;
        }
    }
    
    function _generateBalloonSchedule(bytes32 assetId) internal {
        LoanDetails storage loan = loans[assetId];
        
        uint256 numPayments = (loan.maturityDate - loan.originationDate) / loan.paymentFrequency;
        uint256 periodicRate = loan.interestRate / (365 days / loan.paymentFrequency);
        uint256 interestPayment = (loan.principalAmount * periodicRate) / 10000;
        
        uint256 dueDate = loan.originationDate + loan.paymentFrequency;
        
        for (uint i = 0; i < numPayments; i++) {
            bool isFinal = (i == numPayments - 1);
            
            loan.schedule.push(PaymentScheduleEntry({
                dueDate: dueDate,
                principalDue: isFinal ? loan.principalAmount : 0,
                interestDue: interestPayment,
                totalDue: isFinal ? loan.principalAmount + interestPayment : interestPayment,
                paid: false,
                paidDate: 0,
                paidAmount: 0
            }));
            
            dueDate += loan.paymentFrequency;
        }
    }
    
    function recordPayment(
        bytes32 assetId,
        uint256 scheduleIndex,
        uint256 amount
    ) external {
        LoanDetails storage loan = loans[assetId];
        require(scheduleIndex < loan.schedule.length, "Invalid index");
        
        PaymentScheduleEntry storage entry = loan.schedule[scheduleIndex];
        require(!entry.paid, "Already paid");
        require(amount >= entry.totalDue, "Insufficient payment");
        
        entry.paid = true;
        entry.paidDate = block.timestamp;
        entry.paidAmount = amount;
        
        loan.outstandingPrincipal -= entry.principalDue;
    }
    
    function markDefault(bytes32 assetId) external {
        LoanDetails storage loan = loans[assetId];
        loan.inDefault = true;
        loan.defaultDate = block.timestamp;
    }
    
    function calculateNextPayment(bytes32 assetId) external view returns (
        uint256 dueDate,
        uint256 amount
    ) {
        LoanDetails storage loan = loans[assetId];
        
        for (uint i = 0; i < loan.schedule.length; i++) {
            if (!loan.schedule[i].paid) {
                return (loan.schedule[i].dueDate, loan.schedule[i].totalDue);
            }
        }
        
        return (0, 0);
    }
    
    function _calculatePayment(
        uint256 principal,
        uint256 rate,
        uint256 numPayments
    ) internal pure returns (uint256) {
        // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
        // Simplified for smart contract
        uint256 ratePerPayment = rate;
        uint256 factor = _power((10000 + ratePerPayment), numPayments);
        return (principal * ratePerPayment * factor) / ((factor - 10000) * 10000);
    }
    
    function _power(uint256 base, uint256 exp) internal pure returns (uint256) {
        uint256 result = 10000;
        for (uint i = 0; i < exp; i++) {
            result = (result * base) / 10000;
        }
        return result;
    }
}
`,

CommodityExtension: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CommodityExtension {
    struct CommodityDetails {
        CommodityType commodityType;
        string specificGrade;       // "LBMA Good Delivery", "WTI Crude", etc.
        
        uint256 quantity;
        string unit;                // "troy_oz", "barrels", "metric_tons"
        
        uint256 fineness;           // For precious metals (995 = 99.5%)
        string[] serialNumbers;     // Bar numbers, container IDs
        
        string refiner;             // For gold: LBMA accredited refiner
        bool lbmaAccredited;
        bytes32 certificationHash;  // IPFS hash of assay certificate
        
        StorageLocation storage;
        
        uint256 spotPrice;          // Last known spot price
        uint256 spotPriceTimestamp;
        
        bool physicalDeliveryAvailable;
        string deliveryLocation;
    }
    
    enum CommodityType {
        GOLD,
        SILVER,
        PLATINUM,
        PALLADIUM,
        CRUDE_OIL,
        NATURAL_GAS,
        COPPER,
        ALUMINUM,
        WHEAT,
        CORN,
        SOYBEANS,
        COFFEE,
        SUGAR
    }
    
    struct StorageLocation {
        string facilityName;
        string facilityAddress;
        bytes32 warehouseReceipt;   // IPFS hash
        bool insured;
        address insuranceProvider;
        uint256 insuranceValue;
    }
    
    mapping(bytes32 => CommodityDetails) public commodities;
    
    function registerCommodity(
        bytes32 assetId,
        CommodityDetails calldata details
    ) external {
        commodities[assetId] = details;
    }
    
    function updateSpotPrice(
        bytes32 assetId,
        uint256 newPrice
    ) external {
        CommodityDetails storage comm = commodities[assetId];
        comm.spotPrice = newPrice;
        comm.spotPriceTimestamp = block.timestamp;
    }
    
    function calculateValue(bytes32 assetId) external view returns (uint256) {
        CommodityDetails memory comm = commodities[assetId];
        return comm.quantity * comm.spotPrice;
    }
    
    function verifyLBMA(bytes32 assetId) external view returns (bool) {
        CommodityDetails memory comm = commodities[assetId];
        return comm.lbmaAccredited && comm.fineness >= 995;
    }
}
`

};

export default RWA_CONTRACTS;