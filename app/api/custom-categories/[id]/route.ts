import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

// DELETE: REMOVE A CUSTOM CATEGORY
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const supabase = await createClient();

    // CHECK IF THE CATEGORY EXISTS AND BELONGS TO THE USER
    const { data: existingCategory, error: fetchError } = await supabase
      .from('custom_categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // DELETE THE CATEGORY
    const { error: deleteError } = await supabase
      .from('custom_categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Category deletion error:', deleteError);
      return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}

// PUT: UPDATE A CUSTOM CATEGORY
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, type, min, max } = body;
    const supabase = await createClient();

    // CHECK IF THE CATEGORY EXISTS AND BELONGS TO THE USER
    const { data: existingCategory, error: fetchError } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // VALIDATE TYPE IF PROVIDED
    if (type && !['numeric', 'scale', 'boolean'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // UPDATE THE CATEGORY
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (min !== undefined) updateData.min = min ? parseFloat(min) : null;
    if (max !== undefined) updateData.max = max ? parseFloat(max) : null;

    const { data: updatedCategory, error: updateError } = await supabase
      .from('custom_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Category update error:', updateError);
      if (updateError.code === '23505') { // UNIQUE VIOLATION
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error: any) {
    console.error('Category update error:', error);
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
  }
} 