import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, log_id, threshold = 70 } = await req.json();

        // Analyze access patterns and detect anomalies
        if (action === 'detect_anomalies') {
            const logs = await base44.asServiceRole.entities.AccessControlLog.list('-created_date', 1000);
            
            const anomalies = [];
            const userPatterns = {};

            // Build baseline patterns per user
            logs.forEach(log => {
                if (!userPatterns[log.user_id]) {
                    userPatterns[log.user_id] = {
                        usual_ips: new Set(),
                        usual_hours: new Set(),
                        usual_resources: new Set(),
                        failed_logins: 0,
                        total_logins: 0
                    };
                }

                const pattern = userPatterns[log.user_id];
                pattern.usual_ips.add(log.ip_address);
                
                if (log.created_date) {
                    const hour = new Date(log.created_date).getHours();
                    pattern.usual_hours.add(hour);
                }
                
                if (log.resource_accessed) {
                    pattern.usual_resources.add(log.resource_accessed);
                }

                if (log.action === 'failed_login') pattern.failed_logins++;
                if (log.action === 'login') pattern.total_logins++;
            });

            // Detect anomalies
            logs.forEach(log => {
                const pattern = userPatterns[log.user_id];
                let riskScore = 0;
                const reasons = [];

                // Unusual IP
                if (!pattern.usual_ips.has(log.ip_address) && pattern.usual_ips.size > 0) {
                    riskScore += 30;
                    reasons.push('Access from unusual IP address');
                }

                // Unusual time
                if (log.created_date) {
                    const hour = new Date(log.created_date).getHours();
                    if (!pattern.usual_hours.has(hour) && pattern.usual_hours.size > 0) {
                        riskScore += 20;
                        reasons.push('Access at unusual time');
                    }
                }

                // Failed login attempts
                if (log.action === 'failed_login') {
                    riskScore += 25;
                    reasons.push('Failed login attempt');
                }

                // Multiple failed logins
                if (pattern.failed_logins > 3) {
                    riskScore += 40;
                    reasons.push('Multiple failed login attempts');
                }

                // Access to sensitive resources
                if (log.resource_accessed && log.resource_accessed.includes('admin')) {
                    riskScore += 15;
                    reasons.push('Access to admin resources');
                }

                // Unusual resource access
                if (log.resource_accessed && !pattern.usual_resources.has(log.resource_accessed) && pattern.usual_resources.size > 5) {
                    riskScore += 25;
                    reasons.push('Access to unusual resource');
                }

                if (riskScore >= threshold) {
                    anomalies.push({
                        log_id: log.id,
                        user_id: log.user_id,
                        user_email: log.user_email,
                        action: log.action,
                        resource: log.resource_accessed,
                        ip_address: log.ip_address,
                        timestamp: log.created_date,
                        risk_score: riskScore,
                        reasons: reasons
                    });

                    // Update log with anomaly flag
                    base44.asServiceRole.entities.AccessControlLog.update(log.id, {
                        anomaly_detected: true,
                        anomaly_reason: reasons.join(', '),
                        risk_score: riskScore
                    }).catch(err => console.error('Error updating log:', err));
                }
            });

            return Response.json({ 
                success: true, 
                anomalies: anomalies.sort((a, b) => b.risk_score - a.risk_score),
                total_logs_analyzed: logs.length,
                anomalies_detected: anomalies.length
            });
        }

        // Get audit analytics
        if (action === 'get_analytics') {
            const logs = await base44.asServiceRole.entities.AccessControlLog.list('-created_date', 5000);
            
            // Top users by activity
            const userActivity = {};
            logs.forEach(log => {
                userActivity[log.user_email] = (userActivity[log.user_email] || 0) + 1;
            });
            const topUsers = Object.entries(userActivity)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([email, count]) => ({ email, count }));

            // Actions breakdown
            const actionsBreakdown = {};
            logs.forEach(log => {
                actionsBreakdown[log.action] = (actionsBreakdown[log.action] || 0) + 1;
            });

            // Failed logins trend
            const failedLogins = logs.filter(l => l.action === 'failed_login');
            
            // Access by hour
            const hourlyAccess = new Array(24).fill(0);
            logs.forEach(log => {
                if (log.created_date) {
                    const hour = new Date(log.created_date).getHours();
                    hourlyAccess[hour]++;
                }
            });

            // Anomalies
            const anomalousLogs = logs.filter(l => l.anomaly_detected);

            return Response.json({
                success: true,
                analytics: {
                    total_logs: logs.length,
                    top_users: topUsers,
                    actions_breakdown: actionsBreakdown,
                    failed_logins_count: failedLogins.length,
                    anomalies_count: anomalousLogs.length,
                    hourly_access: hourlyAccess.map((count, hour) => ({ hour, count }))
                }
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Audit anomaly detection error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});