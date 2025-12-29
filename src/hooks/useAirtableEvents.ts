import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AirtableEvent {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  venue: string;
  dateTime: string;
  genre: string;
  description: string;
  artists: string[];
  capacity: number;
  attending: number;
  address: string;
  imageUrl: string;
  status: string;
  isPublic: boolean;
}

export const useAirtableEvents = () => {
  return useQuery({
    queryKey: ["airtable-events"],
    queryFn: async (): Promise<AirtableEvent[]> => {
      const { data, error } = await supabase.functions.invoke("airtable-events");
      
      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
      
      return data.events || [];
    },
  });
};

export const useAirtableEvent = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["airtable-event", slug],
    queryFn: async (): Promise<AirtableEvent | null> => {
      if (!slug) return null;
      
      // Fetch with slug parameter to get specific event
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/airtable-events?slug=${encodeURIComponent(slug)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.error("Error fetching event:", response.statusText);
        throw new Error("Failed to fetch event");
      }
      
      const data = await response.json();
      const events = data.events || [];
      return events.length > 0 ? events[0] : null;
    },
    enabled: !!slug,
  });
};
