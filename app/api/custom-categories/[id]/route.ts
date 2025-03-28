import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const category = await prisma.customCategory.delete({
      where: { id: params.id }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error deleting custom category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 