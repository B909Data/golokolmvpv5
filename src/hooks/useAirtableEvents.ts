import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AirtableEvent {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  venue: string;
  dateTime: string;
  genre: string; // normalized to comma-separated string
  description: string;
  artists: string[];
  capacity: number;
  attending: number;
  address: string;
  imageUrl: string;
  status: string;
  isPublic: boolean;
}

const normalizeGenre = (genre: unknown) => {
  if (Array.isArray(genre)) return genre.filter(Boolean).join(", ");
  if (typeof genre === "string") return genre;
  return "";
};

const normalizeEvents = (events: any[]): AirtableEvent[] => {
  return (events || []).map((e: any) => ({
    ...e,
    genre: normalizeGenre(e?.genre),
    artistName: typeof e?.artistName === "string" ? e.artistName : "",
    title: typeof e?.title === "string" ? e.title : "",
    venue: typeof e?.venue === "string" ? e.venue : "",
    dateTime: typeof e?.dateTime === "string" ? e.dateTime : "",
  }));
};

export const useAirtableEvents = () => {
  return useQuery({
    queryKey: ["airtable-events"],
    retry: 1,
    queryFn: async (): Promise<AirtableEvent[]> => {
      const { data, error } = await supabase.functions.invoke("airtable-events");

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      return normalizeEvents(data?.events || []);
    },
  });
};

export const useAirtableEvent = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["airtable-event", slug],
    retry: 1,
    queryFn: async (): Promise<AirtableEvent | null> => {
      if (!slug) return null;

      // Function is public (no auth) and expects slug as query param
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/airtable-events?slug=${encodeURIComponent(slug)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }

      const data = await response.json();
      const events = normalizeEvents(data?.events || []);
      return events.length > 0 ? events[0] : null;
    },
    enabled: !!slug,
  });
};
