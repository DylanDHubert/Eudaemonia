import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const { data: gratitudes, error } = await supabase
      .from('gratitudes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gratitudes:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(gratitudes || []);
  } catch (error) {
    console.error('Error fetching gratitudes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    const supabase = await createClient();
    const { data: gratitude, error } = await supabase
      .from('gratitudes')
      .insert({
        content,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gratitude:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(gratitude);
  } catch (error) {
    console.error('Error creating gratitude:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 