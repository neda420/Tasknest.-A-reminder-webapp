import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  datetime: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  isRecurring: z.boolean().default(false),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']).optional(),
  categoryId: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const updateReminderSchema = createReminderSchema.partial();

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

// GET /api/reminders - Get all reminders for user
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'all', 'upcoming', 'completed', 'overdue'
    const categoryId = searchParams.get('categoryId');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (status === 'completed') {
      where.isCompleted = true;
    } else if (status === 'upcoming') {
      where.isCompleted = false;
      where.datetime = { gt: new Date() };
    } else if (status === 'overdue') {
      where.isCompleted = false;
      where.datetime = { lt: new Date() };
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (priority) {
      where.priority = priority;
    }

    // Get reminders with pagination (simplified without includes)
    const [reminders, total] = await Promise.all([
      (prisma as any).reminder.findMany({
        where,
        orderBy: [
          { datetime: 'asc' },
        ],
        skip,
        take: limit,
      }),
      (prisma as any).reminder.count({ where }),
    ]);

    return NextResponse.json({
      reminders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Create new reminder
export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createReminderSchema.parse(body);

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate category if provided
    if (validatedData.categoryId) {
      const category = await (prisma as any).category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Create reminder (simplified data structure)
    const reminderData = {
      title: validatedData.title,
      description: validatedData.description,
      datetime: new Date(validatedData.datetime),
      priority: validatedData.priority,
      isRecurring: validatedData.isRecurring,
      recurrence: validatedData.recurrence,
      categoryId: validatedData.categoryId,
      location: validatedData.location,
      notes: validatedData.notes,
      userId: user.id,
    };

    const reminder = await (prisma as any).reminder.create({
      data: reminderData,
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 