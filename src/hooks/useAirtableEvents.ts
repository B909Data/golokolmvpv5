import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AirtableEvent {
  id: string;
  slug: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  genre: string;
  description: string;
  artists: string[];
  capacity: number;
  attending: number;
  address: string;
  imageUrl: string;
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
      
      const { data, error } = await supabase.functions.invoke("airtable-events", {
        body: {},
      });
      
      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }
      
      const events = data.events || [];
      return events.find((e: AirtableEvent) => e.slug === slug) || null;
    },
    enabled: !!slug,
  });
};
