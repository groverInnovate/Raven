"use client";

import { useNullifier } from '../../contexts/NullifierContext';
import Cookies from 'js-cookie';

export default function NullifierDebug() {
  const { nullifier, isVerified, nullifierData, isLoading } = useNullifier();
  
  const cookieValue = typeof window !== 'undefined' ? Cookies.get('ghostpalace_nullifier') : 'N/A (SSR)';
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg border-2 border-blue-300 mb-4">
      <h3 className="font-bold text-lg mb-2">🔍 Nullifier Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Cookie Value:</strong> {cookieValue || 'Not found'}</div>
        <div><strong>Context Nullifier:</strong> {nullifier || 'null'}</div>
        <div><strong>Is Verified:</strong> {isVerified ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Is Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}</div>
        <div><strong>Nullifier Data:</strong> {nullifierData ? '✅ Present' : '❌ Null'}</div>
        {nullifierData && (
          <div className="ml-4">
            <div><strong>- Verified:</strong> {nullifierData.verified ? '✅' : '❌'}</div>
            <div><strong>- User Address:</strong> {nullifierData.userAddress}</div>
            <div><strong>- Timestamp:</strong> {nullifierData.timestamp}</div>
          </div>
        )}
      </div>
    </div>
  );
}
