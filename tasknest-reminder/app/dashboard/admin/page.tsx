"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { LogOut, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  nickname?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

interface Reminder {
  id: number;
  title: string;
  description?: string;
  datetime: string;
  priority: string;
  isCompleted: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [addUserData, setAddUserData] = useState({ name: "", email: "", password: "", nickname: "" });
  const [editUserData, setEditUserData] = useState({ id: 0, name: "", email: "", nickname: "" });
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userReminders, setUserReminders] = useState<Reminder[]>([]);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const router = useRouter();
  const [debugCookie, setDebugCookie] = useState('');
  const [debugUserEmail, setDebugUserEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Stats
  const totalUsers = users.length;
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nickname || "").toLowerCase().includes(search.toLowerCase())
  );
  const recentUsers = users.slice(0, 5);

  useEffect(() => {
    // Debug: Show document.cookie and detected userEmail
    setDebugCookie(document.cookie);
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const userEmail = decodeURIComponent(getCookie('userEmail') || '');
    setDebugUserEmail(userEmail || '');

    if (userEmail !== 'admin@gmail.com') {
      setError('Access denied. Only admin can view this page.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Edit user
  const openEditModal = (user: User) => {
    setEditUser(user);
    setEditUserData({ id: user.id, name: user.name, email: user.email, nickname: user.nickname || "" });
    setShowEditModal(true);
  };
  const handleEditChange = (field: string, value: string) => {
    setEditUserData((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editUserData),
    });
    if (res.ok) {
      toast.success("User updated");
      setShowEditModal(false);
      fetchUsers();
    } else {
      toast.error("Failed to update user");
    }
  };

  // Add user
  const openAddModal = () => {
    setAddUserData({ name: "", email: "", password: "", nickname: "" });
    setShowAddModal(true);
  };
  const handleAddChange = (field: string, value: string) => {
    setAddUserData((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(addUserData),
    });
    if (res.ok) {
      toast.success("User added");
      setShowAddModal(false);
      fetchUsers();
    } else {
      toast.error("Failed to add user");
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setDeletingUserId(id);
    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDeletingUserId(null);
    if (res.ok) {
      toast.success("User deleted");
      fetchUsers();
    } else {
      toast.error("Failed to delete user");
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
  };

  // Show reminders for a user
  const openRemindersModal = async (user: User) => {
    setSelectedUser(user);
    setRemindersLoading(true);
    setShowRemindersModal(true);
    const res = await fetch(`/api/admin/user-reminders?id=${user.id}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setUserReminders(data.reminders);
    } else {
      setUserReminders([]);
    }
    setRemindersLoading(false);
  };

  // Handle password reset
  const openPasswordModal = (user: User) => {
    setPasswordUser(user);
    setNewPassword("");
    setShowPasswordModal(true);
  };
  const handlePasswordReset = async (e: any) => {
    e.preventDefault();
    if (!passwordUser) return;
    setResettingPassword(true);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: passwordUser.id, action: "resetPassword", value: newPassword }),
    });
    setResettingPassword(false);
    if (res.ok) {
      toast.success("Password reset");
      setShowPasswordModal(false);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to reset password");
    }
  };

  // Handle toggle active
  const handleToggleActive = async (user: User, value: boolean) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: user.id, action: "toggleActive", value }),
    });
    if (res.ok) {
      toast.success(value ? "User activated" : "User deactivated");
      fetchUsers();
    } else {
      toast.error("Failed to update status");
    }
  };

  // Handle change role
  const handleChangeRole = async (user: User, value: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: user.id, action: "changeRole", value }),
    });
    if (res.ok) {
      toast.success("Role updated");
      fetchUsers();
    } else {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700">
              <div><b>Debug:</b></div>
              <div><b>document.cookie:</b> {debugCookie}</div>
              <div><b>Detected userEmail:</b> {debugUserEmail}</div>
            </div>
            <Button className="mt-4" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <UserCircle className="h-10 w-10 text-blue-600" />
          <div>
            <div className="text-xl font-bold text-gray-900">Admin Dashboard</div>
            <div className="text-sm text-gray-500">admin@gmail.com</div>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {recentUsers.map((user) => (
                  <button
                    key={user.id}
                    className="bg-white/20 rounded px-4 py-2 text-left hover:bg-white/40 transition"
                    onClick={() => openRemindersModal(user)}
                  >
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs">{user.email}</div>
                  </button>
                ))}
                {recentUsers.length === 0 && <span>No users yet.</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>User Management</CardTitle>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
              <Button onClick={openAddModal}>+ Add User</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nickname</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{user.id}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{user.nickname || "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(user.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Switch checked={user.isActive} onCheckedChange={v => handleToggleActive(user, v)} />
                        <span className={user.isActive ? "text-green-600 ml-2" : "text-red-600 ml-2"}>{user.isActive ? "Active" : "Inactive"}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Select value={user.role} onValueChange={v => handleChangeRole(user, v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)} disabled={deletingUserId === user.id}>
                          {deletingUserId === user.id ? "Deleting..." : "Delete"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openRemindersModal(user)}>
                          Reminders
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => openPasswordModal(user)}>
                          Reset Password
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={editUserData.name} onChange={e => handleEditChange('name', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input value={editUserData.email} onChange={e => handleEditChange('email', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nickname</label>
                  <Input value={editUserData.nickname} onChange={e => handleEditChange('nickname', e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New User</h2>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={addUserData.name} onChange={e => handleAddChange('name', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input value={addUserData.email} onChange={e => handleAddChange('email', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input type="password" value={addUserData.password} onChange={e => handleAddChange('password', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nickname</label>
                  <Input value={addUserData.nickname} onChange={e => handleAddChange('nickname', e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Reminders Modal */}
        {showRemindersModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{selectedUser.name}'s Reminders</h2>
              {remindersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading reminders...</p>
                </div>
              ) : userReminders.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No reminders found for this user.</div>
              ) : (
                <div className="space-y-4">
                  {userReminders.map((reminder) => (
                    <Card key={reminder.id} className="border-blue-100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {reminder.title}
                          {reminder.isCompleted && <span className="text-green-600 text-xs ml-2">(Completed)</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-700 mb-2">{reminder.description}</div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Date: {new Date(reminder.datetime).toLocaleString()}</span>
                          <span>Priority: {reminder.priority}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowRemindersModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Password reset modal */}
        {showPasswordModal && passwordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Reset Password for {passwordUser.name}</h2>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={resettingPassword}>{resettingPassword ? "Resetting..." : "Reset"}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 