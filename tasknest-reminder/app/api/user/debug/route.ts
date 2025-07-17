import { NextRequest, NextResponse } from 'next/server';
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

    // Return all user data for debugging
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: (user as any).nickname,
      avatar: (user as any).avatar,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt
    });
  } catch (error) {
    console.error('Error fetching user debug data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 