'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Calendar, Clock, CheckCircle, AlertTriangle, TrendingUp, Target, Plus } from 'lucide-react';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  datetime: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
}

interface AnalyticsData {
  totalReminders: number;
  completedReminders: number;
  completionRate: number;
  averageCompletionTime: number;
  priorityDistribution: Record<string, number>;
  weeklyTrend: Array<{ week: string; completed: number; total: number }>;
  overdueCount: number;
  upcomingCount: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalReminders: 0,
    completedReminders: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    priorityDistribution: {},
    weeklyTrend: [],
    overdueCount: 0,
    upcomingCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user email from cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const email = getCookie('userEmail');
    if (email) {
      loadAnalytics();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadAnalytics = async () => {
    try {
      // Fetch real data from API
      const response = await fetch('/api/reminders');
      if (response.ok) {
        const data = await response.json();
        const reminders = data.reminders || [];
        calculateAnalytics(reminders);
      } else {
        // Fallback to mock data if API fails
        console.log('API failed, using mock data');
        const mockReminders: Reminder[] = [
          {
            id: 1,
            title: 'Team Meeting',
            description: 'Weekly team sync',
            datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            priority: 'HIGH',
            isCompleted: false
          },
          {
            id: 2,
            title: 'Doctor Appointment',
            description: 'Annual checkup',
            datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'MEDIUM',
            isCompleted: false
          },
          {
            id: 3,
            title: 'Project Deadline',
            description: 'Submit final report',
            datetime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            priority: 'URGENT',
            isCompleted: false
          },
          {
            id: 4,
            title: 'Grocery Shopping',
            description: 'Buy groceries for the week',
            datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            priority: 'LOW',
            isCompleted: true
          },
          {
            id: 5,
            title: 'Client Call',
            description: 'Discuss project requirements',
            datetime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            priority: 'HIGH',
            isCompleted: false
          },
          {
            id: 6,
            title: 'Gym Session',
            description: 'Weekly workout',
            datetime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            priority: 'MEDIUM',
            isCompleted: true
          }
        ];
        calculateAnalytics(mockReminders);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use mock data as fallback
      const mockReminders: Reminder[] = [
        {
          id: 1,
          title: 'Team Meeting',
          description: 'Weekly team sync',
          datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          priority: 'HIGH',
          isCompleted: false
        },
        {
          id: 2,
          title: 'Doctor Appointment',
          description: 'Annual checkup',
          datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'MEDIUM',
          isCompleted: false
        },
        {
          id: 3,
          title: 'Project Deadline',
          description: 'Submit final report',
          datetime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'URGENT',
          isCompleted: false
        },
        {
          id: 4,
          title: 'Grocery Shopping',
          description: 'Buy groceries for the week',
          datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          priority: 'LOW',
          isCompleted: true
        },
        {
          id: 5,
          title: 'Client Call',
          description: 'Discuss project requirements',
          datetime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          priority: 'HIGH',
          isCompleted: false
        },
        {
          id: 6,
          title: 'Gym Session',
          description: 'Weekly workout',
          datetime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          priority: 'MEDIUM',
          isCompleted: true
        }
      ];
      calculateAnalytics(mockReminders);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (reminders: Reminder[]) => {
    const now = new Date();
    const totalReminders = reminders.length;
    const completedReminders = reminders.filter(r => r.isCompleted).length;
    const completionRate = totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;
    
    // Priority distribution
    const priorityDistribution = reminders.reduce((acc, reminder) => {
      acc[reminder.priority] = (acc[reminder.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate weekly trend from real data
    const weeklyTrend = calculateWeeklyTrend(reminders);

    const overdueCount = reminders.filter(r => !r.isCompleted && new Date(r.datetime) < now).length;
    const upcomingCount = reminders.filter(r => !r.isCompleted && new Date(r.datetime) > now).length;

    // Calculate average completion time (mock for now, would need completion timestamps)
    const averageCompletionTime = calculateAverageCompletionTime(reminders);

    setAnalytics({
      totalReminders,
      completedReminders,
      completionRate,
      averageCompletionTime,
      priorityDistribution,
      weeklyTrend,
      overdueCount,
      upcomingCount
    });
  };

  const calculateWeeklyTrend = (reminders: Reminder[]): Array<{ week: string; completed: number; total: number }> => {
    const now = new Date();
    const weeks = [];
    
    // Generate last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekReminders = reminders.filter(r => {
        const reminderDate = new Date(r.datetime);
        return reminderDate >= weekStart && reminderDate <= weekEnd;
      });
      
      const completed = weekReminders.filter(r => r.isCompleted).length;
      const total = weekReminders.length;
      
      weeks.push({
        week: `Week ${4 - i}`,
        completed,
        total
      });
    }
    
    return weeks;
  };

  const calculateAverageCompletionTime = (reminders: Reminder[]): number => {
    // This would need completion timestamps in the database
    // For now, return a mock value based on completion rate
    const completedCount = reminders.filter(r => r.isCompleted).length;
    if (completedCount === 0) return 0;
    
    // Mock calculation: assume completed tasks took 1-3 days on average
    return Math.round((Math.random() * 2 + 1) * 10) / 10; // Random between 1.0 and 3.0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your productivity and task completion</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
              <p className="text-blue-100 text-sm mt-1">
                {analytics.completedReminders} of {analytics.totalReminders} tasks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.completedReminders}</div>
              <p className="text-green-100 text-sm mt-1">Tasks completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.upcomingCount}</div>
              <p className="text-yellow-100 text-sm mt-1">Tasks pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overdueCount}</div>
              <p className="text-red-100 text-sm mt-1">Tasks overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Priority Distribution
              </CardTitle>
              <CardDescription>How your tasks are prioritized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.priorityDistribution).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${
                        priority === 'URGENT' ? 'bg-red-500' :
                        priority === 'HIGH' ? 'bg-orange-500' :
                        priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <span className="font-medium">{priority}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / analytics.totalReminders) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Weekly Completion Trend
              </CardTitle>
              <CardDescription>Your productivity over the last 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyTrend.map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{week.week}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(week.completed / week.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {week.completed}/{week.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productivity Insights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Productivity Insights
              </CardTitle>
              <CardDescription>Tips to improve your task management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">What's Working Well</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {analytics.completionRate > 70 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span>Excellent completion rate of {analytics.completionRate.toFixed(1)}%</span>
                      </li>
                    )}
                    {analytics.completionRate > 50 && analytics.completionRate <= 70 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span>Good completion rate of {analytics.completionRate.toFixed(1)}%</span>
                      </li>
                    )}
                    {Object.keys(analytics.priorityDistribution).length > 2 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span>Good variety in task priorities</span>
                      </li>
                    )}
                    {analytics.overdueCount === 0 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span>No overdue tasks - great time management!</span>
                      </li>
                    )}
                    {analytics.overdueCount > 0 && analytics.overdueCount <= 2 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span>Only {analytics.overdueCount} overdue task(s) - manageable</span>
                      </li>
                    )}
                    {analytics.totalReminders === 0 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span>Start adding tasks to see your productivity insights</span>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Areas for Improvement</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {analytics.completionRate < 50 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <span>Low completion rate of {analytics.completionRate.toFixed(1)}% - try breaking tasks into smaller parts</span>
                      </li>
                    )}
                    {analytics.overdueCount > 3 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <span>You have {analytics.overdueCount} overdue tasks - prioritize urgent items</span>
                      </li>
                    )}
                    {analytics.overdueCount > 0 && analytics.overdueCount <= 3 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <span>Address {analytics.overdueCount} overdue task(s) to improve productivity</span>
                      </li>
                    )}
                    {analytics.upcomingCount > 10 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <span>Many upcoming tasks ({analytics.upcomingCount}) - consider delegating some</span>
                      </li>
                    )}
                    {Object.keys(analytics.priorityDistribution).length === 1 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <span>All tasks have the same priority - consider prioritizing important items</span>
                      </li>
                    )}
                    {analytics.totalReminders > 0 && (
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span>Set specific deadlines and review your progress regularly</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/reminder/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 