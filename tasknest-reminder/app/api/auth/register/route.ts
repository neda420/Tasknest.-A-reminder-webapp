import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await (prisma as any).user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create response with user data
    const response = NextResponse.json(
      { message: 'User registered successfully', user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );

    // Set cookies for authentication (non-httpOnly so client can access them)
    response.cookies.set('userEmail', newUser.email, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('userId', newUser.id.toString(), {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
