import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Award, DollarSign, TrendingUp, FileText, Check, AlertCircle } from 'lucide-react';

export default function AccreditationStep({ data, onChange, errors }) {
    const [verifying, setVerifying] = useState(false);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const verifyAccreditation = async () => {
        setVerifying(true);
        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleChange('accreditation_verified', true);
        setVerifying(false);
    };

    const accreditationCriteria = [
        'Annual income exceeding $200,000 (individual) or $300,000 (joint) in each of the past two years',
        'Net worth over $1 million (excluding primary residence)',
        'Professional certifications (Series 7, 65, 82)',
        'Entity with assets exceeding $5 million'
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Accredited Investor Status
                </h3>
                <p className="text-sm text-slate-600">
                    Accredited investors have access to exclusive investment opportunities
                </p>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                    <strong>Why accreditation matters:</strong> Certain tokenized assets are only available to accredited investors per securities regulations (SEC Regulation D, Reg S).
                </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Accredited Investor Criteria
                </h4>
                <ul className="space-y-2">
                    {accreditationCriteria.map((criteria, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{criteria}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <Label>Do you qualify as an accredited investor? *</Label>
                <select
                    className="w-full px-3 py-2 border rounded-lg mt-1"
                    value={data.accredited_investor ? 'yes' : 'no'}
                    onChange={(e) => handleChange('accredited_investor', e.target.value === 'yes')}
                >
                    <option value="">Select...</option>
                    <option value="yes">Yes, I am an accredited investor</option>
                    <option value="no">No, I am not accredited</option>
                </select>
            </div>

            {data.accredited_investor && (
                <div className="space-y-4">
                    <div>
                        <Label>Accreditation Method *</Label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg mt-1"
                            value={data.accreditation_method || ''}
                            onChange={(e) => handleChange('accreditation_method', e.target.value)}
                        >
                            <option value="">Select method...</option>
                            <option value="income">Annual Income Verification</option>
                            <option value="net_worth">Net Worth Verification</option>
                            <option value="professional">Professional Certification</option>
                            <option value="entity">Entity Assets</option>
                        </select>
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertDescription className="text-sm text-amber-800">
                            You will need to upload supporting documents in the next step to verify your accredited status.
                        </AlertDescription>
                    </Alert>

                    {data.accreditation_verified ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-900 font-medium mb-2">
                                <Check className="h-5 w-5" />
                                Accreditation Pre-Verified
                            </div>
                            <p className="text-sm text-green-700">
                                Your accredited investor status has been verified. You'll have access to all investment opportunities.
                            </p>
                        </div>
                    ) : (
                        <Button
                            onClick={verifyAccreditation}
                            disabled={verifying || !data.accreditation_method}
                            variant="outline"
                            className="w-full"
                        >
                            {verifying ? 'Verifying...' : 'Quick Verify (Demo)'}
                        </Button>
                    )}
                </div>
            )}

            {!data.accredited_investor && data.accredited_investor !== undefined && (
                <Alert>
                    <AlertDescription className="text-sm">
                        <strong>Non-accredited investors</strong> can still invest in Regulation A+ and crowdfunding offerings. Some investment opportunities will be restricted.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}