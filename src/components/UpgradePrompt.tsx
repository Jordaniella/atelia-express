import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredPlan?: 'starter' | 'pro' | 'scale';
  inline?: boolean;
}

export function UpgradePrompt({
  feature,
  description,
  requiredPlan = 'pro',
  inline = false
}: UpgradePromptProps) {
  const planNames = {
    starter: 'Starter',
    pro: 'Pro',
    scale: 'Scale',
  };

  if (inline) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-ai-purple)]/10 to-purple-600/10 border border-[var(--color-ai-purple)]/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{feature}</h4>
            <p className="text-sm text-gray-400 mb-3">{description}</p>
            <Link to="/dashboard/billing">
              <Button size="sm">
                <Sparkles className="w-4 h-4" />
                Upgrade to {planNames[requiredPlan]}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Upgrade to Unlock</h3>
        <p className="text-xl text-white mb-2">{feature}</p>
        <p className="text-gray-400 mb-6">{description}</p>
        <Link to="/dashboard/billing">
          <Button className="w-full">
            <Sparkles className="w-5 h-5" />
            Upgrade to {planNames[requiredPlan]}
          </Button>
        </Link>
      </Card>
    </div>
  );
}
