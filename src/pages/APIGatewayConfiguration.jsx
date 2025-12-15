import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Network, 
    Shield, 
    Zap,
    CheckCircle2,
    AlertCircle,
    Server,
    Globe,
    Lock,
    Activity,
    Code,
    ArrowRight,
    Copy,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const API_GATEWAY_PROVIDERS = [
    { 
        id: 'kong', 
        name: 'Kong Gateway', 
        type: 'oss',
        description: 'Best for: Starting out, cloud-native deployments',
        pricing: 'Free OSS / $500-800/mo Konnect / $2k+ Enterprise',
        icon: '🦍',
        features: ['Rate Limiting', 'JWT Auth', 'Plugins Ecosystem', 'Low Cost']
    },
    { 
        id: 'apigee', 
        name: 'Apigee', 
        type: 'enterprise',
        description: 'Best for: Large payment processors needing enterprise governance',
        pricing: '$1k-10k+/mo (Google Cloud)',
        icon: '🔷',
        features: ['Advanced Analytics', 'Developer Portal', 'Monetization', 'API Products']
    },
    { 
        id: 'azure', 
        name: 'Azure API Management', 
        type: 'enterprise',
        description: 'Best for: Microsoft-centric payment ecosystems',
        pricing: '$600-3k+/mo',
        icon: '☁️',
        features: ['Azure Integration', 'AD Auth', 'Enterprise Security', 'Hybrid Deployment']
    },
    { 
        id: 'mulesoft', 
        name: 'MuleSoft', 
        type: 'enterprise',
        description: 'Best for: Heavy integration with legacy banking systems',
        pricing: '$3k-20k+/mo',
        icon: '🔗',
        features: ['Legacy Integration', 'Anypoint Platform', 'DataWeave', 'Enterprise ESB']
    },
    { 
        id: 'tyk', 
        name: 'Tyk', 
        type: 'oss',
        description: 'Best for: Open-source with strong compliance features',
        pricing: 'Free OSS / $500-2k/mo Enterprise',
        icon: '🔐',
        features: ['GraphQL', 'gRPC Support', 'Universal Data Graph', 'Compliance Ready']
    },
    { 
        id: 'gravitee', 
        name: 'Gravitee.io', 
        type: 'oss',
        description: 'Best for: Full open-source API management platform',
        pricing: 'Free OSS / $1k+/mo Enterprise',
        icon: '🌀',
        features: ['Event-native', 'API Design Studio', 'Async APIs', 'Policy Studio']
    },
    { 
        id: 'wso2', 
        name: 'WSO2 API Manager', 
        type: 'oss',
        description: 'Best for: Open-source with comprehensive features',
        pricing: 'Free OSS / $2k+/mo Enterprise',
        icon: '⚡',
        features: ['Full Lifecycle', 'API Marketplace', 'Microgateway', 'Identity Server']
    },
    { 
        id: 'gloo', 
        name: 'Gloo Edge', 
        type: 'oss',
        description: 'Best for: Kubernetes-native API gateway (Envoy-based)',
        pricing: 'Free OSS / $1k+/mo Enterprise',
        icon: '🚀',
        features: ['Envoy Proxy', 'Service Mesh', 'K8s Native', 'GraphQL']
    },
    { 
        id: 'krakend', 
        name: 'KrakenD', 
        type: 'oss',
        description: 'Best for: High-performance, stateless API gateway',
        pricing: 'Free OSS / $500-2k/mo Enterprise',
        icon: '🐙',
        features: ['Ultra Fast', 'No DB Required', 'Low Memory', 'API Composition']
    }
];

