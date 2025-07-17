import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Helper function to get user email from cookies
async function getUserEmail(request: NextRequest) {
  // Try to get from server-side cookies first
  const cookieStore = await cookies();
  let userEmail = cookieStore.get('userEmail')?.value;

  // If not found in server-side cookies, try from request headers (client-side cookies)
  if (!userEmail) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      userEmail = cookies['userEmail'];
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

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get categories
    const categories = await (prisma as any).category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    });

    // Add default reminder count of 0 for now
    const categoriesWithCounts = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      reminderCount: 0 // Default value for now
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

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if category already exists for this user
    const existingCategory = await (prisma as any).category.findFirst({
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
    const category = await (prisma as any).category.create({
      data: {
        name,
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