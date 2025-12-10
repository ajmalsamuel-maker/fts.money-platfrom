import React from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, HelpCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MerchantTopBar({ user, merchant, onLogout, selectedMID }) {
    const navigate = useNavigate();
    
    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                        {merchant?.business_name || 'Merchant Portal'}
                    </span>
                    {(merchant?.merchant_code || user?.merchant_code) && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded-md">
                            <span className="text-xs font-medium text-slate-600">Code:</span>
                            <span className="text-xs font-mono font-bold text-slate-900">{merchant?.merchant_code || user?.merchant_code}</span>
                        </div>
                    )}
                    {selectedMID && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                            <span className="text-xs font-medium text-slate-600">Active MID:</span>
                            <span className="text-xs font-mono font-bold text-blue-700">{selectedMID}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('MerchantHelpCenter'))}>
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help
                </Button>

                <Button variant="outline" size="sm" onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm">{user?.full_name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-2">
                            <p className="text-sm font-medium">{user?.full_name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('MerchantInfo'))}>
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('MerchantChangePassword'))}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Change Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onLogout} className="text-red-600">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}