'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const RegexTester = () => {
  const [pattern, setPattern] = useState('\\d+');
  const [testString, setTestString] = useState('Hello 123 World 456');
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
  });
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const testRegex = () => {
    try {
      const flagString = `${flags.global ? 'g' : ''}${flags.ignoreCase ? 'i' : ''}${flags.multiline ? 'm' : ''}`;
      const regex = new RegExp(pattern, flagString);

      if (flags.global) {
        const allMatches = [];
        let match;
        const tempRegex = new RegExp(pattern, flagString);
        while ((match = tempRegex.exec(testString)) !== null) {
          allMatches.push(match);
          if (!flags.global) break;
        }
        setMatches(allMatches);
      } else {
        const match = regex.exec(testString);
        setMatches(match ? [match] : []);
      }

      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setMatches([]);
    }
  };

  useEffect(() => {
    testRegex();
  }, [pattern, testString, flags]);

  const highlightMatches = (text: string) => {
    if (!isValid || matches.length === 0) return text;

    let result = text;
    let offset = 0;

    matches.forEach((match, index) => {
      if (match.index !== undefined) {
        const start = match.index + offset;
        const end = start + match[0].length;
        const before = result.substring(0, start);
        const matched = result.substring(start, end);
        const after = result.substring(end);

        result =
          before +
          `<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">${matched}</mark>` +
          after;
        offset += '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded"></mark>'.length;
      }
    });

    return result;
  };


  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'Phone', pattern: '\\(?\\d{3}\\)?[-.\\ ]?\\d{3}[-.\\ ]?\\d{4}' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'IP Address', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
    { name: 'Date (MM/DD/YYYY)', pattern: '\\b\\d{1,2}\\/\\d{1,2}\\/\\d{4}\\b' },
    { name: 'Hex Color', pattern: '#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}' },
    { name: 'Credit Card', pattern: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b' },
    { name: 'Time (HH:MM)', pattern: '\\b([0-1]?[0-9]|2[0-3]):[0-5][0-9]\\b' },
    { name: 'UUID', pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}' },
    { name: 'Username', pattern: '\\b[a-zA-Z0-9_]{3,16}\\b' },
    { name: 'Password', pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}' },
    { name: 'HTML Tag', pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>' },
    { name: 'IPv6', pattern: '([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)' },
    { name: 'Postal Code', pattern: '\\b\\d{5}(-\\d{4})?\\b' },
    { name: 'SSN', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b' },
    { name: 'Currency', pattern: '\\$[0-9]+(\\.[0-9]{2})?\\b' }
  ];
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Regex Tester</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Test and validate regular expressions with live matching and highlighting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="pattern" className="text-gray-700 dark:text-gray-200">
                    Regular Expression Pattern
                  </Label>
                  <CopyButton
                    textToCopy={pattern}
                    successMessage="Regex pattern copied to clipboard."
                    variant="outline"
                    size="sm"
                    className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  />
                </div>
                <Input
                  id="pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                  className={`font-mono ${!isValid ? 'border-red-500' : ''} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                />
                {!isValid && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-200">Flags</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="global"
                      checked={flags.global}
                      onCheckedChange={(checked) => setFlags(prev => ({ ...prev, global: !!checked }))}
                    />
                    <Label htmlFor="global" className="text-sm text-gray-700 dark:text-gray-200">
                      Global (g)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ignoreCase"
                      checked={flags.ignoreCase}
                      onCheckedChange={(checked) => setFlags(prev => ({ ...prev, ignoreCase: !!checked }))}
                    />
                    <Label htmlFor="ignoreCase" className="text-sm text-gray-700 dark:text-gray-200">
                      Ignore Case (i)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiline"
                      checked={flags.multiline}
                      onCheckedChange={(checked) => setFlags(prev => ({ ...prev, multiline: !!checked }))}
                    />
                    <Label htmlFor="multiline" className="text-sm text-gray-700 dark:text-gray-200">
                      Multiline (m)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="testString" className="text-gray-700 dark:text-gray-200">
                  Test String
                </Label>
                <Textarea
                  id="testString"
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against..."
                  className="min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-200">Preview with Matches Highlighted</Label>
                <div
                  className="border rounded-md p-3 min-h-[120px] whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  dangerouslySetInnerHTML={{ __html: highlightMatches(testString) }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-700 dark:text-gray-200">Match Results</Label>
                  <CopyButton
                    textToCopy={matches.length > 0 ? matches.map((match, index) => `Match ${index + 1}: "${match[0]}"`).join('\n') : ''}
                    successMessage="Match results copied to clipboard."
                    emptyMessage="No matches found to copy."
                    variant="outline"
                    size="sm"
                    className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={matches.length > 0 ? "default" : "secondary"} className="bg-blue-500 dark:bg-blue-600">
                      {matches.length} match{matches.length !== 1 ? 'es' : ''} found
                    </Badge>
                  </div>
                  {matches.length > 0 && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {matches.map((match, index) => (
                        <div key={index} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                          <div className="text-sm">
                            <strong>Match {index + 1}:</strong> "{match[0]}"
                          </div>
                          {match.index !== undefined && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Position: {match.index} - {match.index + match[0].length - 1}
                            </div>
                          )}
                          {match.length > 1 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Groups: {match.slice(1).map((group, i) => `$${i + 1}: "${group}"`).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-gray-700 dark:text-gray-200">Common Patterns</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {commonPatterns.map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setPattern(item.pattern)}
                  className="text-left justify-start truncate min-h-[48px] px-3 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegexTester;