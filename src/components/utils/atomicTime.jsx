// Atomic time synchronization utilities
// Uses WorldTimeAPI as the atomic time source

const TIME_API_URL = 'https://worldtimeapi.org/api/timezone';

let timeOffset = 0; // Offset between local time and atomic time in milliseconds
let lastSync = null;

// Sync with atomic time server
export const syncAtomicTime = async (timezone = 'UTC') => {
    try {
        const response = await fetch(`${TIME_API_URL}/${timezone}`);
        if (!response.ok) throw new Error('Time sync failed');
        
        const data = await response.json();
        const serverTime = new Date(data.datetime).getTime();
        const localTime = Date.now();
        
        timeOffset = serverTime - localTime;
        lastSync = new Date();
        
        return {
            success: true,
            serverTime: new Date(serverTime),
            offset: timeOffset,
            timezone: data.timezone,
            abbreviation: data.abbreviation,
            utcOffset: data.utc_offset
        };
    } catch (error) {
        console.error('Atomic time sync failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Get current atomic time
export const getAtomicTime = () => {
    return new Date(Date.now() + timeOffset);
};

// Get time with timezone
export const getTimeInTimezone = (timezone) => {
    const now = getAtomicTime();
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);
};

// Get formatted time with timezone info
export const getFormattedAtomicTime = (timezone, format = 'full') => {
    const now = getAtomicTime();
    
    const options = format === 'full' 
        ? {
            timeZone: timezone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        }
        : {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
    
    return new Intl.DateTimeFormat('en-US', options).format(now);
};

// Get sync status
export const getSyncStatus = () => {
    return {
        lastSync,
        offset: timeOffset,
        isSynced: lastSync !== null
    };
};

// Get available timezones (common ones)
export const getAvailableTimezones = () => {
    return [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
        { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
        { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
        { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
        { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
        { value: 'America/Mexico_City', label: 'America/Mexico City (CST)' },
        { value: 'America/Sao_Paulo', label: 'America/Sao Paulo (BRT)' },
        { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
        { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
        { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
        { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (CET/CEST)' },
        { value: 'Europe/Zurich', label: 'Europe/Zurich (CET/CEST)' },
        { value: 'Europe/Stockholm', label: 'Europe/Stockholm (CET/CEST)' },
        { value: 'Europe/Warsaw', label: 'Europe/Warsaw (CET/CEST)' },
        { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK)' },
        { value: 'Europe/Istanbul', label: 'Europe/Istanbul (TRT)' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
        { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
        { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong (HKT)' },
        { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
        { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
        { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT)' },
        { value: 'Asia/Manila', label: 'Asia/Manila (PHT)' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
        { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEDT/AEST)' },
        { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZDT/NZST)' },
        { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
        { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' }
    ];
};