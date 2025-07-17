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

// GET /api/categories/[id] - Get specific category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get category (simplified without includes)
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
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
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if name already exists for this user (excluding current category)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: user.id,
        id: { not: categoryId },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        color: color || existingCategory.color,
        icon: icon || null,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // For now, allow deletion without checking reminders
    // In a real app, you'd want to check if category has reminders first

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 