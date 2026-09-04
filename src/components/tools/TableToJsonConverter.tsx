'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const TableToJsonConverter = () => {
  const [htmlTable, setHtmlTable] = useState(`<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
      <th>City</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>30</td>
      <td>New York</td>
      <td>john@example.com</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>25</td>
      <td>Los Angeles</td>
      <td>jane@example.com</td>
    </tr>
    <tr>
      <td>Bob Johnson</td>
      <td>35</td>
      <td>Chicago</td>
      <td>bob@example.com</td>
    </tr>
  </tbody>
</table>`);
  const [jsonOutput, setJsonOutput] = useState('');
  const [options, setOptions] = useState({
    includeHeader: true,
    prettify: true,
    ignoreEmptyRows: true,
  });

  const parseHtmlTable = (html: string) => {
    // Parse HTML and extract table data
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');

    if (!table) {
      throw new Error('No table found in the HTML');
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) {
      throw new Error('No rows found in the table');
    }

    let headerRow: string[] = [];
    let dataRows: string[][] = [];

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (thead && options.includeHeader) {
      const headerCells = Array.from(thead.querySelectorAll('th, td'));
      headerRow = headerCells.map((cell) => cell.textContent?.trim() || '');
    } else if (options.includeHeader) {
      // Use first row as header if there is no thead
      const firstRowCells = Array.from(rows[0].querySelectorAll('th, td'));
      headerRow = firstRowCells.map((cell) => cell.textContent?.trim() || '');
    }

    const rowsToProcess = tbody ? Array.from(tbody.querySelectorAll('tr')) : rows.slice(options.includeHeader ? 1 : 0);
    dataRows = rowsToProcess.map((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.map((cell) => cell.textContent?.trim() || '');
    });

    if (options.ignoreEmptyRows) {
      dataRows = dataRows.filter((row) => row.some((cell) => cell !== ''));
    }

    if (headerRow.length > 0 && options.includeHeader) {
      return dataRows.map((row) => {
        const obj: { [key: string]: string } = {};
        headerRow.forEach((header, index) => {
          obj[header] = row[index] ?? '';
        });
        return obj;
      });
    }

    return dataRows;
  };

  const handleConvert = () => {
    if (!htmlTable.trim()) {
      toast({
        title: 'No HTML Table',
        description: 'Please enter an HTML table first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = parseHtmlTable(htmlTable);
      const json = options.prettify ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      setJsonOutput(json);

      toast({
        title: 'Table Converted Successfully',
        description: `Converted ${Array.isArray(data) ? data.length : 0} rows to JSON format.`,
      });
    } catch (error) {
      toast({
        title: 'Conversion Failed',
        description: error instanceof Error ? error.message : 'Failed to parse HTML table.',
        variant: 'destructive',
      });
      setJsonOutput('');
    }
  };


  const handleDownload = () => {
    if (!jsonOutput) {
      toast({
        title: 'Nothing to Download',
        description: 'Convert a table first.',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'JSON file download started.',
    });
  };

  const handleClear = () => {
    setHtmlTable('');
    setJsonOutput('');
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HTML Table to JSON Converter</CardTitle>
          <CardDescription>
            Convert HTML table data to JSON format with customizable options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeader"
                  checked={options.includeHeader}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeHeader: !!checked }))
                  }
                />
                <Label htmlFor="includeHeader" className="text-sm">
                  Use first row as header
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prettify"
                  checked={options.prettify}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, prettify: !!checked }))
                  }
                />
                <Label htmlFor="prettify" className="text-sm">
                  Prettify JSON output
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreEmptyRows"
                  checked={options.ignoreEmptyRows}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, ignoreEmptyRows: !!checked }))
                  }
                />
                <Label htmlFor="ignoreEmptyRows" className="text-sm">
                  Ignore empty rows
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HTML input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="html-table">HTML Table</Label>
                <Button onClick={handleClear} variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
              <Textarea
                id="html-table"
                spellCheck={false}
                placeholder="Paste your HTML table here..."
                value={htmlTable}
                onChange={(e) => setHtmlTable(e.target.value)}
                className="
                  min-h-[400px] font-mono text-sm
                  bg-card text-card-foreground border-border
                  dark:placeholder:text-zinc-400
                "
              />
              <div className="flex gap-2">
                <Button onClick={handleConvert} className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Convert to JSON
                </Button>
              </div>
            </div>

            {/* JSON output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="json-output">JSON Output</Label>
                <div className="flex gap-2">
                  <CopyButton
                    textToCopy={jsonOutput}
                    successMessage="JSON data copied to clipboard."
                    emptyMessage="Convert a table first."
                    variant="outline"
                    size="sm"
                    copyText="Copy"
                  />
                  <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                id="json-output"
                spellCheck={false}
                placeholder="JSON output will appear here..."
                value={jsonOutput}
                readOnly
                className="
                  min-h[400px] font-mono text-sm
                  bg-zinc-50 text-zinc-900 border-zinc-200
                  dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-800
                  dark:placeholder:text-zinc-400
                "
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Supported HTML Table Features:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Tables with &lt;thead&gt; and &lt;tbody&gt; sections</li>
              <li>• Tables with &lt;th&gt; header cells and &lt;td&gt; data cells</li>
              <li>• Option to use first row as column headers</li>
              <li>• Automatic handling of empty rows and cells</li>
              <li>• Support for both simple and complex table structures</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableToJsonConverter;
