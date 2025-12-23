import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    GraduationCap, UtensilsCrossed, ShoppingBag, Hotel, Heart, 
    Home, Car, Plane, Dumbbell, Building, Users, Briefcase,
    TrendingUp, DollarSign, CheckCircle2, Zap, Target, Package,
    Calendar, Receipt, Shield, Smartphone, Percent, Gift, Clock
} from 'lucide-react';

export default function FTSVerticalSolutions() {
    const [selectedVertical, setSelectedVertical] = useState('education');

    const verticals = [
        {
            id: 'education',
            name: 'Education',
            icon: GraduationCap,
            description: 'Schools, universities, training centers, online learning platforms',
            marketSize: '$6.5T global education market',
            paymentVolume: '$450B annual tuition & fees',
            solutions: [
                {
                    name: 'Tuition Management System',
                    features: [
                        'Payment plans (monthly, quarterly, semester)',
                        'Financial aid integration',
                        'Automated billing & invoicing',
                        'Late fee calculation',
                        'Scholarship/grant management',
                        'Multi-student family accounts',
                        'Installment plans with 0% interest options',
                        'Parent/guardian payment portals'
                    ],
                    revenue: '$50-200 per student/year'
                },
                {
                    name: 'Campus Card System',
                    features: [
                        'Virtual & physical student ID cards',
                        'Campus store purchases',
                        'Meal plan management',
                        'Library fines & fees',
                        'Event ticketing',
                        'Parking permits',
                        'Laundry & vending integration',
                        'Parent funding of student accounts'
                    ],
                    revenue: '$10-30 per active student/year'
                },
                {
                    name: 'International Student Payments',
                    features: [
                        'Multi-currency tuition payments',
                        'FX rate transparency',
                        'Country-specific payment methods',
                        'Compliance with education regulations',
                        'Scholarship disbursements',
                        'Living expense transfers',
                        'Tax reporting (1098-T forms)',
                        'Wire transfer alternatives'
                    ],
                    revenue: '0.5-1.5% of international payment volume'
                },
                {
                    name: 'Online Learning Platform',
                    features: [
                        'Course subscription billing',
                        'Pay-per-course options',
                        'Certificate fee management',
                        'Trial period handling',
                        'Bulk corporate pricing',
                        'Refund management',
                        'Proration for course drops',
                        'Revenue share with instructors'
                    ],
                    revenue: '$2-10 per transaction + 2-5% platform fee'
                }
            ],
            keyDifferentiators: [
                'Academic calendar-aligned billing',
                'Complex payment plans over 4-6 years',
                'Family account management',
                'Financial aid workflow integration',
                'Compliance with Title IV regulations',
                'Student refund processing',
                'Semester-based revenue recognition'
            ],
            targetCustomers: 'K-12 schools, universities, online learning platforms, bootcamps',
            arpu: '$75K-300K per institution/year',
            implementation: 'White-label student portal, PMS integration, parent app'
        },
        {
            id: 'fnb',
            name: 'Food & Beverage',
            icon: UtensilsCrossed,
            description: 'Restaurants, cafes, bars, cloud kitchens, food delivery',
            marketSize: '$4.2T global F&B market',
            paymentVolume: '$2.8T annual transaction volume',
            solutions: [
                {
                    name: 'Smart Restaurant POS',
                    features: [
                        'QR code table ordering',
                        'Split bill functionality',
                        'Tip management (pooled/individual)',
                        'Kitchen display system integration',
                        'Menu management with modifiers',
                        'Table management & reservations',
                        'Multi-location support',
                        'Staff scheduling integration',
                        'Offline mode for outages'
                    ],
                    revenue: '$99-299/location/month + 0.5-1.5% transaction fee'
                },
                {
                    name: 'Online Ordering & Delivery',
                    features: [
                        'Branded ordering website/app',
                        'Real-time order tracking',
                        'Driver dispatch management',
                        'Delivery zone pricing',
                        'Scheduled orders',
                        'Customer order history',
                        'Promo code management',
                        'Third-party delivery integration (DoorDash, Uber Eats)',
                        'Commission-free direct orders'
                    ],
                    revenue: '$149-399/month + 2-3% transaction fee'
                },
                {
                    name: 'Loyalty & Gift Cards',
                    features: [
                        'Points-based loyalty program',
                        'Digital gift card sales',
                        'Birthday/anniversary rewards',
                        'Spend-based tier system',
                        'Mobile app loyalty tracking',
                        'Gift card balance management',
                        'Promotional campaigns',
                        'Referral programs'
                    ],
                    revenue: '2-5% of gift card & loyalty transactions'
                },
                {
                    name: 'Cloud Kitchen Management',
                    features: [
                        'Multi-brand management',
                        'Virtual storefront setup',
                        'Centralized order aggregation',
                        'Kitchen capacity optimization',
                        'Menu engineering analytics',
                        'Ingredient cost tracking',
                        'Commission reconciliation',
                        'Ghost kitchen network'
                    ],
                    revenue: '$199-599/brand/month'
                }
            ],
            keyDifferentiators: [
                'Instant settlement for cash flow',
                'Tipping integrated into checkout',
                'Split payment across multiple cards',
                'Integration with food delivery platforms',
                'Table-side payment (pay-at-table)',
                'Real-time inventory sync',
                'Menu item-level analytics',
                'Multi-language support for tourist areas'
            ],
            targetCustomers: 'Quick service restaurants, fine dining, bars, cloud kitchens, food trucks',
            arpu: '$8K-35K per location/year',
            implementation: 'White-label POS app, customer-facing ordering app, kitchen display'
        },
        {
            id: 'retail',
            name: 'Retail',
            icon: ShoppingBag,
            description: 'Physical stores, e-commerce, omnichannel retail, pop-ups',
            marketSize: '$27T global retail market',
            paymentVolume: '$18T annual transaction volume',
            solutions: [
                {
                    name: 'Omnichannel POS System',
                    features: [
                        'Unified inventory across channels',
                        'Buy online pickup in store (BOPIS)',
                        'Ship from store functionality',
                        'Endless aisle (order unavailable items)',
                        'Customer 360° view',
                        'Staff app for mobile checkout',
                        'Receipt customization',
                        'Returns management',
                        'Multi-store transfers'
                    ],
                    revenue: '$79-249/location/month + 1.5-2.5% transaction fee'
                },
                {
                    name: 'Loyalty & Rewards Engine',
                    features: [
                        'Points, tiers, and VIP programs',
                        'Purchase-based rewards',
                        'Birthday & anniversary gifts',
                        'Referral rewards',
                        'Exclusive member pricing',
                        'Early access to sales',
                        'Gamification (badges, challenges)',
                        'SMS/email campaign integration',
                        'Coalition loyalty programs'
                    ],
                    revenue: '$99-399/month + $0.10 per loyalty transaction'
                },
                {
                    name: 'Gift Card & Store Credit',
                    features: [
                        'Physical & digital gift cards',
                        'Bulk corporate gift card sales',
                        'Store credit for returns',
                        'Gift card balance checker',
                        'Branded gift card designs',
                        'Gift card promotions',
                        'Third-party gift card acceptance',
                        'Breakage revenue tracking'
                    ],
                    revenue: '3-5% of gift card sales + monthly fee'
                },
                {
                    name: 'BNPL at Checkout',
                    features: [
                        'Instant credit decisioning',
                        'Flexible installment options (4-12 months)',
                        'Zero-interest promotions',
                        'Approval rate optimization',
                        'Abandoned cart recovery',
                        'Higher average order value',
                        'Risk-free for merchant',
                        'White-label BNPL branding'
                    ],
                    revenue: '3-6% MDR from merchant + late fees from customers'
                },
                {
                    name: 'Pop-Up & Event Commerce',
                    features: [
                        'Mobile POS terminals',
                        'Quick setup (5-minute onboarding)',
                        'Offline transaction mode',
                        'Event-specific reporting',
                        'Staff multi-login',
                        'Inventory snapshot',
                        'Same-day settlement options',
                        'Tax compliance by location'
                    ],
                    revenue: '$49-149/event + transaction fees'
                }
            ],
            keyDifferentiators: [
                'Unified commerce (online + offline)',
                'Real-time inventory visibility',
                'Clienteling tools for staff',
                'Advanced product bundling',
                'Dynamic pricing by channel',
                'Fashion/apparel size/color variants',
                'Seasonal campaign management',
                'Integration with Shopify, WooCommerce, BigCommerce'
            ],
            targetCustomers: 'Fashion retail, electronics, home goods, specialty stores, franchises',
            arpu: '$12K-50K per location/year',
            implementation: 'White-label retail POS, customer loyalty app, e-commerce plugin'
        },
        {
            id: 'hospitality',
            name: 'Hotels & Hospitality',
            icon: Hotel,
            description: 'Hotels, resorts, B&Bs, vacation rentals, hostels',
            marketSize: '$1.5T global hospitality market',
            paymentVolume: '$850B annual bookings',
            solutions: [
                {
                    name: 'Property Management System (PMS)',
                    features: [
                        'Online booking engine',
                        'Channel manager (OTA sync)',
                        'Front desk check-in/out',
                        'Room assignment & housekeeping',
                        'Pre-authorization & deposits',
                        'Mini-bar & incidentals charging',
                        'Group bookings & conferences',
                        'Rate management (seasons, events)',
                        'Guest folio management'
                    ],
                    revenue: '$3-15 per room/month + 1-2% transaction fee'
                },
                {
                    name: 'Contactless Check-In',
                    features: [
                        'Mobile key issuance',
                        'Pre-arrival payment collection',
                        'Digital ID verification',
                        'Room preference selection',
                        'Upsell opportunities (late checkout, upgrades)',
                        'QR code room access',
                        'Express checkout',
                        'Digital receipt delivery',
                        'Review request automation'
                    ],
                    revenue: '$2-5 per booking'
                },
                {
                    name: 'Guest Payment Management',
                    features: [
                        'Multiple payment methods (card, wallet, crypto)',
                        'Split billing (corporate + personal)',
                        'Currency conversion for international guests',
                        'Virtual terminal for phone bookings',
                        'Recurring billing for extended stays',
                        'Payment link generation',
                        'Deposit handling',
                        'Damage waiver fees'
                    ],
                    revenue: '1.5-2.5% of booking value'
                },
                {
                    name: 'Ancillary Revenue Management',
                    features: [
                        'Spa/wellness booking & payment',
                        'Restaurant reservations',
                        'Room service ordering',
                        'Activity bookings',
                        'Minibar inventory tracking',
                        'Parking fee management',
                        'Early check-in/late checkout fees',
                        'Package deal creation'
                    ],
                    revenue: '2-4% of ancillary revenue'
                }
            ],
            keyDifferentiators: [
                'PMS integration (Mews, Cloudbeds, Opera)',
                'Multi-currency support for tourists',
                'Pre-authorization for incidentals',
                'Chargeback protection for no-shows',
                'Commission reconciliation with OTAs',
                'Dynamic pricing based on occupancy',
                'Guest credit balance management',
                'Corporate billing & invoicing'
            ],
            targetCustomers: 'Independent hotels, hotel chains, vacation rentals, hostels, resorts',
            arpu: '$15K-80K per property/year',
            implementation: 'White-label booking engine, mobile check-in app, PMS connector'
        },
        {
            id: 'healthcare',
            name: 'Healthcare',
            icon: Heart,
            description: 'Hospitals, clinics, dental practices, telemedicine, pharmacies',
            marketSize: '$12T global healthcare market',
            paymentVolume: '$3.5T annual patient payments',
            solutions: [
                {
                    name: 'Patient Billing & Collections',
                    features: [
                        'Payment plans (interest-free options)',
                        'Insurance claim coordination',
                        'Co-pay & deductible collection',
                        'EOB (Explanation of Benefits) integration',
                        'Self-service payment portal',
                        'Automated payment reminders',
                        'Financial assistance programs',
                        'Medical credit card processing',
                        'Charity care workflow'
                    ],
                    revenue: '$50-200 per provider/month + 1.5-2.5% transaction fee'
                },
                {
                    name: 'Insurance Claims Management',
                    features: [
                        'Real-time eligibility verification',
                        'Electronic claim submission (EDI 837)',
                        'ERA (Electronic Remittance Advice) posting',
                        'Denial management',
                        'Secondary insurance billing',
                        'Prior authorization tracking',
                        'Claims scrubbing',
                        'Payer-specific rules engine'
                    ],
                    revenue: '$0.50-2.00 per claim processed'
                },
                {
                    name: 'Telemedicine Payments',
                    features: [
                        'Virtual consultation billing',
                        'Subscription-based telehealth',
                        'Co-pay collection before appointment',
                        'Multi-provider scheduling',
                        'Prescription payment integration',
                        'Video consultation platform integration',
                        'Insurance verification',
                        'No-show fee collection'
                    ],
                    revenue: '$2-8 per virtual visit + monthly SaaS fee'
                },
                {
                    name: 'Pharmacy & Medical Devices',
                    features: [
                        'Prescription fulfillment billing',
                        'HSA/FSA card acceptance',
                        'Insurance adjudication',
                        'Mail-order pharmacy payments',
                        'Medical equipment rentals',
                        'Auto-refill subscriptions',
                        'Medication adherence programs',
                        'Copay assistance programs'
                    ],
                    revenue: '1-3% of pharmacy revenue'
                }
            ],
            keyDifferentiators: [
                'HIPAA-compliant payment processing',
                'EMR/EHR integration (Epic, Cerner, Athena)',
                'Insurance eligibility verification',
                'ICD-10/CPT code support',
                'Patient financing options',
                'Transparency in pricing',
                'Bad debt reduction programs',
                'Compliance with healthcare regulations'
            ],
            targetCustomers: 'Hospitals, clinics, dental practices, physical therapy, urgent care',
            arpu: '$25K-150K per facility/year',
            implementation: 'White-label patient portal, EMR connector, payment kiosks'
        },
        {
            id: 'real_estate',
            name: 'Real Estate',
            icon: Home,
            description: 'Property management, rentals, co-living, mortgage, title',
            marketSize: '$9.6T global real estate services',
            paymentVolume: '$1.2T annual rental/lease payments',
            solutions: [
                {
                    name: 'Rent Collection Platform',
                    features: [
                        'Automated monthly rent collection',
                        'ACH/bank transfer with low fees',
                        'Late fee automation',
                        'Partial payment handling',
                        'Payment history for tenants',
                        'Eviction workflow integration',
                        'Roommate split payments',
                        'Rent reporting to credit bureaus',
                        'Security deposit management'
                    ],
                    revenue: '$1-5 per unit/month + 0.5-1.5% transaction fee'
                },
                {
                    name: 'Maintenance & Utility Billing',
                    features: [
                        'Work order payment collection',
                        'Utility bill pass-through',
                        'Common area maintenance (CAM) charges',
                        'HOA fee collection',
                        'Pet rent & deposit tracking',
                        'Parking fee management',
                        'Late payment notifications',
                        'Vendor payment disbursement'
                    ],
                    revenue: '$0.50-2 per transaction'
                },
                {
                    name: 'Lease Application Fees',
                    features: [
                        'Application fee collection',
                        'Credit check payment',
                        'Background check fees',
                        'Move-in cost calculator',
                        'First/last month rent + security deposit',
                        'Admin fees',
                        'Pet deposit',
                        'Key deposit'
                    ],
                    revenue: '$5-15 per application'
                },
                {
                    name: 'Commercial Property Management',
                    features: [
                        'Triple net lease (NNN) billing',
                        'Percentage rent calculation',
                        'Tenant improvement allowances',
                        'Operating expense reconciliation',
                        'Multi-tenant invoice generation',
                        'Lease renewal processing',
                        'Corporate tenant billing',
                        'Multi-property portfolio management'
                    ],
                    revenue: '$10-50 per commercial unit/month'
                }
            ],
            keyDifferentiators: [
                'Property management software integration (Buildium, AppFolio, Yardi)',
                'ACH with 0.5-1% fees vs 2.9% card fees',
                'Automated late fee calculation by state laws',
                'Lease-to-own payment tracking',
                'Section 8/affordable housing compliance',
                'Multi-property owner dashboards',
                'Tenant screening payment integration',
                'Escrow account management'
            ],
            targetCustomers: 'Property managers, landlords, HOAs, commercial property owners',
            arpu: '$5K-40K per property manager/year',
            implementation: 'White-label tenant portal, property manager dashboard, mobile app'
        },
        {
            id: 'automotive',
            name: 'Automotive',
            icon: Car,
            description: 'Dealerships, auto repair, car washes, parking, EV charging',
            marketSize: '$2.8T global automotive aftermarket',
            paymentVolume: '$900B annual service & parts',
            solutions: [
                {
                    name: 'Service & Repair Payments',
                    features: [
                        'Estimate approval & payment',
                        'Parts & labor itemization',
                        'Warranty claim processing',
                        'Financing options (0% APR)',
                        'Subscription maintenance plans',
                        'Fleet billing & invoicing',
                        'Loaner vehicle deposits',
                        'Digital vehicle inspection',
                        'Tap-to-pay at service desk'
                    ],
                    revenue: '$99-399/location/month + 1.5-2.5% transaction fee'
                },
                {
                    name: 'Car Wash & Detailing',
                    features: [
                        'Monthly unlimited subscriptions',
                        'Membership plans (basic/premium)',
                        'License plate recognition (LPR) payments',
                        'Mobile app pre-purchase',
                        'Gift card sales',
                        'Add-on service upsells',
                        'Fleet wash programs',
                        'Loyalty rewards'
                    ],
                    revenue: '$49-149/location/month + subscription revenue share'
                },
                {
                    name: 'EV Charging Payments',
                    features: [
                        'Pay-per-kWh billing',
                        'Subscription charging plans',
                        'Idle fee management',
                        'Multi-network roaming',
                        'Fleet charging programs',
                        'Demand-based pricing',
                        'Green energy credits',
                        'Reservation & pre-payment',
                        'Mobile wallet integration'
                    ],
                    revenue: '5-10% of charging revenue'
                },
                {
                    name: 'Parking & Valet',
                    features: [
                        'Pay-by-plate / LPR',
                        'Hourly/daily rate calculation',
                        'Monthly parking subscriptions',
                        'Event parking pre-booking',
                        'Valet ticketing & payment',
                        'Validation & discount codes',
                        'Mobile pay-to-exit',
                        'Touchless parking payments'
                    ],
                    revenue: '3-5% of parking revenue'
                }
            ],
            keyDifferentiators: [
                'DMS integration (CDK, Reynolds & Reynolds)',
                'License plate recognition (LPR) payments',
                'Financing with instant credit approval',
                'Fleet management billing',
                'Warranty & insurance claim coordination',
                'Parts ordering & payment',
                'Service reminder payment links',
                'Telematics integration for usage-based billing'
            ],
            targetCustomers: 'Auto dealerships, repair shops, car washes, parking operators, EV networks',
            arpu: '$8K-45K per location/year',
            implementation: 'White-label mobile app, kiosk payments, LPR integration'
        },
        {
            id: 'fitness',
            name: 'Fitness & Wellness',
            icon: Dumbbell,
            description: 'Gyms, studios, spas, personal training, wellness centers',
            marketSize: '$96B global fitness market',
            paymentVolume: '$75B annual memberships',
            solutions: [
                {
                    name: 'Membership Management',
                    features: [
                        'Recurring membership billing',
                        'Flexible membership tiers',
                        'Family & corporate plans',
                        'Automated renewal & dunning',
                        'Freeze/pause membership',
                        'Contract management',
                        'Joining fee collection',
                        'Membership upgrade/downgrade',
                        'Cancellation workflow'
                    ],
                    revenue: '$99-299/location/month + 2-4% transaction fee'
                },
                {
                    name: 'Class Booking & Credits',
                    features: [
                        'Class pack purchases',
                        'Drop-in class payments',
                        'Credit-based booking system',
                        'Waitlist management',
                        'Cancellation policies & fees',
                        'Multi-location class access',
                        'Private session booking',
                        'Online class payments',
                        'ClassPass integration'
                    ],
                    revenue: '$1-3 per booking'
                },
                {
                    name: 'Personal Training & Services',
                    features: [
                        'Trainer session packages',
                        'Nutritionist consultations',
                        'Massage & spa services',
                        'Equipment rental',
                        'Locker rentals',
                        'Retail product sales',
                        'Trainer tip collection',
                        'Session package expiration tracking'
                    ],
                    revenue: '3-5% of service revenue'
                },
                {
                    name: 'Wellness Subscription Box',
                    features: [
                        'Monthly supplement/product box',
                        'Customizable subscription options',
                        'One-time purchase + subscription',
                        'Shipping & fulfillment',
                        'Inventory management',
                        'Subscription pause/skip',
                        'Loyalty rewards',
                        'Referral programs'
                    ],
                    revenue: '$5-15 per subscription/month'
                }
            ],
            keyDifferentiators: [
                'Gym management software integration (Mindbody, Zen Planner, Glofox)',
                'Automated dunning to reduce churn',
                'Contract length enforcement',
                'Peak vs off-peak pricing',
                'Check-in system integration',
                'Biometric payment (fingerprint, facial recognition)',
                'Wearable device integration',
                'Challenge & competition payment handling'
            ],
            targetCustomers: 'Gyms, yoga studios, CrossFit boxes, martial arts, spas, wellness centers',
            arpu: '$6K-25K per location/year',
            implementation: 'White-label member app, booking system, check-in integration'
        },
        {
            id: 'professional_services',
            name: 'Professional Services',
            icon: Briefcase,
            description: 'Law, accounting, consulting, agencies, freelancers',
            marketSize: '$1.9T global professional services',
            paymentVolume: '$650B annual billings',
            solutions: [
                {
                    name: 'Client Billing & Invoicing',
                    features: [
                        'Time tracking integration',
                        'Milestone-based billing',
                        'Retainer management',
                        'Automated invoice generation',
                        'Multi-currency invoicing',
                        'Payment terms (Net 15/30/60)',
                        'Late payment reminders',
                        'Client payment portal',
                        'Recurring service billing'
                    ],
                    revenue: '$29-199/user/month + 0.5-1.5% transaction fee'
                },
                {
                    name: 'Trust Account Management',
                    features: [
                        'IOLTA/Trust account compliance',
                        'Client fund segregation',
                        'Trust-to-operating transfers',
                        'State bar reporting',
                        'Audit trail for trust transactions',
                        'Three-way reconciliation',
                        'Client ledger management',
                        'Escrow payment handling'
                    ],
                    revenue: '$49-199/month (compliance premium)'
                },
                {
                    name: 'Online Booking & Deposits',
                    features: [
                        'Consultation booking',
                        'Deposit collection',
                        'Cancellation fee enforcement',
                        'Calendar integration',
                        'Automated reminders',
                        'Service packages',
                        'Proposal acceptance & payment',
                        'Digital contract signing + payment'
                    ],
                    revenue: '$2-10 per booking'
                },
                {
                    name: 'Expense Management',
                    features: [
                        'Client expense pass-through',
                        'Receipt capture & categorization',
                        'Expense approval workflow',
                        'Reimbursement processing',
                        'Vendor payment management',
                        'Corporate card integration',
                        'Project-based expense tracking',
                        'Tax-deductible expense reporting'
                    ],
                    revenue: '$0.50-2 per expense transaction'
                }
            ],
            keyDifferentiators: [
                'Practice management software integration (Clio, QuickBooks, FreshBooks)',
                'IOLTA/Trust account compliance for legal',
                'Proposal-to-payment workflow',
                'Hourly vs project-based billing flexibility',
                'Client payment history & reporting',
                'Multi-client job costing',
                'Accountant-friendly reporting',
                'Professional liability insurance integration'
            ],
            targetCustomers: 'Law firms, accounting firms, consultants, marketing agencies, architects',
            arpu: '$3K-20K per firm/year',
            implementation: 'White-label client portal, mobile payment app, accounting software connector'
        }
    ];

    const currentVertical = verticals.find(v => v.id === selectedVertical);
    const Icon = currentVertical?.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900">
                        FTS.Money Vertical-Specific Payment Solutions
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Industry-tailored payment infrastructure leveraging FTS.Money's white-label multi-tenant platform
                        for specialized business needs across 8+ vertical markets
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Badge className="bg-purple-600 text-white px-4 py-2">
                            8 Industry Verticals
                        </Badge>
                        <Badge className="bg-blue-600 text-white px-4 py-2">
                            $45T+ Combined TAM
                        </Badge>
                        <Badge className="bg-green-600 text-white px-4 py-2">
                            30+ Vertical Solutions
                        </Badge>
                    </div>
                </div>

                {/* Executive Summary */}
                <Card className="border-2 border-purple-200 bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-6 h-6 text-purple-600" />
                            Vertical SaaS Opportunity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Vertical SaaS Market</div>
                                <div className="text-2xl font-bold text-purple-900">$134B</div>
                                <div className="text-xs text-purple-600">By 2027, 35% CAGR</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium">Embedded Payments</div>
                                <div className="text-2xl font-bold text-blue-900">$230B</div>
                                <div className="text-xs text-blue-600">Revenue opportunity 2027</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-green-600 font-medium">Average Take Rate</div>
                                <div className="text-2xl font-bold text-green-900">15-40%</div>
                                <div className="text-xs text-green-600">Of payment volume</div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-sm">
                            <p>
                                <strong>Vertical SaaS + Embedded Payments = Massive Opportunity:</strong> Industry-specific 
                                software platforms that embed payments see 3-5x higher ARPU, 40% lower churn, and 
                                payment revenue becoming 40-60% of total revenue within 3 years.
                            </p>
                            <p>
                                <strong>FTS.Money's Advantage:</strong> White-label multi-tenant infrastructure means each 
                                vertical solution can be provisioned as a dedicated PSP with industry-specific branding, 
                                workflows, and compliance—without rebuilding core payment infrastructure.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Vertical Selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {verticals.map((vertical) => {
                        const VerticalIcon = vertical.icon;
                        return (
                            <Button
                                key={vertical.id}
                                variant={selectedVertical === vertical.id ? "default" : "outline"}
                                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                                    selectedVertical === vertical.id 
                                        ? 'bg-purple-600 text-white' 
                                        : 'hover:bg-purple-50'
                                }`}
                                onClick={() => setSelectedVertical(vertical.id)}
                            >
                                <VerticalIcon className="w-6 h-6" />
                                <span className="text-sm font-medium">{vertical.name}</span>
                            </Button>
                        );
                    })}
                </div>

                {/* Vertical Details */}
                {currentVertical && (
                    <div className="space-y-6">
                        {/* Header Card */}
                        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-purple-100 rounded-lg">
                                        <Icon className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl">{currentVertical.name}</CardTitle>
                                        <p className="text-slate-600 mt-2">{currentVertical.description}</p>
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <Badge variant="outline" className="text-purple-700 border-purple-300">
                                                {currentVertical.marketSize}
                                            </Badge>
                                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                {currentVertical.paymentVolume}
                                            </Badge>
                                            <Badge variant="outline" className="text-green-700 border-green-300">
                                                ARPU: {currentVertical.arpu}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Solutions Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {currentVertical.solutions.map((solution, idx) => (
                                <Card key={idx} className="border-2 hover:border-purple-300 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-purple-600" />
                                            {solution.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2 text-sm">Key Features</h4>
                                            <ul className="space-y-1">
                                                {solution.features.map((feature, fIdx) => (
                                                    <li key={fIdx} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-semibold text-green-900">Revenue Model</span>
                                            </div>
                                            <p className="text-sm text-green-800">{solution.revenue}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Key Differentiators */}
                        <Card className="border-2 border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    Key Differentiators for {currentVertical.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {currentVertical.keyDifferentiators.map((diff, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 p-3 bg-blue-50 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span>{diff}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Implementation & Target Customers */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-600" />
                                        Target Customers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700">{currentVertical.targetCustomers}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        Implementation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700">{currentVertical.implementation}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Vertical Strategy Summary */}
                <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <TrendingUp className="w-7 h-7 text-purple-600" />
                            Vertical Strategy & Economics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                                <div className="text-sm text-purple-600 font-medium mb-2">GTM Strategy</div>
                                <ul className="text-xs text-slate-700 space-y-1">
                                    <li>• Partner with vertical SaaS platforms</li>
                                    <li>• White-label embedded payments</li>
                                    <li>• Revenue share (50-70% to partner)</li>
                                    <li>• Co-marketing & co-selling</li>
                                </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                                <div className="text-sm text-blue-600 font-medium mb-2">Unit Economics</div>
                                <ul className="text-xs text-slate-700 space-y-1">
                                    <li>• Setup: $20K-100K per vertical</li>
                                    <li>• Monthly: $5K-50K per partner</li>
                                    <li>• Transaction: 0.5-2.5% take rate</li>
                                    <li>• Gross margin: 60-75%</li>
                                </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                                <div className="text-sm text-green-600 font-medium mb-2">Scale Trajectory</div>
                                <ul className="text-xs text-slate-700 space-y-1">
                                    <li>• Year 1: 3-5 verticals, 10 partners</li>
                                    <li>• Year 3: 8 verticals, 50 partners</li>
                                    <li>• Year 5: 12 verticals, 150 partners</li>
                                    <li>• Revenue: $50M-200M by Year 5</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-blue-100 border-l-4 border-blue-600 p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">Why Vertical Solutions Win</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>Higher ARPU:</strong> Vertical-specific features justify 3-5x pricing vs horizontal SaaS</li>
                                <li>• <strong>Lower Churn:</strong> Industry workflows create switching costs (25-40% lower churn)</li>
                                <li>• <strong>Faster Sales Cycles:</strong> Industry expertise reduces sales cycle by 40-60%</li>
                                <li>• <strong>Payment Attachment:</strong> 60-80% of customers adopt embedded payments within 12 months</li>
                                <li>• <strong>Network Effects:</strong> Industry-specific marketplace opportunities (e.g., restaurant supply chain)</li>
                            </ul>
                        </div>

                        <div className="bg-purple-100 border-l-4 border-purple-600 p-4">
                            <h3 className="font-semibold text-purple-900 mb-2">FTS.Money's Unique Position</h3>
                            <p className="text-sm text-purple-800 mb-3">
                                Unlike horizontal payment platforms (Stripe, Adyen), FTS.Money enables <strong>PSPs to become vertical specialists</strong> by:
                            </p>
                            <ul className="text-sm text-purple-800 space-y-1">
                                <li>• <strong>White-label provisioning:</strong> Each vertical looks like a dedicated solution</li>
                                <li>• <strong>Industry compliance:</strong> Pre-built PCI, HIPAA, GDPR, industry-specific regulations</li>
                                <li>• <strong>Vertical workflows:</strong> Tuition plans, table ordering, appointment booking out-of-the-box</li>
                                <li>• <strong>Integration marketplace:</strong> Pre-built connectors to vertical SaaS (Mindbody, Toast, Veracross)</li>
                                <li>• <strong>Time to market:</strong> 3-6 months vs 18-24 months to build from scratch</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 mb-3">Implementation Roadmap by Vertical Priority</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-green-900">Tier 1 (Months 1-6)</div>
                                        <div className="text-sm text-green-700">F&B, Retail, Education - Largest TAM, clear pain points</div>
                                    </div>
                                    <Badge className="bg-green-600 text-white">Launch First</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-blue-900">Tier 2 (Months 7-12)</div>
                                        <div className="text-sm text-blue-700">Hotels, Healthcare, Real Estate - Complex but high value</div>
                                    </div>
                                    <Badge className="bg-blue-600 text-white">High Priority</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-purple-900">Tier 3 (Months 13-24)</div>
                                        <div className="text-sm text-purple-700">Automotive, Fitness, Professional Services - Specialized needs</div>
                                    </div>
                                    <Badge className="bg-purple-600 text-white">Expansion</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}