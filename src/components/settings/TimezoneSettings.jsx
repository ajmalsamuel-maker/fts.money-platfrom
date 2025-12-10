import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Globe, MapPin, Clock } from 'lucide-react';
import { getAllCountries, getTimezoneForCountry } from '../utils/countries';
import { getAvailableTimezones } from '../utils/atomicTime';
import AtomicTimeClock from './AtomicTimeClock';

export default function TimezoneSettings({ 
    currentCountry = 'US', 
    currentTimezone = 'America/New_York',
    onSave 
}) {
    const [country, setCountry] = useState(currentCountry);
    const [timezone, setTimezone] = useState(currentTimezone);
    const [saving, setSaving] = useState(false);

    const countries = getAllCountries();
    const timezones = getAvailableTimezones();

    const handleCountryChange = (countryCode) => {
        setCountry(countryCode);
        // Auto-select timezone based on country
        const suggestedTimezone = getTimezoneForCountry(countryCode);
        setTimezone(suggestedTimezone);
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave({ country, timezone });
        setSaving(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Location & Timezone Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Time Display */}
                <div>
                    <Label className="text-sm font-medium mb-2 block">Current Atomic Time</Label>
                    <AtomicTimeClock timezone={timezone} />
                </div>

                {/* Country Selection */}
                <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Country/Region
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.name} ({c.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1">
                        Select the country where your organization is located
                    </p>
                </div>

                {/* Timezone Selection */}
                <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timezone
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {timezones.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1">
                        All timestamps will be displayed in this timezone
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}