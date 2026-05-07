import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CreditCard } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface SubscriptionGateProps {
  children: ReactNode;
  requiredPlan?: 'pro' | 'scale';
  feature: string;
}

export function SubscriptionGate({ children, requiredPlan, feature }: SubscriptionGateProps) {
  const { hasAccess, isPro, isScale, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Subscription Required</h3>
          <p className="text-gray-400 mb-6">
            {feature} is available for paid subscribers. Upgrade your plan to unlock this feature and more.
          </p>
          <Link to="/dashboard/billing">
            <Button className="w-full">
              <CreditCard className="w-5 h-5" />
              View Plans
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (requiredPlan === 'pro' && !isPro) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Pro Plan Required</h3>
          <p className="text-gray-400 mb-6">
            {feature} is available on the Pro plan and above. Upgrade to unlock advanced features.
          </p>
          <Link to="/dashboard/billing">
            <Button className="w-full">
              <CreditCard className="w-5 h-5" />
              Upgrade to Pro
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (requiredPlan === 'scale' && !isScale) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Scale Plan Required</h3>
          <p className="text-gray-400 mb-6">
            {feature} is available on the Scale plan. Upgrade to unlock enterprise features.
          </p>
          <Link to="/dashboard/billing">
            <Button className="w-full">
              <CreditCard className="w-5 h-5" />
              Upgrade to Scale
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
