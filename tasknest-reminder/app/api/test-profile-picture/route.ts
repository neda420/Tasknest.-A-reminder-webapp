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

    const avatar = (user as any).avatar;
    
    return NextResponse.json({
      hasAvatar: !!avatar,
      avatarLength: avatar ? avatar.length : 0,
      avatarPreview: avatar ? avatar.substring(0, 100) + '...' : 'No avatar',
      avatarType: avatar ? (avatar.startsWith('data:image/') ? 'base64' : 'url') : 'none'
    });
  } catch (error) {
    console.error('Error testing profile picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 