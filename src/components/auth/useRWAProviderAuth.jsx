import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function useRWAProviderAuth() {
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem('rwa_provider_session');
        
        if (!sessionData) {
            navigate(createPageUrl('RWAProviderLogin'));
            return;
        }

        const session = JSON.parse(sessionData);
        setProvider(session);
        setLoading(false);
    }, []);

    return { provider, loading };
}

export function useAssetIssuerAuth() {
    const navigate = useNavigate();
    const [issuer, setIssuer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem('asset_issuer_session');
        
        if (!sessionData) {
            navigate(createPageUrl('AssetIssuerLogin'));
            return;
        }

        const session = JSON.parse(sessionData);
        setIssuer(session);
        setLoading(false);
    }, []);

    return { issuer, loading };
}