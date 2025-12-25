import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2, Clock } from 'lucide-react';

/**
 * Unified Status Configuration System
 * Used across all portals for consistent status indicators
 */
export const STATUS_CONFIG = {
    success: { 
        color: 'emerald', 
        icon: CheckCircle2, 
        priority: 1,
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
    },
    active: { 
        color: 'emerald', 
        icon: CheckCircle2, 
        priority: 1,
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
    },
    warning: { 
        color: 'amber', 
        icon: AlertTriangle, 
        priority: 2,
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200'
    },
    pending: { 
        color: 'amber', 
        icon: Clock, 
        priority: 2,
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200'
    },
    error: { 
        color: 'red', 
        icon: XCircle, 
        priority: 3,
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200'
    },
    failed: { 
        color: 'red', 
        icon: XCircle, 
        priority: 3,
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200'
    },
    suspended: { 
        color: 'red', 
        icon: XCircle, 
        priority: 3,
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200'
    },
    info: { 
        color: 'blue', 
        icon: Info, 
        priority: 4,
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200'
    },
    processing: { 
        color: 'blue', 
        icon: Loader2, 
        priority: 4,
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        animate: true
    },
    provisioning: { 
        color: 'blue', 
        icon: Loader2, 
        priority: 4,
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        animate: true
    },
    trial: { 
        color: 'purple', 
        icon: Info, 
        priority: 4,
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200'
    }
};

/**
 * Get status configuration for a given status string
 * @param {string} status - Status key
 * @returns {object} Status configuration object
 */
export function getStatusConfig(status) {
    const normalizedStatus = status?.toLowerCase() || 'info';
    return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.info;
}

/**
 * StatusBadge component for consistent status display
 */
export function StatusBadge({ status, className = '' }) {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border ${className}`}>
            <Icon className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''}`} />
            {status}
        </span>
    );
}