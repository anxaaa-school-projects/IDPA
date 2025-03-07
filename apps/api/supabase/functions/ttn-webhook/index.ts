import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

serve(async (req) => {
  const body = await req.json()

  console.log("Parsed body:", JSON.stringify(body, null, 2))

  const deviceId = body.end_device_ids?.device_id
  const distance = body.uplink_message?.decoded_payload?.distance
  const timestamp = body.received_at

  if (!deviceId || distance === undefined || !timestamp) {
    console.error("Missing data fields")
    return new Response("Bad Request", { status: 400 })
  }

  const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/device_data`, {
    method: "POST",
    headers: {
      "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      device_id: deviceId,
      distance: distance,
      timestamp: timestamp,
    }),
  })

  const result = await response.json()

  console.log("Insert response:", result)

  if (!response.ok) {
    console.error("Failed to insert into Supabase:", result)
    return new Response("Error inserting to DB", { status: 500 })
  }

  return new Response("OK", { status: 200 })
})
