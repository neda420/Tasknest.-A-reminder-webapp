import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Get user count
    const userCount = await prisma.user.count();
    
    // Get a sample user to check schema
    const sampleUser = await prisma.user.findFirst();
    
    return NextResponse.json({
      status: 'Database connected successfully',
      userCount,
      sampleUser: sampleUser ? {
        id: sampleUser.id,
        email: sampleUser.email,
        name: sampleUser.name,
        hasNickname: 'nickname' in sampleUser,
        hasAvatar: 'avatar' in sampleUser,
        nickname: (sampleUser as any).nickname,
        avatar: (sampleUser as any).avatar
      } : null
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 