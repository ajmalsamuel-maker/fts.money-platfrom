// ISO 23257:2022 - Blockchain and Distributed Ledger Technologies
// Reference Material for Digital Assets and Smart Contracts

// DLT Network Types
export const DLT_NETWORK_TYPES = {
    PUBLIC: 'Public/Permissionless',
    PRIVATE: 'Private/Permissioned',
    CONSORTIUM: 'Consortium',
    HYBRID: 'Hybrid'
};

// Consensus Mechanisms (ISO 23257 Reference)
export const CONSENSUS_MECHANISMS = {
    POW: { code: 'POW', name: 'Proof of Work', description: 'Computational puzzle solving' },
    POS: { code: 'POS', name: 'Proof of Stake', description: 'Stake-based validation' },
    DPOS: { code: 'DPOS', name: 'Delegated Proof of Stake', description: 'Elected validators' },
    PBFT: { code: 'PBFT', name: 'Practical Byzantine Fault Tolerance', description: 'Byzantine agreement' },
    RAFT: { code: 'RAFT', name: 'Raft Consensus', description: 'Leader-based consensus' },
    POA: { code: 'POA', name: 'Proof of Authority', description: 'Authority-based validation' }
};

// Digital Asset Types (ISO 23257 Classification)
export const DIGITAL_ASSET_TYPES = {
    CRYPTOCURRENCY: { type: 'cryptocurrency', description: 'Native blockchain currency' },
    TOKEN: { type: 'token', description: 'Token on existing blockchain' },
    UTILITY_TOKEN: { type: 'utility_token', description: 'Access to services' },
    SECURITY_TOKEN: { type: 'security_token', description: 'Regulated security' },
    NFT: { type: 'nft', description: 'Non-fungible token' },
    STABLECOIN: { type: 'stablecoin', description: 'Price-stable cryptocurrency' },
    CBDC: { type: 'cbdc', description: 'Central Bank Digital Currency' }
};

// Smart Contract Standards
export const SMART_CONTRACT_STANDARDS = {
    ERC20: { standard: 'ERC-20', blockchain: 'Ethereum', type: 'Fungible Token' },
    ERC721: { standard: 'ERC-721', blockchain: 'Ethereum', type: 'Non-Fungible Token' },
    ERC1155: { standard: 'ERC-1155', blockchain: 'Ethereum', type: 'Multi-Token' },
    BEP20: { standard: 'BEP-20', blockchain: 'Binance Smart Chain', type: 'Fungible Token' },
    TRC20: { standard: 'TRC-20', blockchain: 'TRON', type: 'Fungible Token' }
};

// Transaction Validation Rules
export const validateBlockchainTransaction = (transaction) => {
    const validations = {
        hasValidAddress: /^(0x)?[0-9a-fA-F]{40}$/.test(transaction.address),
        hasAmount: transaction.amount && transaction.amount > 0,
        hasChainId: transaction.chain_id !== undefined,
        hasValidHash: transaction.tx_hash && transaction.tx_hash.length === 66
    };

    return {
        valid: Object.values(validations).every(v => v),
        validations
    };
};

// Generate Transaction Reference (ISO 23257 compliant)
export const generateDLTReference = (chainId, txHash) => {
    const timestamp = Date.now();
    return `DLT-${chainId}-${timestamp}-${txHash.substring(0, 8)}`;
};

// Blockchain Network Registry
export const BLOCKCHAIN_NETWORKS = [
    { 
        id: 'ethereum', 
        name: 'Ethereum', 
        chainId: 1, 
        type: 'public',
        consensus: 'POS',
        nativeCurrency: 'ETH'
    },
    { 
        id: 'bitcoin', 
        name: 'Bitcoin', 
        chainId: null, 
        type: 'public',
        consensus: 'POW',
        nativeCurrency: 'BTC'
    },
    { 
        id: 'binance', 
        name: 'Binance Smart Chain', 
        chainId: 56, 
        type: 'public',
        consensus: 'POA',
        nativeCurrency: 'BNB'
    },
    { 
        id: 'polygon', 
        name: 'Polygon', 
        chainId: 137, 
        type: 'public',
        consensus: 'POS',
        nativeCurrency: 'MATIC'
    },
    { 
        id: 'avalanche', 
        name: 'Avalanche', 
        chainId: 43114, 
        type: 'public',
        consensus: 'POA',
        nativeCurrency: 'AVAX'
    },
    { 
        id: 'solana', 
        name: 'Solana', 
        chainId: null, 
        type: 'public',
        consensus: 'POS',
        nativeCurrency: 'SOL'
    }
];

// Get blockchain by chain ID
export const getBlockchainByChainId = (chainId) => {
    return BLOCKCHAIN_NETWORKS.find(n => n.chainId === chainId);
};

// Validate blockchain address format
export const validateAddressFormat = (address, blockchain) => {
    const patterns = {
        ethereum: /^(0x)?[0-9a-fA-F]{40}$/,
        bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
        binance: /^(0x)?[0-9a-fA-F]{40}$/,
        polygon: /^(0x)?[0-9a-fA-F]{40}$/,
        solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    };

    const pattern = patterns[blockchain];
    return pattern ? pattern.test(address) : false;
};

// DLT Transaction Status Codes
export const DLT_STATUS_CODES = {
    PENDING: { code: '000', description: 'Transaction pending' },
    CONFIRMED: { code: '001', description: 'Transaction confirmed' },
    FAILED: { code: '002', description: 'Transaction failed' },
    REJECTED: { code: '003', description: 'Transaction rejected' },
    CANCELLED: { code: '004', description: 'Transaction cancelled' }
};