import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, LayoutDashboard,FolderOpenIcon , Package, Calendar, FolderOpen, Settings, LogOut, User, ChevronDown, Library, CreditCard, Crown, FolderOpenDot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { projectsApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { LanguageSelector } from '../LanguageSelector';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Logo from '../Logo';

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

    try {
      const { project } = await projectsApi.get(projectId);
      setProducts(
        project.products
          .filter((product) => product.status === 'ACTIVE')
          .map((product) => ({ id: product.id, name: product.name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    } catch {
      setProducts([]);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isProjectView = !!projectId;

  const navItems = [
    { icon: FolderOpenIcon, label: 'Projects', path: '/dashboard' },
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
    <div className="min-h-screen max-h-[100vh] overflow-x-hidden overflow-y-auto flex px-2 py-3 background gap-2">
      <aside className="w-64 bg-[var(--bg-secondary)] rounded-xl flex flex-col">
        <div className="px-6 pt-6 pb-2">
          <Logo size="md" />
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {!isProjectView && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                ${isActive(item.path)
                  ? 'bg-[var(--bg-primary)] text-white'
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
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--brand-primary)]/10 to-purple-600/10 border border-[var(--brand-primary)] hover:border-[var(--brand-primary)]/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-[var(--color-ai-purple)]" />
                <span className="text-xs font-medium text-gray-400">Current Plan</span>
              </div>
              <p className="text-sm font-semibold text-[var(--brand-primary)] capitalize">
                {subscription?.plan || 'MVP'}
              </p>
            </div>
          </Link>
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
      <main className='flex-1 overflow-hidden flex flex-col gap-2'>
        <div className="flex justify-between p-3 bg-[var(--bg-secondary)] rounded-xl">
          <label htmlFor="search-atelia" className='flex items-center relative'>
              <Search className="w-4 h-4 text-gray-500 absolute left-3" />
            <input id='search-atelia' type="text" className='min-w-80 pt-2 pb-2 ps-11 bg-[var(--bg-primary)] text-white placeholder:text-[var(--text-secondary)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]' placeholder='Search...' />
          </label>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <User className="w-5 h-5 text-black" />
            </div>
            {/* <div class                                                                               */}
          </div>
        </div>
        <div className="flex-1 bg-[var(--bg-secondary)] h-full rounded-xl overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
