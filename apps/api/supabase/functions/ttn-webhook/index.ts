import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

serve(async (req) => {
  // Receive data from TTN
  const body = await req.json()

  console.log("Parsed body:", JSON.stringify(body, null, 2))

  const deviceId = body.end_device_ids?.device_id
  const distance = body.uplink_message?.decoded_payload?.distance
  const timestamp = body.received_at

  if (!deviceId || distance === undefined || !timestamp) {
    console.error("Missing data fields")
    return new Response("Bad Request", { status: 400 })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const headers = {
    "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  }

  // Insert new data into table device_data
  const response = await fetch(`${supabaseUrl}/rest/v1/device_data`, {
    method: "POST",
    headers,
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

  // Clean up logic to prevent the table from exceeding the supabase disk space
  const today = new Date().toISOString().split("T")[0]
  console.log("Today:", today)

  const cleanupRes = await fetch(
    `${supabaseUrl}/rest/v1/rpc/delete_old_data`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ today }),
    }
  )

  console.log(cleanupRes)

  const cleanupResult = await cleanupRes.json()
  console.log("Cleanup result:", cleanupResult)

  return new Response("OK", { status: 200 })
})
