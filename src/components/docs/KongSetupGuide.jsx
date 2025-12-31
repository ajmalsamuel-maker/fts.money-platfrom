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
                                        <Alert className="mb-3 bg-yellow-50 border-yellow-200">
                                            <AlertDescription className="text-xs">
                                                <strong>Finding Your App URL:</strong><br/>
                                                • NOT the builder URL (app.base44.com)<br/>
                                                • Look for your deployed app URL in the Base44 preview/iframe<br/>
                                                • Format: <code className="bg-slate-100 px-1 rounded">https://[unique-id].base44.app</code><br/>
                                                • Or check browser DevTools → Network tab → any API call → see the domain<br/>
                                                • Use ONLY the base domain, no paths (e.g., <code className="bg-slate-100 px-1 rounded">https://abc123.base44.app</code>)
                                            </AlertDescription>
                                        </Alert>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
                                {`# PSP Service Example
                                curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
                                --data "name=psp-service" \\
                                --data "url=https://abc123.base44.app"

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
  --data "config.key_names[]=apikey"

# ISO Gateway Service
curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
  --data "name=iso-gateway-service" \\
  --data "url=https://abc123.base44.app"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/iso-gateway-service/routes \\
  --data "paths[]=/api/v1/iso" \\
  --data "strip_path=false"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/iso-gateway-service/plugins \\
  --data "name=rate-limiting" \\
  --data "config.minute=2000" \\
  --data "config.hour=100000"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/iso-gateway-service/plugins \\
  --data "name=key-auth" \\
  --data "config.key_names[]=apikey"

# Orchestration Service
curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
  --data "name=orchestration-service" \\
  --data "url=https://abc123.base44.app"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/orchestration-service/routes \\
  --data "paths[]=/api/v1/orchestration" \\
  --data "strip_path=false"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/orchestration-service/plugins \\
  --data "name=rate-limiting" \\
  --data "config.minute=1500" \\
  --data "config.hour=75000"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/orchestration-service/plugins \\
  --data "name=key-auth" \\
  --data "config.key_names[]=apikey"

# Crypto Banking Service
curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
  --data "name=crypto-banking-service" \\
  --data "url=https://abc123.base44.app"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/crypto-banking-service/routes \\
  --data "paths[]=/api/v1/crypto" \\
  --data "strip_path=false"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/crypto-banking-service/plugins \\
  --data "name=rate-limiting" \\
  --data "config.minute=500" \\
  --data "config.hour=25000"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/crypto-banking-service/plugins \\
  --data "name=key-auth" \\
  --data "config.key_names[]=apikey"

# RWA Platform Service
curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
  --data "name=rwa-platform-service" \\
  --data "url=https://abc123.base44.app"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/rwa-platform-service/routes \\
  --data "paths[]=/api/v1/rwa" \\
  --data "strip_path=false"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/rwa-platform-service/plugins \\
  --data "name=rate-limiting" \\
  --data "config.minute=1000" \\
  --data "config.hour=50000"

curl -i -X POST http://YOUR_DROPLET_IP:8001/services/rwa-platform-service/plugins \\
  --data "name=key-auth" \\
  --data "config.key_names[]=apikey"`}
                                      </pre>
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
                        <h4 className="font-semibold text-sm mb-2">Error: "Couldn't connect to server" on port 8001</h4>
                        <p className="text-xs text-slate-600 mb-2">Kong Admin API not responding</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`# Check if Kong is running
            docker ps | grep kong

            # If not running, start it
            cd /opt/kong
            docker compose up -d kong

            # Check Kong logs
            docker compose logs -f kong

            # Verify Kong is healthy
            docker compose ps
            curl -i http://localhost:8001/status

            # If firewall issue, allow port
            ufw allow 8001/tcp`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Error: Double "https://" in URL</h4>
                        <p className="text-xs text-slate-600 mb-2"><strong>Wrong:</strong> <code className="bg-slate-100 px-1 rounded">https://https://txn.netxhub.tech</code></p>
                        <p className="text-xs text-slate-600 mb-2"><strong>Correct:</strong> <code className="bg-slate-100 px-1 rounded">https://txn.netxhub.tech</code></p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`# Correct format
            curl -i -X POST http://YOUR_DROPLET_IP:8001/services \\
            --data "name=psp-service" \\
            --data "url=https://txn.netxhub.tech"`}
                        </pre>
                    </div>

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

            <Card className="border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-green-600">✅</span> Kong is Running! Next: Register Your Services
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertDescription className="text-xs">
                            <strong>Before you start:</strong> Replace <code className="bg-slate-100 px-1 rounded">188.166.207.82</code> with your actual droplet IP and <code className="bg-slate-100 px-1 rounded">https://txn.netxhub.tech</code> with your Base44 app URL.
                        </AlertDescription>
                    </Alert>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 1: Register PSP Service</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`curl -i -X POST http://188.166.207.82:8001/services \\
            --data "name=psp-service" \\
            --data "url=https://txn.netxhub.tech"

            curl -i -X POST http://188.166.207.82:8001/services/psp-service/routes \\
            --data "paths[]=/api/v1/psp" \\
            --data "strip_path=false"

            curl -i -X POST http://188.166.207.82:8001/services/psp-service/plugins \\
            --data "name=rate-limiting" \\
            --data "config.minute=1000" \\
            --data "config.hour=50000"

            curl -i -X POST http://188.166.207.82:8001/services/psp-service/plugins \\
            --data "name=key-auth" \\
            --data "config.key_names[]=apikey"`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 2: Register ISO Gateway Service</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`curl -i -X POST http://188.166.207.82:8001/services \\
            --data "name=iso-gateway-service" \\
            --data "url=https://txn.netxhub.tech"

            curl -i -X POST http://188.166.207.82:8001/services/iso-gateway-service/routes \\
            --data "paths[]=/api/v1/iso" \\
            --data "strip_path=false"

            curl -i -X POST http://188.166.207.82:8001/services/iso-gateway-service/plugins \\
            --data "name=rate-limiting" \\
            --data "config.minute=2000" \\
            --data "config.hour=100000"

            curl -i -X POST http://188.166.207.82:8001/services/iso-gateway-service/plugins \\
            --data "name=key-auth" \\
            --data "config.key_names[]=apikey"`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 3: Register Orchestration Service</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`curl -i -X POST http://188.166.207.82:8001/services \\
            --data "name=orchestration-service" \\
            --data "url=https://txn.netxhub.tech"

            curl -i -X POST http://188.166.207.82:8001/services/orchestration-service/routes \\
            --data "paths[]=/api/v1/orchestration" \\
            --data "strip_path=false"

            curl -i -X POST http://188.166.207.82:8001/services/orchestration-service/plugins \\
            --data "name=rate-limiting" \\
            --data "config.minute=1500" \\
            --data "config.hour=75000"

            curl -i -X POST http://188.166.207.82:8001/services/orchestration-service/plugins \\
            --data "name=key-auth" \\
            --data "config.key_names[]=apikey"`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 4: Register Crypto Banking Service</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`curl -i -X POST http://188.166.207.82:8001/services \\
            --data "name=crypto-banking-service" \\
            --data "url=https://txn.netxhub.tech"

            curl -i -X POST http://188.166.207.82:8001/services/crypto-banking-service/routes \\
            --data "paths[]=/api/v1/crypto" \\
            --data "strip_path=false"

            curl -i -X POST http://188.166.207.82:8001/services/crypto-banking-service/plugins \\
            --data "name=rate-limiting" \\
            --data "config.minute=500" \\
            --data "config.hour=25000"

            curl -i -X POST http://188.166.207.82:8001/services/crypto-banking-service/plugins \\
            --data "name=key-auth" \\
            --data "config.key_names[]=apikey"`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 5: Register RWA Platform Service</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`curl -i -X POST http://188.166.207.82:8001/services \\
            --data "name=rwa-platform-service" \\
            --data "url=https://txn.netxhub.tech"

            curl -i -X POST http://188.166.207.82:8001/services/rwa-platform-service/routes \\
            --data "paths[]=/api/v1/rwa" \\
            --data "strip_path=false"

            curl -i -X POST http://188.166.207.82:8001/services/rwa-platform-service/plugins \\
            --data "name=rate-limiting" \\
            --data "config.minute=1000" \\
            --data "config.hour=50000"

            curl -i -X POST http://188.166.207.82:8001/services/rwa-platform-service/plugins \\
            --data "name=key-auth" \\
            --data "config.key_names[]=apikey"`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 6: Create Consumer & Generate API Key</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
                    {`# Create a test consumer
                    curl -i -X POST http://188.166.207.82:8001/consumers \\
                    --data "username=test-client"

                    # Generate API key
                    curl -i -X POST http://188.166.207.82:8001/consumers/test-client/key-auth`}
                        </pre>
                        <Alert className="bg-yellow-50 border-yellow-200 mt-2">
                            <AlertDescription className="text-xs">
                                <strong>Save the API Key!</strong> In the JSON response, look for the <code className="bg-slate-100 px-1 rounded">"key"</code> field.<br/>
                                Example: <code className="bg-slate-100 px-1 rounded">{`{"key":"FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH",...}`}</code><br/>
                                Your API key is the value: <code className="bg-slate-100 px-1 rounded">FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH</code>
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Step 7: Test Your Setup</h4>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
                    {`# Test without API key (should get 401 Unauthorized)
                    curl -i http://188.166.207.82:8000/api/v1/psp

                    # Test with API key (replace with your actual key)
                    curl -i http://188.166.207.82:8000/api/v1/psp \\
                    -H "apikey: FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH"

                    # Verify all services are registered
                    curl http://188.166.207.82:8001/services`}
                        </pre>
                        <Alert className="bg-blue-50 border-blue-200 mt-2">
                            <AlertDescription className="text-xs">
                                <strong>Understanding Test Results:</strong><br/>
                                • <code className="bg-slate-100 px-1 rounded">401 Unauthorized</code> without API key = ✅ Kong authentication working<br/>
                                • <code className="bg-slate-100 px-1 rounded">404 Not Found</code> with API key = ✅ Kong proxying correctly (backend endpoint doesn't exist yet)<br/>
                                • <code className="bg-slate-100 px-1 rounded">200 OK</code> with API key = ✅ Complete success (backend endpoint exists)<br/>
                                • Headers show <code className="bg-slate-100 px-1 rounded">X-RateLimit-*</code> = ✅ Rate limiting active<br/>
                                • Headers show <code className="bg-slate-100 px-1 rounded">Via: kong/3.5</code> = ✅ Request went through Kong
                            </AlertDescription>
                        </Alert>
                    </div>

                    <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-xs">
                            🎉 <strong>Success!</strong> Your Kong Gateway is working! The 401 error without API key and 404 with API key proves Kong is correctly proxying requests and enforcing authentication. All 5 services are registered with rate limiting.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                    <CardTitle className="text-lg">📋 What's Next? Production Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Badge className="bg-purple-600">STEP 1</Badge>
                            Update Base44 Backend Functions
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">Update your backend functions to use Kong endpoints instead of direct Base44 URLs:</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`// Example: Update PSP function to use Kong
            const response = await fetch('http://188.166.207.82:8000/api/v1/psp/merchants', {
            method: 'POST',
            headers: {
            'apikey': 'FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            });`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Badge className="bg-purple-600">STEP 2</Badge>
                            Create API Key Management UI
                        </h4>
                        <p className="text-xs text-slate-600">Build a page for customers to generate/manage their API keys via Kong Admin API</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Badge className="bg-purple-600">STEP 3</Badge>
                            Setup Custom Domain & SSL
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">Point api.fts.money → 188.166.207.82 and install Let's Encrypt SSL</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
            {`# Install Certbot
            apt install certbot python3-certbot-nginx -y

            # Get SSL certificate
            certbot certonly --standalone -d api.fts.money

            # Update Kong docker-compose.yml to mount certificates
            # Then access via: https://api.fts.money:8443/api/v1/psp`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Badge className="bg-purple-600">STEP 4</Badge>
                            Add Monitoring
                        </h4>
                        <p className="text-xs text-slate-600">Install Prometheus + Grafana for Kong metrics and alerting</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Badge className="bg-purple-600">STEP 5</Badge>
                            Production Hardening
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Enable Kong Manager RBAC</li>
                            <li>• Setup automated backups of PostgreSQL</li>
                            <li>• Configure firewall rules (allow only 8000, 8443)</li>
                            <li>• Add health check endpoints</li>
                            <li>• Setup log aggregation (ELK stack)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-cyan-200 bg-cyan-50">
                <CardHeader>
                    <CardTitle className="text-lg">🎯 Kong Gateway in FTS Control Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-xs">
                            ✅ <strong>Already Available!</strong> This Kong Gateway Setup page is accessible from the FTS Platform Control Panel under <strong>Infrastructure → Kong Gateway Setup</strong>
                        </AlertDescription>
                    </Alert>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Quick Access Path:</h4>
                        <ol className="text-xs text-slate-600 space-y-1">
                            <li>1. Login to Platform Admin (ajmal.samuel@fts.money)</li>
                            <li>2. Navigate to: <strong>Infrastructure</strong> section in sidebar</li>
                            <li>3. Click: <strong>Kong Gateway Setup</strong></li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2">Your Kong Endpoints:</h4>
                        <div className="bg-white p-2 rounded border border-cyan-200">
                            <p className="text-xs mb-1"><strong>Gateway Proxy:</strong> http://188.166.207.82:8000</p>
                            <p className="text-xs mb-1"><strong>Admin API:</strong> http://188.166.207.82:8001</p>
                            <p className="text-xs"><strong>Kong Manager:</strong> http://188.166.207.82:8002</p>
                        </div>
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