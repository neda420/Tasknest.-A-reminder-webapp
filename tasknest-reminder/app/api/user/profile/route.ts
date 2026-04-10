import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      nickname: user.nickname || '',
      imageUrl: user.avatar || '',
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const nickname = formData.get('nickname') as string;
    const image = formData.get('image') as File;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Parameters<typeof prisma.user.update>[0]['data'] & { nickname?: string; avatar?: string } = {
      name: name.trim(),
    };

    if (typeof nickname === 'string') {
      updateData.nickname = nickname.trim();
    }

    if (image && image.size > 0) {
      // Validate file size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json({ error: 'Only JPG, PNG, and GIF files are allowed' }, { status: 400 });
      }

      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${image.type};base64,${base64}`;

        // MySQL TEXT field limit (~65KB)
        if (dataUrl.length > 65000) {
          return NextResponse.json({ error: 'Image is too large. Please use an image under 48KB.' }, { status: 400 });
        }

        updateData.avatar = dataUrl;
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: updateData,
    });

    const updatedProfile = {
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      nickname: updatedUser.nickname || '',
      imageUrl: updatedUser.avatar || '',
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
 