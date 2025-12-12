export const ROLE_PERMISSIONS_DOC = `# PSP User Roles and Permissions

## Overview
This document outlines the role-based access control (RBAC) system for the Payment Service Provider (PSP) platform. Each role has specific access rights to different system modules and functionalities.

---

## Role Definitions

### 1. Administrator
**Full System Access**
- Complete control over all platform features
- User management and role assignment
- System configuration and settings
- Security and compliance management

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Transactions (View, Edit, Void, Refund)
- ✓ Merchants (Full CRUD)
- ✓ Gateways & Setup
- ✓ Orchestration & Routing
- ✓ Terminals Management
- ✓ Finance & Settlements
- ✓ Risk & Compliance
- ✓ System Configuration
- ✓ User Management
- ✓ Audit Logs
- ✓ Resources & Documentation

**Responsibilities:**
- Overall platform management
- User access control
- Security oversight
- System configuration
- Critical operations approval

---

### 2. Finance Manager
**Finance, Settlements, and Reporting**
- Financial operations and reconciliation
- Payout management and approval
- Settlement oversight
- Financial reporting

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Transactions (View only)
- ✓ Finance Section:
  - Balances & Settlements
  - Payout Orchestration
  - Fiat & Crypto Payouts
  - Payout Pricing
  - Reconciliation
  - Reports
  - Pricing & Rates
- ✓ Resources & Documentation

**Responsibilities:**
- Payout approval and processing
- Settlement monitoring
- Financial reconciliation
- Revenue and cost analysis
- Merchant pricing oversight
- Financial reporting

**Permissions:**
- View transactions and financial data
- Approve payouts
- Refund transactions
- Manage settlements
- Generate financial reports
- View merchant balances

---

### 3. Operations Manager
**Merchant and Transaction Operations**
- Day-to-day operational management
- Merchant support and onboarding
- Transaction monitoring
- Terminal management

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Transactions (View, Edit, Void, Refund)
- ✓ Merchants Section:
  - All Merchants
  - Merchant Analytics
  - Merchant Users
  - Merchant MIDs
  - Approvals
- ✓ Terminals (Physical & Virtual)
- ✓ Resources & Documentation

**Responsibilities:**
- Merchant onboarding and approval
- Transaction monitoring and support
- Merchant account management
- Terminal configuration
- Operational issue resolution
- Chargeback management

**Permissions:**
- View and edit transactions
- Void and refund transactions
- Create and manage merchants
- Approve merchant onboarding
- Manage merchant users
- Configure terminals

---

### 4. Compliance Officer
**Risk, Compliance, and Audit**
- Regulatory compliance monitoring
- Risk assessment and management
- AML/KYC oversight
- Audit log review

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Transactions (View only)
- ✓ Risk & Compliance Section:
  - Fraud Prevention
  - Fraud Monitoring
  - Compliance Dashboard
  - FATF/AML
- ✓ System Section:
  - User Management (View)
  - Audit Logs
- ✓ Resources & Documentation

**Responsibilities:**
- Compliance monitoring
- Fraud detection and prevention
- AML/KYC verification
- Suspicious activity reporting
- Audit trail review
- Regulatory reporting
- Risk assessment

**Permissions:**
- View all transactions
- Access fraud prevention tools
- View compliance reports
- Review audit logs
- Manage risk rules
- View user activities

---

### 5. Technical Manager
**System Configuration and Integration**
- Payment gateway integration
- System configuration
- API management
- Technical infrastructure

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Gateways & Setup:
  - Payment Gateways
  - Acquirers & Banks
  - Alternative Payment Methods
  - Crypto Exchanges
  - Blockchain Nodes
- ✓ Orchestration Section:
  - AI Smart Routing
  - Routing Rules
  - MID Routing
  - Bank MIDs
- ✓ System Section:
  - API Gateway
  - Security & PKI
  - ISO Standards
  - Database Tools
  - General Settings
- ✓ Resources & Documentation

**Responsibilities:**
- Gateway integration and configuration
- Payment routing optimization
- API management
- System performance monitoring
- Technical documentation
- Database management
- Security configuration

**Permissions:**
- Configure payment gateways
- Manage routing rules
- View and edit system settings
- API configuration
- Database access
- Technical troubleshooting

---

### 6. Editor
**Content Management and Analytics**
- Platform content management
- Analytics review
- Limited operational access

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Transactions (View only)
- ✓ Merchants (View only)
- ✓ Resources & Documentation

**Responsibilities:**
- Dashboard monitoring
- Report generation
- Content updates
- Analytics review

**Permissions:**
- View transactions
- View merchants
- Access analytics
- Generate reports

---

### 7. Viewer
**Read-Only Access**
- Monitoring and observation only
- No modification capabilities

**Accessible Modules:**
- ✓ Overview & Dashboard
- ✓ Resources & Documentation

**Responsibilities:**
- System monitoring
- Report viewing
- Information access

**Permissions:**
- View dashboard metrics
- Access documentation

---

## Permission Matrix

| Permission | Admin | Finance | Operations | Compliance | Technical | Editor | Viewer |
|------------|-------|---------|------------|------------|-----------|--------|--------|
| **Dashboard & Analytics** |
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Analytics | ✓ | ✓ | ✓ | - | - | ✓ | - |
| **Transactions** |
| View Transactions | ✓ | ✓ | ✓ | ✓ | - | ✓ | - |
| Edit Transactions | ✓ | - | ✓ | - | - | - | - |
| Void Transactions | ✓ | - | ✓ | - | - | - | - |
| Refund Transactions | ✓ | ✓ | ✓ | - | - | - | - |
| **Merchants** |
| View Merchants | ✓ | - | ✓ | - | - | ✓ | - |
| Create Merchants | ✓ | - | ✓ | - | - | - | - |
| Edit Merchants | ✓ | - | ✓ | - | - | - | - |
| Delete Merchants | ✓ | - | - | - | - | - | - |
| **Finance** |
| View Balances | ✓ | ✓ | - | - | - | - | - |
| View Reports | ✓ | ✓ | - | - | - | ✓ | - |
| Manage Settlements | ✓ | ✓ | - | - | - | - | - |
| View Payouts | ✓ | ✓ | - | - | - | - | - |
| Approve Payouts | ✓ | ✓ | - | - | - | - | - |
| **Risk & Compliance** |
| View Fraud Prevention | ✓ | - | - | ✓ | - | - | - |
| Manage Risk Rules | ✓ | - | - | ✓ | - | - | - |
| View Compliance | ✓ | - | - | ✓ | - | - | - |
| **System Configuration** |
| View Settings | ✓ | - | - | - | ✓ | - | - |
| Edit Settings | ✓ | - | - | - | ✓ | - | - |
| View Routing | ✓ | - | - | - | ✓ | - | - |
| **User Management** |
| View Users | ✓ | - | - | ✓ | - | - | - |
| Create Users | ✓ | - | - | - | - | - | - |
| Edit Users | ✓ | - | - | - | - | - | - |
| Delete Users | ✓ | - | - | - | - | - | - |
| View Audit Logs | ✓ | - | - | ✓ | - | - | - |

---

## Role Assignment Guidelines

### When to assign Administrator:
- C-level executives
- IT administrators
- Platform owners
- Users requiring full system access

### When to assign Finance Manager:
- CFO and finance team
- Accounting managers
- Treasury staff
- Settlement analysts

### When to assign Operations Manager:
- Operations directors
- Merchant support managers
- Customer service leads
- Transaction monitoring staff

### When to assign Compliance Officer:
- Chief Compliance Officer
- AML specialists
- Risk analysts
- Compliance auditors
- Legal team members

### When to assign Technical Manager:
- CTO and tech leads
- DevOps engineers
- Integration specialists
- API developers
- System administrators

### When to assign Editor:
- Business analysts
- Report specialists
- Content managers

### When to assign Viewer:
- Stakeholders
- External auditors (temporary)
- Read-only monitoring

---

## Security Best Practices

1. **Principle of Least Privilege**
   - Assign the minimum role required for job function
   - Regularly review and update access rights

2. **Role Separation**
   - Avoid assigning Administrator role unnecessarily
   - Use specialized roles for specific functions

3. **Access Reviews**
   - Conduct quarterly access reviews
   - Remove access for inactive users
   - Audit role assignments regularly

4. **Password Requirements**
   - Enforce strong password policies
   - Require password changes every 90 days
   - Enable two-factor authentication

5. **Activity Monitoring**
   - All privileged actions are logged
   - Monitor audit logs regularly
   - Alert on suspicious activities

---

## Change Management

### Requesting Role Changes:
1. Submit request to Administrator
2. Provide business justification
3. Obtain manager approval
4. Document in change log

### Onboarding New Users:
1. Create user account in System -> User Management
2. Assign appropriate role based on job function
3. Send credentials securely
4. Require password change on first login
5. Provide role-specific training

### Offboarding Users:
1. Immediately revoke access upon termination
2. Document in audit log
3. Transfer responsibilities if needed
4. Review and remove all related permissions

---

## Compliance and Audit

### Audit Log Coverage:
- All user logins and logouts
- Role changes and permission updates
- Critical operations (voids, refunds, etc.)
- Configuration changes
- Data access and exports

### Retention:
- Audit logs retained for 7 years (PCI-DSS requirement)
- Critical logs stored in immutable storage
- Regular backup and archival

### Reporting:
- Monthly access review reports
- Quarterly security audits
- Annual compliance certification

---

## Support and Questions

For role assignment requests or questions about permissions:
- Contact: System Administrator
- Review: System -> User Management
- Documentation: Resources -> Documentation

---

*Last Updated: ${new Date().toISOString().split('T')[0]}*
*Version: 1.0*
`;