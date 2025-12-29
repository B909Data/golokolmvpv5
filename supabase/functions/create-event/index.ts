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

  try {
    const apiKey = Deno.env.get('AIRTABLE_API_KEY');
    const baseId = Deno.env.get('AIRTABLE_BASE_ID');
    
    if (!apiKey || !baseId) {
      console.error('Missing Airtable credentials');
      throw new Error('Airtable credentials not configured');
    }

    const body = await req.json();
    const { artist, title, venue, dateTime, genre } = body;

    // Validate required fields
    if (!title || !venue || !dateTime || !genre) {
      throw new Error('Missing required fields: title, venue, dateTime, genre');
    }

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + 
      '-' + Date.now().toString(36);

    console.log('Creating event in Airtable:', { title, venue, dateTime, genre, artist, slug });

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/Events`;
    
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
              title,
              slug,
              venue,
              date_time: dateTime,
              genre,
              artist_name: artist || '',
              status: 'draft',
              is_public: false,
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
    console.log('Event created successfully:', data.records?.[0]?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: data.records?.[0]?.id,
        slug: slug,
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in create-event function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
