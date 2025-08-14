import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Mail, Twitter, Send, Loader2 } from 'lucide-react';
import { Registration, RegistrationRequest, RegistrationResponse } from '@shared/registration';

interface RegistrationFormProps {
  onRegistrationComplete: (registration: Registration) => void;
  existingRegistration?: Registration;
}

export const RegistrationForm = ({ onRegistrationComplete, existingRegistration }: RegistrationFormProps) => {
  const { publicKey, connected } = useWallet();
  const [formData, setFormData] = useState({
    email: existingRegistration?.email || '',
    twitter: existingRegistration?.twitter || '',
    telegram: existingRegistration?.telegram || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const registrationData: RegistrationRequest = {
        email: formData.email,
        twitter: formData.twitter || undefined,
        telegram: formData.telegram || undefined,
        wallet_address: publicKey.toString(),
      };

      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result: RegistrationResponse = await response.json();

      if (result.success && result.registration) {
        onRegistrationComplete(result.registration);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingRegistration) {
    return (
      <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyber-neon flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Registration Complete
          </CardTitle>
          <CardDescription className="text-cyber-light/60">
            Your wallet is registered for the $VERM airdrop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-cyber-light/60">Email</Label>
              <p className="text-cyber-light">{existingRegistration.email}</p>
            </div>
            {existingRegistration.twitter && (
              <div>
                <Label className="text-cyber-light/60">Twitter</Label>
                <p className="text-cyber-light">@{existingRegistration.twitter}</p>
              </div>
            )}
            {existingRegistration.telegram && (
              <div>
                <Label className="text-cyber-light/60">Telegram</Label>
                <p className="text-cyber-light">@{existingRegistration.telegram}</p>
              </div>
            )}
            <div>
              <Label className="text-cyber-light/60">Status</Label>
              <div className="flex space-x-2 mt-1">
                <Badge 
                  variant={existingRegistration.social_verified ? "default" : "secondary"}
                  className={existingRegistration.social_verified ? "bg-cyber-green/20 border-cyber-green text-cyber-green" : ""}
                >
                  {existingRegistration.social_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyber-neon">Register for Airdrop</CardTitle>
        <CardDescription className="text-cyber-light/60">
          Complete your registration to be eligible for the $VERM airdrop
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-cyber-light">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-cyber-light/60" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-cyber-darker border-cyber-neon/20 text-cyber-light"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-cyber-light">
              Twitter Username (Optional)
            </Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-3 h-4 w-4 text-cyber-light/60" />
              <Input
                id="twitter"
                type="text"
                placeholder="your_handle"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="pl-10 bg-cyber-darker border-cyber-neon/20 text-cyber-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram" className="text-cyber-light">
              Telegram Username (Optional)
            </Label>
            <div className="relative">
              <Send className="absolute left-3 top-3 h-4 w-4 text-cyber-light/60" />
              <Input
                id="telegram"
                type="text"
                placeholder="your_handle"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                className="pl-10 bg-cyber-darker border-cyber-neon/20 text-cyber-light"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-cyber-red/20 border border-cyber-red/40 text-cyber-red">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!connected || isSubmitting}
            className="w-full bg-cyber-pink hover:bg-cyber-pink/80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              'Register for Airdrop'
            )}
          </Button>

          {!connected && (
            <p className="text-center text-sm text-cyber-light/60">
              Connect your wallet to register
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
