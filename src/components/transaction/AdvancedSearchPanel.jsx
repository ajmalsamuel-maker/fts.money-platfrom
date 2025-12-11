import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Download, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const ACTION_TYPES = [
    'ALL', 'SALE', 'REFUND', 'AUTH', 'CAPTURE', 'VOID', 'VOID_AUTH', 'VOID_SALE',
    'PAYOUT', 'PAYOUT_ONLY', 'VERTOKEN', 'GENTOKEN', 'TRANSFER'
];

const STATUS_TYPES = [
    'ALL', 'ACCEPTED', 'APPROVED', 'REJECTED', 'DECLINED', 'PENDING', 
    'VOIDED', 'ERROR', 'FAILED', 'PROCESSING', 'CANCELLED'
];

const TXN_TYPES = [
    'ALL', 'ATM Card', 'ATM transfer', 'Alipay', 'American Express', 'Baidu',
    'Bank Transfer', 'Bitcoin', 'Bitcoin Cash', 'CUP QR', 'China Union Pay',
    'Circle USD Coin', 'Convenience Store', 'Coupon', 'Credit/Debit Card',
    'Crypto Currency', 'Debit Card', 'Diners Club', 'E-Wallet Payment',
    'Visa', 'Mastercard', 'Discover', 'JCB', 'UnionPay'
];

const CURRENCIES = [
    'ALL', 'CNY', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'HKD', 
    'SGD', 'INR', 'KRW', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'NZD', 'BRL',
    'MXN', 'ARS', 'CLP', 'COP', 'PEN', 'BTC', 'ETH', 'USDT', 'USDC', 'BNB',
    'XRP', 'SOL', 'ADA', 'DASH', 'LKR', 'MNT'
];

