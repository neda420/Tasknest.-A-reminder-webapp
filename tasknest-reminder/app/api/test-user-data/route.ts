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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: (user as any).nickname,
        hasAvatar: !!(user as any).avatar,
        avatarLength: (user as any).avatar ? (user as any).avatar.length : 0,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt
      },
      message: 'User data retrieved successfully'
    });
  } catch (error) {
    console.error('Error testing user data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 