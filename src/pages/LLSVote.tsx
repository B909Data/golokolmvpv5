import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

const SESSIONS = [
  { value: "lls1", label: "Lokol Listening Station 1" },
  { value: "lls2", label: "Lokol Listening Stations 2" },
] as const;

const ARTISTS_LLS1 = [
  "Alyx Ransom — Back at it",
  "Sque3ze — Rock",
  "Big Pri$e — Holla",
  "Charlie Global — Stay down",
  "E Coolin — Hold on wait",
  "Kaviar Sundays — Rockin it",
  "Trayon Pass — Oath",
  "MVSUA — Bakerman",
  "Kantil — Dancin Flo",
] as const;

const ARTISTS_LLS2 = [
  "Bluntana - Red",
  "Izan - ASWM",
  "Dude Dynamik - Different Pocket",
  "2D4Y - Let's Get it",
  "JointDexter ft. Yoshi - Fye",
  "Beef and Broccoli - Pillow",
  "Steven the Human - Tell'em Today",
  "Fenix&Flo - Who Said?, Pt.2",
  "Chris Harry - Body Language",
  "T.R.3. - Wearing Me Out",
] as const;

const voteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  session: z.string().min(1, "Please select a session"),
  artist_choice: z.string().min(1, "Please select an artist"),
  notify: z.boolean().default(false),
});

type VoteForm = z.infer<typeof voteSchema>;

const LLSVote = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "LLS Vote — Atlanta Spring 2026";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Vote for one Atlanta Hip Hop & RnB artist to be featured in the Lokol Listening Stations Spring 2026 compilation.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Vote for one Atlanta Hip Hop & RnB artist to be featured in the Lokol Listening Stations Spring 2026 compilation.";
      document.head.appendChild(newMeta);
    }
  }, []);

  const form = useForm<VoteForm>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      name: "",
      email: "",
      session: "",
      artist_choice: "",
      notify: false,
    },
  });

  const selectedSession = form.watch("session");
  const artists = selectedSession === "lls1" ? ARTISTS_LLS1 : selectedSession === "lls2" ? ARTISTS_LLS2 : [];

  // Reset artist choice when session changes
  useEffect(() => {
    form.setValue("artist_choice", "");
  }, [selectedSession, form]);

  const onSubmit = async (values: VoteForm) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("lls_votes" as any).insert({
        name: values.name,
        email: values.email.toLowerCase(),
        artist_choice: values.artist_choice,
        session: values.session,
        notify: values.notify,
      });

      if (error) {
        if (error.code === "23505" || error.message?.includes("unique") || error.message?.includes("duplicate")) {
          setSubmitError("Looks like this email has already voted. You can only vote once.");
        } else {
          console.error("Vote insert error:", error);
          setSubmitError("Something went wrong. Please try again.");
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Vote submit error:", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-20">
              <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                Vote received.
              </h1>
              <p className="text-muted-foreground type-body-lg">
                Thank you for helping shape the sound of Atlanta.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2 uppercase tracking-wide">
                Lokol Listening Stations Atlanta
              </h1>
              <h2 className="font-display text-xl md:text-2xl text-primary mb-6 uppercase tracking-wide">
                Spring 2026 Vote
              </h2>

              <p className="text-foreground text-lg md:text-xl font-medium mb-4 max-w-xl">
                Select ONE session and artist. Artists with the highest number of votes will be featured in new music discovery stations found around Atlanta.
              </p>
              <p className="text-primary text-lg md:text-xl font-bold mb-10 max-w-xl">
                The future of music is local.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Session Selector */}
                  <FormField
                    control={form.control}
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Select a session</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a Lokol Listening Station" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SESSIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Artist Selection (shown after session is picked) */}
                  {selectedSession && (
                    <FormField
                      control={form.control}
                      name="artist_choice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Select an artist</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-3 mt-2"
                            >
                              {artists.map((artist) => (
                                <div key={artist} className="flex items-center space-x-3">
                                  <RadioGroupItem value={artist} id={artist} />
                                  <Label
                                    htmlFor={artist}
                                    className="text-foreground cursor-pointer type-body-md"
                                  >
                                    {artist}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {submitError && (
                    <p className="text-destructive type-body-sm">{submitError}</p>
                  )}

                  <div className="space-y-4">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? "Submitting…" : "Submit Vote"}
                    </Button>

                    <p className="type-body-sm">
                      <a
                        href="https://golokol.app/songs"
                        className="text-primary hover:underline"
                      >
                        Submit music for future Lokol Listening Stations
                      </a>
                    </p>
                  </div>
                </form>
              </Form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSVote;
