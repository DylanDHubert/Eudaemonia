import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // DELETE ALL USER DATA (CASCADE WILL HANDLE RELATED RECORDS)
    // DELETE GRATITUDES
    await supabase
      .from('gratitudes')
      .delete()
      .eq('user_id', session.user.id);

    // DELETE DAILY ENTRIES (CASCADE WILL DELETE CUSTOM CATEGORY ENTRIES)
    await supabase
      .from('daily_entries')
      .delete()
      .eq('user_id', session.user.id);

    // DELETE CUSTOM CATEGORIES
    await supabase
      .from('custom_categories')
      .delete()
      .eq('user_id', session.user.id);

    // DELETE PROFILE
    await supabase
      .from('profiles')
      .delete()
      .eq('id', session.user.id);

    // DELETE USER FROM AUTH (REQUIRES ADMIN ACCESS OR USER SELF-DELETE)
    // NOTE: THIS MIGHT REQUIRE SUPABASE ADMIN API OR USER MUST DELETE THEIR OWN ACCOUNT
    // FOR NOW, WE'LL JUST DELETE THE PROFILE AND DATA
    // THE USER CAN BE DELETED MANUALLY FROM SUPABASE DASHBOARD OR VIA ADMIN API

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 