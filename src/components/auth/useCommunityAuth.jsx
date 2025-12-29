import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, hasAnyPermission, hasAllPermissions, canManageUser } from './communityPermissions';

/**
 * Hook for Community Portal authentication and authorization
 */
export function useCommunityAuth(requiredPermissions = []) {
    const navigate = useNavigate();
    const [communityUser, setCommunityUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_session');
        
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }

        const session = JSON.parse(sessionData);
        setCommunityUser(session);
        setLoading(false);

        // Check if user has required permissions
        if (requiredPermissions.length > 0) {
            const hasAllRequired = requiredPermissions.every(permission => 
                hasPermission(session.community_role, permission)
            );
            
            if (!hasAllRequired) {
                navigate(createPageUrl('CommunityPortalDashboard'));
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const checkPermission = (permission) => {
        if (!communityUser) return false;
        return hasPermission(communityUser.community_role, permission);
    };

    const checkAnyPermission = (permissions) => {
        if (!communityUser) return false;
        return hasAnyPermission(communityUser.community_role, permissions);
    };

    const checkAllPermissions = (permissions) => {
        if (!communityUser) return false;
        return hasAllPermissions(communityUser.community_role, permissions);
    };

    const canManageOtherUser = (targetUserRole) => {
        if (!communityUser) return false;
        return canManageUser(communityUser.community_role, targetUserRole);
    };

    return {
        communityUser,
        loading,
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,
        canManageOtherUser,
        userRole: communityUser?.community_role
    };
}