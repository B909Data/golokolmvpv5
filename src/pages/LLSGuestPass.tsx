import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const LLSGuestPass = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("fan");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { eventId, name, email, role, inviteCode });
    // Placeholder for future database integration
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-3xl text-foreground text-center mb-8">
            Get Your LLS Pass
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                placeholder="Your name"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                placeholder="your@email.com"
              />
            </div>

            {/* Role Field */}
            <div className="space-y-3">
              <Label className="text-foreground">Role</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex flex-wrap gap-4"
              >
                {["Fan", "Friend", "Industry", "Other"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.toLowerCase()}
                      id={`role-${option.toLowerCase()}`}
                    />
                    <Label
                      htmlFor={`role-${option.toLowerCase()}`}
                      className="text-foreground cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Invite Code Field */}
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-foreground">
                Invite Code
              </Label>
              <Input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                placeholder="Enter your invite code"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Processing..." : "Get Pass"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSGuestPass;
