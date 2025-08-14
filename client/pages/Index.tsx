import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { WalletButton } from '@/components/WalletButton';
import { RegistrationForm } from '@/components/RegistrationForm';
import { CheckCircle2, Twitter, Send, Wallet, Users, Lock, Zap, Globe, Shield } from 'lucide-react';
import { Registration, RegistrationResponse, VerificationRequest } from '@shared/registration';

interface SocialVerification {
  twitter: boolean;
  telegram: boolean;
}

export default function Index() {
  const { publicKey, connected } = useWallet();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [socialVerified, setSocialVerified] = useState<SocialVerification>({
    twitter: false,
    telegram: false
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
            telegram: result.registration.social_verified
          });
        }
      }
    } catch (error) {
      console.error('Error checking registration:', error);
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

      const response = await fetch('/api/registration/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      if (response.ok) {
        const result: RegistrationResponse = await response.json();
        if (result.success && result.registration) {
          setRegistration(result.registration);
          setSocialVerified(prev => ({ ...prev, twitter: true }));
        }
      }
    } catch (error) {
      console.error('Twitter verification error:', error);
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

      const response = await fetch('/api/registration/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      if (response.ok) {
        const result: RegistrationResponse = await response.json();
        if (result.success && result.registration) {
          setRegistration(result.registration);
          setSocialVerified(prev => ({ ...prev, telegram: true }));
        }
      }
    } catch (error) {
      console.error('Telegram verification error:', error);
    }
  };

  const claimAirdrop = async () => {
    if (!isEligible) return;
    
    // Mock claim process
    setClaimProgress(0);
    const interval = setInterval(() => {
      setClaimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-cyber-darker text-cyber-light overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-dark via-cyber-darker to-black"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyber-pink rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyber-blue rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyber-green rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-cyber-green text-xs font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animation: 'matrix-rain 3s linear infinite'
            }}
          >
            {Math.random().toString(36).substr(2, 1)}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-cyber-neon/20 bg-cyber-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyber-pink to-cyber-blue rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold neon-text text-cyber-neon">$VERM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-cyber-dark border-cyber-neon text-cyber-light">
                <Globe className="w-4 h-4 mr-1" />
                Solana Network
              </Badge>
              {walletConnected && (
                <Badge variant="default" className="bg-cyber-green/20 border-cyber-green text-cyber-green">
                  <Wallet className="w-4 h-4 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green bg-clip-text text-transparent">
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
                  <p className="text-sm text-cyber-light/60">Contract Address</p>
                  <p className="font-mono text-sm bg-cyber-darker p-2 rounded border border-cyber-neon/20">
                    Auu4U7cVjm41yVnVtBCwHW2FBAKznPgLR7hQf4Esjups
                  </p>
                </div>
                <div>
                  <p className="text-sm text-cyber-light/60">Network</p>
                  <p className="text-cyber-green font-semibold">Solana Mainnet</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Process */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Verification Steps */}
            <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyber-neon">Verification Required</CardTitle>
                <CardDescription className="text-cyber-light/60">
                  Complete all steps to become eligible for the airdrop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Connection */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-cyber-neon/20 bg-cyber-darker/50">
                  <div className="flex items-center space-x-3">
                    <Wallet className={`w-6 h-6 ${walletConnected ? 'text-cyber-green' : 'text-cyber-light/60'}`} />
                    <div>
                      <p className="font-medium">Connect Wallet</p>
                      <p className="text-sm text-cyber-light/60">Solana-compatible wallet required</p>
                    </div>
                  </div>
                  {walletConnected ? (
                    <CheckCircle2 className="w-6 h-6 text-cyber-green" />
                  ) : (
                    <Button onClick={connectWallet} size="sm" className="bg-cyber-pink hover:bg-cyber-pink/80">
                      Connect
                    </Button>
                  )}
                </div>

                {/* Twitter Verification */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-cyber-neon/20 bg-cyber-darker/50">
                  <div className="flex items-center space-x-3">
                    <Twitter className={`w-6 h-6 ${socialVerified.twitter ? 'text-cyber-green' : 'text-cyber-light/60'}`} />
                    <div>
                      <p className="font-medium">Follow @nimrevxyz</p>
                      <p className="text-sm text-cyber-light/60">Twitter verification required</p>
                    </div>
                  </div>
                  {socialVerified.twitter ? (
                    <CheckCircle2 className="w-6 h-6 text-cyber-green" />
                  ) : (
                    <Button onClick={verifyTwitter} size="sm" className="bg-cyber-blue hover:bg-cyber-blue/80">
                      Verify
                    </Button>
                  )}
                </div>

                {/* Telegram Verification */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-cyber-neon/20 bg-cyber-darker/50">
                  <div className="flex items-center space-x-3">
                    <Send className={`w-6 h-6 ${socialVerified.telegram ? 'text-cyber-green' : 'text-cyber-light/60'}`} />
                    <div>
                      <p className="font-medium">Join @nimrevxyz</p>
                      <p className="text-sm text-cyber-light/60">Telegram verification required</p>
                    </div>
                  </div>
                  {socialVerified.telegram ? (
                    <CheckCircle2 className="w-6 h-6 text-cyber-green" />
                  ) : (
                    <Button onClick={verifyTelegram} size="sm" className="bg-cyber-purple hover:bg-cyber-purple/80">
                      Verify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Claim Card */}
            <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyber-neon">Claim Your Airdrop</CardTitle>
                <CardDescription className="text-cyber-light/60">
                  Ready to claim when all verifications are complete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyber-green mb-2">10,000</div>
                  <div className="text-cyber-light/60">$VERM Tokens</div>
                </div>

                <Separator className="bg-cyber-neon/20" />

                {claimProgress > 0 && claimProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Claiming...</span>
                      <span>{claimProgress}%</span>
                    </div>
                    <Progress value={claimProgress} className="w-full" />
                  </div>
                )}

                <Button
                  onClick={claimAirdrop}
                  disabled={!isEligible || (claimProgress > 0 && claimProgress < 100)}
                  className={`w-full h-12 text-lg font-semibold ${
                    isEligible 
                      ? 'bg-cyber-green hover:bg-cyber-green/80 cyber-glow' 
                      : 'bg-cyber-light/20'
                  }`}
                >
                  {claimProgress === 100 ? 'Claimed!' : 
                   claimProgress > 0 ? 'Claiming...' : 
                   isEligible ? 'Claim Airdrop' : 'Complete Verification'}
                </Button>

                {!isEligible && (
                  <p className="text-center text-sm text-cyber-light/60">
                    Complete all verification steps to enable claiming
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center text-cyber-light/60">
            <p className="mb-4">
              Built on Solana • Secured by the community • Powered by innovation
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <a href="#" className="hover:text-cyber-neon transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyber-neon transition-colors">Tokenomics</a>
              <a href="#" className="hover:text-cyber-neon transition-colors">Roadmap</a>
              <a href="#" className="hover:text-cyber-neon transition-colors">Community</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
