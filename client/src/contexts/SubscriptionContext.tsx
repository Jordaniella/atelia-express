import { createContext, useContext, ReactNode } from 'react';

type Plan = 'mvp';

interface Usage {
  content_generations: number;
  image_generations: number;
  projects_created: number;
}

interface SubscriptionContextType {
  subscription: { plan: Plan; status: 'active'; generation_limit: number; image_limit: number; current_period_end?: string; stripe_customer_id?: string };
  usage: Usage;
  loading: boolean;
  hasAccess: boolean;
  isTrial: boolean;
  isStarter: boolean;
  isPro: boolean;
  isScale: boolean;
  trialDaysLeft: number | null;
  canGenerateContent: (_type: string) => boolean;
  canGenerateImage: boolean;
  canUseAutomation: boolean;
  generationsLeft: number;
  imagesLeft: number;
  refreshSubscription: () => Promise<void>;
  incrementUsage: (_type: 'content' | 'image') => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const mvpSubscription: SubscriptionContextType = {
  subscription: { plan: 'mvp', status: 'active', generation_limit: -1, image_limit: -1 },
  usage: { content_generations: 0, image_generations: 0, projects_created: 0 },
  loading: false,
  hasAccess: true,
  isTrial: false,
  isStarter: true,
  isPro: true,
  isScale: false,
  trialDaysLeft: null,
  canGenerateContent: () => true,
  canGenerateImage: true,
  canUseAutomation: false,
  generationsLeft: -1,
  imagesLeft: -1,
  refreshSubscription: async () => undefined,
  incrementUsage: async () => undefined,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  return (
    <SubscriptionContext.Provider value={mvpSubscription}>
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
