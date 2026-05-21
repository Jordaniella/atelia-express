import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FolderOpen, PaletteIcon } from 'lucide-react';
import { projectsApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';

export function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAudience: '',
    brandTone: '',
    launchDate: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }

    try {
      const { project } = await projectsApi.create({
        name: formData.name,
        description: formData.description,
        status: 'DRAFT',
        brief: {
          targetAudience: formData.targetAudience,
          brandTone: formData.brandTone || undefined,
          launchGoal: formData.launchDate ? `Launch date: ${formData.launchDate}` : undefined,
        },
      });

      showToast('Project created successfully!', 'success');
      navigate(`/dashboard/project/${project.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
      setError(message);
      showToast(message, 'error');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className='flex gap-3 flex-wrap h-full'>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              {/* Back to Dashboard */}
            </Button>
            <div>
              <h3 className="text-2xl mb-2">Create Launch Project</h3>
              <p className="text-gray-400">Define your product and launch strategy</p>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Product Name"
                placeholder="e.g., AcmeApp Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              >
                <FolderOpen className='w-4 h-4 text-[var(--text-secondary)]'/>
              </Input>

              <Textarea
                label="Description"
                placeholder="What does your product do? What problem does it solve?"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <Textarea
                label="Target Audience"
                placeholder="Who is this product for? Be specific about demographics, needs, and pain points."
                rows={3}
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                required
              />

              <Input
                label="Brand Tone"
                placeholder="e.g., Professional, Friendly, Bold, Luxurious"
                value={formData.brandTone}
                onChange={(e) => setFormData({ ...formData, brandTone: e.target.value })}
              
              >
                <PaletteIcon className='w-4 h-4 text-[var(--text-secondary)]'/>
              </Input>
              <Input
                label="Launch Date (Optional)"
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
              
              >
                <Calendar className='w-4 h-4 text-[var(--text-secondary)]'/>
              </Input>

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" isLoading={loading}>
                  Create Project
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
