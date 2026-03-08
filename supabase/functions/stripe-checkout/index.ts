import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { shopId, orderId, amount, successUrl, cancelUrl, description } = await req.json();

        if (!shopId || !orderId || !amount) {
            throw new Error("Missing required fields");
        }

        // 1. Initialize Supabase Client
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Look up the shop's Stripe account ID
        const { data: shop, error: shopError } = await supabaseAdmin
            .from("shops")
            .select("stripe_account_id")
            .eq("id", shopId)
            .single();

        if (shopError || !shop?.stripe_account_id) {
            throw new Error(`Stripe account not found or not onboarded for shop ${shopId}`);
        }

        const connectedAccountId = shop.stripe_account_id;

        // 1. Calculate platform fee
        const platformFeePercent = 1.0; // 1%
        const platformFeeCents = Math.round(amount * (platformFeePercent / 100));

        // 2. Build line items
        const lineItems = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Invoice ${orderId}`,
                        description: description || `Auto repair for order ${orderId}`,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Platform Fee (1%)",
                        description: "Service processing fee",
                    },
                    unit_amount: platformFeeCents,
                },
                quantity: 1,
            }
        ];

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_intent_data: {
                application_fee_amount: platformFeeCents,
                transfer_data: {
                    destination: connectedAccountId,
                },
            },
            metadata: {
                ticketId: orderId,
                shopId: shopId,
                repairAmountCents: String(amount),
                platformFeeCents: String(platformFeeCents),
            }
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
