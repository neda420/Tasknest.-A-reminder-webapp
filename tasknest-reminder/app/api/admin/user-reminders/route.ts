import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function requireAdmin(): Promise<{ error: NextResponse } | null> {
  const cookieStore = await cookies();
  const userEmail = decodeURIComponent(cookieStore.get('userEmail')?.value || '');
  if (!userEmail) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { role: true } });
  if (!user || user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError.error;

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');
  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }
  const reminders = await prisma.reminder.findMany({
    where: { userId: id },
    orderBy: { datetime: 'desc' },
  });
  return NextResponse.json({ reminders });
} 