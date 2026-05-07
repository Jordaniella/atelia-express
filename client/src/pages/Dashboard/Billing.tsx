import { useState } from 'react';
import { Check, CreditCard, AlertCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useToast } from '../../contexts/ToastContext';

export function Billing() {
  const { subscription, hasAccess, isTrial, trialDaysLeft, generationsLeft, imagesLeft } = useSubscription();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'trial',
      name: 'Trial',
      price: 0,
      interval: '3 days',
      features: [
        '1 Active Project',
        '10 Email Generations',
        'Email Only',
        'No Visual Studio',
        'No Automation',
        'Community Support',
      ],
      limits: '10 generations total',
      recommended: false,
      available: false,
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      features: [
        '1 Active Project',
        '50 Content Generations',
        'All Content Types',
        '10 Visual Assets/month',
        'Email Support',
        'Content Library Access',
      ],
      limits: '50 generations, 10 images',
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      interval: 'month',
      features: [
        '5 Active Projects',
        '200 Content Generations',
        'All Content Types',
        '50 Visual Assets/month',
        'Automation Engine',
        'Priority Support',
        'Advanced Analytics',
      ],
      limits: '200 generations, 50 images',
      recommended: true,
    },
    {
      id: 'scale',
      name: 'Scale',
      price: 299,
      interval: 'month',
      features: [
        'Unlimited Projects',
        'Unlimited Generations',
        'Full AI Suite',
        'Unlimited Visual Assets',
        'Advanced Automation',
        'API Access',
        'Dedicated Support',
        'Custom Integrations',
      ],
      limits: 'Unlimited everything',
      recommended: false,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(true);

    showToast(
      'To implement Stripe payments, you need to add your Stripe secret key. Visit https://bolt.new/setup/stripe for setup instructions.',
      'info'
    );

    setLoading(false);
  };

  const handleManageSubscription = () => {
    showToast(
      'Customer portal will be available once Stripe is configured. Visit https://bolt.new/setup/stripe',
      'info'
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl mb-2">Billing & Subscription</h1>
            <p className="text-gray-400">Manage your subscription and billing information</p>
          </div>

          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 capitalize">
                    Current Plan: {subscription?.plan || 'Free'}
                  </h3>
                    <p className="text-gray-400 mb-2">
                      Status: <span className={`capitalize ${
                        hasAccess ? 'text-green-400' : 'text-red-400'
                      }`}>{subscription?.status || 'inactive'}</span>
                    </p>
                    {isTrial && trialDaysLeft !== null && (
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {subscription?.current_period_end && !isTrial && (
                      <p className="text-sm text-gray-500">
                        Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-3 space-y-1">
                      {generationsLeft !== -1 && (
                        <p className="text-sm text-gray-400">
                          Content generations: <span className="text-white font-medium">{generationsLeft}</span> left this month
                        </p>
                      )}
                      {imagesLeft !== -1 && (
                        <p className="text-sm text-gray-400">
                          Visual assets: <span className="text-white font-medium">{imagesLeft}</span> left this month
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {subscription?.stripe_customer_id && (
                  <Button onClick={handleManageSubscription} variant="outline">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </Card>

          {isTrial && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-500 mb-1">You're on a Trial Plan</p>
                <p className="text-sm text-gray-400">
                  You have {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left with {generationsLeft} email generation{generationsLeft !== 1 ? 's' : ''} remaining.
                  Upgrade now to unlock all features and unlimited content types.
                </p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl mb-6">Available Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.recommended ? 'ring-2 ring-[var(--color-ai-purple)]' : ''
                  } ${plan.id === 'trial' ? 'opacity-60' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[var(--color-ai-purple)] to-purple-600 text-white text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-gray-400">/{plan.interval}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{plan.limits}</p>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-[var(--color-ai-purple)] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.id === subscription?.plan ? 'outline' : 'primary'}
                      disabled={plan.id === subscription?.plan || loading || plan.id === 'trial'}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {plan.id === subscription?.plan ? 'Current Plan' : plan.id === 'trial' ? 'Trial Only' : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Need Custom Solutions?</h3>
              <p className="text-gray-400">
                Looking for enterprise features, custom integrations, or dedicated support? Contact our sales team for a tailored plan.
              </p>
              <Button variant="outline">Contact Sales</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
