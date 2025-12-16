import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const { service_id, regenerate_all } = await req.json();

    if (regenerate_all) {
        // Regenerate docs for all active services
        const services = await base44.asServiceRole.entities.ServiceCatalog.filter({
            status: 'active'
        });

        let generated = 0;
        for (const service of services) {
            const docs = await generateDocumentation(service, base44);
            
            await base44.asServiceRole.entities.ServiceCatalog.update(service.id, {
                auto_generated_docs: docs,
                docs_last_generated: new Date().toISOString()
            });

            generated++;
        }

        return Response.json({
            success: true,
            generated,
            message: `Documentation generated for ${generated} services`
        });
    } else {
        // Generate for single service
        const services = await base44.asServiceRole.entities.ServiceCatalog.filter({
            service_id
        });

        if (!services || services.length === 0) {
            return Response.json({
                success: false,
                error: 'Service not found'
            }, { status: 404 });
        }

        const service = services[0];
        const docs = await generateDocumentation(service, base44);

        await base44.asServiceRole.entities.ServiceCatalog.update(service.id, {
            auto_generated_docs: docs,
            docs_last_generated: new Date().toISOString()
        });

        return Response.json({
            success: true,
            documentation: docs
        });
    }
});

async function generateDocumentation(service, base44) {
    // Build comprehensive documentation using structured template
    let docs = `# ${service.service_name}\n\n`;
    
    docs += `**Version:** ${service.version || '1.0.0'} | **Status:** ${service.lifecycle_state || 'GA'}\n\n`;
    
    docs += `## Overview\n\n`;
    docs += `${service.long_description || service.description || 'No description available.'}\n\n`;

    // Dependencies
    if (service.dependencies && service.dependencies.length > 0) {
        docs += `## Dependencies\n\n`;
        docs += `This service requires the following services to be active:\n\n`;
        service.dependencies.forEach(dep => {
            docs += `- **${dep.service_name}** (${dep.version_requirement || 'any version'})${dep.required ? ' - *Required*' : ' - Optional'}\n`;
        });
        docs += `\n`;
    }

    // Bundle Information
    if (service.is_bundle && service.bundle_components) {
        docs += `## Bundle Components\n\n`;
        docs += `This bundle includes:\n\n`;
        service.bundle_components.forEach(comp => {
            docs += `- ${comp.service_name}${comp.is_optional ? ' (optional)' : ''}\n`;
        });
        if (service.bundle_discount_percentage) {
            docs += `\n**Bundle Savings:** ${service.bundle_discount_percentage}% discount vs individual pricing\n`;
        }
        docs += `\n`;
    }

    // Features
    if (service.features && service.features.length > 0) {
        docs += `## Key Features\n\n`;
        service.features.forEach(feature => {
            docs += `- ${feature}\n`;
        });
        docs += `\n`;
    }

    // API Endpoints
    if (service.api_endpoints && service.api_endpoints.length > 0) {
        docs += `## API Endpoints\n\n`;
        service.api_endpoints.forEach(endpoint => {
            docs += `### ${endpoint.method} ${endpoint.path}\n\n`;
            docs += `${endpoint.description || ''}\n\n`;
        });
    }

    // Pricing
    docs += `## Pricing\n\n`;
    docs += `**Model:** ${service.pricing_model}\n\n`;
    if (service.base_price > 0) {
        docs += `- Base Fee: $${service.base_price}/month\n`;
    }
    if (service.variable_price > 0) {
        docs += `- Variable Fee: ${service.variable_price}% per transaction\n`;
    }
    if (service.pricing_tiers && service.pricing_tiers.length > 0) {
        docs += `\n**Volume Tiers:**\n\n`;
        service.pricing_tiers.forEach(tier => {
            docs += `- $${tier.volume_min} - $${tier.volume_max}: ${tier.price}%\n`;
        });
    }
    docs += `\n`;

    // Integration
    docs += `## Integration\n\n`;
    docs += `**Complexity:** ${service.integration_complexity || 'Moderate'}\n\n`;
    docs += `**Estimated Setup Time:** ${service.estimated_setup_time || '1-2 hours'}\n\n`;

    // SLA & Performance
    docs += `## Service Level Agreement\n\n`;
    docs += `- **Uptime SLA:** ${service.uptime_sla || 99.9}%\n`;
    docs += `- **Average Latency:** ${service.avg_latency_ms || '<200'}ms\n`;
    docs += `- **Current Health:** ${service.health_status || 'Unknown'}\n\n`;

    // Version History
    if (service.version_history && service.version_history.length > 0) {
        docs += `## Version History\n\n`;
        service.version_history.forEach(ver => {
            docs += `### ${ver.version} - ${ver.release_date}\n\n`;
            docs += `${ver.changelog}\n\n`;
            if (ver.breaking_changes) {
                docs += `⚠️ **Contains breaking changes**\n\n`;
            }
        });
    }

    // Deprecation Notice
    if (service.lifecycle_state === 'deprecated' || service.lifecycle_state === 'sunset') {
        docs += `## ⚠️ Deprecation Notice\n\n`;
        if (service.deprecation_date) {
            docs += `This service was deprecated on ${service.deprecation_date}.\n\n`;
        }
        if (service.sunset_date) {
            docs += `**Sunset Date:** ${service.sunset_date} - Service will be completely removed.\n\n`;
        }
        if (service.migration_guide_url) {
            docs += `[View Migration Guide](${service.migration_guide_url})\n\n`;
        }
    }

    docs += `---\n\n`;
    docs += `*Documentation auto-generated on ${new Date().toISOString()}*\n`;

    return docs;
}