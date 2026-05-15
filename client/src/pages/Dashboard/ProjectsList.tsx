import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, AlertCircle, Sparkles, User } from 'lucide-react';
import { Project, projectsApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useSubscription } from '../../contexts/SubscriptionContext';

export function ProjectsList() {
  const { user } = useAuth();
  const { isTrial, trialDaysLeft, generationsLeft, subscription } = useSubscription();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(user?.name || user?.email || '');
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { projects } = await projectsApi.list();
      setProjects(projects);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColors = {
    draft: 'bg-yellow-500/10 text-yellow-500',
    active: 'bg-green-500/10 text-green-500',
    completed: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl mb-2">Welcome back, {userName || 'User'}</h1>
              <p>Manage your launch projects</p>
            </div>
            <div className="flex items-center gap-4">
              {isTrial && trialDaysLeft !== null && (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                      Trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-[var(--color-ai-purple)]/10 border border-[var(--color-ai-purple)]/30 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-ai-purple)]" />
                    <span className="text-sm font-medium text-[var(--color-ai-purple)]">
                      {generationsLeft} email{generationsLeft !== 1 ? 's' : ''} left
                    </span>
                  </div>
                </div>
              )}
              <Link to="/dashboard/new">
                <Button>
                  <Plus className="w-5 h-5" />
                  New Launch
                </Button>
              </Link>
            </div>
          </div>

          {isTrial && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-[var(--color-ai-purple)]/10 to-purple-600/10 border border-[var(--color-ai-purple)]/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-ai-purple)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">You're on a Trial Plan</p>
                <p className="text-sm mb-3">
                  You have {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left with {generationsLeft} email generation{generationsLeft !== 1 ? 's' : ''} remaining.
                  Upgrade to unlock all content types, visual studio, automation, and more.
                </p>
                <Link to="/dashboard/billing">
                  <Button size="sm">
                    <Sparkles className="w-4 h-4" />
                    View Plans & Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl mb-6">Your Projects</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-ai-purple)]"></div>
              </div>
            ) : projects.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-ai-purple)]/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-[var(--color-ai-purple)]" />
                  </div>
                  <h3 className="text-xl mb-2">No projects yet</h3>
                  <p className="mb-6">Create your first launch project to get started</p>
                  <Link to="/dashboard/new">
                    <Button>
                      <Plus className="w-5 h-5" />
                      Create Project
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Link key={project.id} to={`/dashboard/project/${project.id}`}>
                    <Card hover>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold">{project.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status.toLowerCase() as keyof typeof statusColors] || statusColors.draft}`}>
                            {project.status}
                          </span>
                        </div>

                        <p className=" text-sm line-clamp-2 text-[var(--text-muted)]">
                          {project.description || ''}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
