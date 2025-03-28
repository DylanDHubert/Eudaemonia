import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PUT: Update an existing entry
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
    
    // Verify the entry exists and belongs to the user
    const existingEntry = await db.dailyEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // Update the entry
    const updatedEntry = await db.dailyEntry.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : existingEntry.date,
        sleepHours: parseFloat(body.sleepHours),
        sleepQuality: parseInt(body.sleepQuality),
        exercise: Boolean(body.exercise),
        exerciseTime: body.exerciseTime ? parseInt(body.exerciseTime) : null,
        alcohol: Boolean(body.alcohol),
        alcoholUnits: body.alcoholUnits ? parseFloat(body.alcoholUnits) : null,
        weed: Boolean(body.weed),
        weedAmount: body.weedAmount ? parseInt(body.weedAmount) : null,
        meditation: Boolean(body.meditation),
        meditationTime: body.meditationTime ? parseInt(body.meditationTime) : null,
        socialTime: body.socialTime ? parseFloat(body.socialTime) : null,
        workHours: body.workHours ? parseFloat(body.workHours) : null,
        stressLevel: parseInt(body.stressLevel),
        happinessRating: parseInt(body.happinessRating),
        meals: body.meals ? parseInt(body.meals) : null,
        foodQuality: body.foodQuality ? parseInt(body.foodQuality) : null,
        notes: body.notes || null,
        customCategoryEntries: {
          deleteMany: {}, // Remove existing entries
          create: body.customCategoryEntries?.map((entry: any) => ({
            customCategoryId: entry.customCategoryId,
            value: entry.value
          })) || []
        }
      },
      include: {
        customCategoryEntries: {
          include: {
            customCategory: true
          }
        }
      }
    });
    
    return NextResponse.json({ message: 'Entry updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('Entry update error:', error);
    return NextResponse.json({ error: 'Error updating entry' }, { status: 500 });
  }
}

// DELETE: Remove an entry
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
    
    // First, check if the entry exists and belongs to the user
    const existingEntry = await db.dailyEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // Delete the entry
    await db.dailyEntry.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Entry deletion error:', error);
    return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 });
  }
} 