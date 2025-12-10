// Crypto Asset Registry Integration
// Based on CoinMarketCap UCID and CoinGecko API standards

// Top Cryptocurrencies Registry (Static reference data)
export const CRYPTO_ASSETS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', cmc_id: 1, coingecko_id: 'bitcoin', type: 'cryptocurrency' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', cmc_id: 1027, coingecko_id: 'ethereum', type: 'cryptocurrency' },
    { id: 'tether', symbol: 'USDT', name: 'Tether', cmc_id: 825, coingecko_id: 'tether', type: 'stablecoin' },
    { id: 'bnb', symbol: 'BNB', name: 'BNB', cmc_id: 1839, coingecko_id: 'binancecoin', type: 'cryptocurrency' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', cmc_id: 5426, coingecko_id: 'solana', type: 'cryptocurrency' },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', cmc_id: 3408, coingecko_id: 'usd-coin', type: 'stablecoin' },
    { id: 'xrp', symbol: 'XRP', name: 'XRP', cmc_id: 52, coingecko_id: 'ripple', type: 'cryptocurrency' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', cmc_id: 2010, coingecko_id: 'cardano', type: 'cryptocurrency' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', cmc_id: 74, coingecko_id: 'dogecoin', type: 'cryptocurrency' },
    { id: 'tron', symbol: 'TRX', name: 'TRON', cmc_id: 1958, coingecko_id: 'tron', type: 'cryptocurrency' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', cmc_id: 6636, coingecko_id: 'polkadot', type: 'cryptocurrency' },
    { id: 'polygon', symbol: 'MATIC', name: 'Polygon', cmc_id: 3890, coingecko_id: 'matic-network', type: 'cryptocurrency' },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', cmc_id: 2, coingecko_id: 'litecoin', type: 'cryptocurrency' },
    { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', cmc_id: 5805, coingecko_id: 'avalanche-2', type: 'cryptocurrency' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', cmc_id: 1975, coingecko_id: 'chainlink', type: 'cryptocurrency' },
    { id: 'stellar', symbol: 'XLM', name: 'Stellar', cmc_id: 512, coingecko_id: 'stellar', type: 'cryptocurrency' },
    { id: 'monero', symbol: 'XMR', name: 'Monero', cmc_id: 328, coingecko_id: 'monero', type: 'cryptocurrency' },
    { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic', cmc_id: 1321, coingecko_id: 'ethereum-classic', type: 'cryptocurrency' },
    { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', cmc_id: 3794, coingecko_id: 'cosmos', type: 'cryptocurrency' },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', cmc_id: 7083, coingecko_id: 'uniswap', type: 'defi' }
];

// Stablecoins Registry
export const STABLECOINS = [
    { symbol: 'USDT', name: 'Tether', peg: 'USD', issuer: 'Tether Limited', type: 'centralized' },
    { symbol: 'USDC', name: 'USD Coin', peg: 'USD', issuer: 'Circle', type: 'centralized' },
    { symbol: 'BUSD', name: 'Binance USD', peg: 'USD', issuer: 'Paxos', type: 'centralized' },
    { symbol: 'DAI', name: 'Dai', peg: 'USD', issuer: 'MakerDAO', type: 'decentralized' },
    { symbol: 'TUSD', name: 'TrueUSD', peg: 'USD', issuer: 'TrustToken', type: 'centralized' },
    { symbol: 'USDP', name: 'Pax Dollar', peg: 'USD', issuer: 'Paxos', type: 'centralized' }
];

// Get crypto asset by symbol
export const getCryptoBySymbol = (symbol) => {
    return CRYPTO_ASSETS.find(asset => asset.symbol.toLowerCase() === symbol.toLowerCase());
};

// Get crypto asset by CoinMarketCap ID
export const getCryptoByCMCId = (cmcId) => {
    return CRYPTO_ASSETS.find(asset => asset.cmc_id === cmcId);
};

// Get crypto asset by CoinGecko ID
export const getCryptoByCoingeckoId = (coingeckoId) => {
    return CRYPTO_ASSETS.find(asset => asset.coingecko_id === coingeckoId);
};

// Validate cryptocurrency symbol
export const isValidCryptoSymbol = (symbol) => {
    return CRYPTO_ASSETS.some(asset => asset.symbol.toLowerCase() === symbol.toLowerCase());
};

// Get all cryptocurrency symbols
export const getAllCryptoSymbols = () => {
    return CRYPTO_ASSETS.map(asset => asset.symbol);
};

// Get stablecoin by symbol
export const getStablecoin = (symbol) => {
    return STABLECOINS.find(stable => stable.symbol.toLowerCase() === symbol.toLowerCase());
};

// Check if symbol is a stablecoin
export const isStablecoin = (symbol) => {
    return STABLECOINS.some(stable => stable.symbol.toLowerCase() === symbol.toLowerCase());
};

// Crypto asset categories
export const CRYPTO_CATEGORIES = {
    CRYPTOCURRENCY: 'Cryptocurrency',
    STABLECOIN: 'Stablecoin',
    DEFI: 'DeFi Token',
    NFT: 'NFT Platform',
    EXCHANGE: 'Exchange Token',
    SMART_CONTRACT: 'Smart Contract Platform'
};

// Get crypto info with all IDs
export const getCryptoInfo = (symbolOrId) => {
    const asset = getCryptoBySymbol(symbolOrId) || 
                  getCryptoByCMCId(parseInt(symbolOrId)) ||
                  getCryptoByCoingeckoId(symbolOrId);
    
    if (!asset) return null;
    
    return {
        ...asset,
        isStablecoin: isStablecoin(asset.symbol),
        category: isStablecoin(asset.symbol) ? CRYPTO_CATEGORIES.STABLECOIN : CRYPTO_CATEGORIES.CRYPTOCURRENCY,
        ucid: `UCID-${asset.cmc_id}`, // CoinMarketCap UCID format
        apis: {
            coinmarketcap: `https://coinmarketcap.com/currencies/${asset.id}/`,
            coingecko: `https://www.coingecko.com/en/coins/${asset.coingecko_id}`
        }
    };
};

// Format crypto amount with proper decimals
export const formatCryptoAmount = (amount, symbol) => {
    const asset = getCryptoBySymbol(symbol);
    if (!asset) return amount.toString();
    
    // Bitcoin and similar: 8 decimals
    if (['BTC', 'LTC'].includes(symbol)) {
        return amount.toFixed(8);
    }
    // Ethereum and ERC-20: 18 decimals typically, but display 6
    if (['ETH', 'LINK', 'UNI'].includes(symbol)) {
        return amount.toFixed(6);
    }
    // Default: 4 decimals
    return amount.toFixed(4);
};

// Get blockchain for crypto asset
export const getCryptoBlockchain = (symbol) => {
    const blockchainMap = {
        BTC: 'Bitcoin',
        ETH: 'Ethereum',
        BNB: 'Binance Smart Chain',
        SOL: 'Solana',
        ADA: 'Cardano',
        DOT: 'Polkadot',
        MATIC: 'Polygon',
        AVAX: 'Avalanche',
        TRX: 'TRON',
        XRP: 'XRP Ledger'
    };
    
    return blockchainMap[symbol] || 'Multi-chain';
};