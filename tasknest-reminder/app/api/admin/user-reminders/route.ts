import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userEmail = decodeURIComponent(cookieStore.get('userEmail')?.value || '');
  if (userEmail !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');
  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }
  const reminders = await (prisma as any).reminder.findMany({
    where: { userId: id },
    orderBy: { datetime: 'desc' },
  });
  return NextResponse.json({ reminders });
} 