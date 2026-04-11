import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const memberSince = user.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const lastLogin = user.lastLogin
      ? user.lastLogin.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Never';

    const accountInfo = {
      memberSince,
      lastLogin,
      status: user.isActive ? 'Active' : 'Inactive',
    };

    return NextResponse.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
 