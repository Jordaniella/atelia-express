import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Package, Calendar, FolderOpen, Settings, LogOut, User, ChevronDown, Library, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LanguageSelector } from '../LanguageSelector';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface Product {
  id: string;
  name: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProducts();
    }
  }, [projectId]);

  const loadProducts = async () => {
    if (!projectId) return;

    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('name');

    if (data) {
      setProducts(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isProjectView = !!projectId;

  const navItems = [
    { icon: LayoutDashboard, label: 'Projects', path: '/dashboard' },
    { icon: CreditCard, label: 'Billing', path: '/dashboard/billing' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const projectNavItems = projectId ? [
    { icon: LayoutDashboard, label: 'Overview', path: `/dashboard/project/${projectId}` },
    { icon: Library, label: 'Content Library', path: `/dashboard/project/${projectId}/content-library` },
    { icon: Package, label: 'Products', path: `/dashboard/project/${projectId}/products` },
    { icon: Calendar, label: 'Calendar', path: `/dashboard/project/${projectId}/calendar` },
    { icon: FolderOpen, label: 'Gallery', path: `/dashboard/project/${projectId}/gallery` },
  ] : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 glass-effect border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--color-ai-purple)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AtelIA</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {!isProjectView && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive(item.path)
                  ? 'bg-[var(--color-ai-purple)] text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {projectNavItems.length > 0 && (
            <>
              {projectNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive(item.path)
                      ? 'bg-[var(--color-ai-purple)] text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </>
          )}

          {products.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <button
                  onClick={() => setShowProducts(!showProducts)}
                  className="w-full flex items-center justify-between px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showProducts ? '' : '-rotate-90'}`} />
                </button>
              </div>
              {showProducts && products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--color-cyan-accent)]" />
                  <span className="truncate">{product.name}</span>
                </div>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-4 pb-2">
            <LanguageSelector />
          </div>
          <Link to="/dashboard/billing">
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-ai-purple)]/10 to-purple-600/10 border border-[var(--color-ai-purple)]/30 hover:border-[var(--color-ai-purple)]/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-[var(--color-ai-purple)]" />
                <span className="text-xs font-medium text-gray-400">Current Plan</span>
              </div>
              <p className="text-sm font-semibold text-white capitalize">
                {subscription?.plan || 'Free'}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-[var(--color-ai-purple)] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
