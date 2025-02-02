import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Twitter, Instagram, Facebook, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialAccount {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook';
  username: string;
  connected: boolean;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  authUrl: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2',
    authUrl: 'https://twitter.com/oauth', // Replace with actual OAuth URL
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    authUrl: 'https://instagram.com/oauth', // Replace with actual OAuth URL
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#4267B2',
    authUrl: 'https://facebook.com/oauth', // Replace with actual OAuth URL
  },
];

export default function SocialConnections() {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  
  // This would typically come from your backend
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'twitter',
      username: '@johndoe',
      connected: true,
    },
  ]);

  const handleConnect = async (platform: SocialPlatform) => {
    setConnecting(platform.id);
    
    try {
      // Simulate OAuth redirect
      toast({
        title: "Redirecting to " + platform.name,
        description: "You'll be redirected to authorize your account.",
      });
      
      // In reality, you would redirect to the OAuth URL
      window.location.href = platform.authUrl;
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to " + platform.name,
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const getUnconnectedPlatforms = () => {
    return socialPlatforms.filter(
      platform => !connectedAccounts.some(account => account.platform === platform.id)
    );
  };

  return (
    <div className="container max-w-4xl mx-auto space-y-8 p-8 animate-fade-in">
      {/* Connected Accounts Section */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Connected Accounts</CardTitle>
            <CardDescription>
              Your currently connected social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {connectedAccounts.map((account) => {
              const platform = socialPlatforms.find(p => p.id === account.platform);
              if (!platform) return null;
              
              const Icon = platform.icon;
              
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <Icon
                        size={24}
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {account.username}
                      </p>
                    </div>
                  </div>
                  <Check className="text-green-500" size={20} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Available Connections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Available Connections</CardTitle>
          <CardDescription>
            Connect your social media accounts to enhance your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {getUnconnectedPlatforms().map((platform) => {
            const Icon = platform.icon;
            const isConnecting = connecting === platform.id;
            
            return (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    <Icon
                      size={24}
                      style={{ color: platform.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your {platform.name} account
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    "transition-all duration-200 hover:scale-105",
                    isConnecting && "animate-pulse"
                  )}
                  onClick={() => handleConnect(platform)}
                  disabled={isConnecting}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}