'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  Bell,
  Settings,
  BarChart3,
  ListTodo,
  FolderOpen,
  TrendingUp,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  datetime: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  reminderCount: number;
}

interface DashboardStats {
  total: number;
  completed: number;
  upcoming: number;
  overdue: number;
  urgent: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userProfile, setUserProfile] = useState<{
    name: string;
    nickname: string;
    imageUrl: string;
  }>({
    name: '',
    nickname: '',
    imageUrl: ''
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    overdue: 0,
    urgent: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Get user email from cookies (client-side)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const email = getCookie('userEmail');
    console.log('Dashboard: Checking for userEmail cookie:', email);
    console.log('Dashboard: All cookies:', document.cookie);
    
          if (email) {
        console.log('Dashboard: Found email, setting user and loading data');
        setUserEmail(email);
        loadDashboardData();
        
        // Check if profile was recently updated
        const profileUpdated = localStorage.getItem('profileUpdated');
        if (profileUpdated) {
          console.log('Dashboard: Profile was recently updated, refreshing profile data');
          refreshProfileData();
          localStorage.removeItem('profileUpdated'); // Clear the flag
        }
      } else {
        console.log('Dashboard: No email found, redirecting to login');
        router.push('/login');
      }
  }, [router, mounted]);

  // Refresh data when component becomes visible (e.g., returning from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userEmail) {
        // Only refresh profile data when returning, not full dashboard data
        refreshProfileData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileUpdated' && userEmail) {
        refreshProfileData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userEmail]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load profile data first (fastest)
      const profileResponse = await fetch('/api/user/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile({
          name: profileData.name || '',
          nickname: profileData.nickname || '',
          imageUrl: profileData.imageUrl || ''
        });
      }

      // Load reminders and categories in parallel
      const [remindersResponse, categoriesResponse] = await Promise.all([
        fetch('/api/reminders'),
        fetch('/api/categories')
      ]);

      if (remindersResponse.ok) {
        const data = await remindersResponse.json();
        const reminders = data.reminders || [];
        setReminders(reminders);
        calculateStats(reminders);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const calculateStats = (reminders: Reminder[]) => {
    const now = new Date();
    const stats = {
      total: reminders.length,
      completed: reminders.filter(r => r.isCompleted).length,
      upcoming: reminders.filter(r => !r.isCompleted && new Date(r.datetime) > now).length,
      overdue: reminders.filter(r => !r.isCompleted && new Date(r.datetime) < now).length,
      urgent: reminders.filter(r => r.priority === 'URGENT' && !r.isCompleted).length
    };
    setStats(stats);
  };

  const toggleComplete = async (reminderId: number) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Update local state instead of refetching
        setReminders(prevReminders => {
          const updatedReminders = prevReminders.map(reminder => 
            reminder.id === reminderId 
              ? { ...reminder, isCompleted: !reminder.isCompleted }
              : reminder
          );
          calculateStats(updatedReminders);
          return updatedReminders;
        });
        toast.success('Reminder status updated!');
      } else {
        toast.error('Failed to update reminder');
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Error updating reminder');
    }
  };

  const deleteReminder = async (reminderId: number) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state instead of refetching
        setReminders(prevReminders => {
          const updatedReminders = prevReminders.filter(reminder => reminder.id !== reminderId);
          calculateStats(updatedReminders);
          return updatedReminders;
        });
        toast.success('Reminder deleted successfully');
      } else {
        toast.error('Failed to delete reminder');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Error deleting reminder');
    }
  };

  const addQuickReminder = async () => {
    // Show a simple prompt for task name
    const taskName = prompt('Enter task name:');
    
    if (!taskName || taskName.trim() === '') {
      return; // User cancelled or entered empty name
    }

    try {
      const newReminder = {
        title: taskName.trim(),
        description: 'Quick task created from dashboard',
        datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        priority: 'MEDIUM',
        isRecurring: false,
        location: '',
        notes: ''
      };

      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder),
      });

      if (response.ok) {
        const newReminderData = await response.json();
        // Add to local state instead of refetching
        setReminders(prevReminders => {
          const updatedReminders = [...prevReminders, newReminderData];
          calculateStats(updatedReminders);
          return updatedReminders;
        });
        toast.success('Quick task added!');
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding quick reminder:', error);
      toast.error('Error adding task');
    }
  };

  const addQuickCategory = async () => {
    // Show a simple prompt for category name
    const categoryName = prompt('Enter category name:');
    
    if (!categoryName || categoryName.trim() === '') {
      return; // User cancelled or entered empty name
    }

    try {
      const newCategory = {
        name: categoryName.trim(),
        color: '#3B82F6', // Default blue color
        icon: '' // No icon for quick categories
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        toast.success('Quick category added!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding quick category:', error);
      toast.error('Error adding category');
    }
  };

  // Function to refresh dashboard data (can be called from other components)
  const refreshDashboardData = async () => {
    await loadDashboardData();
  };

  // Function to refresh profile data specifically (only when needed)
  const refreshProfileData = async () => {
    try {
      const profileResponse = await fetch('/api/user/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile({
          name: profileData.name || '',
          nickname: profileData.nickname || '',
          imageUrl: profileData.imageUrl || ''
        });
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'completed' && reminder.isCompleted) ||
                         (filterStatus === 'upcoming' && !reminder.isCompleted && new Date(reminder.datetime) > new Date()) ||
                         (filterStatus === 'overdue' && !reminder.isCompleted && new Date(reminder.datetime) < new Date()) ||
                         (filterStatus === 'urgent' && reminder.priority === 'URGENT');
    
    const matchesVisibility = showCompleted || !reminder.isCompleted;
    
    return matchesSearch && matchesFilter && matchesVisibility;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffInMs = target.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} from now`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} from now`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} from now`;
    } else if (diffInMs > 0) {
      return 'In a few moments';
    } else {
      return 'Overdue';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '🔥';
      case 'HIGH':
        return '⚡';
      case 'MEDIUM':
        return '📌';
      case 'LOW':
        return '📝';
      default:
        return '📋';
    }
  };

  const handleStatsClick = (statType: string) => {
    setFilterStatus(statType);
    toast.success(`Filtered to show ${statType} tasks`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">TaskNest</h1>
              </div>
              <span className="text-sm text-gray-500">
                Welcome back, {userProfile.nickname || userProfile.name || userEmail}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleStatsClick('all')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ListTodo className="h-5 w-5 mr-2" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-blue-100 text-sm mt-1">Click to view all</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleStatsClick('completed')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completed}</div>
              <p className="text-green-100 text-sm mt-1">Click to view completed</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleStatsClick('upcoming')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.upcoming}</div>
              <p className="text-yellow-100 text-sm mt-1">Click to view upcoming</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-r from-red-500 to-red-600 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleStatsClick('overdue')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overdue}</div>
              <p className="text-red-100 text-sm mt-1">Click to view overdue</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleStatsClick('urgent')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.urgent}</div>
              <p className="text-purple-100 text-sm mt-1">Click to view urgent</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/reminder/new">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Reminder
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={addQuickReminder}
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add Task
              </Button>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Categories
              </CardTitle>
              <CardDescription>Your task categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <div className="text-center py-4">
                    <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No categories yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={addQuickCategory}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Category
                    </Button>
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-gray-500">
                            {category.reminderCount} reminder{category.reminderCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Link href={`/dashboard?category=${category.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href="/dashboard/categories">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
                <div className="pt-2">
                  <Link href="/dashboard/categories">
                    <Button variant="outline" className="w-full justify-start">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Manage All Categories
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your reminders for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders
                  .filter(r => {
                    const today = new Date();
                    const reminderDate = new Date(r.datetime);
                    return reminderDate.toDateString() === today.toDateString();
                  })
                  .slice(0, 3)
                  .map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-gray-500">{formatDate(reminder.datetime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(reminder.priority)}`}>
                          {getPriorityIcon(reminder.priority)} {reminder.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                {reminders.filter(r => {
                  const today = new Date();
                  const reminderDate = new Date(r.datetime);
                  return reminderDate.toDateString() === today.toDateString();
                }).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No reminders scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminders List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>All Reminders</CardTitle>
                <CardDescription>
                  {filterStatus !== 'all' ? `Showing ${filterStatus} tasks` : 'Manage your tasks and reminders'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reminders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="overdue">Overdue</option>
                  <option value="completed">Completed</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center space-x-1"
                >
                  {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showCompleted ? 'Hide' : 'Show'} Completed</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reminders found</p>
                  <Link href="/dashboard/reminder/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Reminder
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredReminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-md ${
                      reminder.isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleComplete(reminder.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          reminder.isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {reminder.isCompleted && <CheckCircle className="h-3 w-3" />}
                      </button>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <h3 className={`font-medium ${reminder.isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {reminder.title}
                          </h3>
                          {reminder.description && (
                            <p className="text-sm text-gray-500">{reminder.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(reminder.datetime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(reminder.priority)}`}>
                        {getPriorityIcon(reminder.priority)} {reminder.priority}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Link href={`/dashboard/reminder/edit/${reminder.id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
