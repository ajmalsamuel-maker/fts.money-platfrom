import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function SecurityVerification({ partnerId }) {
    const [auditLogs] = useState([
        { action: 'Redemption fulfilled', user: 'staff@partner.com', location: 'Central', time: new Date(), status: 'success' },
        { action: 'Offer updated', user: 'manager@partner.com', location: 'TST', time: new Date(Date.now() - 3600000), status: 'success' },
        { action: 'Failed verification attempt', user: 'unknown', location: 'Unknown', time: new Date(Date.now() - 7200000), status: 'warning' }
    ]);

    const [staffUsers] = useState([
        { name: 'John Wong', email: 'john@partner.com', role: 'Manager', location: 'All', status: 'active' },
        { name: 'Mary Chan', email: 'mary@partner.com', role: 'Staff', location: 'Central', status: 'active' },
        { name: 'David Lee', email: 'david@partner.com', role: 'Staff', location: 'TST', status: 'active' }
    ]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Security & Verification</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <Shield className="h-8 w-8 text-green-600 mb-2" />
                        <p className="text-sm text-gray-600">Security Status</p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Secure</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                        <p className="text-sm text-gray-600">Suspicious Activities</p>
                        <p className="text-3xl font-bold">1</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">Verified Today</p>
                        <p className="text-3xl font-bold">47</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Audit Trail
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {auditLogs.map((log, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">{log.action}</p>
                                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                                {log.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>User: {log.user}</p>
                                            <p>Location: {log.location}</p>
                                            <p>{format(log.time, 'MMM dd, yyyy HH:mm:ss')}</p>
                                        </div>
                                    </div>
                                    {log.status === 'warning' && (
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                        View Complete Audit Log
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Staff Access Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {staffUsers.map((user, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline">{user.role}</Badge>
                                            <Badge variant="outline">{user.location}</Badge>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4">
                        <Users className="h-4 w-4 mr-2" />
                        Add Staff Member
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-600">Extra security for your account</p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">IP Whitelist</p>
                            <p className="text-sm text-gray-600">Restrict access by IP address</p>
                        </div>
                        <Button size="sm" variant="outline">Configure</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="font-semibold">Session Timeout</p>
                            <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                        </div>
                        <Badge>30 minutes</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Fraud Detection Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-orange-900">Suspicious Activity Detected</p>
                                <p className="text-sm text-orange-800 mt-1">
                                    Multiple failed QR verification attempts from unknown location
                                </p>
                                <Button size="sm" variant="outline" className="mt-3">
                                    Review Details
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}