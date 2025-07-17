import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userEmail = decodeURIComponent(cookieStore.get('userEmail')?.value || '');
  if (userEmail !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await (prisma as any).user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      createdAt: true,
      role: true,
      isActive: true,
      lastLogin: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ users });
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const userEmail = decodeURIComponent(cookieStore.get('userEmail')?.value || '');
  if (userEmail !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const { id, name, email, nickname } = body;
  if (!id || !name || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const updatedUser = await (prisma as any).user.update({
    where: { id },
    data: { name, email, nickname },
  });
  return NextResponse.json({ user: updatedUser });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userEmail = decodeURIComponent(cookieStore.get('userEmail')?.value || '');
  if (userEmail !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const { name, email, password, nickname } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await (prisma as any).user.create({
    data: { name, email, password: hashedPassword, nickname },
  });
  return NextResponse.json({ user: newUser });
}

export async function DELETE(request: NextRequest) {
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
  await (prisma as any).user.delete({ where: { id } });
  return NextResponse.json({ message: 'User deleted' });
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const userEmail = decodeURIComponent(cookieStore.get('userEmail')?.value || '');
  if (userEmail !== 'admin@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const { id, action, value } = body;
  if (!id || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  let updatedUser;
  if (action === 'resetPassword') {
    if (!value || typeof value !== 'string' || value.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(value, 10);
    updatedUser = await (prisma as any).user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  } else if (action === 'toggleActive') {
    updatedUser = await (prisma as any).user.update({
      where: { id },
      data: { isActive: value },
    });
  } else if (action === 'changeRole') {
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(value)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    updatedUser = await (prisma as any).user.update({
      where: { id },
      data: { role: value },
    });
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
  return NextResponse.json({ user: updatedUser });
} 