import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Terminal, Server, Database, Lock, Zap } from 'lucide-react';

export default function KongSetupGuide() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Kong Gateway Setup Guide</h1>
                <p className="text-slate-600">Deploy Kong Gateway on DigitalOcean for FTS Platform</p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm">
                    <strong>Timeline:</strong> 30-60 minutes setup • <strong>Cost:</strong> $39/month (4GB Droplet + Basic PostgreSQL)
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="step1">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="step1">Droplet</TabsTrigger>
                    <TabsTrigger value="step2">Database</TabsTrigger>
                    <TabsTrigger value="step3">Docker</TabsTrigger>
                    <TabsTrigger value="step4">Kong</TabsTrigger>
                    <TabsTrigger value="step5">Configure</TabsTrigger>
                    <TabsTrigger value="step6">Test</TabsTrigger>
                </TabsList>

                <TabsContent value="step1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5 text-blue-600" />
                                Step 1: Create DigitalOcean Droplet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Configuration:</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Image:</strong> Ubuntu 22.04 LTS</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Plan:</strong> Basic • 4GB RAM / 2 CPUs ($24/month)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Region:</strong> Choose closest to your users (e.g., NYC, Singapore, Frankfurt)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Authentication:</strong> SSH Key (more secure than password)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Hostname:</strong> kong-gateway-fts</span>
                                    </li>
                                </ul>
                            </div>

                            <Alert>
                                <AlertDescription className="text-xs">
                                    <strong>SSH Key Setup:</strong> If you don't have one, run <code className="bg-slate-100 px-1 rounded">ssh-keygen</code> on your local machine, 
                                    then copy the content of <code className="bg-slate-100 px-1 rounded">~/.ssh/id_rsa.pub</code> to DigitalOcean.
                                </AlertDescription>
                            </Alert>

                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-600 mb-2">After creation, you'll get an IP address:</p>
                                <code className="text-xs">ssh root@YOUR_DROPLET_IP</code>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="step2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-purple-600" />
                                Step 2: Create Managed PostgreSQL Database
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Go to Managed Databases:</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Engine:</strong> PostgreSQL 16</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Plan:</strong> Basic ($15/month)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Region:</strong> Same as your Droplet</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Database Name:</strong> kong</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                        <span><strong>Database Cluster Name:</strong> kong-gateway-db</span>
                                    </li>
                                </ul>
                            </div>

                            <Alert className="bg-yellow-50 border-yellow-200">
                                <AlertDescription className="text-xs">
                                    <strong>Important:</strong> After creation, add your Droplet's IP to the "Trusted Sources" in the database settings.
                                </AlertDescription>
                            </Alert>

                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-600 mb-2">Save these credentials (shown once):</p>
                                <pre className="text-xs overflow-x-auto">
{`Host: your-db-host.db.ondigitalocean.com
Port: 25060
User: doadmin
Password: YOUR_PASSWORD
Database: kong
SSL Mode: require`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="step3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-orange-600" />
                                Step 3: Install Docker on Droplet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">SSH into your Droplet:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
ssh root@YOUR_DROPLET_IP
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Install Docker & Docker Compose:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version`}
                                </pre>
                            </div>

                            <Alert className="bg-green-50 border-green-200">
                                <AlertDescription className="text-xs">
                                    ✅ Docker installation complete! You should see version numbers for both docker and docker-compose.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="step4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-cyan-600" />
                                Step 4: Deploy Kong Gateway
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Create docker-compose.yml file:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Create directory
mkdir -p /opt/kong
cd /opt/kong

# Create docker-compose file
nano docker-compose.yml`}
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Paste this configuration:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto max-h-96">
{`version: '3.8'

services:
  kong-migrations:
    image: kong/kong-gateway:3.5
    command: kong migrations bootstrap
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: your-db-host.db.ondigitalocean.com
      KONG_PG_PORT: 25060
      KONG_PG_USER: doadmin
      KONG_PG_PASSWORD: YOUR_DB_PASSWORD
      KONG_PG_DATABASE: kong
      KONG_PG_SSL: 'on'
    restart: on-failure

  kong:
    image: kong/kong-gateway:3.5
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: your-db-host.db.ondigitalocean.com
      KONG_PG_PORT: 25060
      KONG_PG_USER: doadmin
      KONG_PG_PASSWORD: YOUR_DB_PASSWORD
      KONG_PG_DATABASE: kong
      KONG_PG_SSL: 'on'
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_ADMIN_GUI_URL: http://YOUR_DROPLET_IP:8002
    ports:
      - "8000:8000"   # HTTP Proxy
      - "8443:8443"   # HTTPS Proxy
      - "8001:8001"   # Admin API
      - "8002:8002"   # Kong Manager (GUI)
    depends_on:
      - kong-migrations
    restart: always
    healthcheck:
      test: ["CMD", "kong", "health"]
      interval: 10s
      timeout: 5s
      retries: 5`}
                                </pre>
                            </div>

                            <Alert className="bg-red-50 border-red-200">
                                <AlertDescription className="text-xs">
                                    <strong>Replace:</strong> YOUR_DB_PASSWORD, your-db-host, YOUR_DROPLET_IP with your actual values
                                </AlertDescription>
                            </Alert>

                            <div>
                                <h4 className="font-semibold mb-2">Start Kong:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Run migrations first
