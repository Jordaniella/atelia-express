import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Image, Workflow, TrendingUp, ArrowLeft, Library, Sparkles, Zap, Target, Lightbulb, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  positioning_statement: string | null;
  core_promise: string | null;
  unique_mechanism: string | null;
  key_offer: string | null;
}

interface ReadinessScore {
  content: { current: number; target: number };
  visuals: { current: number; target: number };
  automation: { current: number; target: number };
}

export function DashboardHome() {
  const { user } = useAuth();
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<ReadinessScore>({
    content: { current: 0, target: 5 },
    visuals: { current: 0, target: 4 },
    automation: { current: 0, target: 1 },
  });
  const [stats, setStats] = useState({
    totalContent: 0,
    totalVisuals: 0,
    totalAutomations: 0,
  });

  useEffect(() => {
    loadProject();
    loadStats();
    loadReadiness();
  }, [user, projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (!error && data) {
      setProject(data);
    }

    setLoading(false);
  };

  const loadReadiness = async () => {
    if (!projectId) return;

    const { count: contentCount } = await supabase
      .from('content_assets')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: visualCount } = await supabase
      .from('visual_generations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: automationCount } = await supabase
      .from('automations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    setReadiness({
      content: { current: contentCount || 0, target: 5 },
      visuals: { current: visualCount || 0, target: 4 },
      automation: { current: automationCount || 0, target: 1 },
    });
  };

  const loadStats = async () => {
    if (!projectId) return;

    const { count: contentCount } = await supabase
      .from('content_assets')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: visualCount } = await supabase
      .from('visual_generations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: automationCount } = await supabase
      .from('automations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    setStats({
      totalContent: contentCount || 0,
      totalVisuals: visualCount || 0,
      totalAutomations: automationCount || 0,
    });
  };

  const calculateOverallReadiness = () => {
    const total = readiness.content.current + readiness.visuals.current + readiness.automation.current;
    const maxTotal = readiness.content.target + readiness.visuals.target + readiness.automation.target;
    return Math.round((total / maxTotal) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center">
            <h2 className="text-2xl mb-4">Project not found</h2>
            <Link to="/dashboard">
              <Button>Back to Projects</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </Button>
            </Link>
            <h1 className="text-4xl mb-2">{project.name}</h1>
            <p className="text-gray-300">{project.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card gradient>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl mb-2">Launch Readiness</h2>
                    <p className="text-gray-300">Your overall preparation score</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-[var(--brand-primary)]" />
                      <span className="text-4xl font-bold">{calculateOverallReadiness()}%</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Ready to Launch</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[var(--text-primary)]" />
                        <span className="font-medium">Content</span>
                      </div>
                      <span className="text-sm text-gray-300">
                        {readiness.content.current}/{readiness.content.target}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-purple-400 transition-all duration-500"
                        style={{ width: `${(readiness.content.current / readiness.content.target) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="w-5 h-5 text-[var(--text-primary)]" />
                        <span className="font-medium">Visuals</span>
                      </div>
                      <span className="text-sm text-gray-300">
                        {readiness.visuals.current}/{readiness.visuals.target}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--brand-secondary)] to-blue-400 transition-all duration-500"
                        style={{ width: `${(readiness.visuals.current / readiness.visuals.target) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-[var(--brand-primary)]" />
                        <span className="font-medium">Automation</span>
                      </div>
                      <span className="text-sm text-gray-300">
                        {readiness.automation.current}/{readiness.automation.target}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${(readiness.automation.current / readiness.automation.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Launch Strategy Snapshot</h2>
                  <p className="text-gray-300">Your core messaging framework</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-[var(--text-primary)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)] mb-1">Positioning</p>
                      <p className="text-sm text-[var(--text-muted)]">{project.positioning_statement || 'Not defined yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[var(--color-cyan-accent)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)] mb-1">Core Promise</p>
                      <p className="text-sm text-[var(--text-muted)]">{project.core_promise || 'Not defined yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[var(--brand-primary)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)] mb-1">Unique Mechanism</p>
                      <p className="text-sm text-[var(--text-muted)]">{project.unique_mechanism || 'Not defined yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[var(--brand-primary)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[var(--brand-primary)] mb-1">Key Offer</p>
                      <p className="text-sm text-[var(--text-muted)]">{project.key_offer || 'Not defined yet'}</p>
                    </div>
                  </div>
                </div>

                <Link to={`/dashboard/project/${projectId}/details`}>
                  <Button variant="ghost" className="w-full text-sm mt-2">
                    Edit Strategy
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--brand-primary)]/10">
                  <FileText className="w-6 h-6 text-[var(--text-primary)]" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalContent}</p>
                  <p className="text-sm text-[var(--text-muted)]">Content Assets</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-cyan-accent)]/10">
                  <Image className="w-6 h-6 text-[var(--color-cyan-accent)]" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalVisuals}</p>
                  <p className="text-sm text-gray-400">Visual Generations</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Workflow className="w-6 h-6 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalAutomations}</p>
                  <p className="text-sm text-gray-400">Active Automations</p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to={`/dashboard/project/${projectId}/content`}>
                <Card hover>
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Generate Content</h3>
                      <p className="text-gray-400 text-sm">Create marketing copy with AI agents</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to={`/dashboard/project/${projectId}/visuals`}>
                <Card hover>
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">AI Visual Studio</h3>
                      <p className="text-gray-400 text-sm">Create stunning product visuals</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to={`/dashboard/project/${projectId}/automation`}>
                <Card hover>
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Automation Engine</h3>
                      <p className="text-gray-400 text-sm">Build marketing automation flows</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
