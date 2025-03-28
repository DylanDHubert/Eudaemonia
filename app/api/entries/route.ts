import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST: Create a new daily entry
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['sleepHours', 'sleepQuality', 'exercise', 'alcohol', 
                           'weed', 'meditation', 'stressLevel', 'happinessRating'];
    
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Create the entry
    const entry = await db.dailyEntry.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
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
        userId: session.user.id,
        customCategoryEntries: {
          create: body.customCategoryEntries?.map((entry: any) => ({
            customCategoryId: entry.customCategoryId,
            value: entry.value
          })) || []
        }
      },
      include: {
        customCategoryEntries: true
      }
    });
    
    return NextResponse.json({ message: 'Entry created successfully', entry });
  } catch (error) {
    console.error('Entry creation error:', error);
    return NextResponse.json({ error: 'Error creating entry' }, { status: 500 });
  }
}

// GET: Fetch entries
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;
    
    const where = {
      userId: session.user.id,
      ...(date ? {
        date: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`)
        }
      } : {})
    };
    
    const entries = await db.dailyEntry.findMany({
      where,
      include: {
        customCategoryEntries: {
          include: {
            customCategory: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      ...(limit ? { take: limit } : {})
    });
    
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 });
  }
} 