docker-compose up kong-migrations

# Start Kong
docker-compose up -d kong

# Check status
docker-compose ps
docker-compose logs kong`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="step5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-emerald-600" />
                                Step 5: Configure Kong for FTS Services
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Register your services in Kong:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# PSP Service
curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
  --data "name=psp-service" \\
  --data "url=https://YOUR_BASE44_APP_URL"

# Create route
curl -i -X POST http://YOUR_DROPLET_IP:8001/services/psp-service/routes \\
  --data "paths[]=/api/v1/psp" \\
  --data "strip_path=false"

# Add rate limiting
curl -i -X POST http://YOUR_DROPLET_IP:8001/services/psp-service/plugins \\
  --data "name=rate-limiting" \\
  --data "config.minute=1000" \\
  --data "config.hour=50000"

# Add API key authentication
curl -i -X POST http://YOUR_DROPLET_IP:8001/services/psp-service/plugins \\
  --data "name=key-auth" \\
  --data "config.key_names[]=apikey"`}
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Repeat for other services:</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• ISO Gateway Service</li>
                                    <li>• Orchestration Service</li>
                                    <li>• Crypto Banking Service</li>
                                    <li>• RWA Platform Service</li>
                                </ul>
                            </div>

                            <Alert>
                                <AlertDescription className="text-xs">
                                    <strong>Pro Tip:</strong> Use Kong Manager GUI at http://YOUR_DROPLET_IP:8002 for visual configuration
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="step6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Step 6: Test Your Setup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">1. Check Kong is running:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`curl -i http://YOUR_DROPLET_IP:8001/status

# Should return: {"status":"healthy"}`}
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">2. Test proxy through Kong:</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Test without API key (should be rejected)
curl -i http://YOUR_DROPLET_IP:8000/api/v1/psp

# Create a consumer & API key
curl -i -X POST http://YOUR_DROPLET_IP:8001/consumers \\
  --data "username=test-client"

curl -i -X POST http://YOUR_DROPLET_IP:8001/consumers/test-client/key-auth

# Test with API key (should work)
curl -i http://YOUR_DROPLET_IP:8000/api/v1/psp \\
  -H "apikey: YOUR_GENERATED_KEY"`}
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">3. Access Kong Manager:</h4>
                                <p className="text-sm mb-2">Open in browser:</p>
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">http://YOUR_DROPLET_IP:8002</code>
                            </div>

                            <Alert className="bg-green-50 border-green-200">
                                <AlertDescription className="text-xs">
                                    🎉 <strong>Success!</strong> Kong Gateway is now running and protecting your FTS services!
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-red-600">⚠️</span> Troubleshooting
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Error: 'ContainerConfig' KeyError</h4>
                        <p className="text-xs text-slate-600 mb-2">If you get this error when running migrations:</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto mb-2">
            {`KeyError: 'ContainerConfig'`}
                        </pre>
                        <p className="text-xs text-slate-600 mb-2"><strong>Solution:</strong> Clean up old containers and use Docker Compose V2</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`# Stop and remove all containers
            cd /opt/kong
            docker-compose down -v

            # Remove dangling images
            docker system prune -a

            # Use Docker Compose V2 (without hyphen)
            docker compose up kong-migrations
            docker compose up -d kong

            # OR update docker-compose V1
            pip install --upgrade docker-compose`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Database Connection Failed</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`# Verify database is accessible
            psql "postgresql://doadmin:PASSWORD@HOST:25060/kong?sslmode=require"

            # Check Trusted Sources in DigitalOcean database settings
            # Add your Droplet's IP address`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Kong Not Starting</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`# Check logs
            docker compose logs kong

            # Restart Kong
            docker compose restart kong

            # Verify port availability
            netstat -tuln | grep 8001`}
                        </pre>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">1</Badge>
                        <span>Setup SSL/TLS certificates (Let's Encrypt)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">2</Badge>
                        <span>Configure custom domain (api.fts.money)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">3</Badge>
                        <span>Add monitoring (Prometheus + Grafana)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">4</Badge>
                        <span>Update Base44 functions to use Kong endpoints</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">5</Badge>
                        <span>Create API key management UI for clients</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Useful Commands</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# View Kong logs
docker-compose logs -f kong

# Restart Kong
docker-compose restart kong

# Stop Kong
docker-compose down

# Update Kong
docker-compose pull
docker-compose up -d

# List all services
curl http://YOUR_DROPLET_IP:8001/services

# List all routes
curl http://YOUR_DROPLET_IP:8001/routes

# List all plugins
curl http://YOUR_DROPLET_IP:8001/plugins`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}