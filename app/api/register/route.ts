import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// THIS ROUTE IS NOW HANDLED IN signup/page.tsx DIRECTLY
// KEEPING FOR BACKWARDS COMPATIBILITY BUT CAN BE REMOVED
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // SIGN UP USER
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message || 'Error creating user' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // CREATE PROFILE
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // USER IS CREATED BUT PROFILE FAILED
    }

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: { id: authData.user.id, name, email: authData.user.email } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
} 