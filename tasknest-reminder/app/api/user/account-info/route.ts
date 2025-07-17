import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user-email')?.value || cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format the member since date (actual registration date from database)
    const memberSinceDate = new Date((user as any).createdAt || new Date());
    const memberSince = memberSinceDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format the last login date (using updatedAt as last activity)
    const lastLoginDate = new Date((user as any).updatedAt || new Date());
    const lastLogin = lastLoginDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('Account info fetched:', { memberSince, lastLogin, status: 'Active' });

    const accountInfo = {
      memberSince,
      lastLogin,
      status: 'Active'
    };

    return NextResponse.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 