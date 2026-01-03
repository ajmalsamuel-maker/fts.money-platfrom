/**
 * WCAG-Enhanced Component Wrappers
 * Accessible versions of common UI components
 */

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccessibility } from './AccessibilityProvider';
import { cn } from '@/lib/utils';

/**
 * Accessible Button with proper ARIA labels
 */
export function AccessibleButton({ 
    children, 
    ariaLabel, 
    loading = false,
    disabled = false,
    onClick,
    variant,
    className,
    ...props 
}) {
    const { announce } = useAccessibility();

    const handleClick = (e) => {
        if (loading || disabled) return;
        if (onClick) {
            onClick(e);
            if (ariaLabel) {
                announce(`${ariaLabel} activated`);
            }
        }
    };

    return (
        <Button
            aria-label={ariaLabel}
            aria-busy={loading}
            aria-disabled={disabled || loading}
            disabled={disabled || loading}
            onClick={handleClick}
            variant={variant}
            className={className}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>Loading...</span>
                </span>
            ) : children}
        </Button>
    );
}

/**
 * Accessible Input with proper labels and error handling
 */
export function AccessibleInput({
    label,
    error,
    required = false,
    helpText,
    id,
    ...props
}) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;

    return (
        <div className="space-y-2">
            {label && (
                <label 
                    htmlFor={inputId}
                    className="text-sm font-medium text-slate-900"
                >
                    {label}
                    {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
                </label>
            )}
            <Input
                id={inputId}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={cn(
                    error && errorId,
                    helpText && helpId
                )}
                {...props}
            />
            {helpText && (
                <p id={helpId} className="text-xs text-slate-600">
                    {helpText}
                </p>
            )}
            {error && (
                <p id={errorId} className="text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * Skip Navigation Link (WCAG 2.4.1)
 */
export function SkipNavigation({ targetId = 'main-content' }) {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
            Skip to main content
        </a>
    );
}

/**
 * Focus Trap for Dialogs (WCAG 2.1.2)
 */
export function FocusTrap({ children, active = true }) {
    const trapRef = useRef(null);

    useEffect(() => {
        if (!active || !trapRef.current) return;

        const focusableElements = trapRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        trapRef.current.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => {
            trapRef.current?.removeEventListener('keydown', handleKeyDown);
        };
    }, [active]);

    return <div ref={trapRef}>{children}</div>;
}

/**
 * Accessible Link with external indicator
 */
export function AccessibleLink({ 
    href, 
    children, 
    external = false,
    ...props 
}) {
    return (
        <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            aria-label={external ? `${children} (opens in new window)` : undefined}
            {...props}
        >
            {children}
            {external && (
                <span className="sr-only"> (opens in new window)</span>
            )}
        </a>
    );
}

/**
 * Loading Spinner with accessible announcement
 */
export function AccessibleLoadingSpinner({ message = "Loading..." }) {
    return (
        <div role="status" aria-live="polite" className="flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="sr-only">{message}</span>
        </div>
    );
}