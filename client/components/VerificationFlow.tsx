import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Twitter,
  Send,
  ExternalLink,
  Users,
  AlertCircle,
  Mail,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "@/components/WalletButton";
import {
  Registration,
  RegistrationRequest,
  RegistrationResponse,
  VerificationRequest,
} from "@shared/registration";
import {
  verifyTwitterFollow,
  verifyTelegramJoin,
  verifyTweet,
} from "@/lib/socialVerification";

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface VerificationFlowProps {
  onComplete: (registration: Registration) => void;
  existingRegistration?: Registration;
}

export const VerificationFlow = ({
  onComplete,
  existingRegistration,
}: VerificationFlowProps) => {
  const { publicKey, connected } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    email: existingRegistration?.email || "",
    twitter: existingRegistration?.twitter || "",
    telegram: existingRegistration?.telegram || "",
    tweetUrl: "",
    friendsInvited: 1,
  });

  // Verification steps state
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: "wallet",
      title: "Connect Wallet",
      description: "Connect your Solana wallet",
      completed: false,
      required: true,
    },
    {
      id: "twitter-follow",
      title: "Follow @nimrevxyz",
      description: "Follow us on Twitter",
      completed: false,
      required: true,
    },
    {
      id: "telegram-join",
      title: "Join Telegram",
      description: "Join our Telegram group @nimrevxyz",
      completed: false,
      required: true,
    },
    {
      id: "tweet",
      title: "Tweet About Project",
      description: "Tweet with required hashtags and invite friends",
      completed: false,
      required: true,
    },
    {
      id: "registration",
      title: "Submit Registration",
      description: "Complete your airdrop registration",
      completed: false,
      required: true,
    },
  ]);

  // Update wallet connection status
  useEffect(() => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === "wallet" ? { ...step, completed: connected } : step,
      ),
    );
  }, [connected]);

  // Load existing registration status
  useEffect(() => {
    if (existingRegistration) {
      setSteps((prev) =>
        prev.map((step) => {
          switch (step.id) {
            case "wallet":
              return { ...step, completed: connected };
            case "twitter-follow":
              return {
                ...step,
                completed: (existingRegistration as any).twitter_followed || existingRegistration.social_verified,
              } as VerificationStep;
            case "telegram-join":
              return {
                ...step,
                completed: (existingRegistration as any).telegram_joined || existingRegistration.social_verified,
              } as VerificationStep;
            case "tweet":
              return {
                ...step,
                completed: (existingRegistration as any).tweet_verified || existingRegistration.social_verified,
              } as VerificationStep;
            case "registration":
              return {
                ...step,
                completed: existingRegistration.social_verified,
              } as VerificationStep;
            default:
              return step;
          }
        }),
      );
    }
  }, [existingRegistration, connected]);

  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleTwitterFollow = async () => {
    if (!publicKey) return;

    setError("");

    try {
      const isFollowing = await verifyTwitterFollow("nimrevxyz");

      if (isFollowing) {
        const verificationData: VerificationRequest = {
          wallet_address: publicKey.toString(),
          twitter_followed: true,
        };

        const response = await fetch("/api/registration/verify", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verificationData),
        });

        if (response.ok || response.status === 404) {
          setSteps((prev) =>
            prev.map((step) =>
              step.id === "twitter-follow" ? { ...step, completed: true } : step,
            ),
          );
          if (currentStep === 1) setCurrentStep(2);
        } else {
          setError("Failed to verify Twitter follow. Please try again.");
        }
      } else {
        setError("Please follow @nimrevxyz on Twitter and try again.");
      }
    } catch (error) {
      setError("Error verifying Twitter follow. Please try again.");
      console.error("Twitter verification error:", error);
    }
  };

  const handleTelegramJoin = async () => {
    if (!publicKey) return;

    setError("");

    try {
      const hasJoined = await verifyTelegramJoin();

      if (hasJoined) {
        const verificationData: VerificationRequest = {
          wallet_address: publicKey.toString(),
          telegram_joined: true,
        };

        const response = await fetch("/api/registration/verify", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verificationData),
        });

        if (response.ok || response.status === 404) {
          setSteps((prev) =>
            prev.map((step) =>
              step.id === "telegram-join" ? { ...step, completed: true } : step,
            ),
          );
          if (currentStep === 2) setCurrentStep(3);
        } else {
          setError("Failed to verify Telegram join. Please try again.");
        }
      } else {
        setError("Please join the @nimrevxyz Telegram group and try again.");
      }
    } catch (error) {
      setError("Error verifying Telegram join. Please try again.");
      console.error("Telegram verification error:", error);
    }
  };

  const generateTweetText = () => {
    const hashtags = ["#NimRev", "#VERM", "#GridSecurity"];
    const text = `🚀 Excited to join the $VERM airdrop! Revolutionary blockchain security project by @nimrevxyz! ${hashtags.join(" ")} 

Get your tokens: ${window.location.href}`;
    return encodeURIComponent(text);
  };

  const handleTweetVerification = async () => {
    if (!publicKey) return;

    if (!formData.tweetUrl) {
      setError("Please provide your tweet URL");
      return;
    }

    if (formData.friendsInvited < 1 || formData.friendsInvited > 3) {
      setError("You must invite 1-3 friends");
      return;
    }

    setError("");

    try {
      const requiredHashtags = ["#NimRev", "#VERM", "#GridSecurity"];
      const isTweetValid = await verifyTweet(
        formData.tweetUrl,
        requiredHashtags,
      );

      if (isTweetValid) {
        const verificationData: VerificationRequest = {
          wallet_address: publicKey.toString(),
          tweet_verified: true,
          tweet_url: formData.tweetUrl,
          friends_invited: formData.friendsInvited,
        };

        const response = await fetch("/api/registration/verify", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verificationData),
        });

        if (response.ok || response.status === 404) {
          setSteps((prev) =>
            prev.map((step) =>
              step.id === "tweet" ? { ...step, completed: true } : step,
            ),
          );
          if (currentStep === 3) setCurrentStep(4);
        } else {
          setError("Failed to verify tweet. Please try again.");
        }
      } else {
        setError(
          "Tweet verification failed. Please ensure your tweet includes the required hashtags and mentions.",
        );
      }
    } catch (error) {
      setError("Error verifying tweet. Please check the URL and try again.");
      console.error("Tweet verification error:", error);
    }
  };

  const handleFinalSubmission = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet");
      return;
    }

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    const allRequiredStepsCompleted = steps
      .filter((step) => step.required)
      .every((step) => step.completed);

    if (!allRequiredStepsCompleted) {
      setError("Please complete all verification steps");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const registrationData: RegistrationRequest = {
        email: formData.email,
        twitter: formData.twitter || undefined,
        telegram: formData.telegram || undefined,
        wallet_address: publicKey.toString(),
      };

      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result: RegistrationResponse = await response.json();

      if (result.success && result.registration) {
        // Persist combined verification flags now that registration exists
        const finalVerification: VerificationRequest = {
          wallet_address: publicKey.toString(),
          twitter_followed: steps[1].completed,
          telegram_joined: steps[2].completed,
          tweet_verified: steps[3].completed,
          tweet_url: formData.tweetUrl || undefined,
          friends_invited: formData.friendsInvited,
        };

        const verifyRes = await fetch("/api/registration/verify", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalVerification),
        });

        let finalRegistration = result.registration;
        if (verifyRes.ok) {
          const verifyJson: RegistrationResponse = await verifyRes.json();
          if (verifyJson.success && verifyJson.registration) {
            finalRegistration = verifyJson.registration;
          }
        }

        // Update final step
        setSteps((prev) =>
          prev.map((step) =>
            step.id === "registration" ? { ...step, completed: true } : step,
          ),
        );

        onComplete(finalRegistration);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    return steps.slice(0, stepIndex).every((step) => step.completed);
  };

  if (existingRegistration?.social_verified) {
    return (
      <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyber-green flex items-center">
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Verification Complete
          </CardTitle>
          <CardDescription className="text-cyber-light/60">
            You're eligible for the $VERM airdrop!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyber-green mb-2">
              10,000
            </div>
            <div className="text-cyber-light/60">$VERM Tokens Awaiting</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyber-neon">
            Verification Progress
          </CardTitle>
          <CardDescription className="text-cyber-light/60">
            Complete all steps to become eligible for the airdrop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {completedSteps}/{steps.length} completed
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1 & 2: Social Media Verification */}
      <Card
        className={`cyber-border bg-cyber-dark/50 backdrop-blur-sm ${currentStep === 0 || currentStep === 1 ? "ring-2 ring-cyber-neon" : ""}`}
      >
        <CardHeader>
          <CardTitle className="text-cyber-neon">
            Social Media Verification
          </CardTitle>
          <CardDescription className="text-cyber-light/60">
            Follow our accounts to stay updated and prove you're part of the
            community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Twitter Follow */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {steps[1].completed ? (
                  <CheckCircle2 className="w-6 h-6 text-cyber-green" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-cyber-neon flex items-center justify-center text-xs">
                    1
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-cyber-light">
                    Follow @nimrevxyz on Twitter
                  </h4>
                  <p className="text-sm text-cyber-light/60">
                    Stay updated with project news
                  </p>
                </div>
              </div>

              {!steps[1].completed ? (
                <Button
                  onClick={handleTwitterFollow}
                  disabled={!canProceed(1)}
                  className="bg-cyber-blue hover:bg-cyber-blue/80"
                  size="sm"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Follow
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Badge className="bg-cyber-green/20 border-cyber-green text-cyber-green">
                  ✓ Following
                </Badge>
              )}
            </div>
          </div>

          {/* Telegram Join */}
          <div className="space-y-4 pt-4 border-t border-cyber-neon/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {steps[2].completed ? (
                  <CheckCircle2 className="w-6 h-6 text-cyber-green" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-cyber-neon flex items-center justify-center text-xs">
                    2
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-cyber-light">
                    Join @nimrevxyz Telegram
                  </h4>
                  <p className="text-sm text-cyber-light/60">
                    Get exclusive updates and support
                  </p>
                </div>
              </div>

              {!steps[2].completed ? (
                <Button
                  onClick={handleTelegramJoin}
                  disabled={!canProceed(2)}
                  className="bg-cyber-purple hover:bg-cyber-purple/80"
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Join
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Badge className="bg-cyber-green/20 border-cyber-green text-cyber-green">
                  ✓ Joined
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Tweet Verification */}
      <Card
        className={`cyber-border bg-cyber-dark/50 backdrop-blur-sm ${currentStep === 2 ? "ring-2 ring-cyber-neon" : ""}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            {steps[3].completed ? (
              <CheckCircle2 className="w-6 h-6 text-cyber-green mr-2" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-cyber-neon mr-2 flex items-center justify-center text-xs">
                3
              </div>
            )}
            Tweet About Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!steps[3].completed ? (
            <>
              <Alert className="border-cyber-neon/20 bg-cyber-darker/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-cyber-light/80">
                  <strong>Requirements:</strong> Use hashtags #NimRev #VERM
                  #GridSecurity and invite 1-3 friends
                </AlertDescription>
              </Alert>

              <Button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${generateTweetText()}`,
                    "_blank",
                  )
                }
                disabled={!canProceed(3)}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Create Tweet
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>

              <div className="space-y-2">
                <Label htmlFor="tweet-url">Paste your tweet URL:</Label>
                <Input
                  id="tweet-url"
                  type="url"
                  placeholder="https://twitter.com/your_username/status/..."
                  value={formData.tweetUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, tweetUrl: e.target.value })
                  }
                  className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="friends-count" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Friends invited (1-3):
                </Label>
                <Input
                  id="friends-count"
                  type="number"
                  min="1"
                  max="3"
                  value={formData.friendsInvited}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      friendsInvited: parseInt(e.target.value) || 1,
                    })
                  }
                  className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
                />
              </div>

              <Button
                onClick={handleTweetVerification}
                disabled={!canProceed(3) || !formData.tweetUrl}
                className="w-full bg-cyber-green hover:bg-cyber-green/80"
              >
                Verify Tweet
              </Button>
            </>
          ) : (
            <Badge className="bg-cyber-green/20 border-cyber-green text-cyber-green">
              Tweet Verified ✓
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Final Registration */}
      <Card
        className={`cyber-border bg-cyber-dark/50 backdrop-blur-sm ${currentStep === 3 ? "ring-2 ring-cyber-neon" : ""}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            {steps[4].completed ? (
              <CheckCircle2 className="w-6 h-6 text-cyber-green mr-2" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-cyber-neon mr-2 flex items-center justify-center text-xs">
                4
              </div>
            )}
            Complete Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!steps[4].completed ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter-handle">
                  Twitter Handle (Optional)
                </Label>
                <Input
                  id="twitter-handle"
                  type="text"
                  placeholder="your_handle"
                  value={formData.twitter}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter: e.target.value })
                  }
                  className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-handle">
                  Telegram Handle (Optional)
                </Label>
                <Input
                  id="telegram-handle"
                  type="text"
                  placeholder="your_handle"
                  value={formData.telegram}
                  onChange={(e) =>
                    setFormData({ ...formData, telegram: e.target.value })
                  }
                  className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-cyber-red/20 border border-cyber-red/40 text-cyber-red">
                  {error}
                </div>
              )}

              <Button
                onClick={handleFinalSubmission}
                disabled={!canProceed(4) || isSubmitting || !formData.email}
                className="w-full bg-cyber-pink hover:bg-cyber-pink/80 cyber-glow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </>
          ) : (
            <div className="text-center">
              <Badge className="bg-cyber-green/20 border-cyber-green text-cyber-green text-lg p-3">
                Registration Complete! 🎉
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
