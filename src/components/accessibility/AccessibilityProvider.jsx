/**
 * Centralized Accessibility Provider
 * WCAG 2.1 AA Compliance Framework for FTS.Money Platform
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const ACCESSIBILITY_FEATURES = {
    HIGH_CONTRAST: 'high_contrast',
    LARGE_TEXT: 'large_text',
    KEYBOARD_NAV: 'keyboard_navigation',
    SCREEN_READER: 'screen_reader_optimized',
    REDUCE_MOTION: 'reduce_motion',
    FOCUS_INDICATORS: 'enhanced_focus'
};

export function AccessibilityProvider({ children }) {
    const [preferences, setPreferences] = useState({
        [ACCESSIBILITY_FEATURES.HIGH_CONTRAST]: false,
        [ACCESSIBILITY_FEATURES.LARGE_TEXT]: false,
        [ACCESSIBILITY_FEATURES.KEYBOARD_NAV]: true,
        [ACCESSIBILITY_FEATURES.SCREEN_READER]: false,
        [ACCESSIBILITY_FEATURES.REDUCE_MOTION]: false,
        [ACCESSIBILITY_FEATURES.FOCUS_INDICATORS]: true
    });

    const [announcements, setAnnouncements] = useState([]);

    // Load saved preferences
    useEffect(() => {
        const saved = localStorage.getItem('accessibility_preferences');
        if (saved) {
            setPreferences(JSON.parse(saved));
        }

        // Detect system preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setPreferences(prev => ({ ...prev, [ACCESSIBILITY_FEATURES.REDUCE_MOTION]: true }));
        }
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            setPreferences(prev => ({ ...prev, [ACCESSIBILITY_FEATURES.HIGH_CONTRAST]: true }));
        }
    }, []);

    // Apply preferences to document
    useEffect(() => {
        const root = document.documentElement;

        // High contrast mode
        if (preferences[ACCESSIBILITY_FEATURES.HIGH_CONTRAST]) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Large text
        if (preferences[ACCESSIBILITY_FEATURES.LARGE_TEXT]) {
            root.style.fontSize = '125%';
        } else {
            root.style.fontSize = '';
        }

        // Reduce motion
        if (preferences[ACCESSIBILITY_FEATURES.REDUCE_MOTION]) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }

        // Enhanced focus
        if (preferences[ACCESSIBILITY_FEATURES.FOCUS_INDICATORS]) {
            root.classList.add('enhanced-focus');
        } else {
            root.classList.remove('enhanced-focus');
        }

        // Save preferences
        localStorage.setItem('accessibility_preferences', JSON.stringify(preferences));
    }, [preferences]);

    const toggleFeature = (feature) => {
        setPreferences(prev => ({
            ...prev,
            [feature]: !prev[feature]
        }));
    };

    const announce = (message, priority = 'polite') => {
        const announcement = { id: Date.now(), message, priority };
        setAnnouncements(prev => [...prev, announcement]);
        setTimeout(() => {
            setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
        }, 5000);
    };

    const value = {
        preferences,
        toggleFeature,
        announce,
        isFeatureEnabled: (feature) => preferences[feature]
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
            {/* Screen reader announcements */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {announcements.filter(a => a.priority === 'polite').map(a => (
                    <div key={a.id}>{a.message}</div>
                ))}
            </div>
            <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
                {announcements.filter(a => a.priority === 'assertive').map(a => (
                    <div key={a.id}>{a.message}</div>
                ))}
            </div>
        </AccessibilityContext.Provider>
    );
}

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};