'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Play, Loader2, CheckCircle2, XCircle, Code2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const API_BASE_URL = 'https://express-two-umber.vercel.app/apis/v2';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  category: 'auth' | 'users' | 'products' | 'cart';
  example?: any;
}

const ENDPOINTS: Endpoint[] = [
  // Auth endpoints
  {
    method: 'POST',
    path: '/auth/register',
    description: 'Register a new account',
    requiresAuth: false,
    category: 'auth',
    example: {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123'
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    description: 'Login with username/email and password',
    requiresAuth: false,
    category: 'auth',
    example: {
      username: 'johndoe',
      password: 'password123',
      expiresIn: '15m'
    }
  },
  {
    method: 'POST',
    path: '/auth/change-password',
    description: 'Change account password',
    requiresAuth: true,
    category: 'auth',
    example: {
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123'
    }
  },
  // User endpoints
  {
    method: 'POST',
    path: '/users',
    description: 'Create a new user',
    requiresAuth: true,
    category: 'users',
    example: {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'password123',
      customFields: {}
    }
  },
  {
    method: 'GET',
    path: '/users',
    description: 'Get all users for your account',
    requiresAuth: true,
    category: 'users'
  },
  {
    method: 'GET',
    path: '/users/my',
    description: 'Get current account information',
    requiresAuth: true,
    category: 'users'
  },
  {
    method: 'PUT',
    path: '/users/:id',
    description: 'Update a user by ID',
    requiresAuth: true,
    category: 'users',
    example: {
      name: 'John Doe Updated',
      email: 'john.updated@example.com'
    }
  },
  {
    method: 'DELETE',
    path: '/users/:id',
    description: 'Delete a user by ID',
    requiresAuth: true,
    category: 'users'
  },
  {
    method: 'PATCH',
    path: '/users/:id/status',
    description: 'Update user status (active/inactive)',
    requiresAuth: true,
    category: 'users',
    example: {
      status: 'inactive'
    }
  },
  // Product endpoints
  {
    method: 'POST',
    path: '/products',
    description: 'Create a new product',
    requiresAuth: true,
    category: 'products',
    example: {
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      category: 'Electronics',
      stock: 50,
      image: 'https://example.com/laptop.jpg',
      customFields: {}
    }
  },
  {
    method: 'GET',
    path: '/products',
    description: 'Get all products',
    requiresAuth: true,
    category: 'products'
  },
  {
    method: 'GET',
    path: '/products/:id',
    description: 'Get a single product by ID',
    requiresAuth: true,
    category: 'products'
  },
  {
    method: 'PUT',
    path: '/products/:id',
    description: 'Update a product by ID',
    requiresAuth: true,
    category: 'products',
    example: {
      name: 'Laptop Updated',
      price: 899.99,
      stock: 45
    }
  },
  {
    method: 'DELETE',
    path: '/products/:id',
    description: 'Delete a product by ID',
    requiresAuth: true,
    category: 'products'
  },
  {
    method: 'PATCH',
    path: '/products/:id/status',
    description: 'Update product status (active/inactive)',
    requiresAuth: true,
    category: 'products',
    example: {
      status: 'inactive'
    }
  },
  // Cart endpoints
  {
    method: 'POST',
    path: '/cart',
    description: 'Add item to cart',
    requiresAuth: true,
    category: 'cart',
    example: {
      userId: 'user_id_here',
      productId: 'product_id_here',
      quantity: 2
    }
  },
  {
    method: 'GET',
    path: '/cart/:userId',
    description: 'Get cart for a user',
    requiresAuth: true,
    category: 'cart'
  },
  {
    method: 'PUT',
    path: '/cart/:userId/:productId',
    description: 'Update cart item quantity',
    requiresAuth: true,
    category: 'cart',
    example: {
      quantity: 3
    }
  },
  {
    method: 'DELETE',
    path: '/cart/:userId/:productId',
    description: 'Remove item from cart',
    requiresAuth: true,
    category: 'cart'
  },
  {
    method: 'DELETE',
    path: '/cart/:userId',
    description: 'Clear entire cart',
    requiresAuth: true,
    category: 'cart'
  }
];

const DummyAPIGenerator = () => {
  const [token, setToken] = useState('');
  const loginEndpoint = ENDPOINTS.find(ep => ep.path === '/auth/login') || ENDPOINTS[1];
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(loginEndpoint);
  const [selectedCategory, setSelectedCategory] = useState<'auth' | 'users' | 'products' | 'cart'>('auth');
  const [requestMethod, setRequestMethod] = useState(loginEndpoint.method);
  const [requestPath, setRequestPath] = useState(loginEndpoint.path);
  const [requestBody, setRequestBody] = useState(loginEndpoint.example ? JSON.stringify(loginEndpoint.example, null, 2) : '');
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load token from localStorage
  React.useEffect(() => {
    const savedToken = localStorage.getItem('dummy_api_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Save token to localStorage
  const handleTokenChange = (newToken: string) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('dummy_api_token', newToken);
    } else {
      localStorage.removeItem('dummy_api_token');
    }
  };

  // Select endpoint
  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestMethod(endpoint.method);
    setRequestPath(endpoint.path);
    setSelectedCategory(endpoint.category);
    if (endpoint.example) {
      setRequestBody(JSON.stringify(endpoint.example, null, 2));
    } else {
      setRequestBody('');
    }
  };

  // Get endpoints by category
  const getEndpointsByCategory = (category: string) => {
    return ENDPOINTS.filter(ep => ep.category === category);
  };

  // Category labels
  const categoryLabels = {
    auth: 'Authentication',
    users: 'Users',
    products: 'Products',
    cart: 'Cart'
  };

  // Generate code examples
  const generateCurl = () => {
    const url = `${API_BASE_URL}${requestPath}`;
    let curl = `curl -X ${requestMethod} "${url}"`;
    
    const requiresAuth = !requestPath.startsWith('/auth/');
    if (token && requiresAuth) {
      curl += ` \\\n  -H "Authorization: Bearer ${token}"`;
    }
    
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/'/g, "'\\''")}'`;
    }
    
    return curl;
  };

  const generateFetch = () => {
    const url = `${API_BASE_URL}${requestPath}`;
    let code = `fetch("${url}", {\n  method: "${requestMethod}",`;
    
    const headers: Record<string, string> = {};
    const requiresAuth = !requestPath.startsWith('/auth/');
    if (token && requiresAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (Object.keys(headers).length > 0) {
      code += `\n  headers: {`;
      Object.entries(headers).forEach(([key, value]) => {
        code += `\n    "${key}": "${value}",`;
      });
      code = code.slice(0, -1); // Remove last comma
      code += `\n  },`;
    }
    
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      code += `\n  body: JSON.stringify(${requestBody}),`;
    }
    
    code += `\n})`;
    code += `\n  .then(response => response.json())`;
    code += `\n  .then(data => console.log(data))`;
    code += `\n  .catch(error => console.error('Error:', error));`;
    
    return code;
  };

  const generateAxios = () => {
    const url = `${API_BASE_URL}${requestPath}`;
    let code = `axios.${requestMethod.toLowerCase()}("${url}"`;
    
    const config: any = {};
    const requiresAuth = !requestPath.startsWith('/auth/');
    if (token && requiresAuth) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      try {
        config.data = JSON.parse(requestBody);
      } catch {
        config.data = requestBody;
      }
    }
    
    if (Object.keys(config).length > 0) {
      code += `, ${JSON.stringify(config, null, 2)}`;
    }
    
    code += `)`;
    code += `\n  .then(response => console.log(response.data))`;
    code += `\n  .catch(error => console.error('Error:', error));`;
    
    return code;
  };

  // Execute API request
  const executeRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setResponseStatus(null);

    try {
      const url = `${API_BASE_URL}${requestPath}`;
      const headers: Record<string, string> = {};
      
      // Check if endpoint requires auth (all endpoints except /auth/* require auth)
      const requiresAuth = !requestPath.startsWith('/auth/');
      if (token && requiresAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
        headers['Content-Type'] = 'application/json';
      }

      let body: string | undefined;
      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
        // Validate JSON
        try {
          JSON.parse(requestBody);
          body = requestBody;
        } catch {
          toast.error('Invalid JSON in request body');
          setIsLoading(false);
          return;
        }
      }

      const fetchOptions: RequestInit = {
        method: requestMethod,
        headers
      };

      if (body) {
        fetchOptions.body = body;
      }

      const res = await fetch(url, fetchOptions);
      const data = await res.json();
      
      setResponseStatus(res.status);
      setResponse(data);
      
      if (res.ok) {
        toast.success('Request successful!');
      } else {
        toast.error(`Request failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setResponseStatus(500);
      setResponse({
        success: false,
        error: error.message || 'Network error occurred'
      });
      toast.error('Request failed: ' + (error.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            Dummy API Generator
          </CardTitle>
          <CardDescription>
            Free REST API for testing login, CRUD operations, and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Input */}
          <div className="space-y-2">
            <Label htmlFor="token">API Token (Bearer Token)</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type="text"
                placeholder="Enter your Bearer token (get it from /auth/login)"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                className="flex-1"
              />
              {token && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleTokenChange('');
                    toast.success('Token cleared');
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Token is saved locally. Register an account at <code className="bg-muted px-1 rounded">POST /auth/register</code> then login at <code className="bg-muted px-1 rounded">POST /auth/login</code> to get your token.
            </p>
          </div>

          {/* Simple API Tester Interface */}
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Select Category</Label>
              <div className="flex flex-wrap gap-2">
                {(['auth', 'users', 'products', 'cart'] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(cat);
                      const firstEndpoint = getEndpointsByCategory(cat)[0];
                      if (firstEndpoint) {
                        handleEndpointSelect(firstEndpoint);
                      }
                    }}
                  >
                    {categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Endpoint Selection */}
            <div className="space-y-2">
              <Label>Select Endpoint</Label>
              <Select
                value={selectedEndpoint.path}
                onValueChange={(path) => {
                  const endpoint = ENDPOINTS.find(ep => ep.path === path);
                  if (endpoint) {
                    handleEndpointSelect(endpoint);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getEndpointsByCategory(selectedCategory).map((endpoint, index) => (
                    <SelectItem key={index} value={endpoint.path}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            endpoint.method === 'GET'
                              ? 'default'
                              : endpoint.method === 'POST'
                              ? 'secondary'
                              : endpoint.method === 'PUT'
                              ? 'outline'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{selectedEndpoint.description}</p>
            </div>

            {/* Request Configuration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={requestMethod} onValueChange={setRequestMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Path</Label>
                <Input
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  placeholder="/users"
                />
              </div>
            </div>

            {['POST', 'PUT', 'PATCH'].includes(requestMethod) && (
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm"
                  rows={6}
                />
              </div>
            )}

            <Button
              onClick={executeRequest}
              disabled={isLoading || (!requestPath.startsWith('/auth/') && !token)}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>

            {!requestPath.startsWith('/auth/') && !token && (
              <p className="text-sm text-destructive text-center">
                This endpoint requires authentication. Please enter a token above.
              </p>
            )}

            {/* Response Display */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {responseStatus && responseStatus >= 200 && responseStatus < 300 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    Response
                    {responseStatus && (
                      <Badge variant={responseStatus >= 200 && responseStatus < 300 ? 'default' : 'destructive'}>
                        {responseStatus}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                    <CopyButton
                      text={JSON.stringify(response, null, 2)}
                      className="absolute top-2 right-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Code Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="curl">
                  <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="fetch">Fetch</TabsTrigger>
                    <TabsTrigger value="axios">Axios</TabsTrigger>
                  </TabsList>
                  <TabsContent value="curl" className="mt-4">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {generateCurl()}
                      </pre>
                      <CopyButton text={generateCurl()} className="absolute top-2 right-2" />
                    </div>
                  </TabsContent>
                  <TabsContent value="fetch" className="mt-4">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {generateFetch()}
                      </pre>
                      <CopyButton text={generateFetch()} className="absolute top-2 right-2" />
                    </div>
                  </TabsContent>
                  <TabsContent value="axios" className="mt-4">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {generateAxios()}
                      </pre>
                      <CopyButton text={generateAxios()} className="absolute top-2 right-2" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* API Base URL Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">API Base URL</p>
              <code className="text-sm text-muted-foreground">{API_BASE_URL}</code>
            </div>
            <CopyButton text={API_BASE_URL} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DummyAPIGenerator;
