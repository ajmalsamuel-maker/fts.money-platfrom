import React from 'react';
import { usePermissions } from './usePermissions';
import { Shield, Lock } from 'lucide-react';

// Component that only renders children if user has required permission
export function PermissionGate({ permission, children, fallback = null, showLocked = false }) {
    const { can, loading } = usePermissions();

    if (loading) {
        return null;
    }

    if (!can(permission)) {
        if (showLocked) {
            return (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>Insufficient permissions</span>
                </div>
            );
        }
        return fallback;
    }

    return children;
}

// Full page access denied component
export function AccessDenied() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 max-w-md">
                    You don't have permission to access this page. 
                    Please contact your administrator if you believe this is an error.
                </p>
            </div>
        </div>
    );
}