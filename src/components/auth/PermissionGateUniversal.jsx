import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';

/**
 * Universal Permission Gate Component
 * Works with any service type (community, iso, orchestration, crypto, rwa)
 */
export function PermissionGateUniversal({ 
    user, 
    permission, 
    permissions = [], 
    requireAll = true,
    checkPermissionFn,
    children,
    fallback = null,
    showLocked = false 
}) {
    if (!user || !checkPermissionFn) {
        return fallback;
    }

    let hasAccess = false;

    if (permission) {
        hasAccess = checkPermissionFn(user.role, permission);
    } else if (permissions.length > 0) {
        if (requireAll) {
            hasAccess = permissions.every(p => checkPermissionFn(user.role, p));
        } else {
            hasAccess = permissions.some(p => checkPermissionFn(user.role, p));
        }
    } else {
        hasAccess = true;
    }

    if (!hasAccess) {
        if (showLocked) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative inline-block">
                                <div className="opacity-50 pointer-events-none">
                                    {children}
                                </div>
                                <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>You don't have permission to access this</p>
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
 * Hook for field-level permissions (disables/makes readonly)
 */
export function useFieldPermissionUniversal(user, permission, checkPermissionFn) {
    const canEdit = user && checkPermissionFn ? checkPermissionFn(user.role, permission) : false;
    
    return {
        disabled: !canEdit,
        readOnly: !canEdit,
        canEdit
    };
}