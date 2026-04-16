'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Trash2,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as db from '@/lib/store';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  datetime: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
  categoryId?: number;
  location?: string;
  notes?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export default function EditReminderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reminderIdParam = searchParams.get('id');
  const reminderId = reminderIdParam ? Number.parseInt(reminderIdParam, 10) : Number.NaN;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [reminder, setReminder] = useState<Reminder>({
    id: 0,
    title: '',
    description: '',
    datetime: '',
    priority: 'MEDIUM',
    isCompleted: false,
    categoryId: undefined,
    location: '',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!Number.isFinite(reminderId)) {
      toast.error('Reminder not found');
      router.push('/dashboard');
      setLoading(false);
      return;
    }

    loadReminderData();
    loadCategories();
  }, [mounted, reminderId]);

  const loadReminderData = () => {
    const user = db.getCurrentUser();
    if (!user) return;
    const r = db.getReminderById(reminderId, user.id);
    if (r) {
      setReminder(r);
    } else {
      toast.error('Reminder not found');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const loadCategories = () => {
    const user = db.getCurrentUser();
    if (!user) return;
    setCategories(db.getCategories(user.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const user = db.getCurrentUser();
    if (!user) { setSaving(false); return; }
    const updated = db.updateReminder(reminderId, user.id, {
      ...reminder,
      datetime: new Date(reminder.datetime).toISOString(),
    });
    if (updated) {
      toast.success('Reminder updated successfully!');
      router.push('/dashboard');
    } else {
      toast.error('Failed to update reminder');
    }
    setSaving(false);
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    const user = db.getCurrentUser();
    if (!user) return;
    db.deleteReminder(reminderId, user.id);
    toast.success('Reminder deleted successfully!');
    router.push('/dashboard');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reminder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">TaskNest</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Reminder</h2>
          <p className="text-gray-600">Update your reminder details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Reminder Details
            </CardTitle>
            <CardDescription>
              Update the information for your reminder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={reminder.title}
                  onChange={(e) => setReminder({ ...reminder, title: e.target.value })}
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={reminder.description || ''}
                  onChange={(e) => setReminder({ ...reminder, description: e.target.value })}
                  placeholder="Enter reminder description"
                  rows={3}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={reminder.datetime.split('T')[0]}
                    onChange={(e) => {
                      const time = reminder.datetime.split('T')[1] || '12:00';
                      setReminder({ ...reminder, datetime: `${e.target.value}T${time}` });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={reminder.datetime.split('T')[1] || '12:00'}
                    onChange={(e) => {
                      const date = reminder.datetime.split('T')[0];
                      setReminder({ ...reminder, datetime: `${date}T${e.target.value}` });
                    }}
                    required
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={reminder.priority}
                  onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => 
                    setReminder({ ...reminder, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={reminder.categoryId?.toString() || ''}
                  onValueChange={(value) => 
                    setReminder({ ...reminder, categoryId: value ? parseInt(value) : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={reminder.location || ''}
                  onChange={(e) => setReminder({ ...reminder, location: e.target.value })}
                  placeholder="Enter location (optional)"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={reminder.notes || ''}
                  onChange={(e) => setReminder({ ...reminder, notes: e.target.value })}
                  placeholder="Enter additional notes (optional)"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
