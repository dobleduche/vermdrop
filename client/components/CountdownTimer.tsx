import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calculate target date (85 days and 12 hours from now)
    const targetDate = new Date(Date.now() + ((85 * 24 + 12) * 60 * 60 * 1000));

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <Card className="cyber-border bg-cyber-dark/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyber-neon flex items-center justify-center">
          <Clock className="w-6 h-6 mr-2" />
          Airdrop Countdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-cyber-pink neon-text">
              {formatNumber(timeLeft.days)}
            </div>
            <div className="text-xs md:text-sm text-cyber-light/60 uppercase tracking-wide">
              Days
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-cyber-blue neon-text">
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-xs md:text-sm text-cyber-light/60 uppercase tracking-wide">
              Hours
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-cyber-green neon-text">
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-xs md:text-sm text-cyber-light/60 uppercase tracking-wide">
              Minutes
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold text-cyber-yellow neon-text">
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-xs md:text-sm text-cyber-light/60 uppercase tracking-wide">
              Seconds
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-2xl md:text-3xl font-bold text-cyber-neon mb-2">
            1,000,000 VERM
          </div>
          <div className="text-cyber-light/80">
            Total Airdrop Pool
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
