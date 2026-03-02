import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONNECTED_ACCOUNTS: Record<string, string> = {
    "SHOP-01": Deno.env.get("SHOP_01_CONNECTED_ACCOUNT") || "acct_mock_shop01",
    "SHOP-02": Deno.env.get("SHOP_02_CONNECTED_ACCOUNT") || "acct_mock_shop02",
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

        const connectedAccountId = CONNECTED_ACCOUNTS[shopId];
        if (!connectedAccountId) {
            throw new Error(`No connected account for shop ${shopId}`);
        }

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
