import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICE_IDS } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { plan } = await request.json(); // "pro_monthly" | "pro_yearly" | "builder_monthly"
  const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
  if (!priceId) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

  const { data: profile } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email!, metadata: { user_id: user.id } });
    customerId = customer.id;
    await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/account?upgraded=1`,
    cancel_url: `${appUrl}/upgrade`,
    metadata: { user_id: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
