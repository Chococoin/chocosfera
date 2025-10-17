import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import type { TreeAdoption } from '@/lib/types/mongodb';

const PRICE_PER_TREE = 30; // €30 per tree per year

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, country, trees, consent, locale } = body;

    // Validation
    if (!name || !email || !country || !trees || !consent) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate trees number
    const numberOfTrees = parseInt(trees, 10);
    if (isNaN(numberOfTrees) || numberOfTrees < 1 || numberOfTrees > 100) {
      return NextResponse.json(
        { error: 'Number of trees must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await getDatabase();
    const collection = db.collection<TreeAdoption>('tree_adoptions');

    // Calculate annual cost
    const annualCost = numberOfTrees * PRICE_PER_TREE;

    // Create adoption record
    const adoption: Omit<TreeAdoption, '_id'> = {
      name,
      email,
      country,
      numberOfTrees,
      consent,
      status: 'pending', // Will be 'confirmed' after payment
      locale: locale || 'es',
      annualCost,
      treeIds: [], // Will be populated after actual tree assignment
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(adoption as TreeAdoption);

    // TODO: Initialize payment process (Stripe)
    // TODO: Send confirmation email with payment link
    // TODO: Assign actual trees after payment confirmation

    return NextResponse.json({
      success: true,
      adoptionId: result.insertedId.toString(),
      message: 'Adoption request created successfully',
      annualCost,
      numberOfTrees,
    });
  } catch (error) {
    console.error('Tree adoption error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