const KONG_PLUGINS = [
    { id: 'rate-limiting', name: 'Rate Limiting', category: 'traffic-control', enabled: true },
    { id: 'jwt', name: 'JWT Authentication', category: 'security', enabled: true },
    { id: 'key-auth', name: 'API Key Auth', category: 'security', enabled: true },
    { id: 'cors', name: 'CORS', category: 'security', enabled: true },
    { id: 'request-transformer', name: 'Request Transformer', category: 'transformation', enabled: false },
    { id: 'response-transformer', name: 'Response Transformer', category: 'transformation', enabled: false },
    { id: 'ip-restriction', name: 'IP Restriction', category: 'security', enabled: false },
    { id: 'acl', name: 'ACL', category: 'security', enabled: false },
    { id: 'prometheus', name: 'Prometheus Metrics', category: 'monitoring', enabled: true },
    { id: 'datadog', name: 'Datadog', category: 'monitoring', enabled: false }
];

export default function APIGatewayConfiguration() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedProviders, setSelectedProviders] = useState(['kong']);
    const [kongConfig, setKongConfig] = useState({
        deployment_type: 'kong_oss',
        admin_url: 'http://localhost:8001',
        proxy_url: 'http://localhost:8000',
        admin_token: '',
        enabled_plugins: ['rate-limiting', 'jwt', 'key-auth', 'cors', 'prometheus'],
        rate_limit_per_minute: 1000,
        rate_limit_per_hour: 50000,
        jwt_secret: '',
        cors_origins: '*',
        cors_methods: 'GET, POST, PUT, DELETE, OPTIONS',
        ip_whitelist: []
    });
    
    const [providerConfigs, setProviderConfigs] = useState({
        apigee: {
            organization: '',
            environment: 'test',
            api_key: '',
            service_account_json: ''
        },
        azure: {
            subscription_id: '',
            resource_group: '',
            service_name: '',
            api_key: ''
        },
        mulesoft: {
            anypoint_username: '',
            anypoint_password: '',
            organization_id: '',
            environment_id: ''
        },
        tyk: {
            gateway_url: 'http://localhost:8080',
            dashboard_url: 'http://localhost:3000',
            api_key: '',
            org_id: ''
        },
        gravitee: {
            management_url: 'http://localhost:8083',
            gateway_url: 'http://localhost:8082',
            api_key: ''
        },
        wso2: {
            publisher_url: 'https://localhost:9443',
            gateway_url: 'https://localhost:8243',
            username: 'admin',
            password: ''
        },
        gloo: {
            namespace: 'gloo-system',
            gateway_proxy: 'gateway-proxy',
            cluster_name: 'default'
        },
        krakend: {
            config_file: '/etc/krakend/krakend.json',
            port: 8080,
            admin_port: 8090
        }
    });

    const [orchestrationConfig, setOrchestrationConfig] = useState({
        enable_smart_routing: true,
        enable_failover: true,
        max_retry_attempts: 3,
        retry_delay_ms: 1000,
        enable_cost_optimization: true,
        enable_iso20022_transform: true,
        enable_travel_rule: true,
        log_level: 'info',
        timeout_ms: 30000,
        circuit_breaker_threshold: 5,
        circuit_breaker_timeout: 60000
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const orchestrationEndpoint = `${window.location.origin}/api/orchestrate`;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="APIGatewayConfiguration" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">API Gateway & Orchestration</h2>
                        <p className="text-xs text-slate-600">Kong Gateway + Custom Payment Orchestration Layer</p>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">Architecture</TabsTrigger>
                            <TabsTrigger value="providers">Gateway Providers</TabsTrigger>
                            <TabsTrigger value="configuration">Configuration</TabsTrigger>
                            <TabsTrigger value="orchestration">Orchestration Layer</TabsTrigger>
                            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
                        </TabsList>

                        {/* Architecture Overview */}
                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hybrid Architecture</CardTitle>
                                    <p className="text-sm text-slate-600">
                                        {selectedProviders.length > 0 
                                            ? `${selectedProviders.map(id => API_GATEWAY_PROVIDERS.find(p => p.id === id)?.name).join(', ')} for infrastructure + Custom orchestration for payment logic`
                                            : 'Select gateways in Providers tab + Custom orchestration for payment logic'
                                        }
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {/* Active Gateways */}
                                        {selectedProviders.length > 0 && (
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="font-semibold text-slate-900 mb-2">Active API Gateways</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProviders.map(id => {
                                                        const provider = API_GATEWAY_PROVIDERS.find(p => p.id === id);
                                                        return (
                                                            <Badge key={id} className="bg-blue-600 text-white text-xs">
                                                                {provider?.icon} {provider?.name}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Flow Diagram */}
                                        <div className="flex items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                            <div className="flex-1 text-center">
                                                <div className="w-16 h-16 mx-auto rounded-xl bg-blue-600 flex items-center justify-center mb-3">
                                                    <Globe className="h-8 w-8 text-white" />
                                                </div>
                                                <p className="font-semibold text-slate-900">Merchant</p>
                                                <p className="text-xs text-slate-600">API Request</p>
                                            </div>
                                            <ArrowRight className="h-6 w-6 text-slate-400" />
                                            <div className="flex-1 text-center">
                                                <div className="w-16 h-16 mx-auto rounded-xl bg-purple-600 flex items-center justify-center mb-3">
                                                    <Shield className="h-8 w-8 text-white" />
                                                </div>
                                                <p className="font-semibold text-slate-900">API Gateway(s)</p>
                                                <p className="text-xs text-slate-600">Auth, Rate Limit, Security</p>
                                            </div>
                                            <ArrowRight className="h-6 w-6 text-slate-400" />
                                            <div className="flex-1 text-center">
                                                <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center mb-3">
                                                    <Zap className="h-8 w-8 text-white" />
                                                </div>
                                                <p className="font-semibold text-slate-900">Orchestration</p>
                                                <p className="text-xs text-slate-600">Routing, Fees, ISO20022</p>
                                            </div>
                                            <ArrowRight className="h-6 w-6 text-slate-400" />
                                            <div className="flex-1 text-center">
                                                <div className="w-16 h-16 mx-auto rounded-xl bg-amber-600 flex items-center justify-center mb-3">
                                                    <Network className="h-8 w-8 text-white" />
                                                </div>
                                                <p className="font-semibold text-slate-900">Providers</p>
                                                <p className="text-xs text-slate-600">Process Payment</p>
                                            </div>
                                        </div>

                                        {/* Responsibilities */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <Shield className="h-5 w-5 text-purple-600" />
                                                    API Gateway(s) Handle
                                                </h3>
                                                <ul className="space-y-2 text-sm">
                                                    {[
                                                        'Authentication (JWT, API Keys)',
                                                        'Rate limiting & throttling',
                                                        'DDoS protection',
                                                        'SSL termination',
                                                        'Request/response caching',
                                                        'Load balancing',
                                                        'Analytics & monitoring',
                                                        'CORS & security headers'
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                            <span className="text-slate-700">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-emerald-600" />
                                                    Custom Orchestration Handles
                                                </h3>
                                                <ul className="space-y-2 text-sm">
                                                    {[
                                                        'Multi-PSP tenant routing',
                                                        'Smart payment provider selection',
                                                        'Fee calculation & markup',
                                                        'ISO 20022 transformation',
                                                        'FATF Travel Rule compliance',
                                                        'MID routing (BIN-based)',
                                                        'Failover & retry logic',
                                                        'Settlement reconciliation'
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                            <span className="text-slate-700">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Cost Breakdown */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <Card className="border-2 border-emerald-200 bg-emerald-50">
                                                <CardContent className="p-4">
                                                    <Badge className="bg-emerald-600 text-white mb-2">Recommended</Badge>
                                                    <h4 className="font-semibold text-slate-900 mb-1">Open Source</h4>
                                                    <p className="text-2xl font-bold text-slate-900 mb-2">$0/month</p>
                                                    <p className="text-xs text-slate-600">Kong, Tyk, Gravitee, WSO2, etc.</p>
                                                    <ul className="mt-3 space-y-1 text-xs text-slate-700">
                                                        <li>✓ Full control</li>
                                                        <li>✓ Self-hosted</li>
                                                        <li>✓ Community support</li>
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-2 border-blue-200 bg-blue-50">
                                                <CardContent className="p-4">
                                                    <h4 className="font-semibold text-slate-900 mb-1">Managed/Cloud</h4>
                                                    <p className="text-2xl font-bold text-slate-900 mb-2">$500-2k/mo</p>
                                                    <p className="text-xs text-slate-600">Azure, Tyk Cloud, Gravitee Cloud</p>
                                                    <ul className="mt-3 space-y-1 text-xs text-slate-700">
                                                        <li>✓ Managed service</li>
                                                        <li>✓ Auto-scaling</li>
                                                        <li>✓ 24/7 support</li>
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-2 border-purple-200 bg-purple-50">
                                                <CardContent className="p-4">
                                                    <h4 className="font-semibold text-slate-900 mb-1">Enterprise</h4>
                                                    <p className="text-2xl font-bold text-slate-900 mb-2">$3k-20k+/mo</p>
                                                    <p className="text-xs text-slate-600">Apigee, MuleSoft, WSO2 Enterprise</p>
                                                    <ul className="mt-3 space-y-1 text-xs text-slate-700">
                                                        <li>✓ Full lifecycle</li>
                                                        <li>✓ Enterprise SLA</li>
                                                        <li>✓ Advanced features</li>
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Gateway Providers */}
                        <TabsContent value="providers" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Select Your API Gateways (Multi-Select)</CardTitle>
                                    <p className="text-sm text-slate-600">Choose one or more gateways - use different gateways for different purposes or regions</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {API_GATEWAY_PROVIDERS.map((provider) => {
                                            const isSelected = selectedProviders.includes(provider.id);
                                            return (
                                                <Card 
                                                    key={provider.id}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:shadow-md",
                                                        isSelected 
                                                            ? "border-2 border-blue-500 bg-blue-50" 
                                                            : "border border-slate-200"
                                                    )}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedProviders(selectedProviders.filter(p => p !== provider.id));
                                                        } else {
                                                            setSelectedProviders([...selectedProviders, provider.id]);
                                                        }
                                                    }}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="text-3xl">{provider.icon}</div>
                                                            {isSelected && (
                                                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-slate-900 mb-1">{provider.name}</h4>
                                                        <Badge variant="outline" className="mb-2 text-xs capitalize">
                                                            {provider.type}
                                                        </Badge>
                                                        <p className="text-xs text-slate-600 mb-2">{provider.description}</p>
                                                        <p className="text-xs font-medium text-slate-900 mb-3">{provider.pricing}</p>
                                                        <div className="space-y-1">
                                                            {provider.features.map((feature, i) => (
                                                                <div key={i} className="flex items-center gap-1 text-xs text-slate-700">
                                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                                    {feature}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Configuration */}
                        <TabsContent value="configuration" className="space-y-6">
                            {selectedProviders.map((providerId) => {
                                const provider = API_GATEWAY_PROVIDERS.find(p => p.id === providerId);
                                return (
                                    <Card key={providerId}>
                                        <CardHeader>
                                            <CardTitle>{provider?.name} Configuration</CardTitle>
                                            <p className="text-sm text-slate-600">Configure your {providerId} gateway settings</p>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Kong Configuration */}
                                            {providerId === 'kong' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <Label>Deployment Type</Label>
                                                    <Select value={kongConfig.deployment_type} onValueChange={(v) => setKongConfig({...kongConfig, deployment_type: v})}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="kong_oss">Kong OSS (Open Source)</SelectItem>
                                                            <SelectItem value="kong_konnect">Kong Konnect</SelectItem>
                                                            <SelectItem value="kong_enterprise">Kong Enterprise</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Log Level</Label>
                                                    <Select value={orchestrationConfig.log_level} onValueChange={(v) => setOrchestrationConfig({...orchestrationConfig, log_level: v})}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="debug">Debug</SelectItem>
                                                            <SelectItem value="info">Info</SelectItem>
                                                            <SelectItem value="warn">Warning</SelectItem>
                                                            <SelectItem value="error">Error</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label>Kong Admin URL</Label>
                                            <Input 
                                                value={kongConfig.admin_url} 
                                                onChange={(e) => setKongConfig({...kongConfig, admin_url: e.target.value})}
                                                placeholder="http://localhost:8001"
                                            />
                                        </div>
                                        <div>
                                            <Label>Kong Proxy URL</Label>
                                            <Input 
                                                value={kongConfig.proxy_url} 
                                                onChange={(e) => setKongConfig({...kongConfig, proxy_url: e.target.value})}
                                                placeholder="http://localhost:8000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Admin API Token (Optional)</Label>
                                        <Input 
                                            type="password"
                                            value={kongConfig.admin_token} 
                                            onChange={(e) => setKongConfig({...kongConfig, admin_token: e.target.value})}
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label>Rate Limit (per minute)</Label>
                                            <Input 
                                                type="number"
                                                value={kongConfig.rate_limit_per_minute} 
                                                onChange={(e) => setKongConfig({...kongConfig, rate_limit_per_minute: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Rate Limit (per hour)</Label>
                                            <Input 
                                                type="number"
                                                value={kongConfig.rate_limit_per_hour} 
                                                onChange={(e) => setKongConfig({...kongConfig, rate_limit_per_hour: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                            <div>
                                                <Label>CORS Origins</Label>
                                                <Input 
                                                    value={kongConfig.cors_origins} 
                                                    onChange={(e) => setKongConfig({...kongConfig, cors_origins: e.target.value})}
                                                    placeholder="* or comma-separated origins"
                                                />
                                            </div>
                                        </>
                                    )}

                                            {/* Apigee Configuration */}
                                            {providerId === 'apigee' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Organization</Label>
                                                    <Input value={providerConfigs.apigee.organization} onChange={(e) => setProviderConfigs({...providerConfigs, apigee: {...providerConfigs.apigee, organization: e.target.value}})} placeholder="your-org" />
                                                </div>
                                                <div>
                                                    <Label>Environment</Label>
                                                    <Select value={providerConfigs.apigee.environment} onValueChange={(v) => setProviderConfigs({...providerConfigs, apigee: {...providerConfigs.apigee, environment: v}})}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="test">Test</SelectItem>
                                                            <SelectItem value="prod">Production</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>API Key</Label>
                                                <Input type="password" value={providerConfigs.apigee.api_key} onChange={(e) => setProviderConfigs({...providerConfigs, apigee: {...providerConfigs.apigee, api_key: e.target.value}})} />
                                            </div>
                                            <div>
                                                <Label>Service Account JSON</Label>
                                                <Textarea rows={4} value={providerConfigs.apigee.service_account_json} onChange={(e) => setProviderConfigs({...providerConfigs, apigee: {...providerConfigs.apigee, service_account_json: e.target.value}})} placeholder="Paste service account JSON" />
                                            </div>
                                        </div>
                                    )}

                                            {/* Azure API Management */}
                                            {providerId === 'azure' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Subscription ID</Label>
                                                    <Input value={providerConfigs.azure.subscription_id} onChange={(e) => setProviderConfigs({...providerConfigs, azure: {...providerConfigs.azure, subscription_id: e.target.value}})} />
                                                </div>
                                                <div>
                                                    <Label>Resource Group</Label>
                                                    <Input value={providerConfigs.azure.resource_group} onChange={(e) => setProviderConfigs({...providerConfigs, azure: {...providerConfigs.azure, resource_group: e.target.value}})} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Service Name</Label>
                                                <Input value={providerConfigs.azure.service_name} onChange={(e) => setProviderConfigs({...providerConfigs, azure: {...providerConfigs.azure, service_name: e.target.value}})} />
                                            </div>
                                            <div>
                                                <Label>API Management Key</Label>
                                                <Input type="password" value={providerConfigs.azure.api_key} onChange={(e) => setProviderConfigs({...providerConfigs, azure: {...providerConfigs.azure, api_key: e.target.value}})} />
                                            </div>
                                        </div>
                                    )}

                                            {/* MuleSoft */}
                                            {providerId === 'mulesoft' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Anypoint Username</Label>
                                                    <Input value={providerConfigs.mulesoft.anypoint_username} onChange={(e) => setProviderConfigs({...providerConfigs, mulesoft: {...providerConfigs.mulesoft, anypoint_username: e.target.value}})} />
                                                </div>
                                                <div>
                                                    <Label>Anypoint Password</Label>
                                                    <Input type="password" value={providerConfigs.mulesoft.anypoint_password} onChange={(e) => setProviderConfigs({...providerConfigs, mulesoft: {...providerConfigs.mulesoft, anypoint_password: e.target.value}})} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Organization ID</Label>
                                                    <Input value={providerConfigs.mulesoft.organization_id} onChange={(e) => setProviderConfigs({...providerConfigs, mulesoft: {...providerConfigs.mulesoft, organization_id: e.target.value}})} />
                                                </div>
                                                <div>
                                                    <Label>Environment ID</Label>
                                                    <Input value={providerConfigs.mulesoft.environment_id} onChange={(e) => setProviderConfigs({...providerConfigs, mulesoft: {...providerConfigs.mulesoft, environment_id: e.target.value}})} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                            {/* Other providers - simplified configs */}
                                            {['tyk', 'gravitee', 'wso2', 'gloo', 'krakend'].includes(providerId) && (
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-900">
                                                        <strong>{provider?.name}</strong> configuration available.
                                                        Connect your {providerId} instance to the FTS orchestration endpoint shown in the API Endpoints tab.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {selectedProviders.includes('kong') && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Kong Plugins</CardTitle>
                                        <p className="text-sm text-slate-600">Enable/disable Kong gateway plugins</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            {KONG_PLUGINS.map((plugin) => (
                                                <div key={plugin.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-sm">{plugin.name}</p>
                                                        <Badge variant="outline" className="mt-1 text-xs capitalize">
                                                            {plugin.category.replace('-', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <Switch 
                                                        checked={kongConfig.enabled_plugins.includes(plugin.id)}
                                                        onCheckedChange={(checked) => {
                                                            const plugins = checked 
                                                                ? [...kongConfig.enabled_plugins, plugin.id]
                                                                : kongConfig.enabled_plugins.filter(p => p !== plugin.id);
                                                            setKongConfig({...kongConfig, enabled_plugins: plugins});
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Orchestration Configuration */}
                        <TabsContent value="orchestration" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Custom Orchestration Layer</CardTitle>
                                    <p className="text-sm text-slate-600">Payment-specific business logic configuration</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div>
                                                <Label>Smart Routing</Label>
                                                <p className="text-xs text-slate-500">Cost & success rate optimization</p>
                                            </div>
                                            <Switch 
                                                checked={orchestrationConfig.enable_smart_routing}
                                                onCheckedChange={(v) => setOrchestrationConfig({...orchestrationConfig, enable_smart_routing: v})}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div>
                                                <Label>Automatic Failover</Label>
                                                <p className="text-xs text-slate-500">Switch providers on failure</p>
                                            </div>
                                            <Switch 
                                                checked={orchestrationConfig.enable_failover}
                                                onCheckedChange={(v) => setOrchestrationConfig({...orchestrationConfig, enable_failover: v})}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div>
                                                <Label>ISO 20022 Transform</Label>
                                                <p className="text-xs text-slate-500">Message standardization</p>
                                            </div>
                                            <Switch 
                                                checked={orchestrationConfig.enable_iso20022_transform}
                                                onCheckedChange={(v) => setOrchestrationConfig({...orchestrationConfig, enable_iso20022_transform: v})}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div>
                                                <Label>FATF Travel Rule</Label>
                                                <p className="text-xs text-slate-500">Crypto compliance checks</p>
                                            </div>
                                            <Switch 
                                                checked={orchestrationConfig.enable_travel_rule}
                                                onCheckedChange={(v) => setOrchestrationConfig({...orchestrationConfig, enable_travel_rule: v})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <Label>Max Retry Attempts</Label>
                                            <Input 
                                                type="number"
                                                value={orchestrationConfig.max_retry_attempts}
                                                onChange={(e) => setOrchestrationConfig({...orchestrationConfig, max_retry_attempts: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Retry Delay (ms)</Label>
                                            <Input 
                                                type="number"
                                                value={orchestrationConfig.retry_delay_ms}
                                                onChange={(e) => setOrchestrationConfig({...orchestrationConfig, retry_delay_ms: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Request Timeout (ms)</Label>
                                            <Input 
                                                type="number"
                                                value={orchestrationConfig.timeout_ms}
                                                onChange={(e) => setOrchestrationConfig({...orchestrationConfig, timeout_ms: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label>Circuit Breaker Threshold</Label>
                                            <Input 
                                                type="number"
                                                value={orchestrationConfig.circuit_breaker_threshold}
                                                onChange={(e) => setOrchestrationConfig({...orchestrationConfig, circuit_breaker_threshold: parseInt(e.target.value)})}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Failures before circuit opens</p>
                                        </div>
                                        <div>
                                            <Label>Circuit Breaker Timeout (ms)</Label>
                                            <Input 
                                                type="number"
                                                value={orchestrationConfig.circuit_breaker_timeout}
                                                onChange={(e) => setOrchestrationConfig({...orchestrationConfig, circuit_breaker_timeout: parseInt(e.target.value)})}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Time before retry</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* API Endpoints */}
                        <TabsContent value="endpoints" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Orchestration API Endpoint</CardTitle>
                                    <p className="text-sm text-slate-600">Point Kong to this FTS orchestration endpoint</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-slate-900 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className="bg-emerald-600 text-white">POST</Badge>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => copyToClipboard(orchestrationEndpoint)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <code className="text-emerald-400 text-sm">{orchestrationEndpoint}</code>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Sample Request Body</h4>
                                        <div className="p-4 bg-slate-900 rounded-lg relative">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => copyToClipboard(JSON.stringify({
                                                    psp_code: "PSP001",
                                                    merchant_id: "merchant_123",
                                                    amount: 100.00,
                                                    currency: "USD",
                                                    payment_method: "card",
                                                    card_number: "4242424242424242",
                                                    customer_email: "customer@example.com"
                                                }, null, 2))}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <pre className="text-emerald-400 text-xs overflow-x-auto">
{`{
  "psp_code": "PSP001",
  "merchant_id": "merchant_123",
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "card",
  "card_number": "4242424242424242",
  "customer_email": "customer@example.com"
}`}
                                            </pre>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                            <Code className="h-4 w-4" />
                                            Kong Service Configuration
                                        </h4>
                                        <p className="text-sm text-blue-800 mb-3">
                                            Configure Kong to route requests through this orchestration layer
                                        </p>
                                        <div className="p-3 bg-slate-900 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
{`curl -i -X POST http://localhost:8001/services \\
  --data name=fts-orchestration \\
  --data url='${orchestrationEndpoint}'

curl -i -X POST http://localhost:8001/services/fts-orchestration/routes \\
  --data 'paths[]=/payments' \\
  --data name=payment-route`}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Start Guide</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">1</div>
                                            <div>
                                                <h4 className="font-medium">Install Kong Gateway OSS</h4>
                                                <p className="text-sm text-slate-600">
                                                    Docker: <code className="text-xs bg-slate-100 px-2 py-1 rounded">docker run -d --name kong -p 8000:8000 -p 8001:8001 kong:latest</code>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">2</div>
                                            <div>
                                                <h4 className="font-medium">Configure FTS Orchestration Service</h4>
                                                <p className="text-sm text-slate-600">Point Kong to FTS.Money orchestration endpoint (already deployed)</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">3</div>
                                            <div>
                                                <h4 className="font-medium">Enable Plugins</h4>
                                                <p className="text-sm text-slate-600">Enable JWT, rate-limiting, CORS plugins via Kong Admin API</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex-shrink-0">4</div>
                                            <div>
                                                <h4 className="font-medium">Start Processing Payments</h4>
                                                <p className="text-sm text-slate-600">Send requests to Kong proxy (port 8000), let orchestration handle routing</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}