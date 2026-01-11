const ProductManagementSOPs = `# Product Management & Development SOPs
## Product Lifecycle, Roadmap Planning & Release Management

**Document Classification:** Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Chief Product Officer (CPO)

---

## SOP-PD-001: Product Development Lifecycle

### Agile Sprint Methodology

**2-Week Sprint Cycle:**

\`\`\`mermaid
gantt
    title 2-Week Sprint Cycle
    dateFormat YYYY-MM-DD
    
    section Sprint Planning
    Sprint Planning Meeting (4h)     :p1, 2026-01-13, 1d
    
    section Development (Week 1)
    Development & Daily Standups     :d1, 2026-01-14, 5d
    
    section Development (Week 2)
    Continued Development            :d2, 2026-01-20, 4d
    Code Freeze                      :milestone, 2026-01-23, 0d
    
    section Testing & Review
    QA Testing                       :t1, 2026-01-24, 2d
    Sprint Review Demo               :r1, 2026-01-26, 1d
    Sprint Retrospective             :r2, 2026-01-26, 1d
    
    section Deployment
    Deploy to Production             :milestone, 2026-01-27, 0d
\`\`\`

### Feature Prioritization Framework (RICE)

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| Multi-currency support | 80% customers | 3 (high) | 90% | 8 weeks | 27 | P0 |
| White-label UI customization | 60% | 3 | 80% | 6 weeks | 24 | P0 |
| Advanced fraud rules | 100% | 2 (medium) | 100% | 4 weeks | 50 | P0 |

**Scoring:**
- Reach: % of customers affected
- Impact: 3=high, 2=medium, 1=low
- Confidence: % certain about estimates
- Effort: Person-weeks required
- **RICE Score = (Reach × Impact × Confidence) / Effort**

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026

© 2026 FTS.Money.
`;

export default ProductManagementSOPs;