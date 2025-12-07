import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    CreditCard, 
    Building2,
    Users,
    Shield,
    Landmark,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    ExternalLink,
    Info,
    CheckCircle,
    Clock,
    Send,
    Mail,
    QrCode,
    Smartphone,
    FileText,
    Upload,
    X,
    DollarSign,
    Fingerprint,
    Globe,
    MapPin
} from 'lucide-react';
import { cn } from "@/lib/utils";
import BusinessDetailsStep from '@/components/onboarding/BusinessDetailsStep';
import CompanyStructureStep from '@/components/onboarding/CompanyStructureStep';
import LEIVerificationStep from '@/components/onboarding/LEIVerificationStep';
import ContactInfoStep from '@/components/onboarding/ContactInfoStep';
import DocumentUploadStep from '@/components/onboarding/DocumentUploadStep';
import KYBVerificationStep from '@/components/onboarding/KYBVerificationStep';
import AMLScreeningStep from '@/components/onboarding/AMLScreeningStep';
import BankDetailsStep from '@/components/onboarding/BankDetailsStep';
import PricingStep from '@/components/onboarding/PricingStep';
import ReviewSubmitStep from '@/components/onboarding/ReviewSubmitStep';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

const steps = [
    { id: 1, name: 'Business Details', icon: Building2, component: 'BusinessDetailsStep' },
    { id: 2, name: 'Company Structure', icon: Users, component: 'CompanyStructureStep' },
    { id: 3, name: 'LEI Verification', icon: Globe, component: 'LEIVerificationStep' },
    { id: 4, name: 'Contact Info', icon: Users, component: 'ContactInfoStep' },
    { id: 5, name: 'Documents', icon: FileText, component: 'DocumentUploadStep' },
    { id: 6, name: 'KYB Verification', icon: Shield, component: 'KYBVerificationStep' },
    { id: 7, name: 'AML Screening', icon: AlertTriangle, component: 'AMLScreeningStep' },
    { id: 8, name: 'Bank Details', icon: Landmark, component: 'BankDetailsStep' },
    { id: 9, name: 'Pricing', icon: DollarSign, component: 'PricingStep' },
    { id: 10, name: 'Review & Submit', icon: Check, component: 'ReviewSubmitStep' },
];

