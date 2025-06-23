import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

serve(async (req) => {
  // Receive data from TTN
  const body = await req.json()

  const deviceId = body.end_device_ids?.device_id
  const distance = body.uplink_message?.decoded_payload?.distance
  const batteryStatus = body.uplink_message?.decoded_payload?.batteryStatus
  const timestamp = body.received_at

  if (!deviceId || distance === undefined || !batteryStatus || !timestamp) {
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
      battery_status: batteryStatus,
      timestamp: timestamp,
    }),
  })

  const result = await response.json()
  console.log("Insert response:", result)

  if (!response.ok) {
    console.error("Failed to insert into Supabase:", result)
    return new Response("Error inserting to DB", { status: 500 })
  }

  // Check conditions for notifications
  if (batteryStatus === "LOW" || distance > 40) {
    // Get all push tokens for users who should receive this notification
    const tokensResponse = await fetch(
      `${supabaseUrl}/rest/v1/push_tokens?select=expo_push_token`,
      {
        method: "GET",
        headers,
      }
    );

    const tokensData = await tokensResponse.json();

    if (tokensResponse.ok && tokensData.length > 0) {
      const expoPushTokens = tokensData.map((item: any) => item.expo_push_token);

      // Prepare notification message based on condition
      let message = '';
      if (batteryStatus === "LOW") {
        message = `Device ${deviceId} has low battery!`;
      } else if (distance > 40) {
        message = `Alert: Device ${deviceId} distance is ${distance} (above threshold)`;
      }

      // Send notifications via Expo's push service
      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          expoPushTokens.map(token => ({
            to: token,
            sound: 'default',
            title: 'Device Alert',
            body: message,
            data: { deviceId, distance, batteryStatus },
          }))
        ),
      });

      const expoResult = await expoResponse.json();
      console.log('Expo push notification result:', expoResult);
    }
  }

  // Clean up logic to prevent the table from exceeding the supabase disk space
  const today = new Date().toISOString().split("T")[0]

  const cleanupRes = await fetch(
    `${supabaseUrl}/rest/v1/rpc/delete_old_data`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ today }),
    }
  )

  if (!cleanupRes.ok) {
    const errorBody = await cleanupRes.text()
    console.error("Cleanup failed:", errorBody)
    return new Response("Error cleaning up", { status: 500 })
  }

  console.log("Cleanup completed", cleanupRes)

  return new Response("OK", { status: 200 })
})
