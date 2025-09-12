import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users } from "lucide-react";
import type { ReferralResponse } from "@shared/registration";

export default function ReferralShare() {
  const { publicKey, connected } = useWallet();
  const [referralCode, setReferralCode] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

  const link = useMemo(() => {
    if (!referralCode) return "";
    const url = new URL(window.location.href);
    url.searchParams.set("ref", referralCode);
    return url.toString();
  }, [referralCode]);

  useEffect(() => {
    if (!connected || !publicKey) return;
    (async () => {
      const res = await fetch(`/api/referral/${publicKey.toString()}`);
      if (res.ok) {
        const json: ReferralResponse = await res.json();
        if (json.success && json.info) {
          setReferralCode(json.info.referral_code);
          setTotal(json.info.total_referred);
        }
      }
    })();
  }, [connected, publicKey]);

  if (!connected) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-cyber-neon flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Invite Friends (Referrals)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-cyber-light/80">
          Share your referral link. Successful registrations credited to you.
        </div>
        <div className="flex gap-2">
          <Input value={link} readOnly className="bg-cyber-darker border-cyber-neon/20 text-cyber-light" />
          <Button
            onClick={() => {
              if (link) navigator.clipboard.writeText(link);
            }}
            className="bg-cyber-pink hover:bg-cyber-pink/80"
          >
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
        </div>
        <Badge className="bg-cyber-green/20 border-cyber-green text-cyber-green">Total referred: {total}</Badge>
      </CardContent>
    </Card>
  );
}
