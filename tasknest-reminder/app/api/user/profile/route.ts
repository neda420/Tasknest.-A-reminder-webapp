import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user-email')?.value || cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user profile without sensitive data
    const profile = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      nickname: (user as any).nickname || '', // Use nickname if available, empty string as fallback
      imageUrl: (user as any).avatar || ''
    };

    console.log('Profile API: Returning profile data:', profile);
    console.log('Profile API: User nickname from DB:', (user as any).nickname);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Profile update request received');
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user-email')?.value || cookieStore.get('userEmail')?.value;

    console.log('User email from cookies:', userEmail);

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const nickname = formData.get('nickname') as string;
    const image = formData.get('image') as File;

    console.log('Form data received:', { name, nickname, hasImage: !!image });

    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Find user
    console.log('Looking for user with email:', userEmail);
    const existingUser = await (prisma as any).user.findUnique({
      where: { email: userEmail }
    });

    if (!existingUser) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', { id: existingUser.id, name: existingUser.name });

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      updatedAt: new Date()
    };

    // Add nickname if provided
    if (nickname && nickname.trim()) {
      updateData.nickname = nickname.trim();
      console.log('Profile API: Setting nickname to:', nickname.trim());
    } else if (nickname === '') {
      // Allow empty nickname (user wants to clear it)
      updateData.nickname = '';
      console.log('Profile API: Clearing nickname');
    } else {
      console.log('Profile API: No nickname provided, keeping existing');
    }

    // Handle image upload
    if (image) {
      console.log('Processing image upload:', { 
        name: image.name, 
        size: image.size, 
        type: image.type 
      });
      
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
        // Convert image to base64 for storage (in a real app, use cloud storage)
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${image.type};base64,${base64}`;
        
        console.log('Image converted to base64, length:', dataUrl.length);
        
        // Check if the data is too large (MySQL TEXT field limit is ~65KB)
        if (dataUrl.length > 65000) {
          console.log('Image too large, using placeholder');
          updateData.avatar = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="#e5e7eb"/><text x="75" y="75" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="14">Image too large</text></svg>').toString('base64')}`;
        } else {
          updateData.avatar = dataUrl;
        }
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
      }
    }

    // Update user in database
    console.log('Updating user with data:', updateData);
    console.log('Profile API: Current user nickname before update:', (existingUser as any).nickname);
    
    const updatedUser = await (prisma as any).user.update({
      where: { email: userEmail },
      data: updateData
    });
    
    console.log('Profile API: User nickname after update:', (updatedUser as any).nickname);

    console.log('User updated successfully:', updatedUser);

    // Return updated profile
    const updatedProfile = {
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      nickname: (updatedUser as any).nickname || '', // Use nickname if available, empty string as fallback
      imageUrl: (updatedUser as any).avatar || ''
    };

    console.log('Profile API: Updated user nickname in DB:', (updatedUser as any).nickname);
    console.log('Profile API: Returning updated profile:', updatedProfile);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 