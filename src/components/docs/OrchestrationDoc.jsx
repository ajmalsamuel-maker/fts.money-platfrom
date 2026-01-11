const OrchestrationDoc = `# Payment Orchestration Service Documentation
## Intelligent Payment Routing & Optimization Platform

**Version:** 2.0  
**Classification:** Technical - Orchestration Customers  
**Last Updated:** January 11, 2026  
**Document Owner:** FTS.Money Orchestration Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Smart Routing Engine](#smart-routing-engine)
5. [Failover & Resilience](#failover--resilience)
6. [Cost Optimization](#cost-optimization)
7. [Performance Optimization](#performance-optimization)
8. [Configuration & Rules](#configuration--rules)
9. [Integration Guide](#integration-guide)
10. [Operations & Analytics](#operations--analytics)

---

## Executive Summary

### What is Payment Orchestration?

**Payment Orchestration** is the intelligent routing of payment transactions across multiple payment service providers (PSPs) and processors to optimize success rates, reduce costs, and ensure business continuity.

### The Multi-Processor Challenge

\`\`\`mermaid
graph TB
    M[Merchant] --> P1[Processor A<br/>98% success<br/>2.9% + $0.30]
    M --> P2[Processor B<br/>96% success<br/>2.5% + $0.25]
    M --> P3[Processor C<br/>99% success<br/>3.2% + $0.35]
    
    style M fill:#f96,stroke:#333
    style P1 fill:#9cf,stroke:#333
    style P2 fill:#9cf,stroke:#333
    style P3 fill:#9cf,stroke:#333
\`\`\`

**Problems:**
- ❌ Manual processor selection
- ❌ No automatic failover
- ❌ Suboptimal routing decisions
- ❌ Lost revenue from declines
- ❌ Higher processing costs
- ❌ Single point of failure

### The Orchestration Solution

\`\`\`mermaid
graph TB
    M[Merchant] --> O[Orchestration<br/>Engine]
    
    O -->|Smart<br/>Routing| P1[Processor A]
    O -->|Cost<br/>Optimization| P2[Processor B]
    O -->|Auto<br/>Failover| P3[Processor C]
    O -->|Performance<br/>Routing| P4[Processor D]
    
    O -.Monitor.-> P1
    O -.Monitor.-> P2
    O -.Monitor.-> P3
    O -.Monitor.-> P4
    
    style M fill:#9f9,stroke:#333
    style O fill:#ff9,stroke:#333,stroke-width:3px
    style P1 fill:#9cf,stroke:#333
    style P2 fill:#9cf,stroke:#333
    style P3 fill:#9cf,stroke:#333
    style P4 fill:#9cf,stroke:#333
\`\`\`

**Benefits:**
- ✅ Automatic intelligent routing
- ✅ Instant failover (no downtime)
- ✅ 2-5% higher success rates
- ✅ 10-30% cost reduction
- ✅ 99.99% availability
- ✅ Real-time optimization

### Key Metrics Impact

\`\`\`
Before Orchestration:
  Success Rate:     96.5%
  Avg Cost/Txn:     $0.32
  Downtime/Year:    4.2 hours
  Manual Work:      High

After Orchestration:
  Success Rate:     98.8% (+2.3%)
  Avg Cost/Txn:     $0.24 (-25%)
  Downtime/Year:    0.5 hours (-88%)
  Manual Work:      Minimal

Revenue Impact (100K txns/month @ $50 avg):
  Lost Revenue Before:  $175,000/month
  Lost Revenue After:   $60,000/month
  Recovered:           $115,000/month
  
  Processing Costs Before: $32,000/month
  Processing Costs After:  $24,000/month
  Savings:                 $8,000/month
  
  Total Monthly Benefit:   $123,000
  Annual Benefit:          $1,476,000
\`\`\`

---

## Core Concepts

### 1. Multi-PSP Strategy

\`\`\`mermaid
mindmap
  root((Multi-PSP<br/>Strategy))
    Primary Processor
      High Success Rate
      Best Performance
      70% Traffic
    Secondary Processor
      Backup Route
      Geographic Strength
      20% Traffic
    Tertiary Processor
      Failover Only
      Specialty Cards
      10% Traffic
    Monitoring
      Health Checks
      Success Rates
      Response Times
      Cost Tracking
\`\`\`

### 2. Routing Strategies

**Cost-Based Routing**

\`\`\`
Route to processor with lowest fees

Example:
  Transaction: $100.00
  
  Option A: 2.9% + $0.30 = $3.20
  Option B: 2.5% + $0.25 = $2.75 ← Selected
  Option C: 2.2% + $0.35 = $2.55 ← Best
  
  Savings per txn: $0.65
  Savings (10K txns): $6,500/month
\`\`\`

**Success-Based Routing**

\`\`\`
Route to processor with highest success rate

Processor A: 98.5% success (US cards)
Processor B: 97.2% success (EU cards)
Processor C: 99.1% success (AMEX)

US Visa → Processor A
EU Mastercard → Processor B
AMEX → Processor C
\`\`\`

**Performance-Based Routing**

\`\`\`
Route to fastest processor

Processor A: 150ms (US East)
Processor B: 450ms (US), 180ms (EU)
Processor C: 200ms (Global)

Customer in US → Processor A
Customer in EU → Processor B
Customer in Asia → Processor C
\`\`\`

**Network-Based Routing**

\`\`\`
Route based on card network preferences

Visa Direct → Processor optimized for Visa
Mastercard Send → Processor with MC partnership
Amex → Direct Amex integration
\`\`\`

### 3. Cascading & Failover

\`\`\`mermaid
sequenceDiagram
    participant M as Merchant
    participant O as Orchestrator
    participant P1 as Processor 1
    participant P2 as Processor 2
    participant P3 as Processor 3
    
    M->>O: Payment Request
    O->>O: Select Processor 1
    O->>P1: Forward Request
    
    alt Success
        P1-->>O: Approved
        O-->>M: Success
    else Timeout
        Note over O,P1: 5 second timeout
        O->>P2: Failover to Processor 2
        alt Success
            P2-->>O: Approved
            O-->>M: Success
        else Declined
            P2-->>O: Declined
            O->>P3: Try Processor 3
            P3-->>O: Approved
            O-->>M: Success
        end
    end
\`\`\`

---

## Architecture

### System Architecture

\`\`\`mermaid
graph TB
    subgraph "Merchant Layer"
        A[Merchant API Request]
    end
    
    subgraph "Orchestration Platform"
        B[API Gateway]
        C[Request Validator]
        D[Routing Engine]
        E[Processor Connector Pool]
        F[Response Handler]
        G[Analytics Engine]
    end
    
    subgraph "Processor Layer"
        H1[Stripe]
        H2[Adyen]
        H3[Checkout.com]
        H4[Braintree]
        H5[Worldpay]
        H6[Custom Processor]
    end
    
    subgraph "Data Layer"
        I[(Transaction DB)]
        J[(Rules Engine)]
        K[(Analytics DB)]
        L[Cache Layer]
    end
    
    A --> B
    B --> C
    C --> D
    D --> J
    D --> E
    
    E --> H1
    E --> H2
    E --> H3
    E --> H4
    E --> H5
    E --> H6
    
    H1 --> F
    H2 --> F
    H3 --> F
    H4 --> F
    H5 --> F
    H6 --> F
    
    F --> G
    G --> I
    G --> K
    
    D --> L
    F --> L
\`\`\`

### Core Components

**1. Routing Engine**

\`\`\`javascript
class RoutingEngine {
  selectProcessor(transaction, rules) {
    // Step 1: Filter eligible processors
    const eligible = this.filterEligible(transaction);
    
    // Step 2: Score each processor
    const scored = this.scoreProcessors(eligible, transaction);
    
    // Step 3: Apply routing rules
    const routed = this.applyRules(scored, rules);
    
    // Step 4: Select best option
    return this.selectBest(routed);
  }
  
  filterEligible(transaction) {
    return processors.filter(p => 
      p.supportsCardType(transaction.card_type) &&
      p.supportsCurrency(transaction.currency) &&
      p.supportsCountry(transaction.country) &&
      p.isHealthy() &&
      p.hasCapacity()
    );
  }
  
  scoreProcessors(processors, transaction) {
    return processors.map(p => ({
      processor: p,
      scores: {
        cost: this.calculateCost(p, transaction),
        success_rate: p.getSuccessRate(transaction),
        performance: p.getAvgResponseTime(),
        availability: p.getUptimeScore()
      }
    }));
  }
}
\`\`\`

**2. Health Monitor**

\`\`\`yaml
health_monitoring:
  checks:
    - type: "http_ping"
      interval: 30s
      timeout: 5s
      failure_threshold: 3
      
    - type: "transaction_success_rate"
      window: 5m
      threshold: 95%
      
    - type: "response_time"
      window: 1m
      p95_threshold: 1000ms
      
  actions:
    degraded:
      - reduce_traffic: 50%
      - alert: "warning"
      
    down:
      - remove_from_rotation: true
      - alert: "critical"
      - failover: "automatic"
\`\`\`

**3. Retry Logic**

\`\`\`javascript
class RetryHandler {
  async executeWithRetry(transaction, processor) {
    const config = this.getRetryConfig(transaction);
    let lastError;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await processor.process(transaction);
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryable(error)) {
          throw error; // Don't retry non-retryable errors
        }
        
        if (attempt < config.maxAttempts) {
          const delay = this.calculateBackoff(attempt, config);
          await this.sleep(delay);
        }
      }
    }
    
    throw new MaxRetriesExceededError(lastError);
  }
  
  calculateBackoff(attempt, config) {
    // Exponential backoff with jitter
    const base = config.initialDelay;
    const exponential = base * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponential + jitter, config.maxDelay);
  }
  
  isRetryable(error) {
    const retryableCodes = [
      'TIMEOUT',
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT_EXCEEDED'
    ];
    return retryableCodes.includes(error.code);
  }
}
\`\`\`

---

## Smart Routing Engine

### Decision Tree

\`\`\`mermaid
graph TD
    A[Transaction Request] --> B{Transaction Type}
    
    B -->|Card Payment| C{Card Type}
    B -->|Bank Transfer| D{Currency}
    B -->|Digital Wallet| E{Wallet Type}
    
    C -->|Visa| F{Amount}
    C -->|Mastercard| G{Region}
    C -->|Amex| H[Amex-Optimized<br/>Processor]
    
    F -->|< $1000| I{Customer Country}
    F -->|>= $1000| J[High-Value<br/>Processor]
    
    I -->|US| K[Domestic<br/>Low-Cost]
    I -->|International| L[Global<br/>Processor]
    
    G -->|US/CA| M[North America<br/>Processor]
    G -->|EU| N[European<br/>Processor]
    G -->|Other| O[Global<br/>Processor]
    
    D -->|USD| P[ACH<br/>Processor]
    D -->|EUR| Q[SEPA<br/>Processor]
    D -->|Other| R[SWIFT<br/>Processor]
    
    E -->|Apple Pay| S[Apple Pay<br/>Direct]
    E -->|Google Pay| T[Google Pay<br/>Direct]
    E -->|PayPal| U[PayPal<br/>Integration]
\`\`\`

### Routing Algorithm

\`\`\`python
def route_transaction(transaction):
    # Step 1: Get eligible processors
    eligible = get_eligible_processors(transaction)
    
    # Step 2: Calculate scores
    scores = []
    for processor in eligible:
        score = {
            'processor': processor,
            'cost_score': calculate_cost_score(processor, transaction),
            'success_score': calculate_success_score(processor, transaction),
            'performance_score': calculate_performance_score(processor),
            'availability_score': calculate_availability_score(processor)
        }
        
        # Weighted total score
        score['total'] = (
            score['cost_score'] * 0.3 +
            score['success_score'] * 0.4 +
            score['performance_score'] * 0.2 +
            score['availability_score'] * 0.1
        )
        
        scores.append(score)
    
    # Step 3: Sort by total score
    scores.sort(key=lambda x: x['total'], reverse=True)
    
    # Step 4: Apply business rules
    filtered = apply_business_rules(scores, transaction)
    
    # Step 5: Return top choice
    return filtered[0]['processor']

def calculate_cost_score(processor, transaction):
    cost = processor.calculate_fee(transaction.amount)
    # Lower cost = higher score (inverted)
    max_cost = 5.00
    return (max_cost - cost) / max_cost * 100

def calculate_success_score(processor, transaction):
    # Get historical success rate for similar transactions
    filters = {
        'card_type': transaction.card_type,
        'country': transaction.country,
        'amount_range': get_amount_range(transaction.amount)
    }
    return processor.get_success_rate(filters, lookback_days=7)

def calculate_performance_score(processor):
    # Lower latency = higher score
    p95_latency = processor.get_p95_latency()
    max_acceptable = 2000  # ms
    if p95_latency >= max_acceptable:
        return 0
    return (max_acceptable - p95_latency) / max_acceptable * 100

def calculate_availability_score(processor):
    # Recent uptime percentage
    uptime = processor.get_uptime(hours=24)
    return uptime  # Already 0-100
\`\`\`

### Rule Engine

\`\`\`json
{
  "routing_rules": [
    {
      "id": "rule_high_value_us",
      "name": "High-value US domestic transactions",
      "priority": 1,
      "enabled": true,
      "conditions": {
        "all": [
          { "field": "amount", "operator": "gte", "value": 10000 },
          { "field": "currency", "operator": "eq", "value": "USD" },
          { "field": "billing_country", "operator": "eq", "value": "US" },
          { "field": "card_country", "operator": "eq", "value": "US" }
        ]
      },
      "actions": {
        "route_to": "processor_premium_us",
        "require_3ds": true,
        "max_retries": 2,
        "fallback": ["processor_backup_us"]
      }
    },
    {
      "id": "rule_eu_optimization",
      "name": "EU cost optimization",
      "priority": 5,
      "enabled": true,
      "conditions": {
        "all": [
          { "field": "billing_country", "operator": "in", 
            "value": ["DE", "FR", "IT", "ES", "NL", "BE"] },
          { "field": "amount", "operator": "lt", "value": 1000 }
        ]
      },
      "actions": {
        "route_to": "processor_low_cost_eu",
        "reason": "Cost optimization for small EU transactions",
        "fallback": ["processor_standard_eu", "processor_global"]
      }
    },
    {
      "id": "rule_amex_direct",
      "name": "American Express direct routing",
      "priority": 2,
      "enabled": true,
      "conditions": {
        "any": [
          { "field": "card_brand", "operator": "eq", "value": "amex" }
        ]
      },
      "actions": {
        "route_to": "amex_direct",
        "reason": "Best rates with direct Amex integration",
        "fallback": ["processor_amex_enabled"]
      }
    }
  ]
}
\`\`\`

---

## Failover & Resilience

### Failover Strategy

\`\`\`mermaid
stateDiagram-v2
    [*] --> Healthy
    Healthy --> Degraded: Health Check Failed
    Degraded --> Healthy: Health Restored
    Degraded --> Down: Multiple Failures
    Down --> Healthy: System Recovered
    
    note right of Healthy
        100% traffic
        Normal operation
    end note
    
    note right of Degraded
        50% traffic
        Monitoring closely
        Alerts sent
    end note
    
    note right of Down
        0% traffic
        Removed from rotation
        Critical alerts
    end note
\`\`\`

### Circuit Breaker Pattern

\`\`\`javascript
class CircuitBreaker {
  constructor(processor, options = {}) {
    this.processor = processor;
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 60000;  // ms
    this.halfOpenAttempts = options.halfOpenAttempts || 3;
  }
  
  async execute(transaction) {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await this.processor.process(transaction);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenAttempts) {
        this.state = 'CLOSED';
        this.successCount = 0;
        console.log(\`Circuit breaker CLOSED for \${this.processor.name}\`);
      }
    }
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.successCount = 0;
      console.error(\`Circuit breaker OPEN for \${this.processor.name}\`);
      this.alertOps();
    }
  }
  
  shouldAttemptReset() {
    return Date.now() - this.lastFailureTime >= this.timeout;
  }
  
  alertOps() {
    // Send alert to operations team
    alerting.send({
      level: 'critical',
      message: \`Circuit breaker opened for \${this.processor.name}\`,
      processor: this.processor.name,
      failure_count: this.failureCount
    });
  }
}
\`\`\`

### Cascading Logic

\`\`\`yaml
cascading_configuration:
  max_cascade_depth: 3
  
  cascade_triggers:
    - trigger: "timeout"
      timeout_ms: 5000
      action: "try_next_processor"
      
    - trigger: "decline_retryable"
      decline_codes: ["05", "91", "96"]
      action: "try_next_processor"
      
    - trigger: "processor_error"
      error_codes: ["500", "502", "503", "504"]
      action: "try_next_processor"
      
    - trigger: "rate_limit"
      action: "try_next_processor"
  
  cascade_strategy:
    attempt_1:
      processor: "primary"
      timeout: 5000ms
      
    attempt_2:
      processor: "secondary"
      timeout: 4000ms  # Slightly faster timeout
      
    attempt_3:
      processor: "tertiary"
      timeout: 3000ms
      
  stop_conditions:
    - "hard_decline"  # Don't retry if card is declined
    - "fraud_detected"
    - "invalid_card"
    - "max_attempts_reached"
\`\`\`

---

## Cost Optimization

### Fee Structure Analysis

\`\`\`
Processor Fee Comparison

Processor A (Stripe):
  Card Present:      2.7% + $0.05
  Card Not Present:  2.9% + $0.30
  International:     +1.5%
  Currency Conv:     +1.0%
  
Processor B (Adyen):
  Card Present:      0.60% + $0.12 + interchange
  Card Not Present:  0.60% + $0.12 + interchange
  International:     +0.5%
  
Processor C (Checkout.com):
  Card Present:      1.9% + $0.10
  Card Not Present:  2.5% + $0.20
  International:     +1.0%
  
Cost Optimization Example:

Transaction: $100 domestic Visa debit

Processor A: $100 × 2.9% + $0.30 = $3.20
Processor B: $100 × (0.60% + 1.65%) + $0.12 = $2.37
Processor C: $100 × 2.5% + $0.20 = $2.70

Best Choice: Processor B (saves $0.83 per txn)

Monthly Savings (10,000 txns): $8,300
Annual Savings: $99,600
\`\`\`

### Dynamic Cost Routing

\`\`\`javascript
function selectCostOptimalProcessor(transaction, processors) {
  const costAnalysis = processors.map(processor => {
    // Calculate total cost
    const percentageFee = transaction.amount * processor.rate;
    const fixedFee = processor.fixed_fee;
    const internationalFee = transaction.is_international 
      ? transaction.amount * processor.international_rate 
      : 0;
    const currencyFee = transaction.needs_conversion
      ? transaction.amount * processor.fx_rate
      : 0;
    
    const totalCost = percentageFee + fixedFee + 
                      internationalFee + currencyFee;
    
    return {
      processor: processor,
      total_cost: totalCost,
      breakdown: {
        percentage: percentageFee,
        fixed: fixedFee,
        international: internationalFee,
        currency: currencyFee
      }
    };
  });
  
  // Sort by total cost (ascending)
  costAnalysis.sort((a, b) => a.total_cost - b.total_cost);
  
  // Apply minimum success rate threshold
  const minSuccessRate = 0.97;
  const viable = costAnalysis.filter(analysis => 
    analysis.processor.success_rate >= minSuccessRate
  );
  
  return viable[0].processor;
}
\`\`\`

### Volume-Based Optimization

\`\`\`yaml
volume_tiers:
  processor_a:
    tier_1:
      volume: 0-50000
      rate: 2.9%
      fixed: 0.30
      
    tier_2:
      volume: 50001-500000
      rate: 2.7%
      fixed: 0.25
      
    tier_3:
      volume: 500001+
      rate: 2.4%
      fixed: 0.20
      
  processor_b:
    tier_1:
      volume: 0-100000
      rate: 2.5%
      fixed: 0.25
      
    tier_2:
      volume: 100001-1000000
      rate: 2.2%
      fixed: 0.20
      
    tier_3:
      volume: 1000001+
      rate: 1.9%
      fixed: 0.15

optimization_strategy:
  # Route to maximize volume discounts
  - if_monthly_volume_near_threshold:
      route_to: processor_approaching_next_tier
      reason: "Unlock better pricing"
      
  - if_already_in_top_tier:
      route_to: processor_with_best_top_tier_rates
      reason: "Maximize savings"
\`\`\`

---

## Performance Optimization

### Latency Optimization

\`\`\`mermaid
graph LR
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached<br/>10ms]
    B -->|No| D{Geographic<br/>Routing}
    
    D -->|US Customer| E[US Processor<br/>150ms]
    D -->|EU Customer| F[EU Processor<br/>180ms]
    D -->|Asia Customer| G[Asia Processor<br/>200ms]
    
    E --> H[Update Cache]
    F --> H
    G --> H
    H --> I[Return Response]
\`\`\`

### Connection Pooling

\`\`\`javascript
class ProcessorConnectionPool {
  constructor(processor, config) {
    this.processor = processor;
    this.minConnections = config.min || 10;
    this.maxConnections = config.max || 100;
    this.connections = [];
    this.available = [];
    this.inUse = new Set();
    
    this.initialize();
  }
  
  async initialize() {
    // Create minimum connections
    for (let i = 0; i < this.minConnections; i++) {
      const conn = await this.createConnection();
      this.connections.push(conn);
      this.available.push(conn);
    }
  }
  
  async getConnection() {
    if (this.available.length > 0) {
      const conn = this.available.pop();
      this.inUse.add(conn);
      return conn;
    }
    
    if (this.connections.length < this.maxConnections) {
      const conn = await this.createConnection();
      this.connections.push(conn);
      this.inUse.add(conn);
      return conn;
    }
    
    // Wait for connection to become available
    return await this.waitForConnection();
  }
  
  releaseConnection(conn) {
    this.inUse.delete(conn);
    this.available.push(conn);
  }
  
  async createConnection() {
    return await this.processor.connect();
  }
}
\`\`\`

### Request Batching

\`\`\`javascript
class RequestBatcher {
  constructor(processor, config = {}) {
    this.processor = processor;
    this.batchSize = config.batchSize || 100;
    this.batchWindow = config.batchWindow || 50;  // ms
    this.queue = [];
    this.timer = null;
  }
  
  async enqueue(transaction) {
    return new Promise((resolve, reject) => {
      this.queue.push({ transaction, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.batchWindow);
      }
    });
  }
  
  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      const results = await this.processor.processBatch(
        batch.map(item => item.transaction)
      );
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }
}
\`\`\`

---

## Configuration & Rules

### Complete Configuration Example

\`\`\`yaml
orchestration_config:
  customer_id: "orch_customer_abc123"
  name: "Production Orchestration"
  
  processors:
    - id: "stripe_main"
      name: "Stripe"
      enabled: true
      priority: 1
      health_check_url: "https://status.stripe.com/api/v2/status.json"
      
    - id: "adyen_backup"
      name: "Adyen"
      enabled: true
      priority: 2
      health_check_url: "https://status.adyen.com/api/status"
      
    - id: "checkout_tertiary"
      name: "Checkout.com"
      enabled: true
      priority: 3
      
  routing_strategy: "smart"  # smart, cost, success, performance, manual
  
  routing_rules:
    - name: "High-value US transactions"
      priority: 1
      conditions:
        amount_gte: 10000
        currency: "USD"
        country: "US"
      route_to: "stripe_main"
      fallback: ["adyen_backup"]
      
    - name: "EU cost optimization"
      priority: 5
      conditions:
        country_in: ["DE", "FR", "IT", "ES"]
        amount_lt: 1000
      route_to: "adyen_backup"
      reason: "Lower fees for EU"
      
  failover:
    enabled: true
    max_cascade_attempts: 3
    timeout_ms: 5000
    retry_delays: [1000, 2000, 4000]
    
  retry_logic:
    enabled: true
    max_attempts: 3
    retryable_errors:
      - "TIMEOUT"
      - "NETWORK_ERROR"
      - "RATE_LIMIT"
    non_retryable_errors:
      - "INVALID_CARD"
      - "FRAUD_DETECTED"
      - "INSUFFICIENT_FUNDS"
      
  circuit_breaker:
    enabled: true
    failure_threshold: 5
    timeout_seconds: 60
    half_open_attempts: 3
    
  monitoring:
    health_check_interval: 30s
    metrics_interval: 60s
    alert_on_degraded: true
    alert_on_down: true
    
  analytics:
    track_performance: true
    track_costs: true
    track_success_rates: true
    retention_days: 90
\`\`\`

---

## Integration Guide

### Quick Start

**Step 1: Create Orchestration Customer**

\`\`\`bash
curl -X POST https://api.fts.money/v1/orchestration/customers \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Company",
    "email": "tech@mycompany.com"
  }'

# Response
{
  "customer_id": "orch_abc123",
  "api_key": "orch_sk_live_xxxxx",
  "status": "active"
}
\`\`\`

**Step 2: Connect Processors**

\`\`\`bash
curl -X POST https://api.fts.money/v1/orchestration/processors \\
  -H "Authorization: Bearer orch_sk_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "processor": "stripe",
    "credentials": {
      "secret_key": "sk_live_xxxxx"
    },
    "priority": 1
  }'
\`\`\`

**Step 3: Send Payment**

\`\`\`bash
curl -X POST https://api.fts.money/v1/orchestration/payments \\
  -H "Authorization: Bearer orch_sk_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10000,
    "currency": "USD",
    "payment_method": {
      "type": "card",
      "card": {
        "number": "4242424242424242",
        "exp_month": 12,
        "exp_year": 2025,
        "cvc": "123"
      }
    },
    "description": "Order #12345"
  }'

# Response
{
  "id": "pay_xxxxx",
  "status": "succeeded",
  "amount": 10000,
  "processor_used": "stripe",
  "processing_time_ms": 342,
  "attempts": 1
}
\`\`\`

---

## Operations & Analytics

### Real-Time Dashboard

\`\`\`
Orchestration Dashboard

Success Rates (Last 24h):
  Overall:           98.7%
  Stripe:            98.9%
  Adyen:             98.5%
  Checkout.com:      98.2%

Performance:
  Avg Response Time: 285ms
  P95 Response Time: 450ms
  P99 Response Time: 890ms

Routing Distribution:
  Stripe:            72.3% (45,234 txns)
  Adyen:             18.9% (11,823 txns)
  Checkout.com:       8.8% (5,512 txns)

Cost Savings:
  Total Processed:   $3,450,000
  Total Fees:        $78,450
  Avg Fee Rate:      2.27%
  Est. Savings:      $12,300 vs single processor
  
Failover Stats:
  Failover Events:   23
  Success After:     22 (95.7%)
  Cascade to 2nd:    18
  Cascade to 3rd:    5
\`\`\`

### Analytics API

\`\`\`javascript
// Get success rates by processor
const stats = await orchestration.analytics.getSuccessRates({
  timeframe: 'last_7_days',
  group_by: 'processor'
});

// Get cost analysis
const costs = await orchestration.analytics.getCostAnalysis({
  timeframe: 'last_month',
  breakdown: 'processor'
});

// Get routing decisions
const routing = await orchestration.analytics.getRoutingDecisions({
  timeframe: 'today',
  include_reasoning: true
});
\`\`\`

---

## Conclusion

Payment Orchestration is essential for modern payment operations, delivering higher success rates, lower costs, and better resilience.

**Key Takeaways:**

1. **Increase Revenue:** 2-5% higher success rates
2. **Reduce Costs:** 10-30% savings on processing fees
3. **Improve Reliability:** 99.99% uptime with automatic failover
4. **Optimize Performance:** Route based on speed and geography
5. **Business Intelligence:** Deep analytics on payment performance

**Get Started:**

- Docs: https://docs.fts.money/orchestration
- Support: orchestration@fts.money
- Status: https://status.fts.money/orchestration

---

**Document Information**

- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Status:** Active
- **Classification:** Technical
- **Owner:** Orchestration Team
- **Contact:** orchestration@fts.money

© 2026 FTS.Money. All rights reserved.`;

export default OrchestrationDoc;