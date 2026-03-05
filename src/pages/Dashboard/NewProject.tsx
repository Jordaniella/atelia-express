import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        target_audience: formData.targetAudience,
        brand_tone: formData.brandTone,
        launch_date: formData.launchDate || null,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      showToast('Failed to create project. Please try again.', 'error');
      setLoading(false);
      return;
    }

    if (data) {
      showToast('Project created successfully!', 'success');
      navigate(`/dashboard/project/${data.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl mb-2">Create Launch Project</h1>
            <p className="text-gray-400">Define your product and launch strategy</p>
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
              />

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
              />

              <Input
                label="Launch Date (Optional)"
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
              />

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
