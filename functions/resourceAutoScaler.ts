import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { allocation_id, trigger_type } = await req.json();

        // Fetch allocation
        const allocations = await base44.asServiceRole.entities.ResourceAllocation.filter({ id: allocation_id });
        if (!allocations || allocations.length === 0) {
            return Response.json({ error: 'Allocation not found' }, { status: 404 });
        }

        const allocation = allocations[0];

        // Check if auto-scaling is enabled
        if (!allocation.auto_scaling_policy?.enabled) {
            return Response.json({ 
                success: false, 
                message: 'Auto-scaling not enabled for this allocation' 
            });
        }

        // Determine scaling action
        let scalingAction = null;
        const cpuUsage = allocation.current_usage?.cpu_utilization || 0;
        const memoryUsage = allocation.current_usage?.memory_utilization || 0;

        if (cpuUsage >= allocation.auto_scaling_policy.scale_up_threshold || 
            memoryUsage >= allocation.auto_scaling_policy.scale_up_threshold) {
            scalingAction = 'scale_up';
        } else if (cpuUsage <= allocation.auto_scaling_policy.scale_down_threshold && 
                   memoryUsage <= allocation.auto_scaling_policy.scale_down_threshold) {
            scalingAction = 'scale_down';
        }

        if (!scalingAction) {
            return Response.json({ 
                success: true, 
                message: 'No scaling action needed',
                current_usage: { cpuUsage, memoryUsage }
            });
        }

        // Check tier limits
        const currentCpu = allocation.allocated_resources.cpu_cores || 0;
        const currentMemory = allocation.allocated_resources.memory_gb || 0;
        const maxCpu = allocation.tier_based_limits?.max_cpu_cores || Infinity;
        const maxMemory = allocation.tier_based_limits?.max_memory_gb || Infinity;

        let newCpu = currentCpu;
        let newMemory = currentMemory;

        if (scalingAction === 'scale_up') {
            // Scale up by 25%
            newCpu = Math.min(Math.ceil(currentCpu * 1.25), maxCpu);
            newMemory = Math.min(Math.ceil(currentMemory * 1.25), maxMemory);

            if (newCpu === currentCpu && newMemory === currentMemory) {
                return Response.json({
                    success: false,
                    message: 'Scaling limit reached for this tier',
                    quota_exceeded: true
                });
            }
        } else {
            // Scale down by 20%
            newCpu = Math.max(Math.floor(currentCpu * 0.8), 1);
            newMemory = Math.max(Math.floor(currentMemory * 0.8), 1);
        }

        // Fetch pool to verify capacity
        const pools = await base44.asServiceRole.entities.ResourcePool.filter({ id: allocation.pool_id });
        if (!pools || pools.length === 0) {
            return Response.json({ error: 'Resource pool not found' }, { status: 404 });
        }

        const pool = pools[0];
        const availableCpu = (pool.total_capacity?.cpu_cores || 0) - (pool.allocated_capacity?.cpu_cores || 0);
        const availableMemory = (pool.total_capacity?.memory_gb || 0) - (pool.allocated_capacity?.memory_gb || 0);

        const cpuDiff = newCpu - currentCpu;
        const memoryDiff = newMemory - currentMemory;

        if (cpuDiff > availableCpu || memoryDiff > availableMemory) {
            return Response.json({
                success: false,
                message: 'Insufficient capacity in pool',
                available: { cpu: availableCpu, memory: availableMemory },
                requested: { cpu: cpuDiff, memory: memoryDiff }
            });
        }

        // Apply scaling
        await base44.asServiceRole.entities.ResourceAllocation.update(allocation_id, {
            allocated_resources: {
                ...allocation.allocated_resources,
                cpu_cores: newCpu,
                memory_gb: newMemory
            },
            last_scaled: new Date().toISOString()
        });

        // Update pool capacity
        await base44.asServiceRole.entities.ResourcePool.update(allocation.pool_id, {
            allocated_capacity: {
                ...pool.allocated_capacity,
                cpu_cores: (pool.allocated_capacity?.cpu_cores || 0) + cpuDiff,
                memory_gb: (pool.allocated_capacity?.memory_gb || 0) + memoryDiff
            }
        });

        return Response.json({
            success: true,
            action: scalingAction,
            previous: { cpu: currentCpu, memory: currentMemory },
            new: { cpu: newCpu, memory: newMemory },
            message: `Successfully scaled ${scalingAction === 'scale_up' ? 'up' : 'down'}`
        });

    } catch (error) {
        console.error('Auto-scaling error:', error);
        return Response.json({ 
            error: 'Auto-scaling failed', 
            details: error.message 
        }, { status: 500 });
    }
});