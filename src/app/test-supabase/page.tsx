"use client";

import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function TestSupabasePage() {
  const [nullifier, setNullifier] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testStoreUser = async () => {
    if (!nullifier.trim()) {
      setError('Please enter a nullifier');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const testData = {
        nationality: 'IN',
        age_verified: true,
        user_address: '0x1234567890123456789012345678901234567890',
        verification_data: {
          nationality: 'IN',
          minimumAge: 25,
          verified: true
        }
      };

      const response = await fetch(`/api/users/supabase/${nullifier}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: 'User stored successfully!', data });
      } else {
        setError(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRetrieveUser = async () => {
    if (!nullifier.trim()) {
      setError('Please enter a nullifier');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/users/supabase/${nullifier}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: 'User retrieved successfully!', data: data.data });
      } else {
        setError(`Error: ${data.error || 'User not found'}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Test by trying to fetch a non-existent user (this will test the connection)
      const response = await fetch('/api/users/supabase/connection-test-123');
      const data = await response.json();
      
      // If we get a 404 with "User not found", the connection is working
      // If we get a different error, the connection failed
      const isConnected = response.status === 404 && data.error === 'User not found';
      
      setResult({ 
        success: true, 
        message: 'Supabase connection test completed!', 
        data: { 
          connectionStatus: isConnected ? 'Connected' : 'Failed',
          details: `Status: ${response.status}, Message: ${data.error || 'Unknown'}`
        }
      });
    } catch (err: any) {
      setError(`Connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🗄️ Supabase Database Test
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Test Nullifier Storage & Retrieval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nullifier"
                value={nullifier}
                onChange={(e) => setNullifier(e.target.value)}
                placeholder="Enter a test nullifier (e.g., test_nullifier_123)"
                helperText="Use any string as a test nullifier"
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={testStoreUser}
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? '⏳ Storing...' : '💾 Store Test User'}
                </Button>
                
                <Button
                  onClick={testRetrieveUser}
                  disabled={loading}
                  variant="secondary"
                >
                  {loading ? '⏳ Retrieving...' : '🔍 Retrieve User'}
                </Button>
                
                <Button
                  onClick={testConnection}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? '⏳ Testing...' : '🔌 Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {(result || error) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {result ? '✅ Success' : '❌ Error'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
                
                {result && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium mb-2">{result.message}</p>
                    {result.data && (
                      <div className="bg-white rounded border p-3">
                        <p className="text-sm text-gray-600 mb-2">Data:</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">How to test:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>First, click "Test Connection" to verify Supabase is working</li>
                  <li>Enter any test nullifier (e.g., "test_user_123")</li>
                  <li>Click "Store Test User" to save test data</li>
                  <li>Click "Retrieve User" to fetch the stored data</li>
                  <li>Check your Supabase dashboard to see the data</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Make sure you've run the database schema SQL in your Supabase dashboard first!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
