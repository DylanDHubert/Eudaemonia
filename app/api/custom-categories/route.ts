import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const queryUserId = searchParams.get('userId');
  const userId = queryUserId || session.user.id;

  try {
    const categories = await db.customCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, min, max } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['numeric', 'scale', 'boolean'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Create category
    const category = await db.customCategory.create({
      data: {
        name,
        type,
        min: min ? parseFloat(min) : null,
        max: max ? parseFloat(max) : null,
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: 'Category created successfully', category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
} 