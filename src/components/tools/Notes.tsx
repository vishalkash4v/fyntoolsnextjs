'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Edit, Save, X, Plus, Search, Hash, Pin, Download, Loader2, User, Phone, Cloud, CloudOff, Lock, Mail, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

const API_BASE_URL = 'https://express-two-umber.vercel.app/api';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color: string;
  pinned: boolean;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
    color: '#ffffff'
  });
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  
  // Username/Phone management
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const colors = [
    '#ffffff', '#ffeb3b', '#ff9800', '#f44336',
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39'
  ];

  // Load saved username/phone from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('notesUsername');
    const savedPhone = localStorage.getItem('notesPhone');
    
    if (savedUsername || savedPhone) {
      if (savedUsername) setUsername(savedUsername);
      if (savedPhone) setPhoneNumber(savedPhone);
      loadNotesFromServer(savedUsername || undefined, savedPhone || undefined);
    } else {
      // Show dialog if no username/phone is saved
      setShowUsernameDialog(true);
    }
  }, []);

  // Auto-save to server whenever notes change (debounced)
  useEffect(() => {
    const hasUsername = username && username.trim().length >= 3;
    const hasPhone = phoneNumber && phoneNumber.trim().length > 0;
    
    if ((hasUsername || hasPhone) && notes.length >= 0) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save (2 seconds debounce)
      saveTimeoutRef.current = setTimeout(() => {
        saveNotesToServer();
      }, 2000);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, username, phoneNumber]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
  };

  const saveNotesToServer = async () => {
    // At least one of username or phone is required
    const hasUsername = username && username.trim().length >= 3;
    const hasPhone = phoneNumber && phoneNumber.trim().length > 0;
    
    if (!hasUsername && !hasPhone) return;

    setIsSavingNotes(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: (username && username.trim()) ? username.trim() : null,
          phoneNumber: (phoneNumber && phoneNumber.trim()) ? phoneNumber.trim() : null,
          notes: notes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save notes');
      }
      // Silent success - don't show toast for auto-save
    } catch (error: any) {
      console.error('Error saving notes:', error);
      // Don't show error toast for auto-save failures
    } finally {
      setIsSavingNotes(false);
    }
  };

  const loadNotesFromServer = async (user?: string, phone?: string) => {
    const userToLoad = user || username;
    if (!userToLoad || !userToLoad.trim()) return;

    setIsLoadingNotes(true);
    try {
      let response;
      if (phone && phone.trim()) {
        // Try loading by phone first
        response = await fetch(`${API_BASE_URL}/notes/load-by-phone/${encodeURIComponent(phone.trim().replace(/\D/g, ''))}`);
      } else {
        // Load by username
        response = await fetch(`${API_BASE_URL}/notes/load/${encodeURIComponent(userToLoad.trim().toLowerCase())}`);
      }

      const data = await response.json();
      if (response.ok && data.success) {
        setNotes(data.data.notes || []);
        if (data.data.username) {
          setUsername(data.data.username);
          localStorage.setItem('notesUsername', data.data.username);
        }
        if (data.data.phoneNumber) {
          setPhoneNumber(data.data.phoneNumber);
          localStorage.setItem('notesPhone', data.data.phoneNumber);
        }
        toast.success('Notes loaded successfully');
      } else {
        // No notes found - start fresh
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSaveUsername = async () => {
    // At least one of username or phone is required
    const hasUsername = username && username.trim().length >= 3;
    const hasPhone = phoneNumber && phoneNumber.trim().length > 0;
    
    if (!hasUsername && !hasPhone) {
      toast.error('Either username (min 3 characters) or phone number is required');
      return;
    }

    // If username is provided, check availability BEFORE saving
    if (hasUsername) {
      const normalizedUsername = username.trim().toLowerCase();
      try {
        const response = await fetch(`${API_BASE_URL}/notes/check-username/${encodeURIComponent(normalizedUsername)}`);
        const data = await response.json();
        
        if (data.success && !data.available) {
          toast.error('Username is already taken. Please choose another one.');
          return;
        }
      } catch (error) {
        console.error('Error checking username:', error);
        toast.error('Failed to check username availability. Please try again.');
        return;
      }
    }
    
    // Save to localStorage
    if (hasUsername) {
      const normalizedUsername = username.trim().toLowerCase();
      localStorage.setItem('notesUsername', normalizedUsername);
    }
    if (hasPhone) {
      localStorage.setItem('notesPhone', phoneNumber.trim());
    }

    // Load notes from server
    await loadNotesFromServer(hasUsername ? username.trim().toLowerCase() : undefined, hasPhone ? phoneNumber.trim() : undefined);
    
    setShowUsernameDialog(false);
    const identifier = hasUsername ? `Username "${username.trim().toLowerCase()}"` : `Phone "${phoneNumber.trim()}"`;
    toast.success(`${identifier} saved successfully`);
  };

  const createNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      toast.error('Cannot create empty note');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title.trim() || 'Untitled',
      content: newNote.content.trim(),
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: newNote.color,
      pinned: false,
    };

    setNotes([note, ...notes]);
    setNewNote({ title: '', content: '', tags: '', color: '#ffffff' });
    setIsCreating(false);
    toast.success('Note created successfully');
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
    setEditingId(null);
    toast.success('Note updated successfully');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success('Note deleted');
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
    toast.success('Note pin status changed');
  };

  const handleNoteSelection = (id: string) => {
    const newSelection = new Set(selectedNotes);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotes(newSelection);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const downloadNotes = (selectedNotes: Note[] | 'all') => {
    const notesToDownload = selectedNotes === 'all' ? notes : selectedNotes;
    const blob = new Blob([JSON.stringify(notesToDownload, null, 2)], { type: 'application/json' });
    saveAs(blob, `notes-${new Date().toISOString()}.json`);
  };

  const isLightBackground = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 128;
  };

  return (
    <div className="space-y-6">
      {/* Username/Phone Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save & Load Your Notes</DialogTitle>
            <DialogDescription>
              Enter your username OR phone number (at least one required) to save your notes to the cloud. This ensures zero data loss.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username (Optional, min 3 characters)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="username"
                  placeholder="Choose a unique username (min 3 characters)"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="pl-10"
                  minLength={3}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <p className="text-xs text-muted-foreground">At least one of username or phone number is required</p>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number for easy access"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUsernameDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUsername}
                disabled={
                  (!username || username.trim().length < 3) && (!phoneNumber || phoneNumber.trim().length === 0)
                }
              >
                Save & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header with Save/Load buttons */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {username && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {username}
              </Badge>
              {isSavingNotes && (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUsernameDialog(true)}
            className="gap-2"
          >
            <Cloud className="h-4 w-4" />
            Change User
          </Button>
          {(username || phoneNumber) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadNotesFromServer(username || undefined, phoneNumber || undefined)}
              disabled={isLoadingNotes}
              className="gap-2"
            >
              {isLoadingNotes ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              Reload
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create New Note Button */}
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Note
        </Button>
      )}

      {/* Download Options */}
      <div className="flex gap-2">
        <Button onClick={() => downloadNotes('all')} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download All Notes
        </Button>
        {selectedNotes.size > 0 && (
          <Button onClick={() => downloadNotes(Array.from(selectedNotes).map(id => notes.find(note => note.id === id)!))} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Selected Notes
          </Button>
        )}
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Create New Note</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: '', color: '#ffffff' });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your note..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={4}
            />
            <Input
              placeholder="Tags (comma separated)..."
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newNote.color === color ? 'border-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewNote({ ...newNote, color })}
                  />
                ))}
              </div>
            </div>
            <Button onClick={createNote} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 && !isCreating && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredNotes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            isEditing={editingId === note.id}
            onEdit={() => setEditingId(note.id)}
            onSave={(updates) => updateNote(note.id, updates)}
            onCancel={() => setEditingId(null)}
            onDelete={() => deleteNote(note.id)}
            onPin={() => togglePin(note.id)}
            onSelect={() => handleNoteSelection(note.id)}
            selected={selectedNotes.has(note.id)}
            formatDate={formatDate}
            isLightBackground={isLightBackground(note.color)}
          />
        ))}
      </div>
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Note>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onPin: () => void;
  onSelect: () => void;
  selected: boolean;
  formatDate: (date: string) => string;
  isLightBackground: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onPin,
  onSelect,
  selected,
  formatDate,
  isLightBackground
}) => {
  const [editData, setEditData] = useState({
    title: note.title,
    content: note.content,
    tags: note.tags.join(', ')
  });

  // Update edit data when note changes
  useEffect(() => {
    setEditData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
  }, [note.id, note.title, note.content, note.tags]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave({
      title: editData.title.trim() || 'Untitled',
      content: editData.content.trim(),
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
    onCancel();
  };

  const textColor = isLightBackground ? '#000000' : '#ffffff';
  const textColorMuted = isLightBackground ? '#666666' : '#cccccc';

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${selected ? 'border-2 border-primary' : ''} ${isEditing ? '' : 'cursor-pointer'}`}
      style={{ backgroundColor: note.color }}
      onClick={!isEditing ? onSelect : undefined}
    >
      <CardContent className="p-4" style={{ color: textColor }}>
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Note title..."
              style={{ color: textColor, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className="border-current"
            />
            <Textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              placeholder="Write your note..."
              rows={4}
              style={{ color: textColor, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className="border-current resize-none"
            />
            <Input
              value={editData.tags}
              onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
              placeholder="Tags (comma separated)..."
              style={{ color: textColor, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className="border-current"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                style={{ color: textColor, borderColor: textColor }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                style={{ backgroundColor: isLightBackground ? '#000000' : '#ffffff', color: isLightBackground ? '#ffffff' : '#000000' }}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg leading-tight" style={{ color: textColor }}>
                {note.title}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onPin(); }}
                  className="h-8 w-8"
                  style={{ color: textColor }}
                >
                  <Pin className={`h-4 w-4 ${note.pinned ? (isLightBackground ? 'text-blue-600' : 'text-blue-300') : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="h-8 w-8"
                  style={{ color: textColor }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="h-8 w-8"
                  style={{ color: textColor }}
                >
                  <Trash2 className="h-3 w-3" style={{ color: '#ef4444' }} />
                </Button>
              </div>
            </div>

            {note.content && (
              <p className="text-sm whitespace-pre-wrap line-clamp-3" style={{ color: textColorMuted }}>
                {note.content}
              </p>
            )}

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: isLightBackground ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                      color: textColor
                    }}
                  >
                    <Hash className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-xs" style={{ color: textColorMuted }}>
              {formatDate(note.updatedAt)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Notes;
