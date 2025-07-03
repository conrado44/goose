import React from 'react';
import { SquareIntegration } from '../components/square';

// Demo component showing how to use the Square Integration
export const SquareIntegrationDemo: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Square Web Payments SDK Integration Demo</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Demo Instructions</h2>
        <ol className="text-blue-800 space-y-1">
          <li>1. Enter a Square Customer ID (or search for a customer)</li>
          <li>2. Click "Add New Card on File" to open the secure card entry form</li>
          <li>3. The Square Web Payments SDK will load and provide secure card entry</li>
          <li>4. Card data is tokenized by Square (no sensitive data stored locally)</li>
          <li>5. Tokenized card is sent to Square MCP to create card on file</li>
        </ol>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">Configuration Needed</h2>
        <p className="text-yellow-800 mb-2">To fully test this integration, you'll need:</p>
        <ul className="text-yellow-800 space-y-1">
          <li>• Square Application ID and Location ID</li>
          <li>• Square MCP server connection</li>
          <li>• Valid Square Customer ID for testing</li>
        </ul>
      </div>

      <SquareIntegration />
    </div>
  );
};

export default SquareIntegrationDemo;