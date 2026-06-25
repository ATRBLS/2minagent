import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";

function planFromPriceId(priceId: string): "pro" | "builder" | null {
  if (priceId === process.env.STRIPE_PRICE_BUILDER_MONTHLY) return "builder";
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) return "pro";
  return null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata?.user_id;
      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const plan = planFromPriceId(subscription.items.data[0].price.id);
        if (plan) await supabase.from("users").update({ plan }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", subscription.customer)
        .single();

      if (user) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const plan = isActive ? planFromPriceId(subscription.items.data[0].price.id) : "free";
        await supabase.from("users").update({ plan: plan ?? "free" }).eq("id", user.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
