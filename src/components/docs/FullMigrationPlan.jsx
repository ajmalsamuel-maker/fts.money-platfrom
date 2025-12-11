export const FULL_MIGRATION_PLAN = `# PSP Platform - Migration Plan

**Version:** 1.0  
**Start Date:** December 11, 2025  
**Estimated Duration:** 4-6 months  
**Status:** Planning Phase

---

## Overview

This document outlines the step-by-step migration plan from Base44-only architecture to a hybrid production-ready PSP platform with PCI-DSS Level 1 compliance.

**Migration Strategy:** Phased approach with parallel systems during transition

---

## Phase 1: Foundation & Database Setup (Weeks 1-2)

### Week 1: AWS Infrastructure Setup

**Tasks:**

1. **AWS Account Setup**
   - [ ] Create AWS Organization
   - [ ] Set up production account
   - [ ] Set up staging account
   - [ ] Configure billing alerts
   - [ ] Enable CloudTrail in all regions

2. **VPC & Network Configuration**
   - [ ] Create VPC (10.0.0.0/16)
   - [ ] Create subnets (public, private-app, private-data)
   - [ ] Set up NAT Gateways (2x for HA)
   - [ ] Configure Route Tables
   - [ ] Set up VPC Flow Logs

3. **Security Groups**
   - [ ] ALB Security Group (443 from Cloudflare)
   - [ ] ECS Security Group (8080 from ALB)
   - [ ] RDS Security Group (5432 from ECS only)
   - [ ] Redis Security Group (6379 from ECS only)

---

### Week 2: Database Infrastructure

**Tasks:**

1. **Export Base44 Schema**
   - [ ] Run schema export script
   - [ ] Document all entities and relationships
   - [ ] Identify PCI-scope vs non-PCI tables

2. **RDS PostgreSQL - Transaction DB (PCI Scope)**
   - [ ] Create RDS instance (db.r6g.2xlarge)
   - [ ] Enable Multi-AZ deployment
   - [ ] Configure encryption (KMS key)
   - [ ] Apply schema (transactions, saved_cards, travel_rule_data)
   - [ ] Set up automated backups (30-day retention)

3. **RDS PostgreSQL - Operational DB (Non-PCI Scope)**
   - [ ] Create RDS instance (db.r6g.xlarge)
   - [ ] Create read replica for reporting
   - [ ] Apply schema (merchants, merchant_mids, bank_mids, etc.)

4. **Update Base44 Secrets**
   - [ ] Add \`TRANSACTION_DB_URL\` secret
   - [ ] Add \`OPERATIONAL_DB_URL\` secret
   - [ ] Test connection from Base44 functions

---

## Phase 2: Payment Processor Development (Weeks 3-6)

### Week 3: Go Project Setup

**Tasks:**

1. **Initialize Go Project**
   \`\`\`bash
   mkdir payment-processor
   cd payment-processor
   go mod init github.com/yourorg/payment-processor
   \`\`\`

2. **Project Structure**
   \`\`\`
   payment-processor/
   ├── cmd/
   │   ├── api/          # Main API server
   │   ├── worker/       # SQS workers
   │   └── migrator/     # DB migrations
   ├── internal/
   │   ├── api/          # HTTP handlers
   │   ├── models/       # Data models
   │   ├── repository/   # Database layer
   │   ├── service/      # Business logic
   │   ├── queue/        # SQS integration
   │   ├── cache/        # Redis integration
   │   └── routing/      # Payment routing engine
   ├── Dockerfile
   └── docker-compose.yml
   \`\`\`

3. **Install Dependencies**
   \`\`\`bash
   go get github.com/gofiber/fiber/v2
   go get github.com/lib/pq
   go get github.com/go-redis/redis/v8
   go get github.com/aws/aws-sdk-go-v2
   \`\`\`

---

### Week 4: Core Payment APIs

**Tasks:**

1. **Transaction Processing Endpoints**
   - [ ] POST \`/api/v1/transactions/authorize\`
   - [ ] POST \`/api/v1/transactions/capture\`
   - [ ] POST \`/api/v1/transactions/sale\`
   - [ ] POST \`/api/v1/transactions/void\`
   - [ ] POST \`/api/v1/transactions/refund\`
   - [ ] GET \`/api/v1/transactions/:id\`

2. **Authentication Middleware**
   - [ ] HMAC signature verification
   - [ ] Timestamp validation (prevent replay)
   - [ ] Merchant loading from cache/DB

3. **Testing**
   - [ ] Unit tests (80%+ coverage)
   - [ ] Integration tests with test DB
   - [ ] Load testing (k6 scripts)

---

### Week 5: Payment Routing Engine

**Tasks:**

1. **Routing Logic**
   - [ ] Rule-based routing
   - [ ] Load balancing (round-robin, weighted)
   - [ ] Failover logic (3 retries)
   - [ ] Circuit breaker pattern

2. **Cache Strategy**
   - [ ] Cache routing rules (5-minute TTL)
   - [ ] Cache MID configurations
   - [ ] Invalidate on updates

3. **Provider Connectors**
   - [ ] Abstract connector interface
   - [ ] Mock provider for testing
   - [ ] Stripe connector (example)

---

### Week 6: Queue & Workers

**Tasks:**

1. **SQS Integration**
   - [ ] Create SQS queues (Terraform)
     - \`psp-transactions.fifo\`
     - \`psp-transactions-dlq.fifo\`
     - \`psp-settlements\`
     - \`psp-notifications\`

2. **Message Producers**
   - [ ] Async transaction processing
   - [ ] Message serialization

3. **Message Consumers (Workers)**
   - [ ] Transaction processor worker
   - [ ] Settlement worker
   - [ ] Notification worker

---

## Phase 3: Infrastructure Deployment (Weeks 7-8)

### Week 7: ECS Setup

**Tasks:**

1. **ElastiCache Redis**
   - [ ] Create Redis cluster (4 nodes, r6g.xlarge)
   - [ ] Enable cluster mode
   - [ ] Configure encryption

2. **Application Load Balancer**
   - [ ] Create ALB
   - [ ] Configure SSL certificate (ACM)
   - [ ] Set up target groups
   - [ ] Configure health checks

3. **ECR (Container Registry)**
   - [ ] Create ECR repositories
   - [ ] Enable image scanning
   - [ ] Push Docker images

---

### Week 8: ECS Deployment

**Tasks:**

1. **ECS Cluster**
   - [ ] Create ECS cluster
   - [ ] Configure CloudWatch Container Insights

2. **Task Definitions**
   - [ ] Define payment-processor task
   - [ ] Configure CPU/memory (2048/4096)
   - [ ] Set up environment variables
   - [ ] Add secrets from Secrets Manager

3. **ECS Service**
   - [ ] Create service (4 tasks initially)
   - [ ] Attach to ALB target group
   - [ ] Configure auto-scaling (min 4, max 20)

---

## Phase 4: Base44 Integration (Weeks 9-10)

### Week 9: API Integration

**Tasks:**

1. **Create Base44 Backend Function**
   \`\`\`javascript
   // functions/paymentProxy.js
   import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

   Deno.serve(async (req) => {
       const base44 = createClientFromRequest(req);
       const user = await base44.auth.me();
       
       if (!user) {
           return Response.json({ error: 'Unauthorized' }, { status: 401 });
       }

       const body = await req.json();
       
       // Forward to payment processor
       const response = await fetch(Deno.env.get("PAYMENT_API_URL") + '/api/v1/transactions', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'X-API-Key': Deno.env.get("PAYMENT_API_KEY"),
               'X-Signature': generateHMAC(body)
           },
           body: JSON.stringify(body)
       });

       return Response.json(await response.json());
   });
   \`\`\`

2. **Add Secrets to Base44**
   - [ ] \`PAYMENT_API_URL\` (ALB URL)
   - [ ] \`PAYMENT_API_KEY\`
   - [ ] \`PAYMENT_API_SECRET\` (for HMAC)

3. **Update Frontend Components**
   - [ ] Update VirtualTerminal to use new function
   - [ ] Add error handling for API failures

---

### Week 10: Data Migration

**Tasks:**

1. **Historical Data Migration**
   - [ ] Export transactions from Base44
   - [ ] Transform to new schema
   - [ ] Bulk insert to RDS (transaction DB)
   - [ ] Verify data integrity

2. **Dual-Write Strategy**
   - [ ] Write to both Base44 entities AND external DB
   - [ ] Set up webhooks for status updates

3. **Testing**
   - [ ] End-to-end payment flow testing
   - [ ] Data consistency checks
   - [ ] Performance testing

---

## Phase 5: Cloudflare & Security (Weeks 11-12)

### Week 11: Cloudflare Setup

**Tasks:**

1. **Cloudflare Account**
   - [ ] Sign up for Cloudflare Pro ($200/mo)
   - [ ] Add domain to Cloudflare
   - [ ] Update DNS to Cloudflare nameservers

2. **DNS Configuration**
   \`\`\`
   api.yourpsp.com    → CNAME → ALB DNS name (proxied)
   portal.yourpsp.com → CNAME → Base44 domain (proxied)
   \`\`\`

3. **WAF Rules**
   - [ ] Block common attack patterns (SQL injection, XSS)
   - [ ] Rate limiting rules (1000 req/min per IP)
   - [ ] Challenge requests from high-risk countries

4. **DDoS Protection**
   - [ ] Enable DDoS protection
   - [ ] Configure Under Attack mode settings

---

### Week 12: Security Hardening

**Tasks:**

1. **PCI Scope Documentation**
   - [ ] Network diagram with scope boundaries
   - [ ] Data flow diagrams
   - [ ] System component inventory

2. **Security Baseline**
   - [ ] Enable AWS GuardDuty
   - [ ] Enable AWS Security Hub
   - [ ] Enable AWS Config rules (PCI-DSS baseline)

3. **Access Control**
   - [ ] MFA required for all users
   - [ ] Remove all IAM access keys
   - [ ] Use IAM roles exclusively

4. **Encryption Validation**
   - [ ] Verify TLS 1.3 on ALB
   - [ ] Verify RDS encryption at rest
   - [ ] Verify Redis encryption

---

## Phase 6: Testing & Optimization (Weeks 13-14)

### Week 13: Load Testing

**Tasks:**

1. **Load Testing Infrastructure**
   - [ ] Set up k6 or Gatling
   - [ ] Create test scenarios:
     - Baseline: 1,000 TPS for 1 hour
     - Peak: 5,000 TPS for 15 minutes
     - Spike: 0 → 10,000 TPS in 1 minute

2. **Performance Analysis**
   - [ ] Identify bottlenecks
   - [ ] Database query optimization
   - [ ] Cache hit rate analysis

3. **Optimization**
   - [ ] Add database indexes
   - [ ] Optimize slow queries
   - [ ] Tune connection pools

---

### Week 14: Security Testing

**Tasks:**

1. **Penetration Testing**
   - [ ] Hire third-party pentesting firm
   - [ ] API security testing
   - [ ] SQL injection testing
   - [ ] Rate limiting validation

2. **PCI ASV Scan**
   - [ ] Schedule approved scanning vendor (ASV)
   - [ ] Run quarterly vulnerability scan
   - [ ] Remediate findings

---

## Phase 7: Go Live (Weeks 15-16)

### Week 15: Pre-Production Validation

**Tasks:**

1. **Staging Environment**
   - [ ] Mirror production setup
   - [ ] Deploy latest code
   - [ ] Run full test suite

2. **Monitoring Validation**
   - [ ] Verify all metrics are reporting
   - [ ] Test alerting (trigger test alerts)

3. **Failover Testing**
   - [ ] Simulate RDS failover
   - [ ] Test ECS task failure recovery

---

### Week 16: Production Launch

**Tasks:**

1. **Go-Live Checklist**
   - [ ] Final security review
   - [ ] Backup verification
   - [ ] Communication plan
   - [ ] Rollback plan documented

2. **Deployment**
   - [ ] Deploy to production (off-peak hours)
   - [ ] Blue-green deployment strategy
   - [ ] Monitor key metrics in real-time
   - [ ] Gradual traffic shift (10% → 50% → 100%)

3. **Post-Launch Monitoring (24/7 for 72 hours)**
   - [ ] Watch error rates
   - [ ] Monitor latency (p95, p99)
   - [ ] Check database performance

---

## Phase 8: PCI Certification (Weeks 17-24)

### Months 5-6: PCI DSS Audit

**Tasks:**

1. **Select QSA (Qualified Security Assessor)**
   - [ ] Research PCI QSA firms
   - [ ] Get quotes (expect $30K-$80K)
   - [ ] Sign engagement letter

2. **Pre-Assessment**
   - [ ] Self-assessment questionnaire (SAQ D)
   - [ ] Gap analysis
   - [ ] Remediation plan

3. **On-Site Assessment**
   - [ ] QSA interviews
   - [ ] Technical testing
   - [ ] Evidence review

4. **Attestation of Compliance (AOC)**
   - [ ] Receive AOC from QSA
   - [ ] Submit to acquiring banks

---

## Success Criteria

**Technical:**
- ✅ Payment API processing > 5,000 TPS
- ✅ p99 latency < 200ms
- ✅ Error rate < 0.1%
- ✅ 99.95% uptime

**Security:**
- ✅ PCI DSS Level 1 certified
- ✅ No critical vulnerabilities
- ✅ All data encrypted

---

## Budget Estimate

| Category | Cost |
|----------|------|
| AWS Infrastructure (6 months) | $15,000 |
| Cloudflare Pro (6 months) | $1,200 |
| PCI QSA Audit | $50,000 |
| Penetration Testing | $15,000 |
| Monitoring Tools | $3,000 |
| Training & Consulting | $10,000 |
| **Total** | **~$94,200** |

**Ongoing Monthly Costs:** ~$2,500 (infrastructure only)

---

## Rollback Plan

**If critical issues arise:**

1. **Immediate Rollback** (< 5 minutes)
   - Switch Cloudflare DNS back to Base44-only
   - Disable payment proxy function

2. **Partial Rollback** (< 30 minutes)
   - Route specific merchants back to Base44

---

**Document Status:** Living document, updated weekly during migration  
**Last Updated:** December 11, 2025
`;