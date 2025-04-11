import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const gratitude = await prisma.gratitude.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!gratitude) {
      return new NextResponse('Gratitude not found', { status: 404 });
    }

    if (gratitude.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.gratitude.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting gratitude:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 