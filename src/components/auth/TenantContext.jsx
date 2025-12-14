import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
    const [currentTenant, setCurrentTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load tenant from session
        const session = JSON.parse(localStorage.getItem('platform_admin_session') || '{}');
        if (session.tenant_id) {
            loadTenant(session.tenant_id);
        } else {
            setLoading(false);
        }
    }, []);

    const loadTenant = async (tenantId) => {
        try {
            const tenants = await base44.asServiceRole.entities.Tenant.list();
            const tenant = tenants.find(t => t.id === tenantId);
            setCurrentTenant(tenant);
        } catch (error) {
            console.error('Failed to load tenant:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchTenant = (tenantId) => {
        const session = JSON.parse(localStorage.getItem('platform_admin_session') || '{}');
        session.tenant_id = tenantId;
        localStorage.setItem('platform_admin_session', JSON.stringify(session));
        loadTenant(tenantId);
    };

    const clearTenant = () => {
        const session = JSON.parse(localStorage.getItem('platform_admin_session') || '{}');
        delete session.tenant_id;
        localStorage.setItem('platform_admin_session', JSON.stringify(session));
        setCurrentTenant(null);
    };

    return (
        <TenantContext.Provider value={{ 
            currentTenant, 
            loading, 
            switchTenant, 
            clearTenant,
            tenantId: currentTenant?.id 
        }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
}