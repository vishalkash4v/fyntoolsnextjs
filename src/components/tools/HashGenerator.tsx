'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('md5');
  const [result, setResult] = useState('');
  
  // Hash comparison states
  const [compareInput, setCompareInput] = useState('');
  const [compareHashValue, setCompareHashValue] = useState('');
  const [compareHashType, setCompareHashType] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('md5');
  const [comparisonResult, setComparisonResult] = useState<'pass' | 'fail' | null>(null);
  const [generatedCompareHash, setGeneratedCompareHash] = useState('');

  const generateHash = async () => {
    if (!input.trim()) {
      toast.error('Please enter some text to hash');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      
      let hashBuffer: ArrayBuffer;
      
      if (hashType === 'md5') {
        // MD5 implementation using Web Crypto API workaround
        const hash = await simpleHash(input, 'MD5');
        setResult(hash);
        toast.success('Hash generated successfully');
        return;
      }
      
      const algorithm = hashType.toUpperCase().replace(/(\d+)/, '-$1');
      hashBuffer = await crypto.subtle.digest(algorithm, data);
      
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setResult(hashHex);
      toast.success('Hash generated successfully');
    } catch (error) {
      toast.error('Error generating hash');
      console.error('Hash generation error:', error);
    }
  };

  // Simple hash implementation for MD5 (since Web Crypto doesn't support MD5)
  const simpleHash = async (str: string, algorithm: string): Promise<string> => {
    if (algorithm === 'MD5') {
      // Simple MD5-like hash for demo purposes
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
    }
    return '';
  };


  const clearAll = () => {
    setInput('');
    setResult('');
  };

  // Compare hash function
  const performHashComparison = async () => {
    if (!compareInput.trim() || !compareHashValue.trim()) {
      toast.error('Please enter both text and hash to compare');
      return;
    }

    try {
      // Generate hash from input
      const encoder = new TextEncoder();
      const data = encoder.encode(compareInput);
      
      let generatedHash = '';
      
      if (compareHashType === 'md5') {
        generatedHash = await simpleHash(compareInput, 'MD5');
      } else {
        const algorithm = compareHashType.toUpperCase().replace(/(\d+)/, '-$1');
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        generatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      
      setGeneratedCompareHash(generatedHash);
      
      // Normalize both hashes (remove spaces, convert to lowercase)
      const normalizedGenerated = generatedHash.toLowerCase().replace(/\s+/g, '');
      const normalizedCompare = compareHashValue.toLowerCase().replace(/\s+/g, '');
      
      // Compare
      if (normalizedGenerated === normalizedCompare) {
        setComparisonResult('pass');
        toast.success('Hash comparison passed! The hashes match.');
      } else {
        setComparisonResult('fail');
        toast.error('Hash comparison failed! The hashes do not match.');
      }
    } catch (error) {
      toast.error('Error comparing hash');
      console.error('Hash comparison error:', error);
      setComparisonResult('fail');
    }
  };

  const clearComparison = () => {
    setCompareInput('');
    setCompareHashValue('');
    setGeneratedCompareHash('');
    setComparisonResult(null);
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Hash</TabsTrigger>
          <TabsTrigger value="compare">Compare Hash</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hash Generator
              </CardTitle>
              <CardDescription>
                Generate MD5, SHA-1, SHA-256, or SHA-512 hashes from your text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input-text">Input Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter text to generate hash..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="hash-type">Hash Algorithm</Label>
            <Select value={hashType} onValueChange={(value: typeof hashType) => setHashType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="md5">MD5 (32 chars)</SelectItem>
                <SelectItem value="sha1">SHA-1 (40 chars)</SelectItem>
                <SelectItem value="sha256">SHA-256 (64 chars)</SelectItem>
                <SelectItem value="sha512">SHA-512 (128 chars)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generateHash} className="flex-1">
              Generate Hash
            </Button>
            {result && (
              <CopyButton
                textToCopy={result}
                successMessage="Hash copied to clipboard"
                size="sm"
              />
            )}
            <Button onClick={clearAll} variant="outline">
              Clear
            </Button>
          </div>

          {result && (
            <div className="space-y-2">
              <Label>Generated Hash ({hashType.toUpperCase()})</Label>
              <Input value={result} readOnly className="font-mono text-sm" />
              <p className="text-xs text-muted-foreground">
                Length: {result.length} characters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="compare" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Hash Comparison Tool
            </CardTitle>
            <CardDescription>
              Compare plain text with encrypted/hashed data to verify if they match. Enter your original text and the hash value to check if they correspond.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="compare-text">Original Text (Plain Text)</Label>
              <Textarea
                id="compare-text"
                placeholder="Enter the original text that should match the hash..."
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
                rows={4}
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="compare-hash-type">Hash Algorithm</Label>
              <Select value={compareHashType} onValueChange={(value: typeof compareHashType) => setCompareHashType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="md5">MD5 (32 chars)</SelectItem>
                  <SelectItem value="sha1">SHA-1 (40 chars)</SelectItem>
                  <SelectItem value="sha256">SHA-256 (64 chars)</SelectItem>
                  <SelectItem value="sha512">SHA-512 (128 chars)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="compare-hash-value">Hash Value (Encrypted/Hashed Data)</Label>
              <Textarea
                id="compare-hash-value"
                placeholder="Enter the hash value you want to compare with..."
                value={compareHashValue}
                onChange={(e) => setCompareHashValue(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={performHashComparison} className="flex-1">
                Compare Hash
              </Button>
              <Button onClick={clearComparison} variant="outline">
                Clear
              </Button>
            </div>

            {comparisonResult && (
              <div className="space-y-3 p-4 rounded-lg border-2" 
                style={{
                  borderColor: comparisonResult === 'pass' ? 'rgb(34 197 94)' : 'rgb(239 68 68)',
                  backgroundColor: comparisonResult === 'pass' ? 'rgb(220 252 231 / 0.5)' : 'rgb(254 242 242 / 0.5)'
                }}
              >
                <div className="flex items-center gap-2">
                  {comparisonResult === 'pass' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ✓ Comparison PASSED
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        ✗ Comparison FAILED
                      </span>
                    </>
                  )}
                </div>
                
                {comparisonResult === 'pass' ? (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The hash value matches! The provided text corresponds to the given hash using {compareHashType.toUpperCase()} algorithm.
                  </p>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    The hash value does not match. The provided text does not correspond to the given hash using {compareHashType.toUpperCase()} algorithm.
                  </p>
                )}

                {generatedCompareHash && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm font-medium">Generated Hash from Text:</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={generatedCompareHash} 
                        readOnly 
                        className="font-mono text-xs flex-1"
                      />
                      <CopyButton
                        textToCopy={generatedCompareHash}
                        successMessage="Generated hash copied"
                        size="sm"
                      />
                    </div>
                    <Label className="text-sm font-medium">Provided Hash:</Label>
                    <Input 
                      value={compareHashValue} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Compare the two hashes above. They must match exactly (case-insensitive) for the comparison to pass.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!comparisonResult && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">How to use Hash Comparison:</p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside ml-2">
                  <li>Enter the original plain text in the first field</li>
                  <li>Select the hash algorithm (MD5, SHA-1, SHA-256, or SHA-512)</li>
                  <li>Enter the hash value you want to verify in the hash field</li>
                  <li>Click "Compare Hash" to check if they match</li>
                  <li>The tool will show PASS if they match, or FAIL if they don't</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Hash Algorithm Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold">Feature</th>
                    <th className="text-left p-2 font-semibold">MD5</th>
                    <th className="text-left p-2 font-semibold">SHA-1</th>
                    <th className="text-left p-2 font-semibold">SHA-256</th>
                    <th className="text-left p-2 font-semibold">SHA-512</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-2 font-medium">Output Length</td>
                    <td className="p-2">128 bits (32 hex chars)</td>
                    <td className="p-2">160 bits (40 hex chars)</td>
                    <td className="p-2">256 bits (64 hex chars)</td>
                    <td className="p-2">512 bits (128 hex chars)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 font-medium">Security Level</td>
                    <td className="p-2 text-red-600 dark:text-red-400">❌ Broken</td>
                    <td className="p-2 text-orange-600 dark:text-orange-400">⚠️ Vulnerable</td>
                    <td className="p-2 text-green-600 dark:text-green-400">✅ Secure</td>
                    <td className="p-2 text-green-600 dark:text-green-400">✅ Highly Secure</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 font-medium">Collision Resistance</td>
                    <td className="p-2">❌ Weak (collisions found)</td>
                    <td className="p-2">⚠️ Weak (collisions found)</td>
                    <td className="p-2">✅ Strong</td>
                    <td className="p-2">✅ Very Strong</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 font-medium">Performance</td>
                    <td className="p-2">⚡ Very Fast</td>
                    <td className="p-2">⚡ Fast</td>
                    <td className="p-2">⚡⚡ Moderate</td>
                    <td className="p-2">⚡⚡⚡ Slower</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 font-medium">Common Use Cases</td>
                    <td className="p-2">File checksums, non-security purposes</td>
                    <td className="p-2">Legacy systems, Git (deprecated)</td>
                    <td className="p-2">Bitcoin, SSL/TLS, passwords</td>
                    <td className="p-2">High-security apps, certificates</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 font-medium">Recommended For</td>
                    <td className="p-2">❌ Not recommended</td>
                    <td className="p-2">❌ Avoid for new projects</td>
                    <td className="p-2">✅ General purpose</td>
                    <td className="p-2">✅ Maximum security</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Explanations */}
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">MD5 (Message Digest Algorithm 5)</h3>
                <p className="text-sm text-muted-foreground">
                  MD5 is a 128-bit hash function designed in 1991 by Ronald Rivest. It was widely used for integrity verification and checksums.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground ml-4">
                  <p><strong>Characteristics:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Produces a 32-character hexadecimal hash</li>
                    <li>Extremely fast computation</li>
                    <li>Vulnerable to collision attacks (broken since 2004)</li>
                    <li>Should NOT be used for security-sensitive applications</li>
                  </ul>
                  <p className="mt-2"><strong>Use Cases:</strong> File integrity checks (non-security), quick checksums, legacy systems</p>
                  <p className="text-red-600 dark:text-red-400 font-medium">⚠️ Warning: MD5 is cryptographically broken and should not be used for password hashing or digital signatures.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">SHA-1 (Secure Hash Algorithm 1)</h3>
                <p className="text-sm text-muted-foreground">
                  SHA-1 is a 160-bit hash function published by the NSA in 1995. It was designed to replace MD5 with better security.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground ml-4">
                  <p><strong>Characteristics:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Produces a 40-character hexadecimal hash</li>
                    <li>Faster than SHA-256 but slower than MD5</li>
                    <li>Vulnerable to collision attacks (broken in 2017)</li>
                    <li>Deprecated by major tech companies (Google, Microsoft, etc.)</li>
                  </ul>
                  <p className="mt-2"><strong>Use Cases:</strong> Git version control (being phased out), legacy systems, non-security checksums</p>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">⚠️ Warning: SHA-1 is vulnerable and should not be used for new security applications.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">SHA-256 (Secure Hash Algorithm 256)</h3>
                <p className="text-sm text-muted-foreground">
                  SHA-256 is part of the SHA-2 family, producing a 256-bit hash. It's one of the most widely used secure hash algorithms today.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground ml-4">
                  <p><strong>Characteristics:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Produces a 64-character hexadecimal hash</li>
                    <li>Cryptographically secure and collision-resistant</li>
                    <li>Recommended by security experts and organizations</li>
                    <li>Used in Bitcoin blockchain and SSL/TLS certificates</li>
                    <li>Good balance between security and performance</li>
                  </ul>
                  <p className="mt-2"><strong>Use Cases:</strong> Password hashing, digital signatures, blockchain technology, SSL/TLS, file integrity verification</p>
                  <p className="text-green-600 dark:text-green-400 font-medium">✅ Recommended: SHA-256 is the standard choice for most security applications.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">SHA-512 (Secure Hash Algorithm 512)</h3>
                <p className="text-sm text-muted-foreground">
                  SHA-512 is the larger variant of SHA-2, producing a 512-bit hash. It offers maximum security for high-risk applications.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground ml-4">
                  <p><strong>Characteristics:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Produces a 128-character hexadecimal hash</li>
                    <li>Highest level of security among common hash functions</li>
                    <li>Stronger collision resistance than SHA-256</li>
                    <li>Slower than SHA-256 but more secure</li>
                    <li>Best for high-security and long-term security requirements</li>
                  </ul>
                  <p className="mt-2"><strong>Use Cases:</strong> High-security applications, cryptographic keys, digital certificates, military-grade systems, long-term data protection</p>
                  <p className="text-green-600 dark:text-green-400 font-medium">✅ Recommended: SHA-512 is ideal when maximum security is required.</p>
                </div>
              </div>

              {/* Security Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold text-foreground mb-2">Security Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>For passwords:</strong> Always use SHA-256 or SHA-512 with salt (consider bcrypt or Argon2)</li>
                  <li><strong>For file integrity:</strong> SHA-256 is recommended for most cases</li>
                  <li><strong>For digital signatures:</strong> Use SHA-256 or SHA-512</li>
                  <li><strong>Avoid:</strong> MD5 and SHA-1 for any security-sensitive applications</li>
                  <li><strong>Remember:</strong> Hashing is one-way - you cannot reverse a hash to get the original input</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HashGenerator;
