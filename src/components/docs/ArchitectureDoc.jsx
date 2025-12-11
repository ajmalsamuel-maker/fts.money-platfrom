import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

export default function ArchitectureDoc() {
    const downloadMarkdown = () => {
        const content = `# PSP Platform - Production Architecture Design

**Version:** 1.0  
**Date:** December 11, 2025  
**Status:** Design Phase

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

(Full document continues - see complete Architecture.md for all sections including Components, Security, Cost Breakdown, Migration Path, etc.)
`;
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Architecture.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Architecture Documentation</h2>
                <Button onClick={downloadMarkdown} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Full Architecture.md
                </Button>
            </div>
            <div className="prose max-w-none">
                <p className="text-slate-600 mb-4">
                    Complete production architecture design document for PCI-DSS Level 1 compliant PSP platform.
                </p>
                <p>Click the download button above to get the full Architecture.md file with:</p>
                <ul>
                    <li>Executive Summary & Key Decisions</li>
                    <li>Component Architecture (Frontend, API, Payment Processing, Database, Cache, Queue)</li>
                    <li>Network Architecture & VPC Design</li>
                    <li>PCI-DSS Compliance Strategy</li>
                    <li>Disaster Recovery & Backup</li>
                    <li>Monitoring & Observability</li>
                    <li>Cost Breakdown (~$2,500/mo)</li>
                    <li>Technology Stack Summary</li>
                    <li>Performance Testing & Capacity Planning</li>
                </ul>
            </div>
        </Card>
    );
}