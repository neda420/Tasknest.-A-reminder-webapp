'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Calendar, Clock, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  color: string;
}

export default function ReminderForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    priority: 'MEDIUM',
    isRecurring: false,
    recurrence: 'DAILY',
    categoryId: undefined as number | undefined,
    location: '',
    notes: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Set default datetime to current time + 1 hour
    const defaultDateTime = new Date(Date.now() + 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      datetime: defaultDateTime.toISOString().slice(0, 16)
    }));

    // Load categories
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          datetime: new Date(formData.datetime).toISOString(),
          categoryId: formData.categoryId || undefined
        }),
      });

      if (response.ok) {
        const reminder = await response.json();
        toast.success('Reminder created successfully!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error creating reminder');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Error creating reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Reminder</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Reminder Details</span>
            </CardTitle>
            <CardDescription>
              Fill in the details for your new reminder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime">Date & Time *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) => handleChange('datetime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
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
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId?.toString() || 'none'}
                  onValueChange={(value) => handleChange('categoryId', value === 'none' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && !loadingCategories && (
                  <p className="text-sm text-gray-500">
                    No categories available. <button 
                      type="button" 
                      onClick={() => router.push('/dashboard/categories')}
                      className="text-blue-600 hover:underline"
                    >
                      Create categories first
                    </button>
                  </p>
                )}
              </div>

              {/* Recurring */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => handleChange('isRecurring', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isRecurring">Make this reminder recurring</Label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrence">Recurrence Pattern</Label>
                    <Select
                      value={formData.recurrence}
                      onValueChange={(value) => handleChange('recurrence', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter location (optional)"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Enter additional notes (optional)"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.datetime}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Creating...' : 'Create Reminder'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
