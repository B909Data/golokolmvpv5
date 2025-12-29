import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = Deno.env.get('AIRTABLE_PAT');
    const baseId = Deno.env.get('AIRTABLE_BASE_ID');
    
    if (!apiKey || !baseId) {
      console.error('Missing Airtable credentials');
      throw new Error('Airtable credentials not configured');
    }

    const body = await req.json();
    const { fan_name, fan_phone, event_id } = body;

    console.log('Creating RSVP:', { fan_name, fan_phone, event_id });

    if (!fan_name || !fan_phone || !event_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields: fan_name, fan_phone, event_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create record in RSVPs table
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/RSVPs`;
    
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              fan_name: fan_name,
              fan_phone: fan_phone,
              event: [event_id], // Link to the event record
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', response.status, errorText);
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('RSVP created successfully:', data.records?.[0]?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      rsvp_id: data.records?.[0]?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in create-rsvp function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
