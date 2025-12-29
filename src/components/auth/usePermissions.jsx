import { useMemo } from 'react';
import { PERMISSIONS, ROLE_PERMISSIONS, ROLE_HIERARCHY, REQUIRES_APPROVAL } from './permissions';

/**
 * Hook for checking permissions with context awareness
 * @param {Object} user - Current user object with role
 * @returns {Object} Permission checking functions
 */
export function usePermissions(user) {
    const userRole = user?.platform_role || user?.role || 'viewer';
    
    const hasPermission = useMemo(() => {
        return (permission, targetUser = null, targetEntity = null) => {
            if (!user || !userRole) return false;
            
            // Super admin has all permissions
            if (userRole === 'super_admin') return true;
            
            // Get permissions for this role
            const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
            
            // Check wildcard permission
            if (rolePermissions.includes('*')) return true;
            
            // Check exact permission match
            if (rolePermissions.includes(permission)) {
                // Additional context checks
                return checkContextualPermission(permission, user, targetUser, targetEntity);
            }
            
            return false;
        };
    }, [user, userRole]);
    
    const checkContextualPermission = (permission, currentUser, targetUser, targetEntity) => {
        const currentRole = currentUser?.platform_role || currentUser?.role || 'viewer';
        
        // User management context checks
        if (permission.startsWith('user:') && targetUser) {
            const targetRole = targetUser?.platform_role || targetUser?.role || 'viewer';
            
            // Cannot edit/delete super admins unless you are one
            if (targetRole === 'super_admin' && currentRole !== 'super_admin') {
                return false;
            }
            
            // Check role hierarchy for role_below permissions
            if (permission.includes(':role_below')) {
                const currentRoleLevel = ROLE_HIERARCHY[currentRole] || 0;
                const targetRoleLevel = ROLE_HIERARCHY[targetRole] || 0;
                return currentRoleLevel > targetRoleLevel;
            }
            
            // Check if editing own profile
            if (permission.includes(':own')) {
                return currentUser?.id === targetUser?.id || 
                       currentUser?.email === targetUser?.email;
            }
        }
        
        // PSP ownership checks
        if (permission.startsWith('psp:') && targetEntity) {
            if (permission.includes(':own')) {
                return targetEntity?.created_by === currentUser?.email ||
                       targetEntity?.owner_email === currentUser?.email;
            }
        }
        
        return true;
    };
    
    const hasAnyPermission = (permissions, targetUser = null, targetEntity = null) => {
        return permissions.some(permission => 
            hasPermission(permission, targetUser, targetEntity)
        );
    };
    
    const hasAllPermissions = (permissions, targetUser = null, targetEntity = null) => {
        return permissions.every(permission => 
            hasPermission(permission, targetUser, targetEntity)
        );
    };
    
    const canEditUser = (targetUser) => {
        if (!targetUser) return false;
        
        // Can always edit own profile (limited fields)
        if (user?.id === targetUser?.id || user?.email === targetUser?.email) {
            return hasPermission(PERMISSIONS.USER_EDIT_OWN, targetUser);
        }
        
        // Check if can edit any user
        if (hasPermission(PERMISSIONS.USER_EDIT_ANY, targetUser)) {
            return true;
        }
        
        // Check if can edit users with lower role
        return hasPermission(PERMISSIONS.USER_EDIT_ROLE_BELOW, targetUser);
    };
    
    const canDeleteUser = (targetUser) => {
        if (!targetUser) return false;
        
        // Cannot delete yourself
        if (user?.id === targetUser?.id || user?.email === targetUser?.email) {
            return false;
        }
        
        // Check if can delete any user
        if (hasPermission(PERMISSIONS.USER_DELETE_ANY, targetUser)) {
            return true;
        }
        
        // Check if can delete users with lower role
        return hasPermission(PERMISSIONS.USER_DELETE_ROLE_BELOW, targetUser);
    };
    
    const canChangeUserRole = (targetUser, newRole) => {
        if (!targetUser) return false;
        
        // Cannot change own role
        if (user?.id === targetUser?.id || user?.email === targetUser?.email) {
            return false;
        }
        
        // Must have permission to change roles
        if (!hasPermission(PERMISSIONS.USER_CHANGE_ROLE, targetUser)) {
            return false;
        }
        
        const currentRole = user?.platform_role || user?.role;
        const currentRoleLevel = ROLE_HIERARCHY[currentRole] || 0;
        const newRoleLevel = ROLE_HIERARCHY[newRole] || 0;
        
        // Cannot promote to a role equal or higher than your own (except super admin)
        if (currentRole !== 'super_admin' && newRoleLevel >= currentRoleLevel) {
            return false;
        }
        
        return true;
    };
    
    const requiresApproval = (permission) => {
        const approvalRules = REQUIRES_APPROVAL[permission];
        if (!approvalRules) return false;
        
        const currentRole = user?.platform_role || user?.role;
        return approvalRules.includes(currentRole);
    };
    
    const getRoleLevel = (role) => {
        return ROLE_HIERARCHY[role] || 0;
    };
    
    const isHigherRole = (role1, role2) => {
        return getRoleLevel(role1) > getRoleLevel(role2);
    };
    
    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canEditUser,
        canDeleteUser,
        canChangeUserRole,
        requiresApproval,
        getRoleLevel,
        isHigherRole,
        userRole,
        PERMISSIONS
    };
}

export default usePermissions;