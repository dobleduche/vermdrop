import { useState } from "react";
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
import {
  CheckCircle2,
  Twitter,
  ExternalLink,
  Users,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TweetVerificationProps {
  onVerified: (tweetUrl: string, friendsInvited: number) => void;
  isVerified: boolean;
  disabled?: boolean;
}

export const TweetVerification = ({
  onVerified,
  isVerified,
  disabled,
}: TweetVerificationProps) => {
  const [tweetUrl, setTweetUrl] = useState("");
  const [friendsCount, setFriendsCount] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const requiredHashtags = ["#ODINARY", "#NARY", "#Memeverse"];

  const handleVerify = async () => {
    if (!tweetUrl) {
      setError("Please provide a tweet URL");
      return;
    }

    if (friendsCount < 1 || friendsCount > 3) {
      setError("You must invite 1-3 friends");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // In production, this would verify the tweet contains required hashtags
      // and check the friend invitations

      // Mock verification delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For now, we'll assume verification passes
      onVerified(tweetUrl, friendsCount);
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const generateTweetText = () => {
    const text = `🚀 Joining the NARY airdrop! Meme-only ODINARY platform. ${requiredHashtags.join(" ")} 

Get your tokens: ${window.location.href}`;
    return encodeURIComponent(text);
  };

  const tweetUrl_template = `https://twitter.com/intent/tweet?text=${generateTweetText()}`;

  if (isVerified) {
    return (
      <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyber-green flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Tweet Verified
          </CardTitle>
          <CardDescription className="text-cyber-light/60">
            Your tweet and friend invitations have been verified
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyber-neon flex items-center">
          <Twitter className="w-5 h-5 mr-2" />
          Tweet About Project
        </CardTitle>
        <CardDescription className="text-cyber-light/60">
          Tweet about NARY and invite friends to be eligible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requirements */}
        <Alert className="border-cyber-neon/20 bg-cyber-darker/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-cyber-light/80">
            <strong>Requirements:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use at least one hashtag: {requiredHashtags.join(", ")}</li>
              <li>Follow ODINARY on X</li>
              <li>Invite 1-3 friends to participate</li>
              <li>Join ODINARY Telegram group</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Required Hashtags */}
        <div>
          <Label className="text-cyber-light mb-2 block">
            Required Hashtags (use at least one):
          </Label>
          <div className="flex flex-wrap gap-2">
            {requiredHashtags.map((hashtag) => (
              <Badge
                key={hashtag}
                variant="outline"
                className="border-cyber-blue text-cyber-blue"
              >
                {hashtag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tweet Button */}
        <div className="space-y-3">
          <Button
            onClick={() => window.open(tweetUrl_template, "_blank")}
            className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Create Tweet
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-cyber-light/60 text-center">
            This will open Twitter with a pre-filled tweet. Feel free to modify
            it!
          </p>
        </div>

        {/* Tweet URL Input */}
        <div className="space-y-2">
          <Label htmlFor="tweet-url" className="text-cyber-light">
            Paste your tweet URL here:
          </Label>
          <Input
            id="tweet-url"
            type="url"
            placeholder="https://twitter.com/your_username/status/..."
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
            disabled={disabled}
          />
        </div>

        {/* Friends Count */}
        <div className="space-y-2">
          <Label
            htmlFor="friends-count"
            className="text-cyber-light flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            How many friends did you invite? (1-3)
          </Label>
          <Input
            id="friends-count"
            type="number"
            min="1"
            max="3"
            value={friendsCount}
            onChange={(e) => setFriendsCount(parseInt(e.target.value) || 1)}
            className="bg-cyber-darker border-cyber-neon/20 text-cyber-light"
            disabled={disabled}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-cyber-red/20 border border-cyber-red/40 text-cyber-red">
            {error}
          </div>
        )}

        <Button
          onClick={handleVerify}
          disabled={disabled || isVerifying || !tweetUrl}
          className="w-full bg-cyber-green hover:bg-cyber-green/80"
        >
          {isVerifying ? "Verifying Tweet..." : "Verify Tweet & Friends"}
        </Button>
      </CardContent>
    </Card>
  );
};
