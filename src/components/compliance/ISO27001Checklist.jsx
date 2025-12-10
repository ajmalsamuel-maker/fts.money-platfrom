import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Lock, FileText, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// ISO 27001:2022 Information Security Controls
const ISO27001_CONTROLS = [
    {
        id: 'organizational',
        title: 'Organizational Controls',
        icon: Users,
        controls: [
            { id: '5.1', name: 'Policies for information security', description: 'Define and approve information security policies' },
            { id: '5.2', name: 'Information security roles and responsibilities', description: 'Allocate and communicate security responsibilities' },
            { id: '5.3', name: 'Segregation of duties', description: 'Separate conflicting duties and responsibilities' },
            { id: '5.7', name: 'Threat intelligence', description: 'Collect and analyze threat information' },
            { id: '5.10', name: 'Acceptable use of information', description: 'Define rules for acceptable use' },
            { id: '5.23', name: 'Information security for cloud services', description: 'Secure cloud service usage' }
        ]
    },
    {
        id: 'people',
        title: 'People Controls',
        icon: Users,
        controls: [
            { id: '6.1', name: 'Screening', description: 'Background verification of personnel' },
            { id: '6.2', name: 'Terms and conditions of employment', description: 'Include security responsibilities in contracts' },
            { id: '6.3', name: 'Information security awareness', description: 'Provide security training and awareness' },
            { id: '6.4', name: 'Disciplinary process', description: 'Define process for security violations' },
            { id: '6.8', name: 'Remote working', description: 'Secure remote work arrangements' }
        ]
    },
    {
        id: 'physical',
        title: 'Physical Controls',
        icon: Lock,
        controls: [
            { id: '7.1', name: 'Physical security perimeters', description: 'Define and protect security perimeters' },
            { id: '7.2', name: 'Physical entry', description: 'Control physical access to facilities' },
            { id: '7.4', name: 'Physical security monitoring', description: 'Monitor premises continuously' },
            { id: '7.7', name: 'Clear desk and clear screen', description: 'Implement clear desk/screen policies' },
            { id: '7.11', name: 'Supporting utilities', description: 'Protect supporting infrastructure' }
        ]
    },
    {
        id: 'technological',
        title: 'Technological Controls',
        icon: Shield,
        controls: [
            { id: '8.1', name: 'User endpoint devices', description: 'Secure user devices' },
            { id: '8.2', name: 'Privileged access rights', description: 'Restrict and control privileged access' },
            { id: '8.3', name: 'Information access restriction', description: 'Implement access controls' },
            { id: '8.5', name: 'Secure authentication', description: 'Implement secure authentication mechanisms' },
            { id: '8.8', name: 'Management of technical vulnerabilities', description: 'Track and remediate vulnerabilities' },
            { id: '8.9', name: 'Configuration management', description: 'Manage system configurations' },
            { id: '8.10', name: 'Information deletion', description: 'Securely delete information' },
            { id: '8.12', name: 'Data leakage prevention', description: 'Prevent unauthorized data disclosure' },
            { id: '8.16', name: 'Monitoring activities', description: 'Monitor systems and networks' },
            { id: '8.19', name: 'Installation of software', description: 'Control software installation' },
            { id: '8.23', name: 'Web filtering', description: 'Control web access' },
            { id: '8.24', name: 'Use of cryptography', description: 'Implement encryption controls' },
            { id: '8.28', name: 'Secure coding', description: 'Apply secure development practices' }
        ]
    },
    {
        id: 'incident',
        title: 'Incident Management',
        icon: AlertTriangle,
        controls: [
            { id: '5.24', name: 'Information security incident management', description: 'Plan and prepare for incident response' },
            { id: '5.25', name: 'Assessment of information security events', description: 'Assess and categorize security events' },
            { id: '5.26', name: 'Response to information security incidents', description: 'Respond to confirmed incidents' },
            { id: '5.27', name: 'Learning from information security incidents', description: 'Improve from incident lessons' }
        ]
    },
    {
        id: 'compliance',
        title: 'Compliance & Legal',
        icon: FileText,
        controls: [
            { id: '5.31', name: 'Legal, statutory, regulatory requirements', description: 'Identify and meet legal requirements' },
            { id: '5.32', name: 'Intellectual property rights', description: 'Protect intellectual property' },
            { id: '5.33', name: 'Protection of records', description: 'Protect important records' },
            { id: '5.34', name: 'Privacy and PII protection', description: 'Ensure privacy compliance (GDPR, etc)' },
            { id: '5.36', name: 'Compliance with policies', description: 'Regular compliance reviews' },
            { id: '5.37', name: 'Documented operating procedures', description: 'Document all security procedures' }
        ]
    }
];

export default function ISO27001Checklist() {
    const [checkedItems, setCheckedItems] = useState({});

    const toggleItem = (controlId) => {
        setCheckedItems(prev => ({
            ...prev,
            [controlId]: !prev[controlId]
        }));
    };

    const totalControls = ISO27001_CONTROLS.reduce((sum, category) => 
        sum + category.controls.length, 0
    );

    const completedControls = Object.values(checkedItems).filter(Boolean).length;
    const completionPercentage = Math.round((completedControls / totalControls) * 100);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        ISO 27001:2022 Compliance Checklist
                    </CardTitle>
                    <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                        {completedControls}/{totalControls} Controls
                    </Badge>
                </div>
                <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Implementation Progress</span>
                        <span className="font-semibold">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                    {ISO27001_CONTROLS.map((category) => {
                        const Icon = category.icon;
                        const categoryCompleted = category.controls.filter(c => 
                            checkedItems[c.id]
                        ).length;
                        const categoryTotal = category.controls.length;
                        const categoryProgress = Math.round((categoryCompleted / categoryTotal) * 100);

                        return (
                            <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium">{category.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                                {categoryCompleted}/{categoryTotal}
                                            </span>
                                            {categoryProgress === 100 && (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 pt-2">
                                        {category.controls.map((control) => (
                                            <div
                                                key={control.id}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <Checkbox
                                                    checked={checkedItems[control.id] || false}
                                                    onCheckedChange={() => toggleItem(control.id)}
                                                    className="mt-0.5"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                            {control.id}
                                                        </span>
                                                        <span className="font-medium text-sm">
                                                            {control.name}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        {control.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm text-blue-900">ISO 27001 Certification</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                Complete all controls and engage an accredited certification body for official ISO 27001:2022 certification. 
                                Certification demonstrates commitment to information security best practices.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}