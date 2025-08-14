import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { WalletButton } from "@/components/WalletButton";
import { VerificationFlow } from "@/components/VerificationFlow";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  CheckCircle2,
  Twitter,
  Send,
  Wallet,
  Users,
  Lock,
  Zap,
  Globe,
  Shield,
  ExternalLink,
  Mail,
} from "lucide-react";
import {
  Registration,
  RegistrationResponse,
  VerificationRequest,
} from "@shared/registration";

interface SocialVerification {
  twitter: boolean;
  telegram: boolean;
}

export default function Index() {
  const { publicKey, connected } = useWallet();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [socialVerified, setSocialVerified] = useState<SocialVerification>({
    twitter: false,
    telegram: false,
  });
  const [claimProgress, setClaimProgress] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing registration when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      checkExistingRegistration();
    } else {
      setRegistration(null);
    }
  }, [connected, publicKey]);

  // Check eligibility based on registration and social verifications
  useEffect(() => {
    const hasRegistration = !!registration;
    const socialComplete = socialVerified.twitter && socialVerified.telegram;
    setIsEligible(hasRegistration && socialComplete && connected);
  }, [registration, socialVerified, connected]);

  const checkExistingRegistration = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/registration/${publicKey.toString()}`);
      if (response.ok) {
        const result: RegistrationResponse = await response.json();
        if (result.success && result.registration) {
          setRegistration(result.registration);
          // Update social verification status from registration
          setSocialVerified({
            twitter: result.registration.social_verified,
            telegram: result.registration.social_verified,
          });
        }
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationComplete = (newRegistration: Registration) => {
    setRegistration(newRegistration);
  };

  const verifyTwitter = async () => {
    if (!publicKey || !registration) return;

    // In production, this would redirect to Twitter OAuth or check follow status
    // For now, we'll update the verification status directly
    try {
      const verificationData: VerificationRequest = {
        wallet_address: publicKey.toString(),
        twitter_verified: true,
      };

      const response = await fetch("/api/registration/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      });

      if (response.ok) {
        const result: RegistrationResponse = await response.json();
        if (result.success && result.registration) {
          setRegistration(result.registration);
          setSocialVerified((prev) => ({ ...prev, twitter: true }));
        }
      }
    } catch (error) {
      console.error("Twitter verification error:", error);
    }
  };

  const verifyTelegram = async () => {
    if (!publicKey || !registration) return;

    // In production, this would check Telegram membership
    // For now, we'll update the verification status directly
    try {
      const verificationData: VerificationRequest = {
        wallet_address: publicKey.toString(),
        telegram_verified: true,
      };

      const response = await fetch("/api/registration/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      });

      if (response.ok) {
        const result: RegistrationResponse = await response.json();
        if (result.success && result.registration) {
          setRegistration(result.registration);
          setSocialVerified((prev) => ({ ...prev, telegram: true }));
        }
      }
    } catch (error) {
      console.error("Telegram verification error:", error);
    }
  };

  const claimAirdrop = async () => {
    if (!isEligible) return;

    // Actual claim process - would integrate with smart contract
    setClaimProgress(0);

    try {
      // In production, this would:
      // 1. Call smart contract to mint tokens
      // 2. Transfer tokens to user's wallet
      // 3. Update database status

      const interval = setInterval(() => {
        setClaimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } catch (error) {
      console.error("Claim error:", error);
      setClaimProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker text-cyber-light overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-dark via-cyber-darker to-black"></div>

      {/* Airdrop Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2F29ccaf1d7d264cd2bd339333fe296f0c%2F28f7ef4eba7e4d4498ae85c36c778297?format=webp&width=1920')`,
          backgroundBlendMode: "overlay",
        }}
      ></div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyber-pink rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyber-blue rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyber-green rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Animated Background with Cybergrid and Falling Objects */}
      <AnimatedBackground />

      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyber-neon/20 bg-cyber-dark/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F29ccaf1d7d264cd2bd339333fe296f0c%2F4ecd21b2dfb64ce481313888fb98d440?format=webp&width=80"
                alt="NimRev Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <h1 className="text-lg sm:text-2xl font-bold neon-text text-cyber-neon title-3d">
                $VERM
              </h1>
            </div>

            {/* Network & Wallet */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge
                variant="secondary"
                className="bg-cyber-dark border-cyber-neon text-cyber-light text-xs sm:text-sm px-2 sm:px-3"
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Solana Network</span>
                <span className="sm:hidden">Solana</span>
              </Badge>

              <WalletButton onConnect={() => {}} />

              {connected && (
                <Badge
                  variant="default"
                  className="bg-cyber-green/20 border-cyber-green text-cyber-green text-xs"
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Connected</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Blockchain Security Tagline */}
            <div className="mb-6">
              <p className="text-lg md:text-xl text-cyber-blue font-semibold tracking-wide uppercase mb-2">
                Blockchain Security & Intelligence
              </p>
            </div>

            <h1 className="text-6xl md:text-8xl title-3d mb-6 bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green bg-clip-text text-transparent">
              $VERM AIRDROP
            </h1>
            <p className="text-xl md:text-2xl text-cyber-light/80 mb-8">
              Join the revolution. Claim your share of the future.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cyber-green" />
                <span>Total Supply: 1,000,000,000 VERM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-cyber-yellow" />
                <span>50% LP Locked 1 Year</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyber-blue" />
                <span>Community Driven</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-8">
            <CountdownTimer />
          </div>

          {/* Token Info Card */}
          <Card className="mb-8 cyber-border bg-cyber-dark/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyber-neon flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Token Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-cyber-light/60">
                    Contract Address
                  </p>
                  <p className="font-mono text-sm bg-cyber-darker p-2 rounded border border-cyber-neon/20">
                    Auu4U7cVjm41yVnVtBCwHW2FBAKznPgLR7hQf4Esjups
                  </p>
                </div>
                <div>
                  <p className="text-sm text-cyber-light/60">Network</p>
                  <p className="text-cyber-green font-semibold">
                    Solana Mainnet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Flow */}
          <div className="mb-8">
            <VerificationFlow
              onComplete={handleRegistrationComplete}
              existingRegistration={registration || undefined}
            />
          </div>

          {/* Airdrop Info */}
          {registration?.social_verified && (
            <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-cyber-green">
                  🎉 Congratulations!
                </CardTitle>
                <CardDescription className="text-cyber-light/60">
                  You're eligible for the $VERM airdrop
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-cyber-green mb-4">
                  Share of
                </div>
                <div className="text-4xl font-bold text-cyber-neon mb-2">
                  1,000,000
                </div>
                <div className="text-xl text-cyber-light/80 mb-4">
                  VERM Tokens Reserved
                </div>
                <div className="space-y-2 text-sm text-cyber-light/60">
                  <p>✅ All verification steps completed</p>
                  <p>✅ Registration submitted successfully</p>
                  <p>⏳ Airdrop distribution coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Official Links & Contact */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Official Links */}
              <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyber-neon text-lg">
                    Official Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a
                    href="https://nimrev.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full p-3 rounded-lg bg-cyber-darker border border-cyber-neon/20 hover:border-cyber-neon/40 hover:bg-cyber-darker/80 transition-all group"
                  >
                    <Globe className="w-5 h-5 mr-2 text-cyber-blue" />
                    <span className="text-cyber-light group-hover:text-cyber-neon">
                      NimRev.xyz
                    </span>
                    <ExternalLink className="w-4 h-4 ml-2 text-cyber-light/60" />
                  </a>
                  <a
                    href="https://nimrev.xyz/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full p-3 rounded-lg bg-cyber-darker border border-cyber-neon/20 hover:border-cyber-neon/40 hover:bg-cyber-darker/80 transition-all group"
                  >
                    <Shield className="w-5 h-5 mr-2 text-cyber-green" />
                    <span className="text-cyber-light group-hover:text-cyber-neon">
                      Documentation
                    </span>
                    <ExternalLink className="w-4 h-4 ml-2 text-cyber-light/60" />
                  </a>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyber-neon text-lg">
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a
                    href="mailto:support@nimrev.xyz"
                    className="flex items-center justify-center w-full p-3 rounded-lg bg-cyber-darker border border-cyber-neon/20 hover:border-cyber-neon/40 hover:bg-cyber-darker/80 transition-all group"
                  >
                    <Mail className="w-5 h-5 mr-2 text-cyber-pink" />
                    <span className="text-cyber-light group-hover:text-cyber-neon">
                      support@nimrev.xyz
                    </span>
                  </a>
                  <div className="text-center text-cyber-light/60 text-sm">
                    <p className="mb-2">Blockchain Security & Intelligence</p>
                    <p>Built on Solana • Secured by Innovation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
