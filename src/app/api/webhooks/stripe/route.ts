import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = "error";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }
    
    const { createOrUpdateUser, getUserByEmail } = await import('../../../../utils/supabase');
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;
        
        if (email) {
          const priceId = subscription.items.data[0].price.id;
          let plan: 'lite' | 'standard' | 'premium' = 'lite';
          
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID) {
            plan = 'standard';
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
            plan = 'premium';
          }
          
          await createOrUpdateUser({
            email,
            plan,
            subscription_status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'canceled',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          });
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSubscription.customer as string;
        
        const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId) as Stripe.Customer;
        const deletedEmail = deletedCustomer.email;
        
        if (deletedEmail) {
          await createOrUpdateUser({
            email: deletedEmail,
            plan: 'lite',
            subscription_status: 'canceled',
            stripe_customer_id: deletedCustomerId,
            stripe_subscription_id: undefined,
            current_period_end: undefined,
          });
        }
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
