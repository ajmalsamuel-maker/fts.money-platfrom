const FIXScoreSystemDoc = `# FTS Index (FIX) Merchant Scoring System
## Comprehensive Merchant Performance & Sustainability Ranking

**Version:** 1.0  
**Last Updated:** January 8, 2026  
**Classification:** Public Documentation

---

## Executive Summary

The **FTS Index (FIX) Score** is a proprietary merchant ranking algorithm that evaluates merchant performance across four key dimensions: transaction performance, service adoption, environmental sustainability, and compliance. FIX scores range from 0-1000 and determine merchant benefits, fee discounts, and platform privileges.

**Why FIX Scores Matter**:
- **For Merchants**: Higher scores unlock fee discounts, priority support, and featured marketplace placement
- **For PSPs**: Data-driven merchant segmentation and risk assessment
- **For Platform**: Incentivizes platform engagement and sustainability initiatives

---

## Score Architecture

### Component Breakdown

\`\`\`mermaid
graph TB
    FIX[FIX Score<br/>0-1000 Points<br/>Determines merchant tier] --> T[Transaction Score<br/>300 Points Maximum<br/>40% weight]
    FIX --> S[Service Adoption Score<br/>250 Points Maximum<br/>25% weight]
    FIX --> E[ESG Performance Score<br/>250 Points Maximum<br/>25% weight]
    FIX --> C[Compliance & Security Score<br/>200 Points Maximum<br/>10% weight]
    
    T --> T1[Transaction Volume<br/>Monthly USD value<br/>0-150 points]
    T --> T2[Transaction Count<br/>Frequency & consistency<br/>0-100 points]
    T --> T3[Growth Rate<br/>Month-over-month trend<br/>0-50 points]
    
    S --> S1[Active Services Count<br/>ISO, Orchestration, Crypto, etc.<br/>0-120 points]
    S --> S2[Service Category Diversity<br/>Multiple service types<br/>0-80 points]
    S --> S3[Integration Depth<br/>API usage & adoption<br/>0-50 points]
    
    E --> E1[Carbon Offset Activity<br/>CRBN tokens purchased<br/>0-100 points]
    E --> E2[NANO Tasks Sponsored<br/>Sustainability campaigns<br/>0-80 points]
    E --> E3[Green Bond Investment<br/>Environmental projects<br/>0-70 points]
    
    C --> C1[PCI DSS Compliance<br/>Certified status<br/>0-80 points]
    C --> C2[LEI Verification<br/>Legal entity verified<br/>0-60 points]
    C --> C3[Service Uptime<br/>Last 30 days availability<br/>0-60 points]
    
    style FIX fill:#f59e0b,color:#fff,stroke:#000,stroke-width:3px
    style T fill:#3b82f6,color:#fff
    style S fill:#8b5cf6,color:#fff
    style E fill:#10b981,color:#fff
    style C fill:#ef4444,color:#fff
\`\`\`

---

## Score Components - Detailed Calculation

### 1. Transaction Score (0-300 Points)

**Purpose**: Rewards merchants for high payment volume, consistency, and growth.

**Calculation Formula**:

\`\`\`
Transaction Score = Volume Points + Count Points + Growth Points

Volume Points (0-150):
  - $0-$10K/month: 0-30 points (linear scale)
  - $10K-$100K/month: 30-70 points
  - $100K-$1M/month: 70-120 points
  - $1M-$10M/month: 120-150 points
  - $10M+/month: 150 points (maximum)

Count Points (0-100):
  - <100 txns/month: 0-20 points
  - 100-1,000 txns/month: 20-50 points
  - 1K-10K txns/month: 50-80 points
  - 10K-100K txns/month: 80-95 points
  - 100K+ txns/month: 100 points

Growth Points (0-50):
  - Negative growth: 0 points
  - 0-5% growth: 10 points
  - 5-15% growth: 20 points
  - 15-30% growth: 30 points
  - 30-50% growth: 40 points
  - 50%+ growth: 50 points
\`\`\`

**Why It Matters**: High-volume merchants drive platform revenue and demonstrate business stability. Growth indicates healthy business trajectory.

---

### 2. Service Adoption Score (0-250 Points)

**Purpose**: Rewards merchants for utilizing multiple FTS.Money platform services.

**Service Categories**:

| Service Category | Examples | Points per Active Service |
|-----------------|----------|--------------------------|
| **Core Payment** | PSP instance, payment gateway | 15 points |
| **Message Translation** | ISO Gateway | 20 points |
| **Smart Routing** | Orchestration service | 25 points |
| **Digital Assets** | Crypto Gateway, RWA Platform | 30 points |
| **Compliance** | KYC/AML, LEI verification | 18 points |
| **Value-Added** | Fraud detection, analytics | 20 points |
| **Financial** | E-invoicing, tax management | 15 points |

**Diversity Bonus**:
- Using 3+ different service categories: +30 points
- Using 5+ different service categories: +50 points
- Using all 7 service categories: +80 points (maximum)

**Integration Depth (0-50 points)**:
- API calls per month (higher usage = more points)
- Webhook integration configured: +10 points
- Custom workflows built: +15 points
- Advanced features enabled: +25 points

**Example Calculation**:
\`\`\`
Merchant using:
  - PSP Instance (Core Payment): 15 points
  - ISO Gateway (Translation): 20 points
  - Orchestration (Routing): 25 points
  - Crypto Gateway (Digital Assets): 30 points
  - KYC Service (Compliance): 18 points
  
Service Points: 108
Diversity Bonus (5 categories): +50 points
Integration Depth: +35 points
Total Service Adoption Score: 193 points
\`\`\`

---

### 3. ESG Performance Score (0-250 Points)

**Purpose**: Rewards merchants for environmental, social, and governance initiatives.

**Environmental Actions**:

\`\`\`mermaid
graph TB
    subgraph "Carbon Offset Activities"
        CRBN[CRBN Token Purchases<br/>1 token = 1kg CO2]
        STRIPE[Stripe Climate Orders<br/>Carbon removal projects]
        OFFSET[Total CO2 Offset]
    end
    
    subgraph "NANO Task Sponsorship"
        SPONSOR[Sponsor Tasks<br/>Fund sustainability actions]
        BUDGET[Campaign Budget<br/>Monthly allocation]
        IMPACT[Tasks Completed<br/>By consumers]
    end
    
    subgraph "Green Investment"
        BONDS[Green Bond Purchases<br/>Environmental projects]
        AMOUNT[Total Invested<br/>USD value]
        PROJECTS[Projects Supported<br/>Count]
    end
    
    CRBN --> POINTS1[Carbon Points<br/>0-100]
    STRIPE --> POINTS1
    
    SPONSOR --> POINTS2[NANO Points<br/>0-80]
    BUDGET --> POINTS2
    
    BONDS --> POINTS3[Investment Points<br/>0-70]
    AMOUNT --> POINTS3
    
    POINTS1 --> TOTAL[ESG Score<br/>0-250]
    POINTS2 --> TOTAL
    POINTS3 --> TOTAL
    
    style TOTAL fill:#10b981,color:#fff,stroke:#000,stroke-width:3px
    style POINTS1 fill:#06b6d4,color:#fff
    style POINTS2 fill:#8b5cf6,color:#fff
    style POINTS3 fill:#f59e0b,color:#fff
\`\`\`

**Carbon Offset Points (0-100)**:
- 0-100 kg CO2 offset: 0-20 points
- 100-500 kg: 20-40 points
- 500-1,000 kg: 40-60 points
- 1,000-5,000 kg: 60-80 points
- 5,000-10,000 kg: 80-90 points
- 10,000+ kg: 100 points

**NANO Sponsorship Points (0-80)**:
- $0-$100/month budget: 0-15 points
- $100-$500/month: 15-30 points
- $500-$2,000/month: 30-50 points
- $2,000-$5,000/month: 50-65 points
- $5,000+/month: 80 points

**Green Bond Points (0-70)**:
- $0-$1,000 invested: 0-15 points
- $1,000-$5,000: 15-30 points
- $5,000-$10,000: 30-45 points
- $10,000-$50,000: 45-60 points
- $50,000+: 70 points

---

### 4. Compliance & Security Score (0-200 Points)

**Purpose**: Rewards merchants for regulatory compliance and operational reliability.

**Components**:

| Compliance Item | Points | Verification Method |
|----------------|--------|---------------------|
| **PCI DSS Certified** | 80 points | Annual certification upload |
| **LEI Verified** | 60 points | GLEIF API verification |
| **99%+ Uptime** | 60 points | Automated monitoring (last 30 days) |
| **95-99% Uptime** | 40 points | - |
| **90-95% Uptime** | 20 points | - |
| **<90% Uptime** | 0 points | - |

**PCI Compliance Bonus**:
- Basic PCI: +40 points
- PCI SAQ A: +60 points
- PCI SAQ D: +80 points (maximum)

---

## Score Tiers & Benefits

### Tier System

\`\`\`mermaid
graph TB
    subgraph "FIX Score Tiers"
        DIAMOND[Diamond Tier<br/>900-1000 Points<br/>Top 1% of merchants]
        PLATINUM[Platinum Tier<br/>750-899 Points<br/>Top 5%]
        GOLD[Gold Tier<br/>600-749 Points<br/>Top 15%]
        SILVER[Silver Tier<br/>450-599 Points<br/>Top 40%]
        BRONZE[Bronze Tier<br/>0-449 Points<br/>Entry level]
    end
    
    subgraph "Diamond Benefits"
        D1[0.5% Fee Discount<br/>All transactions]
        D2[Dedicated Account Manager<br/>24/7 priority access]
        D3[Featured Marketplace Listing<br/>Premium placement]
        D4[Priority Support<br/>1-hour SLA]
        D5[Exclusive Beta Access<br/>New features first]
        D6[Custom Integration Support<br/>Engineering assistance]
    end
    
    subgraph "Platinum Benefits"
        P1[0.3% Fee Discount]
        P2[Priority Support<br/>4-hour SLA]
        P3[Featured Listing]
        P4[Beta Access]
    end
    
    subgraph "Gold Benefits"
        G1[0.2% Fee Discount]
        G2[Enhanced Analytics<br/>Advanced reporting]
        G3[Standard Support<br/>24-hour SLA]
    end
    
    DIAMOND --> D1
    DIAMOND --> D2
    DIAMOND --> D3
    DIAMOND --> D4
    DIAMOND --> D5
    DIAMOND --> D6
    
    PLATINUM --> P1
    PLATINUM --> P2
    PLATINUM --> P3
    PLATINUM --> P4
    
    GOLD --> G1
    GOLD --> G2
    GOLD --> G3
    
    style DIAMOND fill:#e879f9,color:#000,stroke:#000,stroke-width:3px
    style PLATINUM fill:#c084fc,color:#fff,stroke:#000,stroke-width:2px
    style GOLD fill:#fbbf24,color:#000,stroke:#000,stroke-width:2px
    style SILVER fill:#94a3b8,color:#fff
    style BRONZE fill:#78350f,color:#fff
\`\`\`

**Fee Discount Impact**:

Example: Diamond merchant processing $1M/month at 2.7% base rate
- Base fees: $27,000/month
- 0.5% discount: $135/month savings
- Annual savings: $1,620
- Plus priority support, featured listing, dedicated manager

---

## Score Calculation & Updates

### Automated Calculation

**URL (Admin)**: https://platform.fts.money/PlatformFIXManagement

**Calculation Trigger**: Scores are recalculated automatically:
- Daily at 02:00 UTC (batch update for all merchants)
- On-demand when merchant completes ESG actions
- Real-time preview in merchant dashboard

**Calculation Backend Function**: functions/calculateFIXScore.js

\`\`\`mermaid
sequenceDiagram
    participant Scheduler as Scheduled Task<br/>Daily 02:00 UTC
    participant Function as calculateFIXScore
    participant DB as Database
    participant Merchant as Merchant Record
    participant Notification as Email Service
    
    Scheduler->>Function: Trigger: Calculate All Scores
    Function->>DB: Fetch All Merchants
    DB-->>Function: Merchant List
    
    loop For Each Merchant
        Function->>DB: Get Transaction Data (30 days)
        Function->>DB: Get Active Services
        Function->>DB: Get ESG Activities
        Function->>DB: Get Compliance Status
        
        Function->>Function: Calculate Component Scores
        Function->>Function: Sum to Overall Score
        Function->>Function: Determine Tier (Bronze-Diamond)
        Function->>Function: Calculate Next Tier Gap
        Function->>Function: Identify Unlocked Benefits
        
        Function->>Merchant: Update FIX Score Record
        Merchant->>DB: Save Updated Score
        
        alt Score Increased to New Tier
            Function->>Notification: Send Tier Upgrade Email
            Notification-->>Merchant: "Congratulations! You reached Gold tier"
        end
    end
    
    Function->>DB: Generate Global Rankings
    Function->>DB: Generate Industry Rankings
    Function-->>Scheduler: Calculation Complete
\`\`\`

**Calculation Performance**:
- Processes 1,000 merchants in ~2 minutes
- Atomic updates (no partial scores)
- Rollback on errors
- Audit trail of score changes

---

## Merchant FIX Dashboard

### Merchant View

**URL**: https://platform.fts.money/MerchantFIXDashboard

**Dashboard Layout**:

\`\`\`mermaid
graph TB
    subgraph "FIX Dashboard - Merchant View"
        HERO[Hero Section<br/>Current Score & Tier<br/>Large display with badge]
        
        subgraph "Score Breakdown"
            TRANS[Transaction Component<br/>Current: 245 / 300<br/>Progress bar]
            SERVICE[Service Adoption<br/>Current: 180 / 250<br/>Progress bar]
            ESG[ESG Performance<br/>Current: 120 / 250<br/>Progress bar]
            COMP[Compliance<br/>Current: 140 / 200<br/>Progress bar]
        end
        
        subgraph "Insights & Actions"
            TREND[Score Trend<br/>Last 6 months chart]
            NEXT[Next Tier Info<br/>Points needed + suggestions]
            BENEFITS[Unlocked Benefits<br/>Current tier rewards]
            ACTIONS[Improvement Actions<br/>Actionable suggestions]
        end
        
        subgraph "Rankings"
            GLOBAL[Global Rank<br/>#245 of 1,842]
            INDUSTRY[Industry Rank<br/>#12 of 156<br/>E-commerce category]
        end
    end
    
    HERO --> TRANS
    HERO --> SERVICE
    HERO --> ESG
    HERO --> COMP
    
    TRANS --> TREND
    SERVICE --> NEXT
    ESG --> BENEFITS
    COMP --> ACTIONS
    
    TREND --> GLOBAL
    NEXT --> INDUSTRY
    
    style HERO fill:#f59e0b,color:#fff
    style NEXT fill:#10b981,color:#fff
\`\`\`

**Improvement Suggestions**:

Merchants see actionable recommendations to improve their score:

\`\`\`
Score Improvement Suggestions:

🎯 To reach Gold Tier (need 85 more points):

Transaction Score (+30 points possible):
  ✓ Increase monthly volume to $150K (+20 points)
  ✓ Maintain 15%+ growth rate (+10 points)

Service Adoption (+50 points possible):
  → Activate Orchestration service (+25 points)
  → Enable Crypto Gateway (+25 points)

ESG Performance (+80 points possible):
  → Sponsor NANO tasks with $500/month budget (+30 points)
  → Purchase 1,000 kg carbon offsets (+25 points)
  → Invest $5,000 in green bonds (+25 points)

Compliance (+20 points possible):
  ✓ Already PCI certified (80 points earned)
  → Verify LEI (+60 points)
\`\`\`

---

## Platform Admin View

### FIX Management Dashboard

**URL**: https://platform.fts.money/PlatformFIXManagement

**Features**:

\`\`\`mermaid
graph TB
    subgraph "Admin FIX Dashboard"
        STATS[Summary Statistics<br/>Avg score, tier distribution]
        
        subgraph "Leaderboard"
            TABLE[Merchant Rankings Table<br/>Sortable by score/tier/industry]
            SEARCH[Search & Filter<br/>By name, email, tier, industry]
            EXPORT[Export to CSV<br/>Filtered results]
        end
        
        subgraph "Score Details"
            DRILL[Drill-Down View<br/>See component breakdown]
            HISTORY[Score History<br/>Trend over time]
            COMPARE[Compare Merchants<br/>Side-by-side analysis]
        end
        
        subgraph "Analytics"
            DIST[Score Distribution Chart<br/>Bell curve visualization]
            TIER_CHART[Tier Breakdown<br/>Pie chart]
            TREND_CHART[Platform Trend<br/>Average score over time]
        end
    end
    
    STATS --> TABLE
    TABLE --> DRILL
    SEARCH --> TABLE
    TABLE --> EXPORT
    
    DRILL --> HISTORY
    HISTORY --> COMPARE
    
    STATS --> DIST
    DIST --> TIER_CHART
    TIER_CHART --> TREND_CHART
    
    style STATS fill:#3b82f6,color:#fff
    style TABLE fill:#10b981,color:#fff
\`\`\`

**Admin Capabilities**:
- View all merchant scores in leaderboard
- Filter by tier, industry, score range
- Sort by any column (score, name, tier, trend)
- Export filtered results to CSV
- Drill into individual merchant details
- View score calculation breakdown
- See score history and trends
- Compare merchants side-by-side

**Key Statistics**:
- Average FIX score across all merchants
- Tier distribution (how many in each tier)
- Industry leaders (top merchants per category)
- Score trends (improving/declining)

---

## Community Leaderboard

### Public Rankings

**URL**: https://platform.fts.money/CommunityFIXLeaderboard

**Purpose**: Public-facing leaderboard celebrating top-performing merchants (opt-in only).

**Leaderboard Features**:
- Top 100 merchants displayed
- Anonymous option (show rank without name)
- Industry-specific leaderboards
- Monthly/quarterly/all-time views
- Achievement badges displayed
- Social sharing capabilities

**Privacy Controls**:
- Merchants opt-in to public display
- Can show rank only (no score)
- Can be fully anonymous
- Can hide from industry category

---

## Score Improvement Strategies

### For Merchants

**Quick Wins (0-30 days)**:
1. ✅ Verify LEI (+60 compliance points)
2. ✅ Activate one new service (+20-30 service points)
3. ✅ Sponsor NANO task campaign (+30-50 ESG points)
4. ✅ Purchase carbon offsets (+20-40 ESG points)

**Medium-Term (30-90 days)**:
1. 📈 Increase transaction volume by 20% (+15-30 transaction points)
2. 📈 Achieve PCI certification (+80 compliance points)
3. 📈 Activate 3+ service categories (+30 diversity bonus)
4. 📈 Invest in green bonds (+30-45 ESG points)

**Long-Term (90+ days)**:
1. 🎯 Sustain 30%+ growth rate (+40-50 transaction points)
2. 🎯 Activate all 7 service categories (+80 diversity bonus)
3. 🎯 Offset 10,000+ kg CO2 annually (+100 ESG points)
4. 🎯 Maintain 99.9%+ uptime (+60 compliance points)

---

## API Integration

### Accessing FIX Scores Programmatically

**Entity**: FIXScore

**SDK Usage**:
\`\`\`javascript
import { base44 } from '@/api/base44Client';

// Get merchant's FIX score
const fixScore = await base44.entities.FIXScore.filter({
  merchant_id: "merchant_xyz123"
});

console.log(fixScore.overall_score); // 685
console.log(fixScore.score_tier); // "gold"
console.log(fixScore.rank_global); // 245
console.log(fixScore.rank_industry); // 12
console.log(fixScore.benefits_unlocked); // ["0.2% fee discount", "enhanced analytics"]
console.log(fixScore.next_tier_threshold); // 65 points to Platinum
\`\`\`

**Webhook Events**:
\`\`\`json
{
  "event": "fix_score.updated",
  "merchant_id": "merchant_xyz123",
  "previous_score": 580,
  "new_score": 685,
  "previous_tier": "silver",
  "new_tier": "gold",
  "tier_changed": true,
  "timestamp": "2026-01-08T02:00:00Z"
}
\`\`\`

---

## Future Enhancements

**Planned Features (Q2 2026)**:
- Social score component (community engagement, forum activity)
- Innovation score (API usage, feature adoption)
- Customer satisfaction score (NPS integration)
- Peer review system (merchant ratings)

**Advanced Analytics (Q3 2026)**:
- Predictive scoring (forecast future score)
- Benchmarking tools (compare to similar merchants)
- Score optimization advisor (AI-powered recommendations)
- Custom scoring rules per industry vertical

---

## Conclusion

The FIX Score system provides:

✅ **Objective merchant ranking** based on 4 key dimensions  
✅ **Tiered benefits system** rewarding high performers  
✅ **Sustainability incentives** encouraging ESG actions  
✅ **Transparent methodology** with clear improvement paths  
✅ **Automated calculation** with daily updates  

FIX scores align merchant incentives with platform success, creating a virtuous cycle of engagement, growth, and sustainability.

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 8, 2026
- **Owner:** FTS.Money Product Team
- **Contact:** product@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default FIXScoreSystemDoc;