import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';

// Types for Square Web Payments SDK
interface SquarePayments {
  payments: (applicationId: string, locationId: string) => PaymentsInstance;
}

interface PaymentsInstance {
  card(): Promise<CardInstance>;
}

interface CardInstance {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<TokenResult>;
  destroy(): void;
}

interface TokenResult {
  status: 'OK' | 'INVALID_CARD' | 'INVALID_EXPIRATION_DATE' | 'INVALID_CVV' | 'INVALID_POSTAL_CODE' | 'CARD_DECLINED' | 'GENERIC_DECLINE';
  token?: string;
  details?: {
    card: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  };
  errors?: Array<{
    type: string;
    field: string;
    message: string;
  }>;
}

declare global {
  interface Window {
    Square?: SquarePayments;
  }
}

interface CardEntryFormProps {
  customerId: string;
  onCardCreated: (cardId: string, cardDetails: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const CardEntryForm: React.FC<CardEntryFormProps> = ({
  customerId,
  onCardCreated,
  onError,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: '',
    locality: '',
    administrativeDistrictLevel1: '',
    postalCode: '',
    country: 'US',
  });
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<CardInstance | null>(null);
  const paymentsRef = useRef<PaymentsInstance | null>(null);

  // Square configuration - these would typically come from environment variables
  const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID || 'sandbox-sq0idb-your-app-id';
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || 'your-location-id';
  const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'sandbox';

  useEffect(() => {
    // Load Square Web Payments SDK
    const loadSquareSDK = () => {
      if (window.Square) {
        initializeSquarePayments();
        return;
      }

      const script = document.createElement('script');
      script.src = SQUARE_ENVIRONMENT === 'production' 
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = () => {
        setIsSDKLoaded(true);
        initializeSquarePayments();
      };
      script.onerror = () => {
        setError('Failed to load Square Web Payments SDK');
      };
      document.head.appendChild(script);
    };

    const initializeSquarePayments = async () => {
      try {
        if (!window.Square) {
          throw new Error('Square SDK not loaded');
        }

        const payments = window.Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
        paymentsRef.current = payments;

        const card = await payments.card();
        cardRef.current = card;
        
        await card.attach('#card-container');
        setIsSDKLoaded(true);
      } catch (err) {
        console.error('Failed to initialize Square payments:', err);
        setError('Failed to initialize payment form');
      }
    };

    loadSquareSDK();

    return () => {
      // Cleanup
      if (cardRef.current) {
        cardRef.current.destroy();
      }
    };
  }, [SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardRef.current || !customerId) {
      setError('Payment form not ready or customer ID missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Tokenize the card
      const tokenResult = await cardRef.current.tokenize();
      
      if (tokenResult.status !== 'OK') {
        throw new Error(tokenResult.errors?.[0]?.message || 'Card tokenization failed');
      }

      if (!tokenResult.token) {
        throw new Error('No token received from Square');
      }

      // Create the card on file using the Square MCP
      const cardData = {
        idempotency_key: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source_id: tokenResult.token,
        card: {
          customer_id: customerId,
          cardholder_name: cardholderName || undefined,
          billing_address: billingAddress.addressLine1 ? {
            address_line_1: billingAddress.addressLine1,
            locality: billingAddress.locality,
            administrative_district_level_1: billingAddress.administrativeDistrictLevel1,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          } : undefined,
        },
      };

      // Call the Square MCP to create the card
      const response = await window.electron.invokeSquareMCP('cards', 'create', cardData);
      
      if (response.ok && response.card) {
        onCardCreated(response.card.id, {
          ...response.card,
          tokenDetails: tokenResult.details,
        });
      } else {
        throw new Error(response.error || 'Failed to create card on file');
      }
    } catch (err) {
      console.error('Error creating card:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Card on File</CardTitle>
        <CardDescription>
          Enter card details for customer ID: {customerId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Square Card Element Container */}
          <div>
            <Label htmlFor="card-container">Card Information</Label>
            <div 
              id="card-container" 
              className="mt-2 p-3 border border-gray-300 rounded-md min-h-[60px] bg-white"
              style={{ minHeight: '60px' }}
            >
              {!isSDKLoaded && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading payment form...
                </div>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholder-name">Cardholder Name (Optional)</Label>
            <Input
              id="cardholder-name"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Billing Address */}
          <div className="space-y-3">
            <Label>Billing Address (Optional)</Label>
            
            <Input
              type="text"
              value={billingAddress.addressLine1}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
              placeholder="Street Address"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={billingAddress.locality}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, locality: e.target.value }))}
                placeholder="City"
              />
              <Input
                type="text"
                value={billingAddress.administrativeDistrictLevel1}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, administrativeDistrictLevel1: e.target.value }))}
                placeholder="State"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={billingAddress.postalCode}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="ZIP Code"
              />
              <select
                value={billingAddress.country}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isSDKLoaded}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Card...
                </>
              ) : (
                'Create Card on File'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};