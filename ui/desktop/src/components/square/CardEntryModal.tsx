import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CardEntryForm } from './CardEntryForm';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface CardEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export const CardEntryModal: React.FC<CardEntryModalProps> = ({
  isOpen,
  onClose,
  customerId,
}) => {
  const [success, setSuccess] = useState<{
    cardId: string;
    cardDetails: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCardCreated = (cardId: string, cardDetails: any) => {
    setSuccess({ cardId, cardDetails });
    setError(null);
    
    // Auto-close after showing success for 3 seconds
    setTimeout(() => {
      onClose();
      setSuccess(null);
    }, 3000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
  };

  const handleClose = () => {
    setSuccess(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Card on File</DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="py-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">Card successfully added!</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Card ID:</strong> {success.cardId}</p>
                    {success.cardDetails.tokenDetails?.card && (
                      <>
                        <p><strong>Brand:</strong> {success.cardDetails.tokenDetails.card.brand}</p>
                        <p><strong>Last 4:</strong> ****{success.cardDetails.tokenDetails.card.last4}</p>
                        <p><strong>Expires:</strong> {success.cardDetails.tokenDetails.card.expMonth}/{success.cardDetails.tokenDetails.card.expYear}</p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-2">This dialog will close automatically...</p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <CardEntryForm
            customerId={customerId}
            onCardCreated={handleCardCreated}
            onError={handleError}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};