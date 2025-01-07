'use client'
import { testEncryptionDecryption } from '@/utils/cryptoTest';
import { useState } from 'react';

export default function TestCrypto() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTest = () => {
    const testResult = testEncryptionDecryption(password);
    setResult(testResult);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Test Encryption/Decryption</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password to test"
          className="border p-2 rounded"
        />
        
        <button
          onClick={handleTest}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Encryption/Decryption
        </button>
        
        {result && (
          <div className="mt-4">
            <h2 className="text-xl mb-2">Test Results:</h2>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}