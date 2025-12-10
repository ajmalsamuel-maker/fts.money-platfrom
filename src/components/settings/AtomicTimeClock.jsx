import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { syncAtomicTime, getFormattedAtomicTime, getSyncStatus } from '../utils/atomicTime';

export default function AtomicTimeClock({ timezone = 'UTC', showSync = true, compact = false }) {
    const [currentTime, setCurrentTime] = useState('');
    const [syncStatus, setSyncStatus] = useState({ isSynced: false, lastSync: null });
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // Initial sync
        handleSync();

        // Update time every second
        const timeInterval = setInterval(() => {
            setCurrentTime(getFormattedAtomicTime(timezone, compact ? 'short' : 'full'));
        }, 1000);

        // Re-sync every 5 minutes
        const syncInterval = setInterval(() => {
            handleSync();
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(syncInterval);
        };
    }, [timezone, compact]);

    const handleSync = async () => {
        setSyncing(true);
        const result = await syncAtomicTime(timezone);
        setSyncStatus(getSyncStatus());
        setCurrentTime(getFormattedAtomicTime(timezone, compact ? 'short' : 'full'));
        setSyncing(false);
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="font-mono">{currentTime}</span>
                {syncStatus.isSynced && (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">{currentTime}</span>
                    {syncStatus.isSynced ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Synced
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Synced
                        </Badge>
                    )}
                </div>
                {syncStatus.lastSync && (
                    <p className="text-xs text-slate-500 mt-0.5">
                        Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
                    </p>
                )}
            </div>
            {showSync && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSync}
                    disabled={syncing}
                    className="h-8"
                >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                </Button>
            )}
        </div>
    );
}