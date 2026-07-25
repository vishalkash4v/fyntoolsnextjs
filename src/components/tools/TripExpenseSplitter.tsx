'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Plus, Loader2, Users, DollarSign, History, Settings, LogIn, UserPlus, Trash2, Edit, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'https://express-two-umber.vercel.app/api';

interface User {
  userId: string;
  username: string;
  email?: string;
  phoneNumber?: string;
}

interface Trip {
  _id: string;
  name: string;
  currency: string;
  description?: string;
  createdBy: string;
  createdAt: string;
}

interface Participant {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'VIEW_ONLY' | 'ADD_EDIT' | 'DELETE' | 'ADMIN';
  userId?: string;
}

interface Expense {
  _id: string;
  paidBy: { _id: string; name: string } | string;
  amount: number;
  category: string;
  description?: string;
  location?: string;
  date: string;
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE' | 'EXCLUDE';
  splitDetails?: any;
}

interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface ActivityLog {
  _id: string;
  action: 'CREATE' | 'EDIT' | 'DELETE';
  entityType: 'EXPENSE' | 'PARTICIPANT' | 'TRIP';
  entityId: string;
  performedBy: { username: string };
  timestamp: string;
}

const TripExpenseSplitter: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', email: '', phoneNumber: '', password: '' });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Trip state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<Settlement[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [userRole, setUserRole] = useState<string>('VIEW_ONLY');

  // Form states
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [tripForm, setTripForm] = useState({ name: '', currency: 'INR', description: '' });
  const [participantForm, setParticipantForm] = useState({ name: '', email: '', phone: '', role: 'VIEW_ONLY' as const });
  const [expenseForm, setExpenseForm] = useState({
    paidBy: '',
    amount: '',
    category: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'EQUAL' as const,
    splitDetails: {} as any
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
    } else {
      setShowAuthDialog(true);
    }
  }, []);

  // Connect to Socket.IO when authenticated and trip selected
  useEffect(() => {
    if (isAuthenticated && currentTrip && user) {
      const token = localStorage.getItem('userToken');
      if (token) {
        socketRef.current = io('https://express-two-umber.vercel.app', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
          socketRef.current?.emit('join-trip', currentTrip._id);
        });

        socketRef.current.on('joined-trip', (data: { tripId: string; role: string }) => {
          setUserRole(data.role);
        });

        socketRef.current.on('expense-created', (expense: Expense) => {
          setExpenses(prev => [expense, ...prev]);
          fetchSettlement();
          fetchActivityLog();
        });

        socketRef.current.on('expense-updated', (expense: Expense) => {
          setExpenses(prev => prev.map(e => e._id === expense._id ? expense : e));
          fetchSettlement();
          fetchActivityLog();
        });

        socketRef.current.on('expense-deleted', (expenseId: string) => {
          setExpenses(prev => prev.filter(e => e._id !== expenseId));
          fetchSettlement();
          fetchActivityLog();
        });

        socketRef.current.on('participant-added', (participant: Participant) => {
          setParticipants(prev => [...prev, participant]);
          fetchActivityLog();
        });

        socketRef.current.on('participant-updated', (participant: Participant) => {
          setParticipants(prev => prev.map(p => p._id === participant._id ? participant : p));
          fetchActivityLog();
        });

        socketRef.current.on('participant-removed', (participantId: string) => {
          setParticipants(prev => prev.filter(p => p._id !== participantId));
          fetchActivityLog();
        });

        socketRef.current.on('error', (error: { message: string }) => {
          toast.error(error.message);
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, currentTrip, user]);

  // Load trips when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips();
    }
  }, [isAuthenticated]);

  // Load trip data when selected
  useEffect(() => {
    if (currentTrip && isAuthenticated) {
      fetchTripData();
    }
  }, [currentTrip, isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Authentication functions
  const handleRegister = async () => {
    if (!authForm.username.trim() || authForm.username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (!authForm.password.trim() || authForm.password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!authForm.email && !authForm.phoneNumber) {
      toast.error('Either email or phone number is required');
      return;
    }

    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Registration successful! Please login.');
        setIsLoginMode(true);
        setAuthForm({ ...authForm, password: '' });
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!authForm.username && !authForm.email && !authForm.phoneNumber) {
      toast.error('Please enter username, email, or phone number');
      return;
    }
    if (!authForm.password) {
      toast.error('Password is required');
      return;
    }

    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();
      if (response.ok && data.success && data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.data));
        setUser(data.data);
        setIsAuthenticated(true);
        setShowAuthDialog(false);
        toast.success('Login successful!');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Trip functions
  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trips`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const allTrips = [...(data.data.owned || []), ...(data.data.participated || [])];
        setTrips(allTrips);
        if (allTrips.length > 0 && !currentTrip) {
          setCurrentTrip(allTrips[0]);
        }
      }
    } catch (error) {
      console.error('Fetch trips error:', error);
    }
  };

  const fetchTripData = async () => {
    if (!currentTrip) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${currentTrip._id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setParticipants(data.data.participants || []);
        setExpenses(data.data.expenses || []);
        setUserRole(data.data.userRole || 'VIEW_ONLY');
        fetchSettlement();
        fetchActivityLog();
      }
    } catch (error) {
      console.error('Fetch trip data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTrip = async () => {
    if (!tripForm.name.trim()) {
      toast.error('Trip name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tripForm)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Trip created successfully!');
        setShowTripDialog(false);
        setTripForm({ name: '', currency: 'INR', description: '' });
        await fetchTrips();
        setCurrentTrip(data.data);
      } else {
        toast.error(data.error || 'Failed to create trip');
      }
    } catch (error: any) {
      console.error('Create trip error:', error);
      toast.error(error.message || 'Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Settlement and activity log
  const fetchSettlement = async () => {
    if (!currentTrip) return;
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${currentTrip._id}/settlement`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSettlement(data.data.settlement || []);
      }
    } catch (error) {
      console.error('Fetch settlement error:', error);
    }
  };

  const fetchActivityLog = async () => {
    if (!currentTrip) return;
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${currentTrip._id}/activity`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setActivityLog(data.data.activities || []);
      }
    } catch (error) {
      console.error('Fetch activity log error:', error);
    }
  };

  // Participant functions
  const addParticipant = async () => {
    if (!participantForm.name.trim()) {
      toast.error('Participant name is required');
      return;
    }
    if (!currentTrip) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${currentTrip._id}/participants`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(participantForm)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Participant added successfully!');
        setShowParticipantDialog(false);
        setParticipantForm({ name: '', email: '', phone: '', role: 'VIEW_ONLY' });
        fetchTripData();
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit('participant-added', data.data);
        }
      } else {
        toast.error(data.error || 'Failed to add participant');
      }
    } catch (error: any) {
      console.error('Add participant error:', error);
      toast.error(error.message || 'Failed to add participant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Expense functions
  const createExpense = async () => {
    if (!expenseForm.paidBy || !expenseForm.amount || !expenseForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!currentTrip) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trips/${currentTrip._id}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount)
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Expense added successfully!');
        setShowExpenseDialog(false);
        setExpenseForm({
          paidBy: '',
          amount: '',
          category: '',
          description: '',
          location: '',
          date: new Date().toISOString().split('T')[0],
          splitType: 'EQUAL',
          splitDetails: {}
        });
        fetchTripData();
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit('expense-created', data.data);
        }
      } else {
        toast.error(data.error || 'Failed to add expense');
      }
    } catch (error: any) {
      console.error('Create expense error:', error);
      toast.error(error.message || 'Failed to add expense. Please check all fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!currentTrip) return;
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/trips/${currentTrip._id}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Expense deleted successfully!');
        fetchTripData();
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit('expense-deleted', expenseId);
        }
      } else {
        toast.error(data.error || 'Failed to delete expense');
      }
    } catch (error: any) {
      console.error('Delete expense error:', error);
      toast.error(error.message || 'Failed to delete expense. Please try again.');
    }
  };

  // Check permissions
  const canAddEdit = ['ADD_EDIT', 'DELETE', 'ADMIN'].includes(userRole);
  const canDelete = ['DELETE', 'ADMIN'].includes(userRole);
  const isAdmin = userRole === 'ADMIN';

  // Render authentication dialog
  if (!isAuthenticated) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isLoginMode ? 'Login Required' : 'Create Account'}</DialogTitle>
            <DialogDescription>
              {isLoginMode 
                ? 'Please login to access Trip Expense Splitter'
                : 'Create an account to start managing trip expenses'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            {!isLoginMode && (
              <>
                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label>Phone Number (optional)</Label>
                  <Input
                    value={authForm.phoneNumber}
                    onChange={(e) => setAuthForm({ ...authForm, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </>
            )}
            {isLoginMode && (
              <>
                <div>
                  <Label>Email or Phone (optional)</Label>
                  <Input
                    value={authForm.email || authForm.phoneNumber}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value, phoneNumber: e.target.value })}
                    placeholder="Enter email or phone"
                  />
                </div>
              </>
            )}
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={isLoginMode ? handleLogin : handleRegister}
                disabled={isAuthLoading}
                className="flex-1"
              >
                {isAuthLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoginMode ? 'Login' : 'Register'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setAuthForm({ username: '', email: '', phoneNumber: '', password: '' });
                }}
              >
                {isLoginMode ? 'Register' : 'Login'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Trips</CardTitle>
            <Button onClick={() => setShowTripDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No trips yet. Create your first trip to get started!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trips.map((trip) => (
                <Button
                  key={trip._id}
                  variant={currentTrip?._id === trip._id ? 'default' : 'outline'}
                  onClick={() => setCurrentTrip(trip)}
                >
                  {trip.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentTrip && (
        <>
          <Tabs defaultValue="expenses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="settlement">Settlement</TabsTrigger>
              <TabsTrigger value="history">Activity History</TabsTrigger>
            </TabsList>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Expenses</CardTitle>
                    {canAddEdit && (
                      <Button onClick={() => setShowExpenseDialog(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No expenses yet. Add your first expense!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {expenses.map((expense) => (
                        <Card key={expense._id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge>{expense.category}</Badge>
                                  <span className="font-semibold">
                                    {currentTrip.currency} {expense.amount}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Paid by: {typeof expense.paidBy === 'object' ? expense.paidBy.name : 'Unknown'}
                                </p>
                                {expense.description && (
                                  <p className="text-sm mt-1">{expense.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(expense.date).toLocaleDateString()}
                                </p>
                              </div>
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteExpense(expense._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Participants</CardTitle>
                    {isAdmin && (
                      <Button onClick={() => setShowParticipantDialog(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Participant
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant._id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {participant.email || participant.phone || 'No contact info'}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {participant.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settlement Tab */}
            <TabsContent value="settlement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Settlement Summary</CardTitle>
                  <CardDescription>
                    Optimized payment plan to settle all expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {settlement.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No settlements needed. All expenses are balanced!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {settlement.map((s, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <p className="font-medium">
                              <span className="text-red-600">{s.fromName}</span> should pay{' '}
                              <span className="text-green-600">{s.toName}</span>
                            </p>
                            <p className="text-lg font-bold mt-2">
                              {currentTrip.currency} {s.amount}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLog.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No activity yet</p>
                  ) : (
                    <div className="space-y-2">
                      {activityLog.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex justify-between items-start p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {activity.action} {activity.entityType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              by {activity.performedBy.username}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Create Trip Dialog */}
      <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trip Name *</Label>
              <Input
                value={tripForm.name}
                onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                placeholder="Enter trip name"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={tripForm.currency}
                onValueChange={(value) => setTripForm({ ...tripForm, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={tripForm.description}
                onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                placeholder="Enter trip description"
              />
            </div>
            <Button onClick={createTrip} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={participantForm.name}
                onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                placeholder="Enter participant name"
              />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={participantForm.email}
                onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input
                value={participantForm.phone}
                onChange={(e) => setParticipantForm({ ...participantForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={participantForm.role}
                onValueChange={(value: any) => setParticipantForm({ ...participantForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW_ONLY">View Only</SelectItem>
                  <SelectItem value="ADD_EDIT">Add & Edit</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addParticipant} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Participant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paid By *</Label>
              <Select
                value={expenseForm.paidBy}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, paidBy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Input
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  placeholder="e.g., Food, Transport"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Enter expense description"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={expenseForm.location}
                onChange={(e) => setExpenseForm({ ...expenseForm, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Split Type</Label>
              <Select
                value={expenseForm.splitType}
                onValueChange={(value: any) => setExpenseForm({ ...expenseForm, splitType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUAL">Equal</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="EXCLUDE">Exclude Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createExpense} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripExpenseSplitter;
