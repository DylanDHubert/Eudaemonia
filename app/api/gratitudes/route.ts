import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const gratitudes = await prisma.gratitude.findMany({
      where: {
        userEmail: session.user.email,
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
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    const gratitude = await prisma.gratitude.create({
      data: {
        content,
        userEmail: session.user.email,
      },
    });

    return NextResponse.json(gratitude);
  } catch (error) {
    console.error('Error creating gratitude:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 