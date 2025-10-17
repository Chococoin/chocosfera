import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import type { NewsletterSubscription } from '@/lib/types/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, consent, locale } = body;

    // Validation
    if (!name || !email || !consent) {
      return NextResponse.json(
        { error: 'Name, email, and consent are required' },
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
    const collection = db.collection<NewsletterSubscription>('newsletter_subscriptions');

    // Check if email already subscribed
    const existing = await collection.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        await collection.updateOne(
          { email },
          {
            $set: {
              isActive: true,
              updatedAt: new Date(),
            },
            $unset: {
              unsubscribedAt: '',
            },
          }
        );
        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated',
        });
      }
    }

    // Create new subscription
    const subscription: Omit<NewsletterSubscription, '_id'> = {
      name,
      email,
      consent,
      locale: locale || 'es',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(subscription as NewsletterSubscription);

    // TODO: Send welcome email (integrate with Resend or similar)
    // TODO: Add to email marketing platform (e.g., Mailchimp, SendGrid)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
