import Link from 'next/link';
import { Bell, CheckCircle, Clock, Calendar, BarChart3, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">TaskNest</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Bell className="h-4 w-4" />
            Your personal reminder &amp; task manager
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Stay on top of everything that matters
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            TaskNest helps you create, organise, and track your reminders with
            priorities, categories, and recurring schedules — so nothing slips
            through the cracks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Create a free account
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {[
            {
              icon: <Bell className="h-6 w-6 text-blue-600" />,
              title: 'Smart Reminders',
              desc: 'Create reminders with dates, priorities (Low → Urgent), locations, and personal notes.',
            },
            {
              icon: <Calendar className="h-6 w-6 text-green-600" />,
              title: 'Recurring Schedules',
              desc: 'Set daily, weekly, monthly, or yearly recurrence so repeating tasks manage themselves.',
            },
            {
              icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
              title: 'Track Progress',
              desc: 'Mark reminders complete, filter by status, and watch your completion rate climb.',
            },
            {
              icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
              title: 'Analytics Dashboard',
              desc: 'Visualise your productivity with completion trends and priority breakdowns.',
            },
            {
              icon: <Clock className="h-6 w-6 text-red-600" />,
              title: 'Overdue Alerts',
              desc: 'Instantly see which reminders are overdue so you can take action right away.',
            },
            {
              icon: <Shield className="h-6 w-6 text-teal-600" />,
              title: 'Secure & Private',
              desc: 'Your data is protected with hashed passwords and session-based authentication.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TaskNest. All rights reserved.</p>
      </footer>
    </div>
  );
}
