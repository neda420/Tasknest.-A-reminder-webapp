'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  nickname: string;
  imageUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    memberSince: '',
    lastLogin: new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'Active'
  });
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    name: '',
    nickname: '',
    imageUrl: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    // Get user email from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const email = getCookie('user-email') || getCookie('userEmail');
    if (email) {
      setUserEmail(email);
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Refresh profile data when component mounts or userEmail changes
  useEffect(() => {
    if (userEmail && mounted) {
      loadUserProfile();
    }
  }, [userEmail, mounted]);

  const loadAccountInfo = async () => {
    try {
      console.log('Loading account info...');
      // Fetch account info from API
      const response = await fetch('/api/user/account-info');
      if (response.ok) {
        const accountData = await response.json();
        console.log('Account info received:', accountData);
        setAccountInfo(accountData);
      } else {
        console.error('Failed to load account info:', response.status);
        // Use current date as fallback for member since
        setAccountInfo({
          memberSince: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          lastLogin: new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: 'Active'
        });
      }
    } catch (error) {
      console.error('Error loading account info:', error);
      // Use current date as fallback
      setAccountInfo({
        memberSince: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        lastLogin: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'Active'
      });
    }
  };

  const loadUserProfile = async () => {
    console.log('Loading user profile for email:', userEmail);
    try {
      // Fetch real profile data from API
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profileData = await response.json();
        console.log('Profile data received:', profileData);
        console.log('Settings: Image URL from API:', profileData.imageUrl ? profileData.imageUrl.substring(0, 50) + '...' : 'No image');
        setProfile(profileData);
        setImagePreview(profileData.imageUrl || '');
        
        // Load account information including member since date
        await loadAccountInfo();
      } else {
        console.error('Failed to load profile data:', response.status);
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      console.log('Updating profile with data:', { name: profile.name, nickname: profile.nickname });
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('nickname', profile.nickname);
      formData.append('email', profile.email);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Try to update profile via API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('Profile updated successfully:', updatedProfile);
        
        // Update the profile state with new data
        setProfile(updatedProfile);
        
        // Update image preview if new image was uploaded
        if (updatedProfile.imageUrl) {
          console.log('Settings: Updating image preview with:', updatedProfile.imageUrl.substring(0, 50) + '...');
          setImagePreview(updatedProfile.imageUrl);
        }
        
        // Clear the image file since it's been uploaded
        setImageFile(null);
        
        toast.success('Profile updated successfully!');
        
        // Refresh account info to ensure everything is up to date
        await loadAccountInfo();
        
        // Notify dashboard to refresh profile data
        localStorage.setItem('profileUpdated', Date.now().toString());
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    setSaving(true);
    try {
      // Try to change password via API
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear cookies regardless of API response
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user-email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear cookies and redirect even if API fails
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user-email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
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
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Settings: Image loaded successfully')}
                          onError={(e) => {
                            console.error('Settings: Image failed to load:', e);
                            console.log('Settings: Image source was:', imagePreview.substring(0, 100) + '...');
                          }}
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">
                      Upload a new profile picture (JPG, PNG, GIF up to 5MB)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Name and Nickname */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={profile.nickname}
                      onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                      placeholder="Enter your nickname"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleProfileUpdate} 
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/test-profile-picture');
                        const data = await response.json();
                        console.log('Profile picture test:', data);
                        toast.success('Check console for profile picture debug info');
                      } catch (error) {
                        console.error('Error testing profile picture:', error);
                        toast.error('Failed to test profile picture');
                      }
                    }}
                    className="px-3"
                  >
                    Debug
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handlePasswordChange} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Changing Password...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-sm text-gray-900">{accountInfo.memberSince}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p className="text-sm text-gray-900">{accountInfo.lastLogin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {accountInfo.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 