import { base44 } from '@/api/base44Client';

/**
 * Enhanced Audit Logger for FTS.Money Control Panel
 * 
 * Complies with:
 * - ISO 27001 (Information Security)
 * - ISO 22301 (Business Continuity)
 * - SOC 2 Type II (Security & Availability)
 * - PCI DSS (Payment Card Industry)
 * - GDPR Article 30 (Records of Processing Activities)
 */

export const AuditLogger = {
    /**
     * Log PSP provisioning action
     */
    async logPSPProvisioning(pspData, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: pspData.id,
            psp_code: pspData.psp_code,
            action: 'created',
            field_changed: 'psp_instance',
            new_value: `PSP ${pspData.psp_name} provisioned with tier ${pspData.tier}`,
            user_email: user.email,
            user_role: user.platform_role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                tier: pspData.tier,
                revenue_share: pspData.revenue_share_percentage,
                iso_compliance: ['ISO 27001', 'ISO 22301', 'PCI DSS Level 1'],
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log service import from NetXHub
     */
    async logServiceImport(serviceCount, isoStandards, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: 'platform',
            psp_code: 'FTS_PLATFORM',
            action: 'services_imported',
            field_changed: 'service_catalog',
            new_value: `Imported ${serviceCount} services from NetXHub`,
            user_email: user.email,
            user_role: user.platform_role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                service_count: serviceCount,
                iso_standards: isoStandards,
                compliance_frameworks: ['ISO 20022', 'ISO 8583', 'ISO 4217', 'ISO 27001'],
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log service provisioning to PSP
     */
    async logServiceProvisioning(pspId, pspCode, serviceId, serviceName, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: pspId,
            psp_code: pspCode,
            action: 'service_provisioned',
            field_changed: 'psp_services',
            new_value: `Service ${serviceName} provisioned`,
            user_email: user.email,
            user_role: user.platform_role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                service_id: serviceId,
                service_name: serviceName,
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log configuration changes
     */
    async logConfigChange(pspId, pspCode, field, oldValue, newValue, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: pspId,
            psp_code: pspCode,
            action: 'configuration_changed',
            field_changed: field,
            old_value: String(oldValue),
            new_value: String(newValue),
            user_email: user.email,
            user_role: user.platform_role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log pricing updates
     */
    async logPricingUpdate(serviceId, serviceName, oldPrice, newPrice, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: 'platform',
            psp_code: 'FTS_PLATFORM',
            action: 'pricing_updated',
            field_changed: 'service_pricing',
            old_value: `${serviceName}: $${oldPrice}`,
            new_value: `${serviceName}: $${newPrice}`,
            user_email: user.email,
            user_role: user.platform_role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                service_id: serviceId,
                service_name: serviceName,
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log compliance check
     */
    async logComplianceCheck(pspId, pspCode, complianceScore, frameworks, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: pspId,
            psp_code: pspCode,
            action: 'compliance_check',
            field_changed: 'compliance_validation',
            new_value: `Compliance score: ${complianceScore}/100`,
            user_email: user.email || 'system@fts.money',
            user_role: user.platform_role || 'platform_system',
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                compliance_score: complianceScore,
                compliance_frameworks: frameworks,
                iso_standards: frameworks.filter(f => f.includes('ISO')),
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log user access
     */
    async logUserAccess(email, role, action, resource, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: 'platform',
            psp_code: 'FTS_PLATFORM',
            action: 'user_access',
            field_changed: resource,
            new_value: `${action} by ${email}`,
            user_email: email,
            user_role: role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                action,
                resource,
                timestamp: new Date().toISOString()
            }
        });
    },

    /**
     * Log deletion
     */
    async logDeletion(pspId, pspCode, resourceType, resourceName, user, metadata = {}) {
        await base44.entities.PSPAuditTrail.create({
            psp_id: pspId,
            psp_code: pspCode,
            action: 'deleted',
            field_changed: resourceType,
            new_value: `Deleted ${resourceType}: ${resourceName}`,
            user_email: user.email,
            user_role: user.platform_role,
            ip_address: metadata.ip_address,
            metadata: {
                ...metadata,
                resource_type: resourceType,
                resource_name: resourceName,
                timestamp: new Date().toISOString()
            }
        });
    }
};