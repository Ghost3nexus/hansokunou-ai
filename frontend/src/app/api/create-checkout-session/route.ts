import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { priceId } = body;
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }
    
    const { createOrUpdateUser, getUserByEmail } = await import('../../../utils/supabase');
    
    let user = await getUserByEmail(session.user.email);
    
    let stripeCustomerId = user?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      });
      
      stripeCustomerId = customer.id;
      
      await createOrUpdateUser({
        email: session.user.email,
        plan: 'lite',
        subscription_status: 'pending',
        stripe_customer_id: stripeCustomerId,
      });
    }
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=canceled`,
      metadata: {
        userId: user?.id || '',
        userEmail: session.user.email,
      },
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      subscription_data: {
        trial_period_days: 7,
      },
    } as Stripe.Checkout.SessionCreateParams);
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
