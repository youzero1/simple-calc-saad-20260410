import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/datasource';
import { Calculation } from '@/entities/Calculation';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);

    const history = await repo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
