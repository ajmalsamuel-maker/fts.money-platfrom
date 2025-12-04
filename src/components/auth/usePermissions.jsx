import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { hasPermission, ROLE_CONFIG } from './permissions';

export function usePermissions() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const userRole = user?.app_role || 'viewer';
    const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.viewer;

    const checkPermission = (permission) => {
        return hasPermission(userRole, permission);
    };

    const can = (permission) => checkPermission(permission);

    const isAdmin = () => userRole === 'admin';
    const isEditor = () => userRole === 'editor';
    const isViewer = () => userRole === 'viewer';

    return {
        user,
        userRole,
        roleConfig,
        loading,
        error,
        can,
        checkPermission,
        isAdmin,
        isEditor,
        isViewer,
    };
}