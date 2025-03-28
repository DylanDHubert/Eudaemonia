import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const categories = await prisma.customCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, min, max, userId } = body;

    if (!name || !type || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!['numeric', 'scale', 'boolean'].includes(type)) {
      return NextResponse.json({ error: 'Type must be either "numeric", "scale", or "boolean"' }, { status: 400 });
    }

    const category = await prisma.customCategory.create({
      data: {
        name,
        type,
        min,
        max,
        userId
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating custom category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
} 