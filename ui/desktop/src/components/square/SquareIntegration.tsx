import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CardEntryModal } from './CardEntryModal';
import { CreditCard, User, Search } from 'lucide-react';

interface SquareIntegrationProps {
  onClose?: () => void;
}

export const SquareIntegration: React.FC<SquareIntegrationProps> = ({ onClose }) => {
  const [customerId, setCustomerId] = useState('');
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const handleOpenCardEntry = () => {
    if (!customerId.trim()) {
      alert('Please enter a Customer ID first');
      return;
    }
    setIsCardModalOpen(true);
  };

  const handleCardCreated = (cardId: string, cardDetails: any) => {
    console.log('Card created successfully:', { cardId, cardDetails });
    setIsCardModalOpen(false);
    // You could add a success notification here
  };

  const handleSearchCustomers = async () => {
    if (!customerSearchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      // This would search for customers using the Square MCP
      const response = await window.electron.invokeSquareMCP('customers', 'search', {
        filter: {
          email_address: {
            fuzzy: customerSearchQuery,
          },
        },
      });
      
      console.log('Customer search results:', response);
      // You would handle the search results here
      // For now, just log them
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Square Integration</h1>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Customer Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Customer
          </CardTitle>
          <CardDescription>
            Search for existing customers to manage their cards on file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by email address..."
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearchCustomers} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer ID Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>
            Enter the Square Customer ID to add a card on file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-id">Square Customer ID</Label>
              <Input
                id="customer-id"
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g., JDKYHBWT1D4F8MFH63DBMEN8Y4"
                className="font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can find the Customer ID in your Square Dashboard or by searching above
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Card on File
          </CardTitle>
          <CardDescription>
            Securely capture and store a customer's payment card information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Card information is securely tokenized by Square</li>
                <li>• No sensitive card data is stored locally</li>
                <li>• Cards can be used for future payments</li>
                <li>• Complies with PCI DSS requirements</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleOpenCardEntry}
              disabled={!customerId.trim()}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add New Card on File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Entry Modal */}
      <CardEntryModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        customerId={customerId}
      />
    </div>
  );
};