import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    
    // CHECK IF GRATITUDE EXISTS AND BELONGS TO USER
    const { data: gratitude, error: fetchError } = await supabase
      .from('gratitudes')
      .select('id, user_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !gratitude) {
      return new NextResponse('Gratitude not found', { status: 404 });
    }

    if (gratitude.user_id !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // DELETE THE GRATITUDE
    const { error: deleteError } = await supabase
      .from('gratitudes')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting gratitude:', deleteError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting gratitude:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 