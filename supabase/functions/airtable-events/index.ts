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

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    // Build Airtable API URL with filters
    let airtableUrl = `https://api.airtable.com/v0/${baseId}/Events`;
    const params = new URLSearchParams();
    
    if (slug) {
      // Filter by slug if provided
      params.append('filterByFormula', `{slug} = '${slug}'`);
    } else {
      // Filter for live and public events only
      params.append('filterByFormula', `AND({status} = 'live', {is_public} = TRUE())`);
    }
    
    // Sort by date_time ascending
    params.append('sort[0][field]', 'date_time');
    params.append('sort[0][direction]', 'asc');
    
    airtableUrl += `?${params.toString()}`;

    console.log('Fetching from Airtable:', airtableUrl);

    const response = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', response.status, errorText);
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.records?.length || 0} events from Airtable`);

    // Transform Airtable records to our event format
    const events = data.records.map((record: any) => ({
      id: record.id,
      slug: record.fields.slug || record.id,
      title: record.fields.title || record.fields.Name || 'Untitled Event',
      artistName: record.fields.artist_name || record.fields.artistName || '',
      venue: record.fields.venue || record.fields.Venue || 'TBD',
      dateTime: record.fields.date_time || record.fields.dateTime || '',
      genre: record.fields.genre || record.fields.Genre || '',
      description: record.fields.description || record.fields.Description || '',
      artists: record.fields.artists || record.fields.Artists || [],
      capacity: record.fields.capacity || record.fields.Capacity || 0,
      attending: record.fields.attending || record.fields.Attending || 0,
      address: record.fields.address || record.fields.Address || '',
      imageUrl: record.fields.imageUrl || record.fields['Image URL'] || record.fields.image?.[0]?.url || '',
      status: record.fields.status || '',
      isPublic: record.fields.is_public || false,
    }));

    return new Response(JSON.stringify({ events }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in airtable-events function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
