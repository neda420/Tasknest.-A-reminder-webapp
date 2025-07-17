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

// GET /api/reminders/[id] - Get specific reminder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderId = parseInt(params.id);
    if (isNaN(reminderId)) {
      return NextResponse.json({ error: 'Invalid reminder ID' }, { status: 400 });
    }

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get reminder
    const reminder = await (prisma as any).reminder.findFirst({
      where: {
        id: reminderId,
        userId: user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('GET /api/reminders/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/reminders/[id] - Update reminder
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderId = parseInt(params.id);
    if (isNaN(reminderId)) {
      return NextResponse.json({ error: 'Invalid reminder ID' }, { status: 400 });
    }

    const body = await request.json();

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await (prisma as any).reminder.findFirst({
      where: {
        id: reminderId,
        userId: user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Update reminder
    const updatedReminder = await (prisma as any).reminder.update({
      where: { id: reminderId },
      data: {
        ...body,
        ...(body.datetime && { datetime: new Date(body.datetime) }),
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error('PUT /api/reminders/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders/[id] - Delete reminder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderId = parseInt(params.id);
    if (isNaN(reminderId)) {
      return NextResponse.json({ error: 'Invalid reminder ID' }, { status: 400 });
    }

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await (prisma as any).reminder.findFirst({
      where: {
        id: reminderId,
        userId: user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Delete reminder
    await (prisma as any).reminder.delete({
      where: { id: reminderId },
    });

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/reminders/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/reminders/[id]/complete - Toggle completion status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = await getUserEmail(request);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderId = parseInt(params.id);
    if (isNaN(reminderId)) {
      return NextResponse.json({ error: 'Invalid reminder ID' }, { status: 400 });
    }

    // Get user
    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current reminder
    const reminder = await (prisma as any).reminder.findFirst({
      where: {
        id: reminderId,
        userId: user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Toggle completion status
    const updatedReminder = await (prisma as any).reminder.update({
      where: { id: reminderId },
      data: {
        isCompleted: !reminder.isCompleted,
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error('PATCH /api/reminders/[id]/complete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 