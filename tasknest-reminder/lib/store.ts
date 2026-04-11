// lib/store.ts – client-side localStorage data store (no backend required)

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  nickname?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  userId: number;
  createdAt: string;
}

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  datetime: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
  isRecurring: boolean;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  categoryId?: number;
  userId: number;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const USERS_KEY = 'tasknest_users';
const REMINDERS_KEY = 'tasknest_reminders';
const CATEGORIES_KEY = 'tasknest_categories';
const COUNTER_KEY = 'tasknest_counter';

function safe<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(): number {
  if (typeof window === 'undefined') return 0;
  const count = (safe<number>(COUNTER_KEY, 0)) + 1;
  save(COUNTER_KEY, count);
  return count;
}

// ── Users ──────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return safe<User[]>(USERS_KEY, []);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: number): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function createUser(data: { name: string; email: string; password: string }): User {
  const users = getUsers();
  const user: User = {
    id: nextId(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'USER',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  save(USERS_KEY, [...users, user]);
  return user;
}

export function updateUser(id: number, data: Partial<Omit<User, 'id'>>): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  save(USERS_KEY, users);
  return users[idx];
}

export function deleteUser(id: number): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  save(USERS_KEY, filtered);
  return true;
}

// ── Auth helpers ───────────────────────────────────────────────────────────

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

export function getCurrentUser(): User | null {
  const email = getCookie('userEmail');
  if (!email) return null;
  return getUserByEmail(email) ?? null;
}

export function setAuthCookies(user: User): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `userEmail=${user.email}; max-age=${maxAge}; path=/; samesite=lax`;
  document.cookie = `userId=${user.id}; max-age=${maxAge}; path=/; samesite=lax`;
}

export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// ── Reminders ──────────────────────────────────────────────────────────────

export function getReminders(userId: number): Reminder[] {
  return safe<Reminder[]>(REMINDERS_KEY, []).filter(r => r.userId === userId);
}

export function getAllReminders(): Reminder[] {
  return safe<Reminder[]>(REMINDERS_KEY, []);
}

export function getReminderById(id: number, userId: number): Reminder | null {
  return getReminders(userId).find(r => r.id === id) ?? null;
}

export function createReminder(
  userId: number,
  data: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Reminder {
  const all = safe<Reminder[]>(REMINDERS_KEY, []);
  const reminder: Reminder = {
    ...data,
    id: nextId(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  save(REMINDERS_KEY, [...all, reminder]);
  return reminder;
}

export function updateReminder(id: number, userId: number, data: Partial<Reminder>): Reminder | null {
  const all = safe<Reminder[]>(REMINDERS_KEY, []);
  const idx = all.findIndex(r => r.id === id && r.userId === userId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  save(REMINDERS_KEY, all);
  return all[idx];
}

export function deleteReminder(id: number, userId: number): boolean {
  const all = safe<Reminder[]>(REMINDERS_KEY, []);
  const filtered = all.filter(r => !(r.id === id && r.userId === userId));
  if (filtered.length === all.length) return false;
  save(REMINDERS_KEY, filtered);
  return true;
}

// ── Categories ────────────────────────────────────────────────────────────

export function getCategories(userId: number): Category[] {
  return safe<Category[]>(CATEGORIES_KEY, []).filter(c => c.userId === userId);
}

export function getAllCategories(): Category[] {
  return safe<Category[]>(CATEGORIES_KEY, []);
}

export function getCategoryById(id: number, userId: number): Category | null {
  return getCategories(userId).find(c => c.id === id) ?? null;
}

export function createCategory(
  userId: number,
  data: { name: string; color: string; icon?: string }
): Category {
  const all = safe<Category[]>(CATEGORIES_KEY, []);
  const category: Category = {
    id: nextId(),
    name: data.name,
    color: data.color || '#3B82F6',
    icon: data.icon,
    userId,
    createdAt: new Date().toISOString(),
  };
  save(CATEGORIES_KEY, [...all, category]);
  return category;
}

export function updateCategory(id: number, userId: number, data: Partial<Category>): Category | null {
  const all = safe<Category[]>(CATEGORIES_KEY, []);
  const idx = all.findIndex(c => c.id === id && c.userId === userId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data };
  save(CATEGORIES_KEY, all);
  return all[idx];
}

export function deleteCategory(id: number, userId: number): boolean {
  const all = safe<Category[]>(CATEGORIES_KEY, []);
  const filtered = all.filter(c => !(c.id === id && c.userId === userId));
  if (filtered.length === all.length) return false;
  save(CATEGORIES_KEY, filtered);
  return true;
}
