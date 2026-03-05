import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Plan = 'trial' | 'starter' | 'pro' | 'scale';
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

interface Subscription {
  id: string;
  user_id: string;
  plan: Plan;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  trial_ends_at?: string;
  generation_limit: number;
  image_limit: number;
}

interface Usage {
  content_generations: number;
  image_generations: number;
  projects_created: number;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  usage: Usage;
  loading: boolean;
  hasAccess: boolean;
  isTrial: boolean;
  isStarter: boolean;
  isPro: boolean;
  isScale: boolean;
  trialDaysLeft: number | null;
  canGenerateContent: (type: string) => boolean;
  canGenerateImage: boolean;
  canUseAutomation: boolean;
  generationsLeft: number;
  imagesLeft: number;
  refreshSubscription: () => Promise<void>;
  incrementUsage: (type: 'content' | 'image') => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>({ content_generations: 0, image_generations: 0, projects_created: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
      loadUsage();
    } else {
      setSubscription(null);
      setUsage({ content_generations: 0, image_generations: 0, projects_created: 0 });
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSubscription(data as Subscription);
    } else {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3);

      const { data: newSub } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan: 'trial',
          status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          generation_limit: 10,
          image_limit: 0,
        })
        .select()
        .single();

      if (newSub) {
        setSubscription(newSub as Subscription);
      }
    }
    setLoading(false);
  };

  const loadUsage = async () => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .maybeSingle();

    if (data) {
      setUsage({
        content_generations: data.content_generations,
        image_generations: data.image_generations,
        projects_created: data.projects_created,
      });
    } else {
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          month: currentMonth,
          content_generations: 0,
          image_generations: 0,
          projects_created: 0,
        });
    }
  };

  const incrementUsage = async (type: 'content' | 'image') => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const field = type === 'content' ? 'content_generations' : 'image_generations';

    await supabase
      .from('usage_tracking')
      .update({
        [field]: (usage[field] || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('month', currentMonth);

    await loadUsage();
  };

  const refreshSubscription = async () => {
    await loadSubscription();
    await loadUsage();
  };

  const hasAccess = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrial = hasAccess && subscription?.plan === 'trial';
  const isStarter = hasAccess && subscription?.plan === 'starter';
  const isPro = hasAccess && (subscription?.plan === 'pro' || subscription?.plan === 'scale');
  const isScale = hasAccess && subscription?.plan === 'scale';

  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const generationsLeft = subscription?.generation_limit === -1
    ? -1
    : Math.max(0, (subscription?.generation_limit || 0) - usage.content_generations);

  const imagesLeft = subscription?.image_limit === -1
    ? -1
    : Math.max(0, (subscription?.image_limit || 0) - usage.image_generations);

  const canGenerateContent = (type: string) => {
    if (!hasAccess) return false;
    if (isTrial && type !== 'email') return false;
    if (generationsLeft === 0) return false;
    return true;
  };

  const canGenerateImage = hasAccess && !isTrial && imagesLeft !== 0;
  const canUseAutomation = hasAccess && !isTrial;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        loading,
        hasAccess,
        isTrial,
        isStarter,
        isPro,
        isScale,
        trialDaysLeft,
        canGenerateContent,
        canGenerateImage,
        canUseAutomation,
        generationsLeft,
        imagesLeft,
        refreshSubscription,
        incrementUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
