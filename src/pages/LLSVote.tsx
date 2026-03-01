import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

const ARTISTS = [
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

const voteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
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
      meta.setAttribute("content", "Vote for one Atlanta Hip Hop & RnB artist to be featured in the Lokol Listening Sessions Spring 2026 compilation.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Vote for one Atlanta Hip Hop & RnB artist to be featured in the Lokol Listening Sessions Spring 2026 compilation.";
      document.head.appendChild(newMeta);
    }
  }, []);

  const form = useForm<VoteForm>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      name: "",
      email: "",
      artist_choice: "",
      notify: false,
    },
  });

  const onSubmit = async (values: VoteForm) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("lls_votes" as any).insert({
        name: values.name,
        email: values.email.toLowerCase(),
        artist_choice: values.artist_choice,
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
                Lokol Listening Sessions Atlanta
              </h1>
              <h2 className="font-display text-xl md:text-2xl text-primary mb-6 uppercase tracking-wide">
                Spring 2026 Vote
              </h2>

              <p className="text-muted-foreground type-body-md mb-10 max-w-xl">
                Select one artist you want featured in a seasonal compilation release representing the current sounds coming out of Atlanta in the Hip Hop and RnB genres. You can only vote once.
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

                  {/* Artist Selection */}
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
                            {ARTISTS.map((artist) => (
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

                  {/* Notify Checkbox */}
                  <FormField
                    control={form.control}
                    name="notify"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label className="text-muted-foreground type-body-sm cursor-pointer leading-snug">
                          Do you want us to notify you with the results and when the compilation CD and digital download will be available.
                        </Label>
                      </FormItem>
                    )}
                  />

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
                        Submit music for future Lokol Listening Sessions
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
