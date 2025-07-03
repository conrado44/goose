// Type validation test for Square Integration components
import { CardEntryForm, CardEntryModal, SquareIntegration } from '../components/square';

// This file serves as a type check to ensure our components are properly typed
// and can be imported without issues

// Test CardEntryForm props
const cardEntryFormProps = {
  customerId: 'test-customer-id',
  onCardCreated: (cardId: string, cardDetails: any) => {
    console.log('Card created:', cardId, cardDetails);
  },
  onError: (error: string) => {
    console.error('Card creation error:', error);
  },
  onCancel: () => {
    console.log('Card creation cancelled');
  },
};

// Test CardEntryModal props
const cardEntryModalProps = {
  isOpen: true,
  onClose: () => {
    console.log('Modal closed');
  },
  customerId: 'test-customer-id',
};

// Test SquareIntegration props
const squareIntegrationProps = {
  onClose: () => {
    console.log('Square integration closed');
  },
};

// Type assertions to ensure components accept the correct props
const _cardEntryForm: React.FC<typeof cardEntryFormProps> = CardEntryForm;
const _cardEntryModal: React.FC<typeof cardEntryModalProps> = CardEntryModal;
const _squareIntegration: React.FC<typeof squareIntegrationProps> = SquareIntegration;

// Export to prevent unused variable warnings
export { _cardEntryForm, _cardEntryModal, _squareIntegration };

console.log('✅ All Square Integration components are properly typed');