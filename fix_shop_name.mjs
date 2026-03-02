import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    // Trim whitespace and carriage returns
    line = line.trim();
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim();
    }
});

const SUPABASE_URL = "https://tfmxiuyfwhvbhoxtrtqg.supabase.co"; // HARDCODED IF Parse FAILS
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

async function checkAndFixShopName() {
    console.log("Fetching SHOP-01 from Supabase REST API...");

    // FETCH SHOP
    const res = await fetch(`${SUPABASE_URL}/rest/v1/shops?id=eq.SHOP-01`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });

    const shops = await res.json();
    if (!shops || shops.length === 0) {
        console.error("Shop not found.");
        return;
    }

    const shop = shops[0];
    console.log("Current Shop Name in DB:", shop.name);

    if (shop.name && shop.name.toLowerCase().includes('elite')) {
        console.log("Updating shop name to Service Bay Software...");

        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/shops?id=eq.SHOP-01`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ name: 'Service Bay Software' })
        });

        if (updateRes.ok) {
            console.log("Successfully updated shop to 'Service Bay Software'");
            const updated = await updateRes.json();
            console.log("Updated record:", updated);

            // Wait a moment and then fetch again to verify
            const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/shops?id=eq.SHOP-01`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const verifyShops = await verifyRes.json();
            console.log("VERIFIED DB VALUE NOW:", verifyShops[0].name);

        } else {
            console.error("Error updating shop:", await updateRes.text());
        }
    } else {
        console.log("Shop name is fine or already updated.");
    }
}

checkAndFixShopName();
