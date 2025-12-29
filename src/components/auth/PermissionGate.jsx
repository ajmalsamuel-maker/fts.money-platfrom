import React from 'react';
import { usePermissions } from './usePermissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */
export function PermissionGate({ 
    children, 
    permission, 
    permissions,
    requireAll = false,
    user,
    targetUser = null,
    targetEntity = null,
    fallback = null,
    showLocked = false 
}) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(user);
    
    let hasAccess = false;
    
    if (permission) {
        hasAccess = hasPermission(permission, targetUser, targetEntity);
    } else if (permissions) {
        if (requireAll) {
            hasAccess = hasAllPermissions(permissions, targetUser, targetEntity);
        } else {
            hasAccess = hasAnyPermission(permissions, targetUser, targetEntity);
        }
    }
    
    if (!hasAccess) {
        if (showLocked) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative inline-block opacity-50 cursor-not-allowed">
                                {children}
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 rounded">
                                    <Lock className="h-4 w-4 text-slate-600" />
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>You don't have permission for this action</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        return fallback;
    }
    
    return <>{children}</>;
}

/**
 * Disable fields based on permissions
 */
export function useFieldPermission(user, permission, targetUser = null, targetEntity = null) {
    const { hasPermission } = usePermissions(user);
    const canEdit = hasPermission(permission, targetUser, targetEntity);
    
    return {
        disabled: !canEdit,
        readOnly: !canEdit,
        canEdit
    };
}

export default PermissionGate;