import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user data
    await prisma.$transaction([
      // Delete gratitudes
      prisma.gratitude.deleteMany({
        where: { userId: session.user.id },
      }),
      // Delete daily entries
      prisma.dailyEntry.deleteMany({
        where: { userId: session.user.id },
      }),
      // Delete custom categories
      prisma.customCategory.deleteMany({
        where: { userId: session.user.id },
      }),
      // Delete the user
      prisma.user.delete({
        where: { id: session.user.id },
      }),
    ]);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 