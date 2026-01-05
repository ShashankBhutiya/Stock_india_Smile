import { useNavigate } from 'react-router-dom';
import { User, LogOut, BookOpen, Shield, TrendingUp, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useVirtualAccount } from '@/hooks/useVirtualAccount';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Disclaimer } from '@/components/Disclaimer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { balance, initialBalance } = useVirtualAccount();
  const { summary } = usePortfolio();

  const totalValue = summary.totalValue + balance;
  const overallPnL = totalValue - initialBalance;
  const overallPnLPercent = (overallPnL / initialBalance) * 100;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account settings</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-foreground">
                  {user?.user_metadata?.full_name || 'Investor'}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Capital</span>
              <span className="font-semibold">₹{initialBalance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Value</span>
              <span className="font-semibold">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overall P&L</span>
              <span className={`font-semibold ${overallPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {overallPnL >= 0 ? '+' : ''}₹{overallPnL.toFixed(2)} ({overallPnL >= 0 ? '+' : ''}{overallPnLPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Educational Resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This simulator helps you learn stock market investing concepts without financial risk.
            </p>
            <div className="space-y-2 mt-3">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">Practice buying and selling stocks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">Understand P&L and portfolio management</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">Learn to read stock charts and data</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">Build investing confidence</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Disclaimer />
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
