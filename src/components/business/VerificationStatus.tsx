"use client";

import React from 'react';
import { useNullifier } from '../../contexts/NullifierContext';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';

export function VerificationStatus() {
  const { 
    nullifier, 
    nullifierData, 
    isVerified, 
    isLoading, 
    clearNullifier, 
    refreshNullifierData 
  } = useNullifier();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading verification status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isVerified || !nullifier) {
    return (
      <Card className="w-full max-w-md border-gray-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Verified</h3>
            <p className="text-gray-600 text-sm">
              Complete Aadhaar verification to access marketplace features
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-green-900">
            ✅ Verified User
          </CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Verification Details */}
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Nationality:</span>
                <span className="ml-1 font-medium">
                  {nullifierData?.verificationData?.nationality || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Age:</span>
                <span className="ml-1 font-medium">
                  {nullifierData?.verificationData?.minimumAge || 'N/A'}+
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Verified:</span>
                <span className="ml-1 font-medium">
                  {nullifierData?.timestamp ? 
                    new Date(nullifierData.timestamp).toLocaleDateString() : 
                    'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Nullifier Info */}
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-sm">
              <span className="text-gray-500">Nullifier ID:</span>
              <div className="mt-1 font-mono text-xs bg-gray-100 p-2 rounded break-all">
                {nullifier.substring(0, 20)}...{nullifier.substring(nullifier.length - 20)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNullifierData}
              className="flex-1"
            >
              🔄 Refresh
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={clearNullifier}
              className="flex-1"
            >
              🗑️ Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VerificationStatus;
