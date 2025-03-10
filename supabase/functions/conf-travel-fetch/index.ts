// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as perpApi from "./services/index.ts";
import {
  ConferenceEventFetch,
  ConferenceEventFetchSchema,
  FlightItineraryFetch,
  FlightItineraryFetchSchema,
} from "./types/requestApi.ts";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://trippinglobes.lol",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400", // 24-hour preflight cache
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      throw new Error("Could not find the Perplexity API key!");
    }

    const api = perpApi.perplexityApiInst(apiKey);

    if (req.method === "POST") {
      // we simulate an endpoint
      const endpoint = req.url.split("/").at(-1);

      const reqBody = await req.json();
      console.log(`Received ${JSON.stringify(reqBody)}`);

      if (endpoint === "events") {
        const validatedEventReq: ConferenceEventFetch =
          ConferenceEventFetchSchema.parse(reqBody);

        const confListRes = await perpApi.fetchConferenceList(
          api,
          validatedEventReq.eventTags,
          validatedEventReq.city,
          validatedEventReq.country,
          validatedEventReq.fromWhen, // ISO 8601
        );

        return new Response(
          JSON.stringify({ success: true, data: confListRes }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      } else if (endpoint === "flights") {
        const validatedFlightReq: FlightItineraryFetch =
          FlightItineraryFetchSchema.parse(reqBody);

        const flightListRes = await perpApi.fetchFlightSchedule(
          api,
          validatedFlightReq.conferenceCity,
          validatedFlightReq.conferenceCountry,
          validatedFlightReq.departCity,
          validatedFlightReq.departCountry,
          validatedFlightReq.fromWhen, // ISO 8601
        );

        return new Response(
          JSON.stringify({ success: true, data: flightListRes }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      } else {
        return new Response(
          JSON.stringify({ error: `Unknown request for ${endpoint}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // heartbeat check
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const { name } = await req.json();
    const data = {
      message: `Hello ${name}!`,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/conf-travel-fetch' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
