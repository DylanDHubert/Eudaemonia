import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      date,
      sleepHours,
      sleepQuality,
      exercise,
      exerciseTime,
      alcohol,
      alcoholUnits,
      weed,
      weedAmount,
      meditation,
      meditationTime,
      socialTime,
      workHours,
      stressLevel,
      happinessRating,
      meals,
      foodQuality,
      notes,
      customCategoryEntries,
      userId
    } = body;

    // Create the daily entry with custom category entries
    const entry = await prisma.dailyEntry.create({
      data: {
        date: new Date(date),
        sleepHours: parseFloat(sleepHours),
        sleepQuality: parseInt(sleepQuality),
        exercise,
        exerciseTime: exerciseTime ? parseInt(exerciseTime) : null,
        alcohol,
        alcoholUnits: alcoholUnits ? parseFloat(alcoholUnits) : null,
        weed,
        weedAmount: weedAmount ? parseInt(weedAmount) : null,
        meditation,
        meditationTime: meditationTime ? parseInt(meditationTime) : null,
        socialTime: socialTime ? parseInt(socialTime) : null,
        workHours: workHours ? parseFloat(workHours) : null,
        stressLevel: parseInt(stressLevel),
        happinessRating: parseInt(happinessRating),
        meals: meals ? parseInt(meals) : null,
        foodQuality: foodQuality ? parseInt(foodQuality) : null,
        notes,
        userId,
        customCategoryEntries: {
          create: customCategoryEntries?.map((entry: any) => ({
            customCategoryId: entry.customCategoryId,
            value: entry.value
          })) || []
        }
      },
      include: {
        customCategoryEntries: true
      }
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating daily entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const entries = await prisma.dailyEntry.findMany({
      where: {
        userId,
        ...(startDate && endDate ? {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {})
      },
      include: {
        customCategoryEntries: {
          include: {
            customCategory: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching daily entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
} 