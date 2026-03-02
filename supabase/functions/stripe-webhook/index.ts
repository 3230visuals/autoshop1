import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
    const signature = req.headers.get("Stripe-Signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
        console.error("Webhook secret or signature missing");
        return new Response("Webhook secret not configured", { status: 400 });
    }

    try {
        const body = await req.text();
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret,
            undefined,
            cryptoProvider
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const ticketId = session.metadata?.ticketId;
            const shopId = session.metadata?.shopId;

            if (ticketId) {
                // Initialize Supabase with service role to bypass RLS
                const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
                const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

                const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

                const { error } = await supabase
                    .from("orders")
                    .update({
                        paid: true,
                        payment_method: "Stripe",
                        paid_date: new Date().toISOString()
                    })
                    .eq("order_number", ticketId);

                if (error) {
                    console.error("Failed to update order:", error);
                    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
                }

                console.log(`Successfully processed payment for order ${ticketId}`);
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
