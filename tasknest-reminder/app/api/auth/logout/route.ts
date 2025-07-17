import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear authentication cookies
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    response.cookies.set('auth-token', '', {
      expires: new Date(0),
      path: '/',
    });
    
    response.cookies.set('user-email', '', {
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 