export default function MerchantSelfOnboarding() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const qr = urlParams.get('qr');
    const navigate = useNavigate();
    
    const [authMethod, setAuthMethod] = useState(null); // 'token', 'email', 'qr', 'sms'
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authEmail, setAuthEmail] = useState('');
    const [authPhone, setAuthPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [isValidToken, setIsValidToken] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [merchantId, setMerchantId] = useState('');
    
    const [formData, setFormData] = useState({
        business: {
            legal_name: '',
            trading_name: '',
            business_type: '',
            registration_number: '',
            tax_id: '',
            incorporation_date: '',
            country: '',
            website: '',
            mcc_code: '',
            business_description: '',
            business_address: '',
            lei: '',
            expected_volume: '',
            avg_ticket: '',
            industry: '',
        },
        companyStructure: {
            shareholders: [],
            directors: [],
            ubos: [],
        },
        contacts: {
            full_name: '',
            email: '',
            phone: '',
            role: '',
            secondary_name: '',
            secondary_email: '',
            secondary_phone: '',
            secondary_role: '',
        },
        documents: {
            incorporation_certificate: null,
            business_license: null,
            proof_of_address: null,
            directors_id: [],
            shareholders_id: [],
        },
        bank: {
            account_holder: '',
            bank_name: '',
            account_number: '',
            swift_code: '',
            iban: '',
            currency: 'USD',
            bank_address: '',
        },
        pricing: {
            pricing_model: 'interchange_plus',
            card_present_rate: '',
            card_not_present_rate: '',
            monthly_fee: '',
            setup_fee: '',
        },
        kyb: {
            status: 'not_started',
            provider: 'thekyb',
            reference_id: '',
        },
        aml: {
            status: 'not_started',
            provider: 'amlwatcher',
            risk_score: null,
        },
        lei_verification: {
            status: 'not_started',
            verified_date: null,
        },
    });

    useEffect(() => {
        if (token) {
            // Direct token access - validate and start onboarding
            validateToken(token);
        } else if (email) {
            // Magic link with email - start onboarding directly
            setAuthEmail(email);
            setIsValidToken(true);
            setAuthMethod('email');
        } else if (qr) {
            // QR code scan - validate and start onboarding
            validateQRCode(qr);
        } else {
            // No token/email/qr - show authentication options
            setIsValidToken(false);
        }
    }, [token, email, qr]);

    const validateToken = async (tokenValue) => {
        setIsAuthenticating(true);
        try {
            const merchants = await base44.entities.Merchant.filter({ onboarding_token: tokenValue });
            if (merchants && merchants.length > 0) {
                setIsValidToken(true);
                setAuthMethod('token');
                // Pre-fill any existing data
                const merchant = merchants[0];
                if (merchant.business_name) {
                    setFormData(prev => ({
                        ...prev,
                        business: { ...prev.business, legal_name: merchant.business_name }
                    }));
                }
            } else {
                setIsValidToken(false);
            }
        } catch (error) {
            setIsValidToken(false);
        }
        setIsAuthenticating(false);
    };

    const validateQRCode = async (qrValue) => {
        setIsAuthenticating(true);
        try {
            // QR value should be a token, validate it
            const merchants = await base44.entities.Merchant.filter({ onboarding_token: qrValue });
            if (merchants && merchants.length > 0) {
                setIsValidToken(true);
                setAuthMethod('qr');
                const merchant = merchants[0];
                if (merchant.business_name) {
                    setFormData(prev => ({
                        ...prev,
                        business: { ...prev.business, legal_name: merchant.business_name }
                    }));
                }
            } else {
                setIsValidToken(true); // Allow new onboarding
                setAuthMethod('qr');
            }
        } catch (error) {
            setIsValidToken(true); // Allow new onboarding
            setAuthMethod('qr');
        }
        setIsAuthenticating(false);
    };

    const sendMagicLink = async () => {
        if (!authEmail) return;
        setIsAuthenticating(true);
        try {
            const magicToken = `MLT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const magicLink = `${window.location.origin}${createPageUrl('MerchantSelfOnboarding')}?token=${magicToken}&email=${encodeURIComponent(authEmail)}`;
            
            await base44.integrations.Core.SendEmail({
                to: authEmail,
                subject: 'Complete Your Merchant Onboarding - PaymentHub',
                body: `Click the link below to complete your merchant onboarding:\n\n${magicLink}\n\nThis link is valid for 24 hours.\n\nIf you didn't request this, please ignore this email.`
            });
            
            setShowCodeInput(false);
            alert('Magic link sent! Check your email to continue.');
        } catch (error) {
            alert('Failed to send magic link. Please try again.');
        }
        setIsAuthenticating(false);
    };

    const sendSMSCode = async () => {
        if (!authPhone) return;
        setIsAuthenticating(true);
        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            // Store code temporarily (in production, use secure backend)
            sessionStorage.setItem('sms_code', code);
            
            // In production, integrate with SMS provider (Twilio, SNS, etc.)
            alert(`SMS Code sent to ${authPhone}: ${code}`);
            setShowCodeInput(true);
        } catch (error) {
            alert('Failed to send SMS. Please try again.');
        }
        setIsAuthenticating(false);
    };

    const verifySMSCode = () => {
        const storedCode = sessionStorage.getItem('sms_code');
        if (verificationCode === storedCode) {
            setIsValidToken(true);
            setAuthMethod('sms');
            setShowCodeInput(false);
            sessionStorage.removeItem('sms_code');
        } else {
            alert('Invalid code. Please try again.');
        }
    };

    const handleBiometricAuth = async () => {
        setIsAuthenticating(true);
        try {
            // Check if Web Authentication API is available
            if (window.PublicKeyCredential) {
                // For demo purposes, simulate biometric success
                // In production, use WebAuthn API for actual fingerprint/face ID
                await new Promise(resolve => setTimeout(resolve, 1500));
                setIsValidToken(true);
                setAuthMethod('biometric');
            } else {
                alert('Biometric authentication is not supported on this device. Please use email or SMS instead.');
            }
        } catch (error) {
            alert('Biometric authentication failed. Please try another method.');
        }
        setIsAuthenticating(false);
    };

    const generateQRCode = async () => {
        setIsAuthenticating(true);
        try {
            const qrToken = `QRT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const qrUrl = `${window.location.origin}${createPageUrl('MerchantSelfOnboarding')}?qr=${qrToken}`;
            setQrCode(qrUrl);
            setAuthMethod('qr');
            // In production, this URL would be encoded as a QR code image
        } catch (error) {
            alert('Failed to generate QR code');
        }
        setIsAuthenticating(false);
    };

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!formData.business.legal_name) newErrors.legal_name = 'Required';
            if (!formData.business.business_type) newErrors.business_type = 'Required';
            if (!formData.business.registration_number) newErrors.registration_number = 'Required';
            if (!formData.business.country) newErrors.country = 'Required';
            if (!formData.business.mcc_code) newErrors.mcc_code = 'Required';
        }
        
        if (step === 2) {
            if (!formData.companyStructure.directors || formData.companyStructure.directors.length === 0) {
                newErrors.directors = 'At least one director required';
            }
        }
        
        if (step === 4) {
            if (!formData.contacts.full_name) newErrors.full_name = 'Required';
            if (!formData.contacts.email) newErrors.email = 'Required';
            if (!formData.contacts.phone) newErrors.phone = 'Required';
        }
        
        if (step === 8) {
            if (!formData.bank.account_holder) newErrors.account_holder = 'Required';
            if (!formData.bank.bank_name) newErrors.bank_name = 'Required';
            if (!formData.bank.account_number && !formData.bank.iban) {
                newErrors.account_number = 'Account number or IBAN required';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }
            if (currentStep < 10) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepId) => {
        if (completedSteps.includes(stepId - 1) || stepId === 1) {
            setCurrentStep(stepId);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const newMerchantId = `MID-${Date.now()}`;
            
            const merchant = await base44.entities.Merchant.create({
                merchant_id: newMerchantId,
                business_name: formData.business.legal_name,
                trading_name: formData.business.trading_name,
                status: 'pending',
                category: getCategoryFromMCC(formData.business.mcc_code),
                mcc_code: formData.business.mcc_code,
                country: formData.business.country,
                contact_name: formData.contacts.full_name,
                contact_email: formData.contacts.email,
                contact_phone: formData.contacts.phone,
                address: `${formData.business.address_line1}, ${formData.business.city}, ${formData.business.state} ${formData.business.postal_code}`,
                website: formData.business.website,
                lei: formData.business.lei,
                lei_status: formData.lei_verification.status === 'verified' ? 'verified' : 'pending',
                kyb_status: formData.kyb.status,
                kyb_provider: formData.kyb.provider,
                kyb_reference_id: formData.kyb.reference_id,
                aml_status: formData.aml.status,
                aml_provider: formData.aml.provider,
                aml_risk_score: formData.aml.risk_score,
                onboarding_token: token,
                risk_level: calculateRiskLevel(formData),
                processing_volume: parseVolume(formData.business.expected_monthly_volume),
                fee_rate: parseFloat(formData.pricing.card_not_present_rate) || 2.5,
            });

            setMerchantId(newMerchantId);

            // Send confirmation email
            await base44.integrations.Core.SendEmail({
                to: formData.contacts.email,
                subject: 'Merchant Application Received - PaymentHub',
                body: `Dear ${formData.contacts.full_name},

Your merchant application for ${formData.business.legal_name} has been successfully submitted and is now under review.

Merchant ID: ${newMerchantId}
Submitted: ${new Date().toLocaleString()}

What happens next:
1. KYB Verification Review (1-2 business days)
2. AML Screening Confirmation
3. Compliance Approval
4. API Credentials Delivery

You will receive your API credentials and merchant portal access once your application is approved.

Estimated review time: 2-3 business days

Thank you for choosing PaymentHub!

Best regards,
The PaymentHub Team`
            });

            setSubmitSuccess(true);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit application. Please try again.');
        }
        setIsSubmitting(false);
    };

    const getCategoryFromMCC = (mcc) => {
        if (!mcc) return 'other';
        const code = parseInt(mcc);
        if (code >= 5000 && code <= 5999) return 'retail';
        if (code >= 7000 && code <= 7999) return 'services';
        if (code >= 4000 && code <= 4799) return 'travel';
        return 'ecommerce';
    };

    const parseVolume = (volumeString) => {
        if (!volumeString) return 0;
        return parseFloat(volumeString.replace(/[^0-9.]/g, '')) || 0;
    };

    const calculateRiskLevel = (data) => {
        let score = 0;
        
        if (data.aml.risk_score > 70) score += 2;
        else if (data.aml.risk_score > 50) score += 1;
        
        const volume = parseVolume(data.business.expected_monthly_volume);
        if (volume > 100000) score += 1;
        
        const highRiskMCCs = ['7995', '5816', '6051'];
        if (highRiskMCCs.includes(data.business.mcc_code)) score += 2;
        
        if (score >= 3) return 'high';
        if (score >= 1) return 'medium';
        return 'low';
    };

    // Authentication Screen
    if (isValidToken === false && !authMethod) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Merchant Onboarding</h1>
                        <p className="text-slate-600">Choose your preferred method to get started</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500" onClick={() => setAuthMethod('email')}>
                            <Mail className="h-8 w-8 text-blue-600 mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Magic Link via Email</h3>
                            <p className="text-sm text-slate-600">Receive a secure link to complete onboarding</p>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500" onClick={() => setAuthMethod('sms')}>
                            <Smartphone className="h-8 w-8 text-purple-600 mb-3" />
                            <h3 className="font-semibold text-lg mb-2">SMS Verification</h3>
                            <p className="text-sm text-slate-600">Get a code sent to your mobile phone</p>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-500" onClick={generateQRCode}>
                            <QrCode className="h-8 w-8 text-emerald-600 mb-3" />
                            <h3 className="font-semibold text-lg mb-2">QR Code</h3>
                            <p className="text-sm text-slate-600">Scan QR code with your mobile device</p>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-amber-500" onClick={handleBiometricAuth}>
                            <Fingerprint className="h-8 w-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Biometric Auth</h3>
                            <p className="text-sm text-slate-600">Use fingerprint or face ID (supported devices)</p>
                        </Card>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Have an invitation link?</strong> Check your email or SMS for a direct access link.
                        </AlertDescription>
                    </Alert>
                </Card>
            </div>
        );
    }

    // Email Magic Link
    if (authMethod === 'email' && !isValidToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8">
                    <Button variant="ghost" onClick={() => setAuthMethod(null)} className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />Back
                    </Button>
                    <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-center mb-2">Magic Link</h2>
                    <p className="text-slate-600 text-center mb-6">Enter your email to receive a secure access link</p>
                    
                    <div className="space-y-4">
                        <div>
                            <Label>Email Address</Label>
                            <Input 
                                type="email" 
                                value={authEmail} 
                                onChange={(e) => setAuthEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>
                        <Button onClick={sendMagicLink} disabled={isAuthenticating || !authEmail} className="w-full">
                            {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Send Magic Link
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // SMS Verification
    if (authMethod === 'sms' && !isValidToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8">
                    <Button variant="ghost" onClick={() => setAuthMethod(null)} className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />Back
                    </Button>
                    <Smartphone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-center mb-2">SMS Verification</h2>
                    <p className="text-slate-600 text-center mb-6">
                        {showCodeInput ? 'Enter the 6-digit code sent to your phone' : 'Enter your phone number'}
                    </p>
                    
                    <div className="space-y-4">
                        {!showCodeInput ? (
                            <>
                                <div>
                                    <Label>Phone Number</Label>
                                    <Input 
                                        type="tel" 
                                        value={authPhone} 
                                        onChange={(e) => setAuthPhone(e.target.value)}
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                                <Button onClick={sendSMSCode} disabled={isAuthenticating || !authPhone} className="w-full">
                                    {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                    Send Code
                                </Button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <Label>Verification Code</Label>
                                    <Input 
                                        value={verificationCode} 
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="text-center text-2xl tracking-widest font-mono"
                                    />
                                </div>
                                <Button onClick={verifySMSCode} disabled={verificationCode.length !== 6} className="w-full">
                                    <Check className="h-4 w-4 mr-2" />
                                    Verify Code
                                </Button>
                                <Button variant="ghost" onClick={() => setShowCodeInput(false)} className="w-full">
                                    Use Different Number
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    // QR Code Display (only show if explicitly in QR generation mode)
    if (qrCode && authMethod === 'qr' && !isValidToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <Button variant="ghost" onClick={() => { setQrCode(''); setAuthMethod(null); }} className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />Back
                    </Button>
                    <QrCode className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">QR Code Generated</h2>
                    <p className="text-slate-600 mb-6">Scan this with your mobile device</p>
                    
                    <div className="w-64 h-64 bg-white border-4 border-slate-200 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                        <div className="text-center p-4">
                            <QrCode className="h-32 w-32 text-slate-300 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-mono break-all">{qrCode}</p>
                        </div>
                    </div>

                    <Button 
                        onClick={() => {
                            navigator.clipboard.writeText(qrCode);
                            alert('Link copied to clipboard!');
                        }}
                        variant="outline"
                        className="w-full mb-4"
                    >
                        Copy Link
                    </Button>
                    
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-left text-xs">
                            <strong>Mobile onboarding:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Scan with camera app</li>
                                <li>Or copy link and open on mobile</li>
                                <li>Complete onboarding on any device</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                </Card>
            </div>
        );
    }

    if (isAuthenticating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full p-8">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">Application Submitted Successfully!</h1>
                        <p className="text-lg text-slate-600 mb-6">
                            Your merchant application for <strong>{formData.business.legal_name}</strong> has been received.
                        </p>
                        
                        <Card className="p-6 bg-blue-50 border-blue-200 mb-6">
                            <div className="grid md:grid-cols-2 gap-4 text-left">
                                <div>
                                    <p className="text-sm text-slate-600">Merchant ID</p>
                                    <p className="font-mono font-semibold text-slate-900">{merchantId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Application Date</p>
                                    <p className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Review Status</p>
                                    <Badge className="bg-amber-100 text-amber-700">Under Review</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Estimated Time</p>
                                    <p className="font-semibold text-slate-900">2-3 Business Days</p>
                                </div>
                            </div>
                        </Card>

                        <Alert className="mb-6 text-left">
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                                <strong>What happens next:</strong>
                                <ol className="list-decimal list-inside mt-2 space-y-1">
                                    <li>KYB Verification Review</li>
                                    <li>AML Screening Confirmation</li>
                                    <li>Compliance Team Approval</li>
                                    <li>API Credentials & Portal Access Delivery</li>
                                </ol>
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => window.print()}>
                                <FileText className="h-4 w-4 mr-2" />
                                Print Confirmation
                            </Button>
                            <Button onClick={() => window.location.href = createPageUrl('MerchantLogin')}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Go to Merchant Portal
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900">PaymentHub</h1>
                            <p className="text-xs text-slate-500">Merchant Onboarding Portal</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="hidden sm:flex">
                        Step {currentStep} of {steps.length}
                    </Badge>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <OnboardingProgress 
                    steps={steps}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={handleStepClick}
                />

                <Card className="p-6 md:p-8 mb-6 min-h-[500px]">
                    {currentStep === 1 && (
                        <BusinessDetailsStep 
                            data={formData.business}
                            onChange={(updatedData) => setFormData(prev => ({ ...prev, business: updatedData }))}
                            errors={errors}
                        />
                    )}
                    
                    {currentStep === 2 && (
                        <CompanyStructureStep 
                            data={formData.companyStructure}
                            businessType={formData.business.business_type}
                            onChange={(updatedData) => setFormData(prev => ({ ...prev, companyStructure: updatedData }))}
                            errors={errors}
                        />
                    )}
                    
                    {currentStep === 3 && (
                        <LEIVerificationStep 
                            formData={formData.lei_verification}
                            lei={formData.business.lei}
                            businessName={formData.business.legal_name}
                            onChange={(field, value) => handleChange('lei_verification', field, value)}
                        />
                    )}
                    
                    {currentStep === 4 && (
                        <ContactInfoStep 
                            formData={formData.contacts}
                            onChange={(field, value) => handleChange('contacts', field, value)}
                            errors={errors}
                        />
                    )}
                    
                    {currentStep === 5 && (
                        <DocumentUploadStep 
                            formData={formData.documents}
                            onChange={(field, value) => handleChange('documents', field, value)}
                            entityType={formData.business.entity_type}
                        />
                    )}
                    
                    {currentStep === 6 && (
                        <KYBVerificationStep 
                            formData={formData.kyb}
                            businessData={formData.business}
                            onChange={(field, value) => handleChange('kyb', field, value)}
                        />
                    )}
                    
                    {currentStep === 7 && (
                        <AMLScreeningStep 
                            formData={formData.aml}
                            businessData={formData.business}
                            onChange={(field, value) => handleChange('aml', field, value)}
                        />
                    )}
                    
                    {currentStep === 8 && (
                        <BankDetailsStep 
                            formData={formData.bank}
                            onChange={(field, value) => handleChange('bank', field, value)}
                            errors={errors}
                        />
                    )}
                    
                    {currentStep === 9 && (
                        <PricingStep 
                            formData={formData.pricing}
                            onChange={(field, value) => handleChange('pricing', field, value)}
                            businessVolume={formData.business.expected_monthly_volume}
                        />
                    )}
                    
                    {currentStep === 10 && (
                        <ReviewSubmitStep 
                            formData={formData}
                            onEdit={(step) => setCurrentStep(step)}
                        />
                    )}
                </Card>

                <div className="flex justify-between items-center">
                    <Button 
                        variant="outline" 
                        onClick={handleBack} 
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                    
                    <div className="flex gap-3">
                        {currentStep < 10 ? (
                            <Button 
                                onClick={handleNext} 
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Submit Application
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-6 mt-12">
                <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-600">
                    <p className="mb-2">Need help? Contact our support team at support@paymenthub.com</p>
                    <p className="text-xs text-slate-400">
                        © 2024 PaymentHub. All rights reserved. | Secure onboarding powered by 256-bit encryption
                    </p>
                </div>
            </footer>
        </div>
    );
}