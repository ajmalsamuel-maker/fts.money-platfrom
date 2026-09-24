import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { months_to_forecast, growth_rate } = await req.json();

        // Fetch current PSPs and allocations
        const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
        const allocations = await base44.asServiceRole.entities.ResourceAllocation.list();
        const pools = await base44.asServiceRole.entities.ResourcePool.list();

        // Calculate current capacity
        const currentCapacity = {
            total_psps: psps.length,
            cpu_cores: allocations.reduce((sum, a) => sum + (a.allocated_resources?.cpu_cores || 0), 0),
            memory_gb: allocations.reduce((sum, a) => sum + (a.allocated_resources?.memory_gb || 0), 0),
            storage_gb: allocations.reduce((sum, a) => sum + (a.allocated_resources?.storage_gb || 0), 0)
        };

        // Calculate average per PSP
        const avgPerPSP = {
            cpu: currentCapacity.cpu_cores / (currentCapacity.total_psps || 1),
            memory: currentCapacity.memory_gb / (currentCapacity.total_psps || 1),
            storage: currentCapacity.storage_gb / (currentCapacity.total_psps || 1)
        };

        // Generate monthly forecast
        const monthlyForecast = [];
        const forecastMonths = months_to_forecast || 6;
        const monthlyGrowthRate = (growth_rate || 15) / 100;

        for (let i = 1; i <= forecastMonths; i++) {
            const projectedPSPs = Math.ceil(currentCapacity.total_psps * Math.pow(1 + monthlyGrowthRate, i));
            const month = new Date();
            month.setMonth(month.getMonth() + i);

            monthlyForecast.push({
                month: month.toISOString().slice(0, 7),
                projected_psps: projectedPSPs,
                cpu_required: Math.ceil(projectedPSPs * avgPerPSP.cpu),
                memory_required: Math.ceil(projectedPSPs * avgPerPSP.memory),
                storage_required: Math.ceil(projectedPSPs * avgPerPSP.storage)
            });
        }

        // Calculate total pool capacity
        const totalPoolCapacity = {
            cpu_cores: pools.reduce((sum, p) => sum + (p.total_capacity?.cpu_cores || 0), 0),
            memory_gb: pools.reduce((sum, p) => sum + (p.total_capacity?.memory_gb || 0), 0),
            storage_gb: pools.reduce((sum, p) => sum + (p.total_capacity?.storage_gb || 0), 0)
        };

        // Identify capacity gaps
        const finalForecast = monthlyForecast[monthlyForecast.length - 1];
        const capacityGap = {
            cpu_cores: Math.max(0, finalForecast.cpu_required - totalPoolCapacity.cpu_cores),
            memory_gb: Math.max(0, finalForecast.memory_required - totalPoolCapacity.memory_gb),
            storage_gb: Math.max(0, finalForecast.storage_required - totalPoolCapacity.storage_gb)
        };

        // Generate recommendations
        const recommendations = [];
        
        if (capacityGap.cpu_cores > 0) {
            recommendations.push({
                action: `Add ${capacityGap.cpu_cores} CPU cores to resource pools`,
                priority: 'high',
                estimated_cost: capacityGap.cpu_cores * 50,
                implementation_date: monthlyForecast[Math.floor(forecastMonths / 2)].month
            });
        }

        if (capacityGap.memory_gb > 0) {
            recommendations.push({
                action: `Add ${capacityGap.memory_gb} GB memory to resource pools`,
                priority: 'high',
                estimated_cost: capacityGap.memory_gb * 10,
                implementation_date: monthlyForecast[Math.floor(forecastMonths / 2)].month
            });
        }

        if (capacityGap.storage_gb > 0) {
            recommendations.push({
                action: `Add ${capacityGap.storage_gb} GB storage to resource pools`,
                priority: 'medium',
                estimated_cost: capacityGap.storage_gb * 0.1,
                implementation_date: monthlyForecast[Math.floor(forecastMonths / 2)].month
            });
        }

        // Calculate budget
        const budgetEstimate = recommendations.reduce((sum, r) => sum + (r.estimated_cost || 0), 0);

        // Create capacity plan
        const plan = {
            plan_id: `CAP-${Date.now()}`,
            plan_name: `${forecastMonths}-Month Capacity Plan`,
            forecast_period: {
                start_date: new Date().toISOString().split('T')[0],
                end_date: monthlyForecast[monthlyForecast.length - 1].month + '-01'
            },
            current_capacity: currentCapacity,
            projected_demand: {
                new_psps: finalForecast.projected_psps - currentCapacity.total_psps,
                growth_rate_percentage: growth_rate || 15,
                required_cpu_cores: finalForecast.cpu_required,
                required_memory_gb: finalForecast.memory_required,
                required_storage_gb: finalForecast.storage_required
            },
            capacity_gap: capacityGap,
            recommended_actions: recommendations,
            monthly_forecast: monthlyForecast,
            budget_estimate: budgetEstimate,
            status: 'draft',
            created_by: user.email
        };

        // Save plan
        await base44.asServiceRole.entities.CapacityPlan.create(plan);

        return Response.json({
            success: true,
            plan
        });

    } catch (error) {
        console.error('Capacity planning error:', error);
        return Response.json({ 
            error: 'Capacity planning failed', 
            details: error.message 
        }, { status: 500 });
    }
});