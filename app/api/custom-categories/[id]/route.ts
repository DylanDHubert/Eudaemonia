import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// DELETE: Remove a custom category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // First, check if the category exists and belongs to the user
    const existingCategory = await db.customCategory.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete the category
    await db.customCategory.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}

// PUT: Update a custom category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, type, min, max } = body;

    // First, check if the category exists and belongs to the user
    const existingCategory = await db.customCategory.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Validate type if provided
    if (type && !['numeric', 'scale', 'boolean'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Update the category
    const updatedCategory = await db.customCategory.update({
      where: { id },
      data: {
        name: name || undefined,
        type: type || undefined,
        min: min !== undefined ? parseFloat(min) : undefined,
        max: max !== undefined ? parseFloat(max) : undefined
      }
    });

    return NextResponse.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error: any) {
    console.error('Category update error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
  }
} 