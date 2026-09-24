import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const { service_id, check_all } = await req.json();

    if (check_all) {
        // Run health checks for all services with health_check_enabled
        const services = await base44.asServiceRole.entities.ServiceCatalog.filter({
            health_check_enabled: true
        });

        const results = [];
        for (const service of services) {
            const result = await checkServiceHealth(service);
            
            // Update service health status
            await base44.asServiceRole.entities.ServiceCatalog.update(service.id, {
                health_status: result.status,
                last_health_check: new Date().toISOString(),
                uptime_percentage: result.uptime_percentage,
                health_incidents: [
                    ...(service.health_incidents || []).slice(-9), // Keep last 10
                    {
                        timestamp: new Date().toISOString(),
                        status: result.status,
                        details: result.details
                    }
                ]
            });

            results.push({
                service_id: service.service_id,
                service_name: service.service_name,
                ...result
            });
        }

        return Response.json({
            success: true,
            checked: results.length,
            results
        });
    } else {
        // Check single service
        const service = await base44.asServiceRole.entities.ServiceCatalog.filter({
            service_id
        });

        if (!service || service.length === 0) {
            return Response.json({
                success: false,
                error: 'Service not found'
            }, { status: 404 });
        }

        const result = await checkServiceHealth(service[0]);
        
        // Update service
        await base44.asServiceRole.entities.ServiceCatalog.update(service[0].id, {
            health_status: result.status,
            last_health_check: new Date().toISOString(),
            uptime_percentage: result.uptime_percentage
        });

        return Response.json({
            success: true,
            ...result
        });
    }
});

async function checkServiceHealth(service) {
    const result = {
        status: 'unknown',
        uptime_percentage: 0,
        response_time_ms: 0,
        details: ''
    };

    if (!service.health_check_url) {
        result.status = 'unknown';
        result.details = 'No health check URL configured';
        return result;
    }

    try {
        const startTime = Date.now();
        const response = await fetch(service.health_check_url, {
            method: 'GET',
            headers: { 'User-Agent': 'FTS-HealthChecker/1.0' },
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        const endTime = Date.now();

        result.response_time_ms = endTime - startTime;

        if (response.ok) {
            result.status = 'healthy';
            result.uptime_percentage = 99.9; // Calculate based on incidents
            result.details = `HTTP ${response.status} - ${result.response_time_ms}ms`;
        } else {
            result.status = 'degraded';
            result.uptime_percentage = 95.0;
            result.details = `HTTP ${response.status} - Service responding but with errors`;
        }
    } catch (error) {
        result.status = 'down';
        result.uptime_percentage = 0;
        result.details = `Health check failed: ${error.message}`;
    }

    return result;
}