'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';

const JwtDecoder = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const decodeJWT = () => {
    if (!token.trim()) {
      toast.error('Please enter a JWT token');
      return;
    }

    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode header
      const decodedHeader = JSON.stringify(
        JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))),
        null,
        2
      );
      
      // Decode payload
      const decodedPayload = JSON.stringify(
        JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))),
        null,
        2
      );

      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setSignature(parts[2]);
      setIsValid(true);
      
      toast.success('JWT decoded successfully');
    } catch (error) {
      setHeader('');
      setPayload('');
      setSignature('');
      setIsValid(false);
      toast.error('Invalid JWT token format');
    }
  };


  const clearAll = () => {
    setToken('');
    setHeader('');
    setPayload('');
    setSignature('');
    setIsValid(null);
  };

  const loadSampleToken = () => {
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setToken(sampleToken);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            JWT Token Decoder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="jwt-token">JWT Token</Label>
              <Button onClick={loadSampleToken} variant="outline" size="sm">
                Load Sample
              </Button>
            </div>
            <Textarea
              id="jwt-token"
              placeholder="Paste your JWT token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={decodeJWT} className="flex-1">
              Decode JWT
            </Button>
            <Button onClick={clearAll} variant="outline">
              Clear
            </Button>
          </div>

          {isValid !== null && (
            <div className="flex items-center gap-2">
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? "Valid Format" : "Invalid Format"}
              </Badge>
              {!isValid && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Invalid JWT token format</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {header && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Header</CardTitle>
                <CopyButton
                  textToCopy={header}
                  successMessage="Header copied to clipboard"
                  variant="outline"
                  size="sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                {header}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Payload</CardTitle>
                <CopyButton
                  textToCopy={payload}
                  successMessage="Payload copied to clipboard"
                  variant="outline"
                  size="sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                {payload}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Signature</CardTitle>
                <CopyButton
                  textToCopy={signature}
                  successMessage="Signature copied to clipboard"
                  variant="outline"
                  size="sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs bg-muted p-3 rounded break-all font-mono">
                {signature}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Signature verification requires the secret key
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About JWT Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• JWT (JSON Web Token) is a compact, URL-safe means of representing claims</p>
            <p>• Consists of three parts: Header, Payload, and Signature</p>
            <p>• This tool only decodes the token - signature verification requires the secret</p>
            <p>• Never share JWT tokens containing sensitive information</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JwtDecoder;
