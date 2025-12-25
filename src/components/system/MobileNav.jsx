import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

/**
 * Mobile Navigation Component
 * Hamburger menu for all portals
 */
export default function MobileNav({ menuSections, currentPage, children }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                    <Menu className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
                    {children}
                </nav>
            </SheetContent>
        </Sheet>
    );
}