export default function AdvancedSearchPanel({ mids = [], onSearch, onExport }) {
    const [expanded, setExpanded] = useState(true);
    const [midSelection, setMidSelection] = useState('all');
    const [selectedMID, setSelectedMID] = useState('');
    const [filters, setFilters] = useState({
        merchantTxnId: '',
        transactionId: '',
        action: 'ALL',
        status: 'ALL',
        txnType: 'ALL',
        currency: 'ALL',
        cardPrefix: '',
        cardNumber: '',
        paymentCode: '',
        approvalCode: '',
        txnAmountFrom: '',
        txnAmountTo: '',
        billToAccountName: '',
        actualAmountFrom: '',
        actualAmountTo: '',
        userId: '',
        remarks: '',
        ipAddress: '',
        trialId: '',
        connectorTxnNo: '',
        dateFrom: new Date(),
        timeFromHH: '00',
        timeFromMM: '00',
        dateTo: new Date(),
        timeToHH: '24',
        timeToMM: '00',
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        const searchParams = {
            ...filters,
            midSelection,
            selectedMID: midSelection === 'specific' ? selectedMID : null
        };
        onSearch(searchParams);
    };

    const handleReset = () => {
        setFilters({
            merchantTxnId: '',
            transactionId: '',
            action: 'ALL',
            status: 'ALL',
            txnType: 'ALL',
            currency: 'ALL',
            cardPrefix: '',
            cardNumber: '',
            paymentCode: '',
            approvalCode: '',
            txnAmountFrom: '',
            txnAmountTo: '',
            billToAccountName: '',
            actualAmountFrom: '',
            actualAmountTo: '',
            userId: '',
            remarks: '',
            ipAddress: '',
            trialId: '',
            connectorTxnNo: '',
            dateFrom: new Date(),
            timeFromHH: '00',
            timeFromMM: '00',
            dateTo: new Date(),
            timeToHH: '24',
            timeToMM: '00',
        });
        setMidSelection('all');
        setSelectedMID('');
    };

    return (
        <Card className="mb-6">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Transaction
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>
            
            {expanded && (
                <CardContent className="p-4 bg-gradient-to-br from-slate-50 to-blue-50">
                    {/* MID Selection */}
                    <div className="mb-4 flex items-center justify-between bg-white rounded-lg p-3 border">
                        <RadioGroup value={midSelection} onValueChange={setMidSelection} className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="all-mids" />
                                <Label htmlFor="all-mids" className="cursor-pointer">All MIDs</Label>
                            </div>
                            <div className="flex items-center space-x-2 gap-3">
                                <RadioGroupItem value="specific" id="specific-mid" />
                                <Label htmlFor="specific-mid" className="cursor-pointer">MID:</Label>
                                <Select 
                                    value={selectedMID} 
                                    onValueChange={setSelectedMID}
                                    disabled={midSelection === 'all'}
                                >
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="Select MID" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mids.map(mid => (
                                            <SelectItem key={mid.id} value={mid.id}>
                                                {mid.mid} - {mid.merchant_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </RadioGroup>
                        <span className="text-xs text-slate-500">Time Zone: Asia/Hong_Kong</span>
                    </div>

                    {/* Search Fields Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-4 border">
                        {/* Row 1 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Merchant Transaction ID</Label>
                            <Input 
                                value={filters.merchantTxnId}
                                onChange={(e) => handleFilterChange('merchantTxnId', e.target.value)}
                                placeholder="Enter merchant transaction ID"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Transaction ID</Label>
                            <Input 
                                value={filters.transactionId}
                                onChange={(e) => handleFilterChange('transactionId', e.target.value)}
                                placeholder="Enter transaction ID"
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Action</Label>
                            <Select value={filters.action} onValueChange={(val) => handleFilterChange('action', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {ACTION_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Status</Label>
                            <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {STATUS_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Row 3 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Txn Type</Label>
                            <Select value={filters.txnType} onValueChange={(val) => handleFilterChange('txnType', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {TXN_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Currency</Label>
                            <Select value={filters.currency} onValueChange={(val) => handleFilterChange('currency', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {CURRENCIES.map(curr => (
                                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Row 4 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Card Prefix (6 digits prefix)</Label>
                            <Input 
                                value={filters.cardPrefix}
                                onChange={(e) => handleFilterChange('cardPrefix', e.target.value)}
                                placeholder="First 6 digits"
                                maxLength={6}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Card Number</Label>
                            <Input 
                                value={filters.cardNumber}
                                onChange={(e) => handleFilterChange('cardNumber', e.target.value)}
                                placeholder="Card number"
                            />
                        </div>

                        {/* Row 5 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Payment Code</Label>
                            <Input 
                                value={filters.paymentCode}
                                onChange={(e) => handleFilterChange('paymentCode', e.target.value)}
                                placeholder="Payment code"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Approval Code</Label>
                            <Input 
                                value={filters.approvalCode}
                                onChange={(e) => handleFilterChange('approvalCode', e.target.value)}
                                placeholder="Approval code"
                            />
                        </div>

                        {/* Row 6 - Amount Range */}
                        <div className="space-y-1">
                            <Label className="text-xs">Txn Amount</Label>
                            <div className="flex gap-2 items-center">
                                <Input 
                                    value={filters.txnAmountFrom}
                                    onChange={(e) => handleFilterChange('txnAmountFrom', e.target.value)}
                                    placeholder="From"
                                    type="number"
                                />
                                <span>To</span>
                                <Input 
                                    value={filters.txnAmountTo}
                                    onChange={(e) => handleFilterChange('txnAmountTo', e.target.value)}
                                    placeholder="To"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Bill To Account Name</Label>
                            <Input 
                                value={filters.billToAccountName}
                                onChange={(e) => handleFilterChange('billToAccountName', e.target.value)}
                                placeholder="Account name"
                            />
                        </div>

                        {/* Row 7 - Actual Amount Range */}
                        <div className="space-y-1">
                            <Label className="text-xs">Actual Amount</Label>
                            <div className="flex gap-2 items-center">
                                <Input 
                                    value={filters.actualAmountFrom}
                                    onChange={(e) => handleFilterChange('actualAmountFrom', e.target.value)}
                                    placeholder="From"
                                    type="number"
                                />
                                <span>To</span>
                                <Input 
                                    value={filters.actualAmountTo}
                                    onChange={(e) => handleFilterChange('actualAmountTo', e.target.value)}
                                    placeholder="To"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">User ID</Label>
                            <Input 
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                                placeholder="User ID"
                            />
                        </div>

                        {/* Row 8 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Remarks</Label>
                            <Input 
                                value={filters.remarks}
                                onChange={(e) => handleFilterChange('remarks', e.target.value)}
                                placeholder="Remarks"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">IP Address</Label>
                            <Input 
                                value={filters.ipAddress}
                                onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                                placeholder="IP address"
                            />
                        </div>

                        {/* Row 9 */}
                        <div className="space-y-1">
                            <Label className="text-xs">Trial ID</Label>
                            <Input 
                                value={filters.trialId}
                                onChange={(e) => handleFilterChange('trialId', e.target.value)}
                                placeholder="Trial ID"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Connector Txn No</Label>
                            <Input 
                                value={filters.connectorTxnNo}
                                onChange={(e) => handleFilterChange('connectorTxnNo', e.target.value)}
                                placeholder="Connector transaction number"
                            />
                        </div>

                        {/* Row 10 - Date Range */}
                        <div className="space-y-1 col-span-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">From</Label>
                                    <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateFrom}
                                                    onSelect={(date) => handleFilterChange('dateFrom', date)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Input 
                                            value={filters.timeFromHH}
                                            onChange={(e) => handleFilterChange('timeFromHH', e.target.value)}
                                            placeholder="HH"
                                            className="w-16"
                                            maxLength={2}
                                        />
                                        <Input 
                                            value={filters.timeFromMM}
                                            onChange={(e) => handleFilterChange('timeFromMM', e.target.value)}
                                            placeholder="MM"
                                            className="w-16"
                                            maxLength={2}
                                        />
                                        <span className="text-xs text-slate-500 self-center">(HH:MM)</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">To</Label>
                                    <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateTo}
                                                    onSelect={(date) => handleFilterChange('dateTo', date)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Input 
                                            value={filters.timeToHH}
                                            onChange={(e) => handleFilterChange('timeToHH', e.target.value)}
                                            placeholder="HH"
                                            className="w-16"
                                            maxLength={2}
                                        />
                                        <Input 
                                            value={filters.timeToMM}
                                            onChange={(e) => handleFilterChange('timeToMM', e.target.value)}
                                            placeholder="MM"
                                            className="w-16"
                                            maxLength={2}
                                        />
                                        <span className="text-xs text-slate-500 self-center">(HH:MM)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={handleReset}>
                            Reset
                        </Button>
                        <Button variant="outline" onClick={onExport} className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700 gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}