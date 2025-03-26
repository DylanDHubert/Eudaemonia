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
        socialTime: body.socialTime ? parseInt(body.socialTime) : null,
        workHours: body.workHours ? parseFloat(body.workHours) : null,
        stressLevel: parseInt(body.stressLevel),
        happinessRating: parseInt(body.happinessRating),
        notes: body.notes || null,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json({ message: 'Entry created successfully', entry }, { status: 201 });
  } catch (error) {
    console.error('Entry creation error:', error);
    return NextResponse.json({ error: 'Error creating entry' }, { status: 500 });
  }
}

// GET: Fetch all entries for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    
    // Optional date filtering
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build the where clause for the query
    let where: any = { userId: session.user.id };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const entries = await db.dailyEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    
    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 });
  }
} 