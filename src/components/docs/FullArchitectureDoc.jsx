export const FULL_ARCHITECTURE_DOC = `# PSP Platform - Production Architecture Design

**Version:** 1.1  
**Date:** January 23, 2026  
**Status:** Production Ready

---

## Executive Summary

This document outlines the production architecture for a PCI-DSS Level 1 compliant Payment Service Provider (PSP) platform capable of handling 1,000+ transactions per second (TPS) with high availability and scalability.

**Key Architecture Decisions:**
- **Hybrid Approach**: Base44 for admin/backoffice, AWS for payment processing
- **Language**: Go (Fiber framework) for payment processing
- **Database**: PostgreSQL (RDS) with future Citus sharding capability
- **Message Queue**: AWS SQS for async processing
- **Cache**: Redis Cluster (ElastiCache)
- **Orchestration**: AWS ECS with Fargate
- **Security**: Cloudflare WAF + DDoS protection

---

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE WAF/CDN                        │
│                    (DDoS Protection, Rate Limiting)              │
└────────────────┬────────────────────────┬───────────────────────┘
                 │                        │
                 ▼                        ▼
        ┌────────────────┐       ┌────────────────┐
        │  Base44 Portal │       │   Merchant     │
        │  (Admin/Staff) │       │   Portal       │
        └────────┬───────┘       └────────┬───────┘
                 │                        │
                 │                        │
                 ▼                        ▼
        ┌─────────────────────────────────────────┐
        │         AWS Application Load Balancer    │
        │              (ALB with SSL)               │
        └──────────────────┬──────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │   ECS    │   │   ECS    │   │   ECS    │
    │  Task 1  │   │  Task 2  │   │  Task 3  │
    │ (Go/Fiber)   │ (Go/Fiber)   │ (Go/Fiber)│
    └─────┬────┘   └─────┬────┘   └─────┬────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │   SQS    │   │  Redis   │   │    RDS   │
    │  Queue   │   │ Cluster  │   │PostgreSQL│
    │          │   │ (Cache)  │   │          │
    └─────┬────┘   └──────────┘   └─────┬────┘
          │                              │
          ▼                              ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Transaction     │      │   Transaction    │
    │  Processors      │      │   Database       │
    │  (Workers)       │      │  (PCI Scope)     │
    └──────────────────┘      └──────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Operational DB  │
                              │  (Non-PCI Scope) │
                              └──────────────────┘
\`\`\`

---

## Component Architecture

### 1. Frontend Layer

#### Base44 Admin Portal (Non-PCI Scope)
- **Purpose**: Staff administration, reporting, configuration
- **Technology**: React + Base44 platform
- **Features**:
  - Merchant onboarding & management
  - User management
  - Analytics & reporting
  - System configuration
  - Audit logs
  - Settlement management

#### Merchant Portal (Non-PCI Scope)
- **Purpose**: Merchant self-service
- **Technology**: React + Base44 platform
- **Features**:
  - Transaction history
  - Dashboard analytics
  - Settings management
  - API credentials
  - Dispute management

### 2. API Gateway Layer

#### Cloudflare
- **DDoS Protection**: Layer 3-7 protection
- **WAF Rules**: 
  - SQL injection prevention
  - XSS protection
  - Rate limiting (per IP, per merchant)
- **SSL/TLS Termination**: Full (strict) mode
- **Caching**: Static assets only
- **Geographic Restrictions**: Configurable by region
- **Cost**: ~$200/mo (Pro plan)

#### AWS Application Load Balancer (ALB)
- **SSL Certificates**: AWS Certificate Manager
- **Health Checks**: \`/health\` endpoint every 30s
- **Connection Draining**: 300s timeout
- **Sticky Sessions**: Disabled (stateless)
- **Target Groups**: 
  - Payment API (port 8080)
  - Webhook receivers (port 8081)

### 3. Payment Processing Engine (PCI Scope)

#### Go Application (Fiber Framework)

**Services:**
1. **Payment API Service** (\`/api/v1/*\`)
   - Transaction processing
   - Authorization & capture
   - Refunds & voids
   - 3DS authentication
   - Tokenization

2. **Webhook Service** (\`/webhooks/*\`)
   - Provider callbacks
   - Bank notifications
   - Exchange updates

3. **Orchestration Service** (Internal)
   - Smart routing engine
   - MID selection
   - Failover logic
   - Load balancing

**Performance Targets:**
- Latency: p95 < 100ms, p99 < 200ms
- Throughput: 5,000 TPS per instance
- Error Rate: < 0.1%
- Uptime: 99.95%

**ECS Configuration:**
\`\`\`yaml
Cluster: psp-production
Service: payment-processor
Task Definition:
  CPU: 2048 (2 vCPU)
  Memory: 4096 (4 GB)
  Image: payment-processor:latest
  Port: 8080
  Health Check: /health
  
Scaling Policy:
  Min Tasks: 4
  Max Tasks: 20
  Target CPU: 70%
  Target Memory: 80%
\`\`\`

---

## Cost Breakdown (Monthly)

| Component | Specification | Cost |
|-----------|--------------|------|
| **ECS Tasks** | 4x c6g.xlarge (24/7) | $400 |
| **RDS Transaction DB** | db.r6g.2xlarge + Multi-AZ | $600 |
| **RDS Operational DB** | db.r6g.xlarge + Read Replica | $350 |
| **ElastiCache Redis** | 4-node cluster (r6g.xlarge) | $200 |
| **SQS** | 10M requests/mo | $50 |
| **ALB** | 2 load balancers | $50 |
| **Data Transfer** | 5TB outbound | $450 |
| **CloudWatch** | Logs + Metrics | $100 |
| **Cloudflare Pro** | WAF + DDoS | $200 |
| **Backups & Storage** | S3 snapshots | $100 |
| **Total** |  | **~$2,500/mo** |

**At 10K TPS:** ~$5,000/mo  
**At 50K TPS:** ~$12,000/mo (with Citus sharding)

---

## Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React + Base44 | Rapid development, built-in auth |
| **API Gateway** | Cloudflare + ALB | DDoS protection, SSL termination |
| **Backend** | Go + Fiber | Low latency, high concurrency |
| **Database** | PostgreSQL (RDS) | ACID compliance, proven scale |
| **Cache** | Redis Cluster | Sub-ms latency, rate limiting |
| **Queue** | AWS SQS | Managed, reliable, FIFO support |
| **Orchestration** | ECS + Fargate | Easier than EKS, auto-scaling |
| **Monitoring** | CloudWatch + PagerDuty | Native AWS integration |
| **Security** | AWS KMS + WAF | Encryption, compliance |

---

## Security Considerations

### PCI-DSS Compliance

**PCI Scope (Cardholder Data Environment):**
- ECS Payment Processor
- Transaction Database (RDS)
- Redis Cache (if storing tokens)
- ALB (SSL termination)

**Out of PCI Scope:**
- Base44 Admin Portal (no card data)
- Merchant Portal (tokenized references only)
- Operational Database
- SQS queues (encrypted messages)

### Security Controls

**Network Segmentation:**
- Private subnets for all PCI components
- No direct internet access
- NAT Gateway for outbound only

**Encryption:**
- TLS 1.3 for all data in transit
- AES-256 for data at rest (RDS, S3, SQS)
- AWS KMS for key management

**Access Control:**
- IAM roles (no access keys)
- MFA for all admin access
- AWS SSM Session Manager (no SSH keys)

---

## LEI/vLEI Identity & Transaction Signing Architecture

### Overview

The Legal Entity Identifier (LEI) and verifiable LEI (vLEI) infrastructure provides cryptographic identity verification and transaction signing capabilities across the entire platform. This enables regulatory compliance, non-repudiation, and complete audit trails for all financial transactions.

### LEI/vLEI Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GLEIF GLOBAL REGISTRY                              │
│                    (authoritative LEI data source)                           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ API Integration
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FTS.MONEY LEI VERIFICATION SERVICE                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  LEI Lookup     │  │  Status Check   │  │  Hierarchy      │              │
│  │  Service        │  │  Service        │  │  Resolver       │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│           └────────────────────┼────────────────────┘                        │
│                                ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    LEI CACHE (Redis Cluster)                         │    │
│  │              TTL: 24 hours | Refresh: On-demand                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  PSP TENANT   │         │  PSP TENANT   │         │  PSP TENANT   │
│  LEI: 5493..  │         │  LEI: 2138..  │         │  LEI: 9845..  │
│               │         │               │         │               │
│  ┌─────────┐  │         │  ┌─────────┐  │         │  ┌─────────┐  │
│  │ vLEI    │  │         │  │ vLEI    │  │         │  │ vLEI    │  │
│  │ Wallet  │  │         │  │ Wallet  │  │         │  │ Wallet  │  │
│  └────┬────┘  │         │  └────┬────┘  │         │  └────┬────┘  │
│       │       │         │       │       │         │       │       │
│       ▼       │         │       ▼       │         │       ▼       │
│  ┌─────────┐  │         │  ┌─────────┐  │         │  ┌─────────┐  │
│  │Merchants│  │         │  │Merchants│  │         │  │Merchants│  │
│  │(w/ LEI) │  │         │  │(w/ LEI) │  │         │  │(w/ LEI) │  │
│  └─────────┘  │         │  └─────────┘  │         │  └─────────┘  │
└───────────────┘         └───────────────┘         └───────────────┘
\`\`\`

### vLEI Credential Hierarchy

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         vLEI TRUST HIERARCHY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    Level 0: GLEIF Root of Trust                                             │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  GLEIF Root Credential                                          │      │
│    │  - Global authority for LEI system                              │      │
│    │  - Issues credentials to Qualified vLEI Issuers (QVIs)          │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                    │                                         │
│                                    ▼                                         │
│    Level 1: Qualified vLEI Issuer (QVI)                                     │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  QVI Credential                                                 │      │
│    │  - Authorized to issue vLEI credentials                         │      │
│    │  - Performs identity verification                               │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                    │                                         │
│                                    ▼                                         │
│    Level 2: Legal Entity (FTS.Money Platform)                               │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │  FTS.Money Platform vLEI                                        │      │
│    │  - LEI: [Platform LEI]                                          │      │
│    │  - Parent credential for all PSP tenants                        │      │
│    │  - Signs PSP onboarding credentials                             │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                          │                   │                               │
│                          ▼                   ▼                               │
│    Level 3: PSP Tenant Credentials                                          │
│    ┌─────────────────────────┐    ┌─────────────────────────┐               │
│    │  PSP Alpha vLEI         │    │  PSP Beta vLEI          │               │
│    │  LEI: 549300ABC...      │    │  LEI: 213800XYZ...      │               │
│    │  Parent: FTS Platform   │    │  Parent: FTS Platform   │               │
│    └────────────┬────────────┘    └────────────┬────────────┘               │
│                 │                              │                              │
│                 ▼                              ▼                              │
│    Level 4: Merchant Credentials                                             │
│    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │
│    │ Merchant 1    │  │ Merchant 2    │  │ Merchant 3    │                  │
│    │ LEI: 9845...  │  │ LEI: 7291...  │  │ LEI: 3847...  │                  │
│    │ Parent: PSP α │  │ Parent: PSP α │  │ Parent: PSP β │                  │
│    └───────────────┘  └───────────────┘  └───────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### Transaction Signing Flow

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRANSACTION SIGNING WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Transaction Initiated                                                    │
│     ┌─────────────┐                                                         │
│     │  Merchant   │ ──► POST /payments/process                              │
│     │  System     │     { amount, currency, card_token, ... }               │
│     └─────────────┘                                                         │
│            │                                                                 │
│            ▼                                                                 │
│  2. LEI Verification                                                         │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  LEI Verification Service                                        │     │
│     │  ┌───────────────────────────────────────────────────────────┐  │     │
│     │  │ • Check merchant LEI status (verified/grace_period)       │  │     │
│     │  │ • Check PSP LEI status                                    │  │     │
│     │  │ • Validate credential chain integrity                     │  │     │
│     │  │ • Cache lookup (Redis) → GLEIF fallback                   │  │     │
│     │  └───────────────────────────────────────────────────────────┘  │     │
│     └─────────────────────────────────────────────────────────────────┘     │
│            │                                                                 │
│            ▼                                                                 │
│  3. Signature Generation                                                     │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  vLEI Signing Service                                            │     │
│     │  ┌───────────────────────────────────────────────────────────┐  │     │
│     │  │ Algorithm: EdDSA (Ed25519) or ECDSA-P256/P384             │  │     │
│     │  │                                                           │  │     │
│     │  │ Signed Payload:                                           │  │     │
│     │  │ {                                                         │  │     │
│     │  │   transaction_id: "TXN-123456",                           │  │     │
│     │  │   merchant_lei: "549300ABC123456789XY",                   │  │     │
│     │  │   psp_lei: "213800XYZ987654321AB",                        │  │     │
│     │  │   amount: 150.00,                                         │  │     │
│     │  │   currency: "USD",                                        │  │     │
│     │  │   timestamp: "2026-01-23T12:00:00Z"                       │  │     │
│     │  │ }                                                         │  │     │
│     │  │                                                           │  │     │
│     │  │ Output: Base64 signature + signing timestamp              │  │     │
│     │  └───────────────────────────────────────────────────────────┘  │     │
│     └─────────────────────────────────────────────────────────────────┘     │
│            │                                                                 │
│            ▼                                                                 │
│  4. Transaction Record with Signature                                        │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  Transaction Database (PCI Scope)                                │     │
│     │  ┌───────────────────────────────────────────────────────────┐  │     │
│     │  │ transaction_id: "TXN-123456"                              │  │     │
│     │  │ merchant_lei: "549300ABC123456789XY"                      │  │     │
│     │  │ psp_lei: "213800XYZ987654321AB"                           │  │     │
│     │  │ credential_chain: ["GLEIF", "QVI", "FTS", "PSP", "Merch"] │  │     │
│     │  │ vlei_signature: "MEUCIQDx4r9y..."                         │  │     │
│     │  │ signature_algorithm: "EdDSA"                              │  │     │
│     │  │ signed_at: "2026-01-23T12:00:00.123Z"                     │  │     │
│     │  │ chain_validated: true                                     │  │     │
│     │  │ chain_validation_timestamp: "2026-01-23T12:00:00.100Z"    │  │     │
│     │  └───────────────────────────────────────────────────────────┘  │     │
│     └─────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### LEI Database Schema

| Table | Column | Type | Description |
|-------|--------|------|-------------|
| **provisioned_psp** | lei | VARCHAR(20) | PSP Legal Entity Identifier |
| | vlei_credential | TEXT | JSON-LD verifiable credential |
| | parent_lei | VARCHAR(20) | FTS Platform LEI reference |
| | lei_status | ENUM | pending, verified, grace_period, expired |
| | lei_verified_date | TIMESTAMP | Last GLEIF verification |
| | vlei_issued_date | TIMESTAMP | Credential issuance date |
| | grace_period_start | TIMESTAMP | Grace period start |
| | grace_period_end | TIMESTAMP | Grace period expiration |
| **merchants** | lei | VARCHAR(20) | Merchant LEI |
| | vlei | TEXT | Merchant vLEI credential |
| | lei_status | ENUM | Status enum |
| | lei_verified_date | DATE | Verification date |
| **transactions** | psp_lei | VARCHAR(20) | PSP LEI for transaction |
| | merchant_lei | VARCHAR(20) | Merchant LEI |
| | customer_lei | VARCHAR(20) | Customer LEI (if applicable) |
| | credential_chain | JSONB | Full trust chain array |
| | vlei_signature | TEXT | Digital signature |
| | signature_algorithm | ENUM | EdDSA, ECDSA-P256, ECDSA-P384 |
| | signed_at | TIMESTAMP | Signing timestamp |
| | chain_validated | BOOLEAN | Validation status |
| | chain_validation_timestamp | TIMESTAMP | When validated |

### LEI Verification API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/lei/verify/{lei}\` | GET | Verify LEI against GLEIF |
| \`/lei/lookup/{lei}\` | GET | Get full LEI entity details |
| \`/lei/hierarchy/{lei}\` | GET | Get parent/child relationships |
| \`/vlei/issue\` | POST | Issue vLEI credential |
| \`/vlei/sign\` | POST | Sign transaction with vLEI |
| \`/vlei/validate\` | POST | Validate credential chain |
| \`/vlei/revoke/{credential_id}\` | DELETE | Revoke vLEI credential |

### Grace Period Management

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LEI LIFECYCLE STATE MACHINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    Verification    ┌──────────┐                              │
│   │ PENDING  │ ─────────────────► │ VERIFIED │                              │
│   └──────────┘                    └────┬─────┘                              │
│        ▲                               │                                     │
│        │                               │ LEI Expires                         │
│        │                               ▼                                     │
│        │                         ┌─────────────┐                            │
│        │ Renewal                 │ GRACE_PERIOD│ ◄── Configurable           │
│        │                         │ (30-90 days)│     (default: 30 days)     │
│        │                         └──────┬──────┘                            │
│        │                                │                                    │
│        └────────────────────────────────┤                                    │
│                                         │ Grace Period Expires               │
│                                         ▼                                    │
│                                   ┌──────────┐                              │
│                                   │ EXPIRED  │ ──► Transactions Blocked     │
│                                   └──────────┘                              │
│                                                                              │
│   Grace Period Actions:                                                      │
│   • Warning emails at 30, 14, 7, 1 days before expiration                   │
│   • Dashboard alerts for PSP admins                                          │
│   • API responses include expiration warnings                                │
│   • Transactions continue but flagged in audit logs                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### Regulatory Compliance Matrix

| Regulation | Jurisdiction | LEI Requirement | Implementation |
|------------|--------------|-----------------|----------------|
| **MiFID II/MiFIR** | EU | Mandatory for investment firms | Auto-validation on merchant onboarding |
| **EMIR** | EU | All derivative counterparties | Stored in transaction records |
| **Dodd-Frank** | USA | CFTC swap reporting | Included in ISO 20022 messages |
| **SFTR** | EU | Securities financing | Credential chain in settlement |
| **CSDR** | EU | Central securities depositories | RWA tokenization compliance |
| **ISO 20022** | Global | LEI in payment messages | Native field mapping |
| **DORA** | EU | Digital operational resilience | Audit trail with signatures |
| **Travel Rule** | Global | FATF crypto requirements | vLEI for VASP identification |
| **eIDAS 2.0** | EU | Digital identity framework | vLEI as qualified credential |

### Performance Considerations

| Operation | Target Latency | Caching Strategy |
|-----------|---------------|------------------|
| LEI Lookup (cached) | < 5ms | Redis, 24h TTL |
| LEI Lookup (GLEIF) | < 500ms | Async refresh |
| vLEI Signature | < 50ms | HSM-backed keys |
| Chain Validation | < 100ms | Cached credentials |
| Full Verification | < 200ms | Combined operations |

### Security Controls for LEI/vLEI

| Control | Implementation |
|---------|----------------|
| **Key Storage** | AWS KMS / HSM for signing keys |
| **Key Rotation** | Automated 90-day rotation |
| **Credential Revocation** | Real-time CRL checking |
| **Audit Logging** | All LEI operations logged |
| **Access Control** | Role-based vLEI management |
| **Signature Verification** | Multi-party validation |

---

## Disaster Recovery

### Backup Strategy

**RDS Automated Backups:**
- Daily snapshots (30-day retention)
- Point-in-time recovery (up to 5 minutes)
- Cross-region backup to us-west-2

### Recovery Objectives

- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 5 minutes
- **Availability**: 99.95% uptime SLA

---

## Monitoring & Observability

### Metrics (CloudWatch)

**Application Metrics:**
\`\`\`
- transaction.count (by status, merchant)
- transaction.latency (p50, p95, p99)
- transaction.errors (by error_code)
- routing.decision_time
- cache.hit_rate
- api.requests_per_second
\`\`\`

**Infrastructure Metrics:**
\`\`\`
- ecs.cpu_utilization
- ecs.memory_utilization
- rds.connections
- rds.read_iops
- redis.cache_hits
- sqs.messages_visible
\`\`\`

---

## Conclusion

This architecture provides:
✅ PCI-DSS Level 1 compliance readiness  
✅ 5,000+ TPS capacity with room to scale  
✅ 99.95% uptime SLA  
✅ Sub-200ms p99 latency  
✅ Cost-effective (~$2,500/mo starting)  
✅ Clear migration path from Base44  
✅ LEI/vLEI identity infrastructure with GLEIF integration  
✅ Cryptographic transaction signing for regulatory compliance  
✅ Complete credential chain validation and audit trails  

**Next Steps:** See MigrationPlan.md for implementation roadmap.

---

**Document Maintained By:** Platform Engineering Team  
**Last Updated:** January 23, 2026  
**Review Cycle:** Quarterly
`;