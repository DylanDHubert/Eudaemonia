import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const gratitudes = await prisma.gratitude.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(gratitudes);
  } catch (error) {
    console.error('Error fetching gratitudes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    const gratitude = await prisma.gratitude.create({
      data: {
        content,
        userId: session.user.id,
      },
    });

    return NextResponse.json(gratitude);
  } catch (error) {
    console.error('Error creating gratitude:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 