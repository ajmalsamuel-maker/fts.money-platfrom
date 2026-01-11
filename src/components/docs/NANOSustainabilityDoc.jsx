const NANOSustainabilityDoc = `# NANO Sustainability Platform
## Gamified Environmental Action & Carbon Offset System

**Version:** 2.0  
**Last Updated:** January 11, 2026  
**Classification:** Public Documentation  
**Document Owner:** FTS.Money Sustainability Team

---

## Executive Summary

The **NANO Sustainability Platform** is a gamified rewards system that incentivizes consumers to take environmental actions. Users complete sustainability tasks (e.g., plant trees, use public transport, reduce plastic) and earn NANO tokens, which can be staked for APY, used for DAO governance, or converted to CRBN (carbon offset) tokens.

**Platform Components**:
- 🌱 **NANO Task Marketplace** - Browse and complete sustainability tasks
- 🏆 **Achievement NFTs** - Unlock NFT badges for milestones
- 💰 **NANO Staking** - Earn 5-15% APY on staked tokens
- 🗳️ **Project DAO** - Vote on environmental project funding
- 🌍 **Carbon Offset System** - Convert NANO to CRBN tokens (1 CRBN = 1kg CO2 offset)
- 📊 **Community Leaderboard** - Compete for top sustainability rankings
- 💬 **Community Forum** - Share tips and celebrate achievements

---

## NANO Token Economy

### Token Architecture

\`\`\`mermaid
graph TB
    subgraph "NANO Token Flow"
        EARN[Earn NANO Tokens]
        BALANCE[User NANO Balance<br/>Stored in NanoToken entity]
        UTILITY[Token Utility]
    end
    
    subgraph "Earning Methods"
        TASKS[Complete Tasks<br/>5-500 NANO per task]
        MERCHANT[Merchant Campaigns<br/>Sponsored tasks]
        STREAK[Daily Streaks<br/>Bonus multipliers]
        REFERRAL[Refer Friends<br/>50 NANO per signup]
    end
    
    subgraph "Token Usage"
        STAKE[Stake for APY<br/>5-15% annual returns]
        DAO_VOTE[DAO Governance<br/>1 NANO = 1 vote]
        DISCOUNT[Merchant Discounts<br/>Partner exclusive offers]
        CONVERT[Convert to CRBN<br/>Carbon offset tokens]
        TRADE[Trade on DEX<br/>Polygon network]
    end
    
    TASKS --> EARN
    MERCHANT --> EARN
    STREAK --> EARN
    REFERRAL --> EARN
    
    EARN --> BALANCE
    
    BALANCE --> STAKE
    BALANCE --> DAO_VOTE
    BALANCE --> DISCOUNT
    BALANCE --> CONVERT
    BALANCE --> TRADE
    
    style BALANCE fill:#f59e0b,color:#fff,stroke:#000,stroke-width:3px
    style EARN fill:#10b981,color:#fff
    style STAKE fill:#8b5cf6,color:#fff
    style DAO_VOTE fill:#3b82f6,color:#fff
    style CONVERT fill:#06b6d4,color:#fff
\`\`\`

**Token Specifications**:
- **Blockchain**: Polygon (ERC-20)
- **Contract Address**: 0x... (NANO token contract)
- **Total Supply**: Dynamic (minted on task completion)
- **Decimals**: 2 (100 = 1 NANO)
- **Transferable**: Yes (tradeable on DEX)

---

## NANO Task System

### Task Types

\`\`\`mermaid
graph TB
    subgraph "NANO Task Categories"
        direction TB
        
        TREE[🌳 Plant Tree<br/>50 NANO reward<br/>Verify: GPS + Photo]
        TRANSPORT[🚌 Public Transport<br/>20 NANO per trip<br/>Verify: GPS tracking]
        PLASTIC[♻️ Reduce Plastic<br/>30 NANO reward<br/>Verify: Receipt scan]
        RECYCLE[📦 Recycle<br/>15 NANO reward<br/>Verify: Photo upload]
        ENERGY[💡 Energy Saving<br/>25 NANO reward<br/>Verify: Utility bill]
        CUSTOM[⚡ Custom Tasks<br/>Variable reward<br/>Merchant-sponsored]
    end
    
    subgraph "Verification Methods"
        RECEIPT[Receipt Scan<br/>AI text extraction<br/>2-min validation]
        PHOTO[Photo Upload<br/>Before/after comparison<br/>Manual review]
        GPS[GPS Tracking<br/>Location verification<br/>Instant validation]
        QR[QR Code Scan<br/>Partner validation<br/>Instant validation]
        MANUAL[Manual Review<br/>Community moderators<br/>24-hour validation]
    end
    
    TREE -.Uses.-> PHOTO
    TREE -.Uses.-> GPS
    TRANSPORT -.Uses.-> GPS
    PLASTIC -.Uses.-> RECEIPT
    RECYCLE -.Uses.-> PHOTO
    ENERGY -.Uses.-> RECEIPT
    CUSTOM -.Uses.-> QR
    CUSTOM -.Uses.-> MANUAL
    
    style TREE fill:#10b981,color:#fff
    style TRANSPORT fill:#3b82f6,color:#fff
    style PLASTIC fill:#8b5cf6,color:#fff
    style ENERGY fill:#f59e0b,color:#fff
\`\`\`

### Task Completion Flow

**User Journey**:

\`\`\`mermaid
sequenceDiagram
    participant User as Consumer
    participant Market as Task Marketplace
    participant Task as NanoTask Entity
    participant Upload as File Upload
    participant Verify as Verification Service
    participant Tokens as NanoToken Entity
    participant Completion as TaskCompletion Entity
    
    User->>Market: Browse Available Tasks
    Market->>Task: Fetch Active Tasks
    Task-->>Market: Display Task List
    Market-->>User: Show Tasks with Rewards
    
    User->>Market: Select Task
    Market-->>User: Show Task Details & Requirements
    
    User->>User: Perform Real-World Action
    User->>Upload: Upload Verification (photo/receipt/GPS)
    Upload-->>User: Upload Successful
    
    User->>Market: Submit Task Completion
    Market->>Completion: Create Completion Record
    Completion->>Verify: Queue for Verification
    
    alt AI Auto-Verification (Receipt/GPS)
        Verify->>Verify: AI Analysis
        Verify->>Verify: Validate Data
        Verify-->>Completion: Status: Verified
    else Manual Review (Photos)
        Verify->>Verify: Queue for Moderator
        Note over Verify: Manual review within 24h
        Verify-->>Completion: Status: Verified
    end
    
    Completion->>Tokens: Issue NANO Reward
    Tokens->>Tokens: Update User Balance
    Tokens-->>User: +50 NANO Earned!
    
    Completion->>User: Update Streak
    Completion->>User: Check Achievement Progress
    
    alt Achievement Unlocked
        Completion->>User: Mint Achievement NFT
        User-->>User: NFT Badge Displayed
    end
\`\`\`

**Verification SLA**:
- **AI Automated**: <2 minutes (receipt scan, GPS)
- **Manual Review**: <24 hours (photo upload)
- **Partner QR**: Instant (merchant validation)

---

### Merchant-Sponsored Tasks

**How It Works**:

Merchants can sponsor custom NANO tasks to drive foot traffic, increase brand awareness, and demonstrate sustainability commitment.

\`\`\`mermaid
graph LR
    subgraph "Merchant Campaign Setup"
        MERCHANT[Green Merchant] --> CREATE[Create Sponsored Task]
        CREATE --> CONFIG[Configure Task]
        CONFIG --> BUDGET[Set Budget]
        BUDGET --> LAUNCH[Launch Campaign]
    end
    
    subgraph "Task Configuration"
        TITLE[Task Title<br/>"Visit Eco Store"]
        DESC[Description<br/>"Shop sustainable products"]
        REWARD[NANO Reward<br/>100 NANO per visit]
        DISCOUNT[Merchant Discount<br/>10% off purchase]
        MAX[Max Completions<br/>500 tasks]
        VERIFY[Verification<br/>QR code at checkout]
    end
    
    subgraph "User Experience"
        USER[Consumer] --> DISCOVER[Discover Task]
        DISCOVER --> COMPLETE[Complete Action]
        COMPLETE --> SCAN[Scan QR Code]
        SCAN --> EARN[Earn 100 NANO]
        EARN --> SHOP[Get 10% Discount]
    end
    
    LAUNCH --> DISCOVER
    
    TITLE --> CONFIG
    DESC --> CONFIG
    REWARD --> CONFIG
    DISCOUNT --> CONFIG
    MAX --> CONFIG
    VERIFY --> CONFIG
    
    style MERCHANT fill:#10b981,color:#fff
    style EARN fill:#f59e0b,color:#fff
    style SHOP fill:#8b5cf6,color:#fff
\`\`\`

**Merchant Benefits**:
- Drive foot traffic to physical locations
- Increase brand awareness among eco-conscious consumers
- Demonstrate sustainability commitment
- Boost FIX score (NANO sponsorship = +30-80 ESG points)
- Collect customer data (opt-in during task)
- Track campaign ROI (completions, conversions)

**Sponsored Task Examples**:
- "Visit our zero-waste store" - 100 NANO + 10% discount
- "Try our plant-based menu" - 75 NANO + free dessert
- "Bike to our location" - 50 NANO + free coffee
- "Bring reusable bag" - 25 NANO + loyalty points

---

## NANO Staking System

### Staking Tiers

**URL**: https://platform.fts.money/NANOStaking

\`\`\`mermaid
graph TB
    subgraph "Staking Tiers"
        FLEX[Flexible Staking<br/>5% APY<br/>No lock period<br/>Withdraw anytime]
        THREE[3-Month Lock<br/>8% APY<br/>90-day lock<br/>+Early bird bonus]
        SIX[6-Month Lock<br/>12% APY<br/>180-day lock<br/>+Governance boost]
        TWELVE[12-Month Lock<br/>15% APY<br/>365-day lock<br/>+NFT badge + Priority access]
    end
    
    subgraph "Staking Benefits"
        APY[Earn Interest<br/>Paid daily in NANO]
        GOV[Enhanced Voting Power<br/>Locked NANO = 1.5x votes]
        EARLY[Early Access<br/>New features first]
        NFT[Exclusive NFT<br/>12-month staker badge]
        PRIORITY[Priority Support<br/>Faster response times]
    end
    
    FLEX --> APY
    THREE --> APY
    THREE --> GOV
    SIX --> APY
    SIX --> GOV
    SIX --> EARLY
    TWELVE --> APY
    TWELVE --> GOV
    TWELVE --> EARLY
    TWELVE --> NFT
    TWELVE --> PRIORITY
    
    style TWELVE fill:#8b5cf6,color:#fff,stroke:#000,stroke-width:3px
    style APY fill:#10b981,color:#fff
    style GOV fill:#3b82f6,color:#fff
    style NFT fill:#f59e0b,color:#fff
\`\`\`

**Staking Mechanics**:
- Minimum stake: 100 NANO
- Maximum stake: Unlimited
- Compound option: Auto-reinvest rewards
- Early withdrawal penalty: Forfeit 50% of earned interest
- Rewards distribution: Daily accrual, claimed anytime

**Example Returns**:
\`\`\`
Stake Amount: 10,000 NANO
Tier: 12-Month Lock
APY: 15%

Daily Earnings: 10,000 × 15% ÷ 365 = 4.11 NANO/day
Monthly Earnings: ~123 NANO/month
Annual Earnings: 1,500 NANO/year

With Auto-Compound:
Year 1: 11,500 NANO
Year 2: 13,225 NANO (+15% on 11,500)
Year 3: 15,209 NANO (+15% on 13,225)
\`\`\`

---

## Project DAO Governance

### DAO Voting System

**URL**: https://platform.fts.money/ProjectDAO

**Purpose**: Community governs funding allocation for environmental projects through decentralized voting.

\`\`\`mermaid
sequenceDiagram
    participant Community as NANO Holders
    participant DAO as Project DAO
    participant Proposal as Project Proposal
    participant Vote as Voting Contract
    participant Treasury as DAO Treasury
    participant Project as Environmental Project
    
    Project->>DAO: Submit Funding Proposal
    DAO->>Proposal: Create Proposal Record
    Proposal->>Proposal: Set Voting Period (7 days)
    
    DAO-->>Community: New Proposal Available
    
    Community->>Vote: Cast Votes (1 NANO = 1 vote)
    Community->>Vote: Staked NANO = 1.5x voting power
    
    Note over Vote: Voting period: 7 days
    
    Vote->>Vote: Calculate Results
    
    alt Proposal Approved (>50% yes votes)
        Vote->>Treasury: Release Funds
        Treasury->>Project: Transfer to Project Wallet
        Project->>Project: Execute Environmental Action
        Project-->>DAO: Submit Impact Report
        DAO-->>Community: Share Results
    else Proposal Rejected
        Vote->>DAO: Mark as Rejected
        DAO-->>Community: Proposal Failed
    end
\`\`\`

**Active Proposals** (Examples):

| Project | Funding Request | Current Votes | Status | Impact |
|---------|----------------|---------------|--------|--------|
| Ocean Cleanup Initiative | $50,000 USDC | 1.2M NANO (82% yes) | ✅ Approved | Remove 100 tons plastic |
| Rainforest Conservation | $75,000 USDC | 890K NANO (68% yes) | 🗳️ Active | Protect 500 hectares |
| Solar Panel Installation | $40,000 USDC | 450K NANO (72% yes) | 🗳️ Active | 200 households powered |
| Mangrove Restoration | $60,000 USDC | 2.1M NANO (91% yes) | ✅ Funded | Plant 50,000 mangroves |

**DAO Treasury**:
- Funding source: 2% of all NANO rewards
- Current balance: ~$500K USDC equivalent
- Average project funding: $40K-$80K
- Projects funded per quarter: 8-12

---

## Achievement NFT System

### Gamification & Badges

**URL**: https://platform.fts.money/NFTAchievements

\`\`\`mermaid
graph TB
    subgraph "Achievement Categories"
        direction TB
        
        TREE[🌳 Tree Planter<br/>Bronze: 10 trees<br/>Silver: 50 trees<br/>Gold: 100 trees<br/>Platinum: 500 trees]
        
        PLASTIC[♻️ Plastic Reducer<br/>Bronze: 30 days<br/>Silver: 90 days<br/>Gold: 180 days<br/>Platinum: 365 days]
        
        TRANSPORT[🚌 Transport Hero<br/>Bronze: 50 trips<br/>Silver: 150 trips<br/>Gold: 300 trips<br/>Platinum: 1000 trips]
        
        ENERGY[💡 Energy Saver<br/>Bronze: 100 kWh saved<br/>Silver: 300 kWh<br/>Gold: 500 kWh<br/>Platinum: 1000 kWh]
        
        STREAK[🔥 Streak Master<br/>Bronze: 30 days<br/>Silver: 90 days<br/>Gold: 365 days<br/>Platinum: 730 days]
        
        COMMUNITY[👥 Community Leader<br/>Bronze: 10 posts<br/>Silver: 30 posts<br/>Gold: 100 posts<br/>Platinum: 300 posts]
        
        ECO[🌍 Eco Warrior<br/>Bronze: 1,000 NANO<br/>Silver: 5,000 NANO<br/>Gold: 10,000 NANO<br/>Platinum: 50,000 NANO]
        
        CARBON[☁️ Carbon Crusher<br/>Bronze: 100kg offset<br/>Silver: 500kg<br/>Gold: 1,000kg<br/>Platinum: 10,000kg]
    end
    
    subgraph "NFT Minting"
        ACHIEVE[Achievement Unlocked] --> MINT[Mint NFT on Polygon]
        MINT --> WALLET[Add to User Wallet]
        WALLET --> DISPLAY[Display in Profile]
        DISPLAY --> TRADE[Tradeable on OpenSea]
    end
    
    subgraph "NFT Utility"
        BONUS[Bonus NANO Rewards<br/>10-200 NANO per tier]
        BOOST[DAO Voting Boost<br/>+10% voting power]
        EXCLUSIVE[Exclusive Tasks<br/>NFT holders only]
        SOCIAL[Social Proof<br/>Display on profile]
    end
    
    TREE --> ACHIEVE
    PLASTIC --> ACHIEVE
    TRANSPORT --> ACHIEVE
    ENERGY --> ACHIEVE
    STREAK --> ACHIEVE
    COMMUNITY --> ACHIEVE
    ECO --> ACHIEVE
    CARBON --> ACHIEVE
    
    MINT --> BONUS
    MINT --> BOOST
    MINT --> EXCLUSIVE
    MINT --> SOCIAL
    
    style ACHIEVE fill:#f59e0b,color:#fff
    style MINT fill:#8b5cf6,color:#fff
    style TRADE fill:#10b981,color:#fff
\`\`\`

**NFT Tier Visual Design**:
- **Bronze**: Brown gradient, basic animation
- **Silver**: Silver gradient, particle effects
- **Gold**: Gold gradient, shimmer animation
- **Platinum**: Holographic gradient, 3D rotation, glow effect

**Achievement Bonus Rewards**:

| Achievement | Bronze Bonus | Silver Bonus | Gold Bonus | Platinum Bonus |
|-------------|--------------|--------------|------------|----------------|
| Tree Planter | +10 NANO | +25 NANO | +50 NANO | +150 NANO |
| Plastic Reducer | +15 NANO | +35 NANO | +75 NANO | +200 NANO |
| Transport Hero | +20 NANO | +40 NANO | +100 NANO | +250 NANO |
| Energy Saver | +25 NANO | +50 NANO | +125 NANO | +300 NANO |
| Streak Master | +30 NANO | +75 NANO | +200 NANO | +500 NANO |

---

## Streak Tracking System

### Daily Engagement Rewards

**URL**: https://platform.fts.money/UserNanoHub

\`\`\`mermaid
graph TB
    subgraph "Streak Tracking"
        LOGIN[User Completes Task] --> CHECK{Last Activity<br/>Within 24h?}
        
        CHECK -->|Yes| CONTINUE[Continue Streak<br/>Current + 1 day]
        CHECK -->|No| BREAK[Streak Broken<br/>Reset to 1 day]
        
        CONTINUE --> UPDATE[Update Streak Record]
        BREAK --> UPDATE
        
        UPDATE --> MILESTONE{Milestone<br/>Reached?}
        
        MILESTONE -->|7 days| REWARD1[+20 NANO Bonus]
        MILESTONE -->|30 days| REWARD2[+100 NANO + Bronze NFT]
        MILESTONE -->|90 days| REWARD3[+300 NANO + Silver NFT]
        MILESTONE -->|365 days| REWARD4[+1000 NANO + Gold NFT]
        MILESTONE -->|730 days| REWARD5[+2500 NANO + Platinum NFT]
        
        REWARD1 --> NOTIFY[Notify User]
        REWARD2 --> NOTIFY
        REWARD3 --> NOTIFY
        REWARD4 --> NOTIFY
        REWARD5 --> NOTIFY
    end
    
    subgraph "Streak Protection"
        FREEZE[Streak Freeze<br/>200 NANO cost]
        FREEZE --> PROTECT[Protect streak for 24h<br/>Can miss one day]
    end
    
    style CONTINUE fill:#10b981,color:#fff
    style BREAK fill:#ef4444,color:#fff
    style REWARD4 fill:#f59e0b,color:#fff
\`\`\`

**Streak Bonuses**:
- **7-day streak**: +20 NANO bonus
- **14-day streak**: +50 NANO bonus
- **30-day streak**: +100 NANO bonus + Bronze badge
- **90-day streak**: +300 NANO bonus + Silver badge
- **180-day streak**: +600 NANO bonus
- **365-day streak**: +1,000 NANO bonus + Gold badge
- **730-day streak**: +2,500 NANO bonus + Platinum badge

**Streak Freeze Mechanic**:
- Cost: 200 NANO (one-time use)
- Effect: Protects streak for 24 hours
- Use case: Travel, illness, emergency
- Limit: 3 freezes per year

---

## Carbon Offset Integration

### CRBN Token System

**CRBN Token**: 1 CRBN = 1 kg CO2 offset

\`\`\`mermaid
graph TB
    subgraph "Carbon Offset Flow"
        ACTION[User Action<br/>Task/Purchase] --> CALC[Calculate CO2 Impact]
        
        CALC --> REWARD_CRBN[Reward CRBN Tokens<br/>Based on impact]
        CALC --> PURCHASE[Purchase Offsets<br/>User-initiated]
        
        REWARD_CRBN --> MINT[Mint CRBN Tokens]
        PURCHASE --> STRIPE[Stripe Climate API]
        
        STRIPE --> ORDER[Create Order<br/>Carbon removal projects]
        ORDER --> PROJECTS[Fund Verified Projects<br/>Direct air capture, forestry]
        PROJECTS --> CERT[Generate Certificate<br/>Downloadable PDF]
        
        MINT --> BALANCE[User CRBN Balance]
        CERT --> BALANCE
        
        BALANCE --> RETIRE[Retire CRBN<br/>Permanent offset]
        BALANCE --> TRADE[Trade on DEX<br/>Polygon network]
        BALANCE --> DONATE[Donate to Projects<br/>DAO proposals]
    end
    
    subgraph "Verified Projects"
        P1[Direct Air Capture<br/>Climeworks, Carbon Engineering]
        P2[Biochar Production<br/>Carbon sequestration]
        P3[Forest Conservation<br/>REDD+ projects]
        P4[Ocean Alkalinity<br/>Marine carbon capture]
    end
    
    PROJECTS --> P1
    PROJECTS --> P2
    PROJECTS --> P3
    PROJECTS --> P4
    
    style MINT fill:#06b6d4,color:#fff
    style STRIPE fill:#635bff,color:#fff
    style BALANCE fill:#10b981,color:#fff
\`\`\`

**CRBN Earning Methods**:
1. **Task Completion**: Tasks automatically calculate CO2 impact
   - Plant tree: +10 CRBN (10kg CO2 sequestered over tree lifetime)
   - Public transport: +2 CRBN (vs driving)
   - Recycle: +0.5 CRBN (avoided emissions)

2. **Purchase via Stripe Climate**:
   - $10 = ~100 kg CO2 offset = 100 CRBN
   - $100 = ~1,000 kg = 1,000 CRBN
   - Projects vetted by Frontier Climate

3. **Merchant Sponsorship**: Green merchants can reward CRBN for purchases

**CRBN Token Utility**:
- ✅ Proof of carbon offset (blockchain verified)
- ✅ Tradeable on decentralized exchanges
- ✅ Can be retired (permanently remove from circulation)
- ✅ Boosts FIX score when offset by merchants
- ✅ Transferable to other users
- ✅ Tax-deductible in some jurisdictions (consult accountant)

---

## Green Bonds Marketplace

### Investment Platform

**URL**: https://platform.fts.money/GreenBondsMarketplace

**Purpose**: Users invest NANO tokens into tokenized green bonds funding real environmental projects.

\`\`\`mermaid
graph TB
    subgraph "Green Bond Lifecycle"
        ISSUE[Project Issuer<br/>Creates Green Bond]
        TOKEN[Tokenize as RWA<br/>ERC-3643 security token]
        LIST[List on Marketplace<br/>For NANO investment]
        INVEST[Users Invest NANO<br/>Fractional ownership]
        FUND[Project Receives Funds<br/>Executes environmental action]
        RETURN[Project Generates Returns<br/>Carbon credits, revenue]
        DIVIDEND[Distribute Dividends<br/>To NANO investors]
    end
    
    subgraph "Project Types"
        SOLAR[☀️ Solar Farm Installation<br/>15% annual return<br/>Target: $500K]
        WIND[💨 Wind Energy Project<br/>12% annual return<br/>Target: $1M]
        FOREST[🌲 Reforestation Initiative<br/>8% return + carbon credits<br/>Target: $300K]
        CLEAN[💧 Clean Water Infrastructure<br/>10% return + impact<br/>Target: $400K]
    end
    
    ISSUE --> TOKEN
    TOKEN --> LIST
    LIST --> INVEST
    INVEST --> FUND
    FUND --> RETURN
    RETURN --> DIVIDEND
    
    SOLAR --> LIST
    WIND --> LIST
    FOREST --> LIST
    CLEAN --> LIST
    
    style TOKEN fill:#10b981,color:#fff
    style INVEST fill:#f59e0b,color:#fff
    style DIVIDEND fill:#8b5cf6,color:#fff
\`\`\`

**Investment Tiers**:
- Minimum investment: 100 NANO (~$10 equivalent)
- Maximum investment: Unlimited
- Lock period: 1-5 years (depends on project)
- Expected returns: 8-15% annually
- Dividend distribution: Quarterly
- Exit option: Secondary market trading

**Example Green Bond**:
\`\`\`
Project: Solar Farm in Morocco
Target Funding: $500,000
NANO Required: 500,000 NANO (1:1 ratio for simplicity)
Current Funding: $345,000 (69%)
Investors: 1,247 users
Minimum Investment: 100 NANO
Expected Return: 15% annually
Lock Period: 3 years
Impact: Power 2,000 homes, offset 5,000 tons CO2/year
\`\`\`

---

## Community Features

### Community Forum

**URL**: https://platform.fts.money/CommunityForum

**Post Types**:
- 💡 **Sustainability Tip**: Share eco-friendly advice
- ❓ **Question**: Ask the community for help
- 🏆 **Achievement**: Celebrate milestones
- 💬 **Discussion**: General sustainability topics

**Gamification**:
- Post creation: +5 NANO
- Post liked: +1 NANO per like (capped at 50)
- Helpful answer: +20 NANO (voted by community)
- Top contributor badge: Monthly recognition

**Moderation**:
- Community moderators (volunteer)
- AI content filtering (spam, abuse)
- Upvote/downvote system
- Report inappropriate content

### Community Leaderboard

**URL**: https://platform.fts.money/CommunityLeaderboard

**Leaderboard Categories**:

\`\`\`mermaid
graph TB
    subgraph "Leaderboards"
        direction LR
        
        TASKS[Most Tasks Completed<br/>Top 100 users<br/>Updated daily]
        CARBON[Most CO2 Offset<br/>Top 100 by CRBN<br/>Updated daily]
        EARNERS[Top NANO Earners<br/>Top 100 by balance<br/>Updated daily]
        STREAK[Longest Streaks<br/>Top 100 consecutive days<br/>Updated real-time]
        IMPACT[Most Impact<br/>Environmental score<br/>Updated weekly]
    end
    
    subgraph "Rewards"
        TOP1[🥇 #1 Position<br/>500 NANO/month<br/>+ Exclusive NFT]
        TOP3[🥈 #2-3 Positions<br/>250 NANO/month<br/>+ Special badge]
        TOP10[🥉 #4-10 Positions<br/>100 NANO/month<br/>+ Recognition]
        TOP100[🏅 #11-100 Positions<br/>25 NANO/month<br/>+ Badge]
    end
    
    TASKS --> TOP1
    CARBON --> TOP1
    EARNERS --> TOP1
    STREAK --> TOP1
    
    style TOP1 fill:#f59e0b,color:#fff,stroke:#000,stroke-width:3px
    style TASKS fill:#10b981,color:#fff
    style CARBON fill:#06b6d4,color:#fff
\`\`\`

**Monthly Champions**:
- Category winners announced first of each month
- Exclusive "Champion" NFT minted
- Featured in newsletter and social media
- Bonus NANO rewards
- Interview/feature on blog

---

## Integration with FIX Score System

### ESG Synergy

**How NANO Platform Boosts Merchant FIX Scores**:

\`\`\`mermaid
graph LR
    subgraph "Merchant Actions on NANO Platform"
        SPONSOR[Sponsor NANO Tasks<br/>Create campaigns]
        OFFSET[Purchase CRBN Offsets<br/>Company carbon neutral]
        INVEST[Invest in Green Bonds<br/>Environmental projects]
        CERTIFY[Upload Green Certifications<br/>B-Corp, Climate Neutral]
    end
    
    subgraph "FIX Score Impact"
        ESG[ESG Performance Component<br/>0-250 points possible]
        
        ESG_CALC[Calculate ESG Points<br/>Based on actions]
        
        BOOST[FIX Score Boost<br/>+50 to +150 points]
    end
    
    subgraph "Merchant Benefits"
        TIER[Higher FIX Tier<br/>Silver → Gold → Platinum]
        DISCOUNT[Fee Discounts<br/>0.2% to 0.5% reduction]
        FEATURED[Featured Placement<br/>Marketplace priority]
        BADGE[Green Badge<br/>Verified → Premium]
    end
    
    SPONSOR --> ESG_CALC
    OFFSET --> ESG_CALC
    INVEST --> ESG_CALC
    CERTIFY --> ESG_CALC
    
    ESG_CALC --> ESG
    ESG --> BOOST
    
    BOOST --> TIER
    TIER --> DISCOUNT
    TIER --> FEATURED
    TIER --> BADGE
    
    style BOOST fill:#10b981,color:#fff,stroke:#000,stroke-width:3px
    style DISCOUNT fill:#f59e0b,color:#fff
\`\`\`

**Merchant Sponsorship ROI**:

Example: E-commerce merchant sponsors NANO tasks with $2,000/month budget

\`\`\`
Direct Benefits:
  - 500 task completions/month (4 NANO per completion × 500)
  - 500 consumers visit website (10% conversion = 50 new customers)
  - Average order value: $75
  - New revenue: 50 × $75 = $3,750/month

FIX Score Benefits:
  - NANO sponsorship: +50 ESG points
  - FIX score increases from 620 → 670 (stays in Gold tier)
  - Closer to Platinum (750) - need 80 more points

Brand Benefits:
  - Green merchant badge displayed
  - Featured in eco-conscious consumer searches
  - Positive brand association with sustainability

Total ROI:
  - Cost: $2,000/month
  - New revenue: $3,750/month
  - Net gain: $1,750/month (87.5% ROI)
  - Plus brand & FIX score benefits
\`\`\`

---

## Technical Implementation

### Entity Schema

**NanoTask** (Task Marketplace):
\`\`\`json
{
  "task_title": "Plant a Tree",
  "task_description": "Plant and care for a tree in your community",
  "task_type": "plant_tree",
  "reward_amount": 50,
  "carbon_impact": 10,
  "verification_method": "photo_upload",
  "sponsor_merchant_id": "merchant_abc123",
  "sponsor_discount": 10,
  "status": "active",
  "max_completions": 1000,
  "completion_count": 247
}
\`\`\`

**TaskCompletion** (User submissions):
\`\`\`json
{
  "task_id": "task_xyz789",
  "user_email": "user@example.com",
  "completion_date": "2026-01-08T14:30:00Z",
  "verification_status": "verified",
  "verification_data": {
    "photo_url": "https://...",
    "gps_coords": {"lat": 40.7128, "lng": -74.0060}
  },
  "reward_issued": true,
  "nano_tokens_earned": 50,
  "carbon_impact": 10,
  "merchant_discount_applied": true
}
\`\`\`

**NanoToken** (User balances):
\`\`\`json
{
  "user_email": "user@example.com",
  "balance": 2450,
  "total_earned": 5890,
  "total_spent": 3440,
  "staked_amount": 2000,
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
\`\`\`

**CarbonToken** (CRBN balances):
\`\`\`json
{
  "user_email": "user@example.com",
  "crbn_balance": 1250,
  "total_acquired": 3200,
  "total_retired": 1950,
  "wallet_address": "0x...",
  "verified_projects": [
    "climeworks_2024",
    "mangrove_restoration_2025"
  ]
}
\`\`\`

---

## User Journeys

### New User Onboarding

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as Consumer Portal
    participant Tasks as Task Marketplace
    participant Wallet as NANO Wallet
    participant Tutorial
    
    User->>Portal: Sign Up
    Portal->>Wallet: Create NANO Wallet
    Wallet-->>Portal: Wallet Created
    
    Portal->>User: Welcome! Here's 50 NANO to start
    Portal->>Tutorial: Start Interactive Tutorial
    
    Tutorial->>User: "Complete your first task"
    User->>Tasks: Browse Tasks
    Tasks-->>User: Show "Plant a Tree" (50 NANO)
    
    User->>User: Plants tree in real life
    User->>Tasks: Upload photo proof
    Tasks->>Tasks: AI validates photo
    Tasks-->>User: ✅ Verified! +50 NANO
    
    User->>Portal: Check Total Balance
    Portal-->>User: 100 NANO (50 welcome + 50 earned)
    
    Portal->>User: "Unlock your first achievement!"
    Tutorial->>User: "Try staking for passive income"
    
    Note over User,Portal: User is now engaged in ecosystem
\`\`\`

### Power User Flow

\`\`\`mermaid
graph TB
    subgraph "Daily Routine"
        MORNING[Morning: Check Tasks<br/>Complete public transport task<br/>+20 NANO + streak bonus]
        AFTERNOON[Afternoon: Lunch at Green Merchant<br/>QR scan task completion<br/>+75 NANO + 10% discount]
        EVENING[Evening: Forum Activity<br/>Share sustainability tip<br/>+5 NANO + community karma]
    end
    
    subgraph "Weekly Activities"
        STAKE[Stake Accumulated NANO<br/>12-month lock for 15% APY]
        VOTE[Vote on DAO Proposals<br/>Support ocean cleanup project]
        NFT[Check Achievement Progress<br/>Close to Silver Transport Hero]
    end
    
    subgraph "Monthly Activities"
        BONDS[Invest in Green Bond<br/>Allocate 500 NANO to solar project]
        LEADERBOARD[Check Leaderboard Position<br/>Aiming for top 100]
        WITHDRAW[Claim Staking Rewards<br/>Auto-compound enabled]
    end
    
    subgraph "Results"
        EARNED[Monthly Earnings<br/>1,200 NANO from tasks<br/>150 NANO from staking<br/>Total: 1,350 NANO]
        IMPACT[Environmental Impact<br/>120 kg CO2 offset<br/>15 trees planted<br/>25 public transport trips]
        RANKING[Community Standing<br/>Rank #47 globally<br/>Silver tier badges]
    end
    
    MORNING --> EARNED
    AFTERNOON --> EARNED
    EVENING --> EARNED
    STAKE --> EARNED
    
    MORNING --> IMPACT
    AFTERNOON --> IMPACT
    
    VOTE --> RANKING
    NFT --> RANKING
    LEADERBOARD --> RANKING
    
    style EARNED fill:#f59e0b,color:#fff
    style IMPACT fill:#10b981,color:#fff
    style RANKING fill:#8b5cf6,color:#fff
\`\`\`

---

## Monetization & Business Model

### Revenue Streams

**For FTS.Money Platform**:

1. **Merchant Sponsorships**:
   - Merchants pay to sponsor NANO tasks
   - Platform commission: 15% of sponsorship budget
   - Example: $2,000/month budget = $300 platform revenue

2. **Transaction Fees**:
   - NANO to CRBN conversion: 2% fee
   - NANO to USD cash-out: 5% fee
   - Green bond investment: 1% platform fee

3. **Premium Features**:
   - Streak freeze purchase: 200 NANO (platform keeps 20%)
   - Expedited verification: 50 NANO fee
   - Custom NFT design: 500 NANO

4. **FIX Score Boost**:
   - Merchants increase ESG scores through NANO platform
   - Higher FIX scores = more platform engagement
   - Indirect revenue through increased service adoption

**For Merchants**:

1. **Customer Acquisition**:
   - Average cost per customer via NANO task: $4
   - Traditional digital ads: $15-50 per customer
   - Savings: 75-90% acquisition cost

2. **Brand Building**:
   - Green badge certification
   - Featured in eco-conscious searches
   - Positive sustainability reputation

3. **FIX Score Improvement**:
   - ESG points boost from NANO sponsorship
   - Unlock fee discounts (0.2-0.5%)
   - Priority support and features

---

## Future Roadmap

### Q1 2026
- ✅ NANO Task Marketplace (Live)
- ✅ Staking System (Live)
- ✅ Achievement NFTs (Live)
- ✅ Project DAO (Live)
- 🔨 Mobile app (iOS/Android)
- 🔨 NANO token DEX listing

### Q2 2026
- 📋 Physical NANO card (spend NANO at merchants)
- 📋 NANO referral program (earn for inviting friends)
- 📋 Corporate NANO accounts (for employee programs)
- 📋 NANO grants (for nonprofits)

### Q3 2026
- 📋 NANO API for merchants (integrate directly)
- 📋 WhatsApp bot for task submissions
- 📋 AR task verification (use phone camera)
- 📋 NANO marketplace (trade items with NANO)

### Q4 2026
- 📋 NANO stablecoin (backed by carbon credits)
- 📋 Cross-chain bridge (Ethereum, Solana)
- 📋 Institutional NANO pools (for companies)
- 📋 Carbon credit registry integration (Verra, Gold Standard)

---

## Conclusion

The NANO Sustainability Platform creates a **self-reinforcing ecosystem** where:
- ✅ Consumers earn rewards for environmental actions
- ✅ Merchants gain customers and FIX score boosts
- ✅ Platform generates revenue from sponsorships and fees
- ✅ Real environmental impact through verified carbon offsets
- ✅ Community governance ensures transparency

**Key Metrics (Current)**:
- 🌱 12,500 registered users
- 🏆 45,000 tasks completed
- 💰 2.5M NANO tokens in circulation
- ☁️ 15,000 kg CO2 offset
- 🌲 2,300 trees planted
- 📈 $125K in green bonds funded

**Impact Goal (2026)**:
- 100,000 users
- 1M tasks completed
- 100M NANO in circulation
- 500,000 kg CO2 offset annually

---

**Document Information**
- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Owner:** FTS.Money Sustainability Team
- **Contact:** sustainability@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default NANOSustainabilityDoc;