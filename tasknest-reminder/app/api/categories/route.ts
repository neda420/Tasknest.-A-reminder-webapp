import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Helper function to get user email from cookies
async function getUserEmail(request: NextRequest) {
  const cookieStore = await cookies();
  let userEmail = cookieStore.get('userEmail')?.value;

  if (!userEmail) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const parsed = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      userEmail = parsed['userEmail'];
    }
  }

  return userEmail;
}

// GET /api/categories - Get all categories for user
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get categories with actual reminder counts
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { reminders: true },
        },
      },
    });

    const categoriesWithCounts = categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      reminderCount: category._count.reminders,
    }));

    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if category already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: user.id,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        icon: icon || null,
        userId: user.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
