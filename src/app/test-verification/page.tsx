"use client";

import React, { useState } from 'react';

export default function TestVerificationPage() {
  const [nullifier, setNullifier] = useState('5977493314111785286936752583767236892795437540705499483879954375887806953649');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testRetrieveUser = async () => {
    if (!nullifier.trim()) {
      setError('Please enter a nullifier');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/users/${nullifier}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to retrieve user data');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testStoreUser = async () => {
    if (!nullifier.trim()) {
      setError('Please enter a nullifier');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const mockVerificationData = {
        verificationData: {
          nullifier: nullifier,
          nationality: "IND",
          minimumAge: "18",
          gender: "\u0000",
          ofac: [false, true, true],
          issuingState: "",
          name: "",
          idNumber: "\u0000\u0000\u0000\u0000",
          dateOfBirth: "NaN",
          expiryDate: "UNAVAILABLE",
          forbiddenCountriesListPacked: ["0", "0", "0", "0"]
        },
        userAddress: "0x1234567890123456789012345678901234567890",
        documentType: 3
      };

      const response = await fetch(`/api/users/${nullifier}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockVerificationData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to store user data');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Test Verification Data Storage
          </h1>
          
          <div className="space-y-6">
            {/* Nullifier Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nullifier
              </label>
              <input
                type="text"
                value={nullifier}
                onChange={(e) => setNullifier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter nullifier to test"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={testStoreUser}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '⏳ Storing...' : '📝 Test Store User Data'}
              </button>
              
              <button
                onClick={testRetrieveUser}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '⏳ Loading...' : '📥 Test Retrieve User Data'}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700">❌ {error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ✅ Result:
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                
                {result.ipfsHash && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">IPFS Links:</p>
                    <div className="space-y-1">
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        🔗 Pinata Gateway: https://gateway.pinata.cloud/ipfs/{result.ipfsHash}
                      </a>
                      <a
                        href={`https://ipfs.io/ipfs/${result.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        🌐 Public IPFS: https://ipfs.io/ipfs/{result.ipfsHash}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📋 How to Check Manually:
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>1. <strong>Store Test Data:</strong> Click "Test Store User Data" to create a test entry</li>
                <li>2. <strong>Retrieve Data:</strong> Click "Test Retrieve User Data" to fetch stored data</li>
                <li>3. <strong>Check Pinata Dashboard:</strong> Login to pinata.cloud and look for files named with your nullifier</li>
                <li>4. <strong>Visit IPFS Links:</strong> Click the generated IPFS links to view data directly</li>
                <li>5. <strong>Check Browser Console:</strong> Open DevTools to see detailed logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
