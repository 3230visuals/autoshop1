import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { vin } = await req.json()

        if (!vin || typeof vin !== 'string' || vin.length !== 17) {
            return new Response(JSON.stringify({ error: 'Invalid VIN — must be 17 characters' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 1. Call the FREE NHTSA vPIC API
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
        )
        const data = await response.json()

        // 2. Extract key fields from the Results array
        const results = data.Results
        const getVal = (id: number) =>
            results.find((r: { VariableId: number; Value: string | null }) => r.VariableId === id)?.Value

        const vehicleData = {
            make: getVal(26),  // VariableId 26 = Make
            model: getVal(28),  // VariableId 28 = Model
            year: getVal(29),  // VariableId 29 = Model Year
            type: getVal(14),  // VariableId 14 = Body Class
        }

        return new Response(JSON.stringify(vehicleData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
