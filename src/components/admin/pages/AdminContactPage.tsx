'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Trash2, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/seo/site';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';



interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ipAddress: string;
  createdAt: string;
}

const AdminContactPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [statusFilter, page]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE_URL}/contact/admin/list?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/fyntoolsadmin/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setContacts(data.data.contacts || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contact queries');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/contact/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewContact = async (contact: Contact) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/contact/admin/${contact._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedContact(data.data);
        setIsDialogOpen(true);
        fetchContacts(); // Refresh to update status
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to load contact details');
    }
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/contact/admin/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Status updated successfully');
        fetchContacts();
        fetchStats();
        if (selectedContact?._id === contactId) {
          setSelectedContact(data.data);
        }
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact query?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/contact/admin/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Contact query deleted successfully');
        fetchContacts();
        fetchStats();
        if (selectedContact?._id === contactId) {
          setIsDialogOpen(false);
          setSelectedContact(null);
        }
      } else {
        toast.error(data.error || 'Failed to delete contact');
      }
    } catch (error) {
      toast.error('Failed to delete contact query');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      new: { variant: 'default' as const, label: 'New' },
      read: { variant: 'secondary' as const, label: 'Read' },
      replied: { variant: 'outline' as const, label: 'Replied' },
      archived: { variant: 'outline' as const, label: 'Archived' },
    };
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Contact Queries</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and respond to contact form submissions
          </p>
        </div>
        <Button onClick={fetchContacts} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">New</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.new || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Read</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.read || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Replied</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.replied || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Archived</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.archived || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Contact Queries ({total})</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No contact queries found
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`p-3 sm:p-4 border rounded-lg ${
                    contact.status === 'new' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">{contact.name}</h3>
                        {getStatusBadge(contact.status)}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 break-all">
                        <Mail className="inline h-3 w-3 mr-1" />
                        {contact.email}
                      </p>
                      <p className="font-medium text-sm sm:text-base mb-1">{contact.subject}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {contact.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(contact.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0 justify-end sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewContact(contact)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(contact._id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{selectedContact?.subject}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Contact query from {selectedContact?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium">Name</label>
                <p className="text-xs sm:text-sm mt-1">{selectedContact.name}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Email</label>
                <p className="text-xs sm:text-sm mt-1 break-all">
                  <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                    {selectedContact.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Subject</label>
                <p className="text-xs sm:text-sm mt-1">{selectedContact.subject}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Message</label>
                <p className="text-xs sm:text-sm whitespace-pre-wrap mt-1 break-words">{selectedContact.message}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Status</label>
                <div className="mt-2">
                  <Select
                    value={selectedContact.status}
                    onValueChange={(value) => handleUpdateStatus(selectedContact._id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="font-medium">IP Address</label>
                  <p className="text-muted-foreground mt-1">{selectedContact.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium">Submitted</label>
                  <p className="text-muted-foreground mt-1">{formatDate(selectedContact.createdAt)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedContact._id)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactPage;
