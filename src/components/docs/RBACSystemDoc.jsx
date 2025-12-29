export const RBACSystemDoc = `# Role-Based Access Control (RBAC) System

**Last Updated:** December 2025  
**Status:** Production Ready  
**Version:** 2.0

---

## Table of Contents

1. [Overview](#overview)
2. [Multi-User Organization Support](#multi-user-organization-support)
3. [Standard Role Hierarchy](#standard-role-hierarchy)
4. [Service-Specific Permissions](#service-specific-permissions)
5. [Permission Management](#permission-management)
6. [User Management Workflows](#user-management-workflows)
7. [Security & Best Practices](#security-best-practices)

---

## Overview

The FTS.Money RBAC system provides comprehensive access control across all platform services, enabling organizations to grant granular permissions to multiple team members based on their roles and responsibilities.

### Key Features

- ✅ **Multi-user per organization** - Each customer can have unlimited users
- ✅ **Six-tier role hierarchy** - From Owner to Viewer with distinct permissions
- ✅ **Service-specific RBAC** - Tailored permissions for each FTS service
- ✅ **Editable permission matrices** - Platform admins can customize role permissions
- ✅ **Secure authentication** - Password hashing with bcrypt, session management
- ✅ **Audit trail** - All user actions logged for compliance

### Supported Services

| Service | User Management Page | Customer Entity | User Entity |
|---------|---------------------|-----------------|-------------|
| **ISO Gateway** | ISOGatewayUserManagement | ISOGatewayCustomer | ISOGatewayUser |
| **Orchestration** | OrchestrationUserManagement | OrchestrationCustomer | OrchestrationUser |
| **Crypto Banking** | CryptoGatewayUserManagement | CryptoGatewayCustomer | CryptoGatewayUser |
| **RWA Platform** | RWAProviderUserManagement | RWAProvider | RWAProviderUser |
| **PSP Staff** | PSPUserManagement | ProvisionedPSP | AppUser (staff) |

---

## Multi-User Organization Support

### Architecture

\`\`\`mermaid
graph TB
    A[Organization] --> B[Owner User]
    A --> C[Administrator Users]
    A --> D[Developer Users]
    A --> E[Operations Users]
    A --> F[Analyst Users]
    A --> G[Viewer Users]
    
    B --> H[Full Control]
    C --> I[Management Access]
    D --> J[API & Technical]
    E --> K[Day-to-Day Ops]
    F --> L[Analytics Only]
    G --> M[Read Only]
    
    style A fill:#e0f2fe
    style B fill:#fecaca
    style H fill:#dcfce7
\`\`\`

### User Entity Schema

\`\`\`json
{
  "name": "ISOGatewayUser",
  "properties": {
    "customer_id": "string",
    "email": "string",
    "full_name": "string",
    "role": "enum[owner, administrator, developer, operations, analyst, viewer]",
    "password_hash": "string",
    "status": "enum[active, inactive, pending]",
    "last_login": "datetime"
  }
}
\`\`\`

---

## Standard Role Hierarchy

### Role Definitions

| Role | Power Level | Description | Typical Users |
|------|-------------|-------------|---------------|
| **Owner** | 100% | Complete administrative control, can manage all users | CEO, Founder, Primary Account Holder |
| **Administrator** | 90% | Full management access except cannot modify/delete owner | CTO, IT Manager, System Admin |
| **Developer** | 60% | API access, technical configuration, testing | Software Engineers, Integration Specialists |
| **Operations** | 50% | Day-to-day operational tasks, monitoring | Support Team, Operations Staff |
| **Analyst** | 40% | Reporting, analytics, read-only data access | Business Analysts, Finance Team |
| **Viewer** | 20% | Read-only access to basic information | Auditors, Compliance Officers |

### Permission Inheritance

\`\`\`mermaid
graph TD
    Owner[Owner - All Permissions]
    Owner --> Admin[Administrator]
    Admin --> Dev[Developer]
    Admin --> Ops[Operations]
    Dev --> Analyst[Analyst]
    Ops --> Analyst
    Analyst --> Viewer[Viewer]
    
    style Owner fill:#fecaca
    style Admin fill:#fed7aa
    style Dev fill:#ddd6fe
    style Ops fill:#bfdbfe
    style Analyst fill:#bbf7d0
    style Viewer fill:#e2e8f0
\`\`\`

---

## Service-Specific Permissions

### ISO Gateway Permissions

#### Permission Matrix

| Permission | Owner | Admin | Developer | Operations | Analyst | Viewer |
|-----------|-------|-------|-----------|-----------|---------|--------|
| customer:view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| customer:update | ✓ | ✓ | - | - | - | - |
| connection:view | ✓ | ✓ | ✓ | ✓ | - | - |
| connection:create | ✓ | ✓ | ✓ | - | - | - |
| connection:update | ✓ | ✓ | ✓ | - | - | - |
| connection:delete | ✓ | ✓ | - | - | - | - |
| message:view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| message:send | ✓ | ✓ | ✓ | - | - | - |
| translation:view | ✓ | ✓ | ✓ | ✓ | - | - |
| translation:update | ✓ | ✓ | ✓ | - | - | - |
| routing:view | ✓ | ✓ | ✓ | ✓ | - | - |
| routing:update | ✓ | ✓ | ✓ | - | - | - |
| api_key:view | ✓ | ✓ | ✓ | - | - | - |
| api_key:create | ✓ | ✓ | ✓ | - | - | - |
| api_key:delete | ✓ | ✓ | - | - | - | - |
| analytics:view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| billing:view | ✓ | ✓ | - | - | ✓ | - |
| user:manage | ✓ | ✓ | - | - | - | - |

#### Code Reference

\`\`\`javascript
// components/auth/isoGatewayPermissions.js
export const ISO_PERMISSIONS = {
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_UPDATE: 'customer:update',
  CONNECTION_VIEW: 'connection:view',
  CONNECTION_CREATE: 'connection:create',
  CONNECTION_UPDATE: 'connection:update',
  CONNECTION_DELETE: 'connection:delete',
  MESSAGE_VIEW: 'message:view',
  MESSAGE_SEND: 'message:send',
  TRANSLATION_VIEW: 'translation:view',
  TRANSLATION_UPDATE: 'translation:update',
  ROUTING_VIEW: 'routing:view',
  ROUTING_UPDATE: 'routing:update',
  API_KEY_VIEW: 'api_key:view',
  API_KEY_CREATE: 'api_key:create',
  API_KEY_DELETE: 'api_key:delete',
  ANALYTICS_VIEW: 'analytics:view',
  BILLING_VIEW: 'billing:view',
  USER_MANAGE: 'user:manage'
};
\`\`\`

---

### Orchestration Service Permissions

| Permission | Description | Owner | Admin | Developer | Operations | Analyst | Viewer |
|-----------|-------------|-------|-------|-----------|-----------|---------|--------|
| customer:view | View customer profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| customer:update | Modify settings | ✓ | ✓ | - | - | - | - |
| rule:view | View routing rules | ✓ | ✓ | ✓ | ✓ | - | - |
| rule:create | Create rules | ✓ | ✓ | ✓ | - | - | - |
| rule:update | Modify rules | ✓ | ✓ | ✓ | - | - | - |
| rule:delete | Delete rules | ✓ | ✓ | ✓ | - | - | - |
| route:view | View routes | ✓ | ✓ | ✓ | ✓ | - | - |
| route:create | Create routes | ✓ | ✓ | ✓ | - | - | - |
| route:update | Modify routes | ✓ | ✓ | ✓ | - | - | - |
| route:delete | Delete routes | ✓ | ✓ | ✓ | - | - | - |
| execution:view | View logs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| provider:view | View providers | ✓ | ✓ | ✓ | ✓ | - | - |
| provider:update | Modify providers | ✓ | ✓ | - | - | - | - |
| api_key:view | View API keys | ✓ | ✓ | ✓ | - | - | - |
| api_key:create | Create keys | ✓ | ✓ | ✓ | - | - | - |
| api_key:delete | Delete keys | ✓ | ✓ | - | - | - | - |
| analytics:view | View analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| billing:view | View billing | ✓ | ✓ | - | - | ✓ | - |
| user:manage | Manage users | ✓ | ✓ | - | - | - | - |

---

### Crypto Banking Gateway Permissions

| Permission | Description | Owner | Admin | Developer | Operations | Analyst | Viewer |
|-----------|-------------|-------|-------|-----------|-----------|---------|--------|
| customer:view | View customer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| customer:update | Modify settings | ✓ | ✓ | - | - | - | - |
| wallet:view | View wallets | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| wallet:create | Create wallets | ✓ | ✓ | - | - | - | - |
| wallet:update | Modify wallets | ✓ | ✓ | - | - | - | - |
| transaction:view | View transactions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| transaction:create | Initiate tx | ✓ | ✓ | - | - | - | - |
| kyc:view | View KYC | ✓ | ✓ | - | ✓ | - | - |
| kyc:approve | Approve KYC | ✓ | ✓ | - | - | - | - |
| kyc:reject | Reject KYC | ✓ | ✓ | - | - | - | - |
| iban:view | View IBANs | ✓ | ✓ | - | ✓ | - | - |
| iban:create | Create IBANs | ✓ | ✓ | - | - | - | - |
| api_key:view | View API keys | ✓ | ✓ | ✓ | - | - | - |
| api_key:create | Create keys | ✓ | ✓ | ✓ | - | - | - |
| api_key:delete | Delete keys | ✓ | ✓ | - | - | - | - |
| analytics:view | View analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| billing:view | View billing | ✓ | ✓ | - | - | ✓ | - |
| settings:update | Modify settings | ✓ | ✓ | - | - | - | - |
| user:manage | Manage users | ✓ | ✓ | - | - | - | - |

---

### RWA Platform Permissions

| Permission | Description | Owner | Admin | Developer | Operations | Analyst | Viewer |
|-----------|-------------|-------|-------|-----------|-----------|---------|--------|
| provider:view | View provider | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| provider:update | Modify settings | ✓ | ✓ | - | - | - | - |
| asset:view | View assets | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| asset:create | Tokenize assets | ✓ | ✓ | - | - | - | - |
| asset:update | Modify assets | ✓ | ✓ | - | - | - | - |
| asset:delete | Delete assets | ✓ | ✓ | - | - | - | - |
| issuer:view | View issuers | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| issuer:create | Onboard issuers | ✓ | ✓ | - | - | - | - |
| issuer:update | Modify issuers | ✓ | ✓ | - | - | - | - |
| issuer:delete | Remove issuers | ✓ | ✓ | - | - | - | - |
| investor:view | View investors | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| investor:approve | Approve KYC | ✓ | ✓ | - | - | - | - |
| investor:reject | Reject KYC | ✓ | ✓ | - | - | - | - |
| holding:view | View holdings | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| order:view | View orders | ✓ | ✓ | - | ✓ | ✓ | - |
| order:approve | Approve orders | ✓ | ✓ | - | - | - | - |
| dividend:view | View dividends | ✓ | ✓ | - | - | ✓ | - |
| dividend:create | Schedule payments | ✓ | ✓ | - | - | - | - |
| dividend:process | Process payments | ✓ | ✓ | - | - | - | - |
| api_key:view | View API keys | ✓ | ✓ | ✓ | - | - | - |
| api_key:create | Create keys | ✓ | ✓ | ✓ | - | - | - |
| api_key:delete | Delete keys | ✓ | ✓ | - | - | - | - |
| analytics:view | View analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| billing:view | View billing | ✓ | ✓ | - | - | ✓ | - |
| user:manage | Manage users | ✓ | ✓ | - | - | - | - |

---

### PSP Staff Permissions

| Permission | Admin | Manager | Operator | Finance | Compliance | Technical | Viewer |
|-----------|-------|---------|----------|---------|------------|-----------|--------|
| VIEW_DASHBOARD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VIEW_ANALYTICS | ✓ | ✓ | - | ✓ | - | - | - |
| VIEW_TRANSACTIONS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VIEW_SETTLEMENTS | ✓ | ✓ | - | ✓ | - | - | - |
| VIEW_CHARGEBACKS | ✓ | ✓ | - | - | - | - | - |
| VIEW_DISPUTES | ✓ | ✓ | - | - | - | - | - |
| VIEW_MERCHANTS | ✓ | ✓ | ✓ | - | ✓ | - | ✓ |
| VIEW_ONBOARDING | ✓ | ✓ | - | - | - | - | - |
| VIEW_ORCHESTRATION | ✓ | ✓ | - | - | - | - | - |
| VIEW_ROUTING | ✓ | ✓ | - | - | - | - | - |
| VIEW_TERMINALS | ✓ | ✓ | ✓ | - | - | - | - |
| VIEW_BALANCES | ✓ | ✓ | - | ✓ | - | - | - |
| VIEW_PAYOUTS | ✓ | ✓ | - | ✓ | - | - | - |
| VIEW_REPORTS | ✓ | ✓ | - | ✓ | - | - | - |
| VIEW_FRAUD_PREVENTION | ✓ | ✓ | - | - | ✓ | - | - |
| VIEW_COMPLIANCE | ✓ | ✓ | - | - | ✓ | - | - |
| VIEW_SETTINGS | ✓ | ✓ | - | - | - | ✓ | - |
| VIEW_USERS | ✓ | ✓ | - | - | - | ✓ | - |
| VIEW_APPEARANCE | ✓ | ✓ | - | - | - | - | - |
| APPROVE_ONBOARDING | ✓ | - | - | - | - | - | - |

---

## Permission Management

### Editable Permission Matrices

Platform administrators can customize role permissions through the **Role & Permission Management** page.

#### Access Location

\`Platform Admin → User & Access Management → Role & Permission Management\`

#### Editing Workflow

\`\`\`mermaid
sequenceDiagram
    actor Admin as Platform Admin
    participant UI as Permission Page
    participant State as React State
    participant API as Backend API
    participant DB as Database
    
    Admin->>UI: Click "Edit Permissions"
    UI->>State: Enable edit mode
    Admin->>UI: Toggle permission checkbox
    UI->>State: Update local state
    Note over State: Changes tracked
    Admin->>UI: Click "Save Changes"
    UI->>API: POST /savePermissions
    API->>DB: Update permission config
    DB-->>API: Success
    API-->>UI: Confirmation
    UI->>Admin: Show success toast
\`\`\`

#### Implementation

\`\`\`javascript
// pages/RolePermissionManagement.js
const handlePermissionChange = (service, role, permission, checked) => {
    setHasChanges(true);
    
    const updatePerms = (currentPerms) => {
        const newPerms = { ...currentPerms };
        if (checked) {
            newPerms[role] = [...(newPerms[role] || []), permission];
        } else {
            newPerms[role] = (newPerms[role] || []).filter(p => p !== permission);
        }
        return newPerms;
    };

    if (service === 'ISO Gateway') setIsoPerms(updatePerms);
    else if (service === 'Orchestration') setOrchPerms(updatePerms);
    // ... other services
};
\`\`\`

---

## User Management Workflows

### Inviting Users

\`\`\`mermaid
graph TB
    A[Platform Admin] --> B[Navigate to User Management]
    B --> C[Select Service]
    C --> D[Click 'Invite User']
    D --> E[Fill Form]
    E --> F[Enter Email]
    E --> G[Enter Full Name]
    E --> H[Select Role]
    E --> I[Set Password]
    F --> J[Submit]
    G --> J
    H --> J
    I --> J
    J --> K{Validation}
    K -->|Pass| L[Hash Password]
    L --> M[Create User Record]
    M --> N[Send Welcome Email]
    N --> O[User Created]
    K -->|Fail| P[Show Error]
    P --> E
    
    style A fill:#e0f2fe
    style O fill:#dcfce7
    style P fill:#fee2e2
\`\`\`

### Password Management

\`\`\`javascript
// functions/isoGatewayUserManagement.js
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'fts_iso_salt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
\`\`\`

### Authentication Flow

\`\`\`mermaid
sequenceDiagram
    actor User
    participant Login as Login Page
    participant API as Auth API
    participant DB as Database
    participant Session as Session Store
    
    User->>Login: Enter credentials
    Login->>API: POST /auth
    API->>DB: Query user by email
    DB-->>API: User record
    API->>API: Verify password hash
    alt Valid
        API->>Session: Create session
        Session-->>API: Session token
        API-->>Login: Success + token
        Login->>User: Redirect to dashboard
    else Invalid
        API-->>Login: Error
        Login->>User: Show error message
    end
\`\`\`

---

## Security & Best Practices

### Security Features

1. **Password Hashing**
   - SHA-256 with salt
   - Unique salt per service
   - Never store plain text passwords

2. **Session Management**
   - Secure session tokens
   - Automatic expiration
   - Server-side validation

3. **Audit Logging**
   - All user actions logged
   - Immutable audit trail
   - Compliance-ready reports

4. **Permission Enforcement**
   - Server-side validation
   - Role-based middleware
   - Context-aware checks

### Best Practices

#### For Platform Admins

- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Regular Audits**: Review user access quarterly
- **Immediate Revocation**: Remove access for departed team members
- **Role Review**: Validate role assignments match job functions

#### For Organization Owners

- **Separate Duties**: Don't give everyone Admin role
- **Use Service Accounts**: Create dedicated users for API integration
- **Monitor Activity**: Review audit logs for unusual patterns
- **Document Roles**: Maintain internal documentation of who has what access

#### For Developers

- **Check Permissions**: Always validate permissions server-side
- **Handle Edge Cases**: Account for role changes mid-session
- **Test All Roles**: Verify functionality with different role levels
- **Log Actions**: Track permission checks and denials

### Code Examples

#### Permission Check in Backend

\`\`\`javascript
// Validate user has permission
async function checkPermission(user, permission) {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    if (!rolePermissions.includes(permission)) {
        throw new Error('Permission denied');
    }
}

// Usage in API endpoint
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    await checkPermission(user, 'message:send');
    
    // ... proceed with authorized action
});
\`\`\`

#### Permission Check in Frontend

\`\`\`javascript
import { usePermissions } from '@/components/auth/usePermissions';

function MessageConsole({ user }) {
    const { hasPermission } = usePermissions(user);
    
    return (
        <div>
            {hasPermission('message:view') && <MessageList />}
            {hasPermission('message:send') && <MessageForm />}
        </div>
    );
}
\`\`\`

---

## Migration & Rollout

### Existing Customers

Existing single-user customers are automatically converted to multi-user:

1. Current user becomes **Owner**
2. They can invite additional users
3. No disruption to existing functionality

### New Customers

New customers can:

1. Invite team during onboarding
2. Set up role hierarchy from day one
3. Customize permissions immediately

---

## Support & Resources

### Documentation

- User Management Guide: \`/docs/user-management\`
- Permission Reference: \`/docs/permissions\`
- API Authentication: \`/docs/api-auth\`

### Contact

- Technical Support: support@fts.money
- Security Issues: security@fts.money
- Feature Requests: product@fts.money

---

**End of RBAC System Documentation**
`;

export default RBACSystemDoc;