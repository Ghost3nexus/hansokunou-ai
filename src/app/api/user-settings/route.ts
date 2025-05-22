import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

type SessionWithId = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    subscription?: {
      status: "lite" | "standard" | "premium";
      priceId?: string;
      currentPeriodEnd?: string;
    };
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as SessionWithId | null;
    
    const userId = session?.user?.id || 'test-user-123';
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
    const response = await fetch(`${backendUrl}/api/user-settings/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch settings' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/user-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as SessionWithId | null;
    
    const userId = session?.user?.id || 'test-user-123';
    
    const body = await request.json();
    
    const data = {
      ...body,
      user_id: userId
    };
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
    const response = await fetch(`${backendUrl}/api/user-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to save settings' },
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in POST /api/user-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
