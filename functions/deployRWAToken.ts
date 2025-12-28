import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.9.0';

/**
 * Deploy RWA Security Token
 * Integrates with Fireblocks for custody
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const {
            assetType,
            assetClass,
            name,
            symbol,
            totalValue,
            jurisdiction,
            issuerLEI,
            network = 'polygon' // Default to Polygon for lower fees
        } = payload;

        // Network configuration
        const networks = {
            ethereum: {
                rpc: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
                chainId: 1,
                factoryAddress: '0x...' // Deploy factory first
            },
            polygon: {
                rpc: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
                chainId: 137,
                factoryAddress: '0x...'
            },
            base: {
                rpc: 'https://base-mainnet.g.alchemy.com/v2/YOUR_KEY',
                chainId: 8453,
                factoryAddress: '0x...'
            }
        };

        const config = networks[network];
        if (!config) {
            return Response.json({ error: 'Unsupported network' }, { status: 400 });
        }

        // Connect to blockchain
        const provider = new ethers.JsonRpcProvider(config.rpc);
        
        // Use Fireblocks for signing (MPC custody)
        // In production, integrate Fireblocks SDK
        const wallet = new ethers.Wallet(
            Deno.env.get('DEPLOYER_PRIVATE_KEY'), // Temporary - use Fireblocks
            provider
        );

        // Create asset metadata
        const assetMetadata = {
            assetType: getAssetTypeEnum(assetType),
            assetClass,
            assetId: ethers.id(`${assetClass}-${Date.now()}`),
            extensionModule: ethers.ZeroAddress, // Set after extension deployment
            totalValue: ethers.parseUnits(totalValue.toString(), 18),
            jurisdiction,
            issuerLEI: ethers.encodeBytes32String(issuerLEI),
            issuanceDate: Math.floor(Date.now() / 1000),
            state: 0 // PENDING_TOKENIZATION
        };

        // Deploy via factory (saves gas)
        const factoryAbi = [
            'function deployToken(string name, string symbol, tuple(uint8,string,bytes32,address,uint256,string,bytes32,uint256,uint8) assetData) returns (address)'
        ];
        
        const factory = new ethers.Contract(config.factoryAddress, factoryAbi, wallet);
        
        const tx = await factory.deployToken(
            name,
            symbol,
            assetMetadata
        );
        
        const receipt = await tx.wait();
        
        // Get deployed token address from event
        const tokenAddress = receipt.logs[0].address;

        // Store in Base44 database
        const rwaAsset = await base44.asServiceRole.entities.RWAAsset.create({
            asset_id: assetMetadata.assetId,
            asset_type: assetType,
            asset_class: assetClass,
            name,
            symbol,
            total_value: totalValue,
            jurisdiction,
            issuer_lei: issuerLEI,
            issuer_email: user.email,
            contract_address: tokenAddress,
            network,
            chain_id: config.chainId,
            deployment_tx_hash: tx.hash,
            status: 'deployed',
            state: 'pending_tokenization'
        });

        return Response.json({
            success: true,
            tokenAddress,
            txHash: tx.hash,
            explorerUrl: `${getExplorerUrl(network)}/tx/${tx.hash}`,
            assetId: rwaAsset.id
        });

    } catch (error) {
        console.error('Deployment error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
});

function getAssetTypeEnum(type) {
    const types = {
        'real_estate': 0,
        'treasury_bill': 1,
        'private_credit': 2,
        'commodity': 3,
        'equity': 4,
        'corporate_bond': 5,
        'municipal_bond': 6,
        'abs': 7,
        'fund_share': 8,
        'carbon_credit': 9
    };
    return types[type] || 0;
}

function getExplorerUrl(network) {
    const explorers = {
        ethereum: 'https://etherscan.io',
        polygon: 'https://polygonscan.com',
        base: 'https://basescan.org'
    };
    return explorers[network] || '';
}