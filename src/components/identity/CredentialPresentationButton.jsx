import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VerifiablePresentationFlow from './VerifiablePresentationFlow';
import { Shield, Send } from 'lucide-react';

/**
 * Reusable button component to trigger credential presentation
 * Can be embedded in any onboarding/auth flow
 */
export default function CredentialPresentationButton({ 
    serviceName,
    requiredType,
    onPresentationComplete,
    buttonText = "Present Credentials",
    buttonVariant = "default",
    buttonClassName = ""
}) {
    const [showDialog, setShowDialog] = useState(false);

    const handlePresentationCreated = (presentation) => {
        setShowDialog(false);
        onPresentationComplete?.(presentation);
    };

    return (
        <>
            <Button 
                variant={buttonVariant}
                className={buttonClassName}
                onClick={() => setShowDialog(true)}
            >
                <Shield className="h-4 w-4 mr-2" />
                {buttonText}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-purple-600" />
                            Present Credentials to {serviceName}
                        </DialogTitle>
                    </DialogHeader>

                    <VerifiablePresentationFlow
                        recipientService={serviceName}
                        requiredCredentialType={requiredType}
                        onPresentationCreated={handlePresentationCreated}
                        onCancel={() => setShowDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}