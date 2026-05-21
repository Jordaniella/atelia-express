import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Workflow, Target, Lightbulb, Zap, Gift, Edit, Package, Calendar as CalendarIcon, FolderOpen, Library } from 'lucide-react';
import { Project as ApiProject, projectsApi, toProjectStatus } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';

interface Project {
  id: string;
  name: string;
  description: string | null;
  target_audience: string;
  brand_tone: string | null;
  launch_date: string | null;
  status: string;
  positioning_statement: string | null;
  core_promise: string | null;
  unique_mechanism: string | null;
  key_offer: string | null;
}

function toViewProject(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    target_audience: project.brief?.targetAudience || '',
    brand_tone: project.brief?.brandTone || null,
    launch_date: project.brief?.launchGoal?.startsWith('Launch date: ')
      ? project.brief.launchGoal.replace('Launch date: ', '')
      : null,
    status: project.status,
    positioning_statement: project.brief?.marketContext || null,
    core_promise: project.brief?.keyMessage || null,
    unique_mechanism: project.brief?.launchGoal || null,
    key_offer: project.brief?.offerDescription || null,
  };
}
export function ProjectDetail() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStrategy, setEditingStrategy] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    positioning_statement: '',
    core_promise: '',
    unique_mechanism: '',
    key_offer: '',
  });
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    description: '',
    target_audience: '',
    brand_tone: '',
    launch_date: '',
    status: 'draft',
  });

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const { project: apiProject } = await projectsApi.get(projectId);
      const data = toViewProject(apiProject);
      setProject(data);
      setStrategyForm({
        positioning_statement: data.positioning_statement || '',
        core_promise: data.core_promise || '',
        unique_mechanism: data.unique_mechanism || '',
        key_offer: data.key_offer || '',
      });
      setDetailsForm({
        name: data.name || '',
        description: data.description || '',
        target_audience: data.target_audience || '',
        brand_tone: data.brand_tone || '',
        launch_date: data.launch_date || '',
        status: data.status || 'DRAFT',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!projectId) return;

    try {
      await projectsApi.update(projectId, {
        brief: {
          marketContext: strategyForm.positioning_statement,
          keyMessage: strategyForm.core_promise,
          launchGoal: strategyForm.unique_mechanism,
          offerDescription: strategyForm.key_offer,
        },
      });
      showToast('Launch strategy saved successfully!', 'success');
      setEditingStrategy(false);
      loadProject();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save strategy. Please try again.', 'error');
    }
  };

  const handleSaveDetails = async () => {
    if (!projectId) return;

    try {
      await projectsApi.update(projectId, {
        name: detailsForm.name,
        description: detailsForm.description || null,
        status: toProjectStatus(detailsForm.status),
        brief: {
          targetAudience: detailsForm.target_audience,
          brandTone: detailsForm.brand_tone,
          launchGoal: detailsForm.launch_date ? `Launch date: ${detailsForm.launch_date}` : undefined,
        },
      });
      showToast('Project details saved successfully!', 'success');
      setEditingDetails(false);
      loadProject();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save project details. Please try again.', 'error');
    }
  };

  const modules = [
    {
      icon: FileText,
      title: 'Content Agents',
      description: 'Generate marketing content with AI',
      path: `/dashboard/project/${projectId}/content`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Library,
      title: 'Content Library',
      description: 'View and manage all content',
      path: `/dashboard/project/${projectId}/content-library`,
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Image,
      title: 'AI Visual Studio',
      description: 'Create stunning product visuals',
      path: `/dashboard/project/${projectId}/visuals`,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Workflow,
      title: 'Automation Engine',
      description: 'Build marketing automation flows',
      path: `/dashboard/project/${projectId}/automation`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Package,
      title: 'Products',
      description: 'Manage products and offers',
      path: `/dashboard/project/${projectId}/products`,
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: CalendarIcon,
      title: 'Launch Calendar',
      description: 'Plan milestones and timeline',
      path: `/dashboard/project/${projectId}/calendar`,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: FolderOpen,
      title: 'Visual Gallery',
      description: 'Browse all generated visuals',
      path: `/dashboard/project/${projectId}/gallery`,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-ai-purple)]"></div>
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
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl mb-2">{project.name}</h1>
            <p className="text-gray-400">{project.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Project Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingDetails(!editingDetails)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {editingDetails ? (
                <div className="space-y-4">
                  <Input
                    label="Project Name"
                    placeholder="Enter project name"
                    value={detailsForm.name}
                    onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe your product"
                    rows={3}
                    value={detailsForm.description}
                    onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
                  />
                  <Textarea
                    label="Target Audience"
                    placeholder="Who is this for?"
                    rows={2}
                    value={detailsForm.target_audience}
                    onChange={(e) => setDetailsForm({ ...detailsForm, target_audience: e.target.value })}
                  />
                  <Input
                    label="Brand Tone"
                    placeholder="e.g., Professional, Friendly, Bold"
                    value={detailsForm.brand_tone}
                    onChange={(e) => setDetailsForm({ ...detailsForm, brand_tone: e.target.value })}
                  />
                  <Input
                    label="Launch Date"
                    type="date"
                    value={detailsForm.launch_date}
                    onChange={(e) => setDetailsForm({ ...detailsForm, launch_date: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={detailsForm.status}
                      onChange={(e) => setDetailsForm({ ...detailsForm, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <Button onClick={handleSaveDetails} className="w-full">
                    Save Details
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Target Audience</p>
                    <p>{project.target_audience}</p>
                  </div>
                  {project.brand_tone && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Brand Tone</p>
                      <p>{project.brand_tone}</p>
                    </div>
                  )}
                  {project.launch_date && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Launch Date</p>
                      <p>{new Date(project.launch_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Status</p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                      {project.status}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card gradient>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Launch Strategy Snapshot</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingStrategy(!editingStrategy)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {editingStrategy ? (
                <div className="space-y-4">
                  <Input
                    label="Positioning Statement"
                    placeholder="We help X achieve Y through Z"
                    value={strategyForm.positioning_statement}
                    onChange={(e) => setStrategyForm({ ...strategyForm, positioning_statement: e.target.value })}
                  />
                  <Textarea
                    label="Core Promise"
                    placeholder="What's the main transformation you deliver?"
                    rows={2}
                    value={strategyForm.core_promise}
                    onChange={(e) => setStrategyForm({ ...strategyForm, core_promise: e.target.value })}
                  />
                  <Input
                    label="Unique Mechanism"
                    placeholder="What makes your approach different?"
                    value={strategyForm.unique_mechanism}
                    onChange={(e) => setStrategyForm({ ...strategyForm, unique_mechanism: e.target.value })}
                  />
                  <Input
                    label="Key Offer"
                    placeholder="Your primary CTA or offer"
                    value={strategyForm.key_offer}
                    onChange={(e) => setStrategyForm({ ...strategyForm, key_offer: e.target.value })}
                  />
                  <Button onClick={handleSaveStrategy} className="w-full">
                    Save Strategy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-[var(--color-ai-purple)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Positioning</p>
                      <p>{project.positioning_statement || 'Not defined yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[var(--color-cyan-accent)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Core Promise</p>
                      <p>{project.core_promise || 'Not defined yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Unique Mechanism</p>
                      <p>{project.unique_mechanism || 'Not defined yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Key Offer</p>
                      <p>{project.key_offer || 'Not defined yet'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div>
            <h2 className="text-2xl mb-6">Launch Modules</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <Link key={index} to={module.path}>
                  <Card hover>
                    <div className="space-y-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                        <module.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                        <p className="text-gray-400 text-sm">{module.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
