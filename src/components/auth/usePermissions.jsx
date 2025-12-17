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
                // Check for staff session first
                const staffSession = localStorage.getItem('staff_session');
                if (staffSession) {
                    const session = JSON.parse(staffSession);
                    setUser({
                        email: session.email,
                        full_name: session.full_name,
                        app_role: session.role,
                        id: session.user_id
                    });
                } else {
                    // Fallback to Base44 auth
                    const currentUser = await base44.auth.me();
                    setUser(currentUser);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const userRole = user?.app_role || user?.role || 'viewer';
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