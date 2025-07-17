'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  reminderCount: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: ''
  });

  useEffect(() => {
    // Load categories from API
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Fallback to mock data if API fails
        console.log('API failed, using mock data');
        const mockCategories: Category[] = [
          { id: 1, name: 'Work', color: '#3B82F6', icon: '💼', reminderCount: 5 },
          { id: 2, name: 'Personal', color: '#10B981', icon: '👤', reminderCount: 3 },
          { id: 3, name: 'Health', color: '#EF4444', icon: '🏥', reminderCount: 2 },
          { id: 4, name: 'Shopping', color: '#F59E0B', icon: '🛒', reminderCount: 1 },
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use mock data as fallback
      const mockCategories: Category[] = [
        { id: 1, name: 'Work', color: '#3B82F6', icon: '💼', reminderCount: 5 },
        { id: 2, name: 'Personal', color: '#10B981', icon: '👤', reminderCount: 3 },
        { id: 3, name: 'Health', color: '#EF4444', icon: '🏥', reminderCount: 2 },
        { id: 4, name: 'Shopping', color: '#F59E0B', icon: '🛒', reminderCount: 1 },
      ];
      setCategories(mockCategories);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Category updated successfully!');
          loadCategories(); // Refresh categories
        } else {
          toast.error('Failed to update category');
        }
      } else {
        // Create new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Category created successfully!');
          loadCategories(); // Refresh categories
        } else {
          toast.error('Failed to create category');
        }
      }

      // Reset form
      setFormData({ name: '', color: '#3B82F6', icon: '' });
      setEditingCategory(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted successfully!');
        loadCategories(); // Refresh categories
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', color: '#3B82F6', icon: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600">Organize your reminders with categories</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="e.g., 💼"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon || <FolderOpen className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>
                        {category.reminderCount} reminder{category.reminderCount !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Color: {category.color}</span>
                  <Link href={`/dashboard?category=${category.id}`}>
                    <Button variant="outline" size="sm">
                      View Reminders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first category to start organizing your reminders
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 