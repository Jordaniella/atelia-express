import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Plus, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_at: string;
  status: string;
  priority: string;
}

interface ContentEvent {
  id: string;
  title: string | null;
  type: string;
  channel: string | null;
  publish_at: string | null;
  status: string;
}

interface CalendarEvent {
  id: string;
  type: 'milestone' | 'content';
  title: string;
  date: string;
  status: string;
  priority?: string;
  contentType?: string;
  channel?: string;
}

interface Project {
  id: string;
  name: string;
}

export function Calendar() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'month'>('upcoming');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    due_at: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    const [projectResult, milestonesResult, contentResult] = await Promise.all([
      supabase.from('projects').select('id, name').eq('id', projectId).maybeSingle(),
      supabase.from('project_milestones').select('*').eq('project_id', projectId),
      supabase.from('content_assets').select('id, title, type, channel, publish_at, status').eq('project_id', projectId).not('publish_at', 'is', null),
    ]);

    if (projectResult.data) setProject(projectResult.data);

    const allEvents: CalendarEvent[] = [];

    if (milestonesResult.data) {
      milestonesResult.data.forEach((m: Milestone) => {
        allEvents.push({
          id: m.id,
          type: 'milestone',
          title: m.title,
          date: m.due_at,
          status: m.status,
          priority: m.priority,
        });
      });
    }

    if (contentResult.data) {
      contentResult.data.forEach((c: ContentEvent) => {
        allEvents.push({
          id: c.id,
          type: 'content',
          title: c.title || `${c.type} content`,
          date: c.publish_at!,
          status: c.status,
          contentType: c.type,
          channel: c.channel || undefined,
        });
      });
    }

    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(allEvents);
    setLoading(false);
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const data = {
      project_id: projectId,
      title: milestoneForm.title,
      description: milestoneForm.description || null,
      due_at: new Date(milestoneForm.due_at).toISOString(),
      priority: milestoneForm.priority,
    };

    if (editingMilestoneId) {
      const { error } = await supabase
        .from('project_milestones')
        .update(data)
        .eq('id', editingMilestoneId);

      if (error) {
        showToast('Failed to update milestone. Please try again.', 'error');
      } else {
        showToast('Milestone updated successfully!', 'success');
        resetMilestoneForm();
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('project_milestones')
        .insert(data);

      if (error) {
        showToast('Failed to create milestone. Please try again.', 'error');
      } else {
        showToast('Milestone created successfully!', 'success');
        resetMilestoneForm();
        loadData();
      }
    }
  };

  const handleToggleMilestoneStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';

    const { error } = await supabase
      .from('project_milestones')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      showToast('Failed to update status. Please try again.', 'error');
    } else {
      showToast('Status updated!', 'success');
      loadData();
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    const { error } = await supabase
      .from('project_milestones')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Failed to delete milestone. Please try again.', 'error');
    } else {
      showToast('Milestone deleted!', 'success');
      loadData();
    }
  };

  const resetMilestoneForm = () => {
    setMilestoneForm({
      title: '',
      description: '',
      due_at: '',
      priority: 'medium',
    });
    setEditingMilestoneId(null);
    setShowMilestoneForm(false);
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (eventDate >= now && eventDate <= thirtyDaysFromNow) {
        const dateKey = eventDate.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-ai-purple)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedEvents = groupEventsByDate();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link to={`/dashboard/project/${projectId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Project
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl mb-2">Launch Calendar</h1>
                <p className="text-gray-400">
                  Plan and track milestones for {project?.name}
                </p>
              </div>
              <Button onClick={() => setShowMilestoneForm(!showMilestoneForm)}>
                <Plus className="w-5 h-5" />
                Add Milestone
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant={view === 'upcoming' ? 'primary' : 'ghost'}
              onClick={() => setView('upcoming')}
            >
              <Clock className="w-5 h-5" />
              Upcoming
            </Button>
            <Button
              variant={view === 'month' ? 'primary' : 'ghost'}
              onClick={() => setView('month')}
            >
              <CalendarIcon className="w-5 h-5" />
              Month View
            </Button>
          </div>

          {showMilestoneForm && (
            <Card>
              <h3 className="text-xl font-semibold mb-6">
                {editingMilestoneId ? 'Edit Milestone' : 'New Milestone'}
              </h3>
              <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                <Input
                  label="Title"
                  placeholder="e.g., Finalize offer & pricing"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  required
                />
                <Textarea
                  label="Description"
                  placeholder="Additional details..."
                  rows={3}
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                />
                <Input
                  label="Due Date"
                  type="datetime-local"
                  value={milestoneForm.due_at}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, due_at: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={milestoneForm.priority}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit">
                    {editingMilestoneId ? 'Update Milestone' : 'Create Milestone'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetMilestoneForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {view === 'upcoming' && (
            <div className="space-y-6">
              {groupedEvents.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                    <p className="text-gray-400 mb-6">
                      Add milestones or schedule content to see them here
                    </p>
                  </div>
                </Card>
              ) : (
                groupedEvents.map(([date, dayEvents]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-4 text-gray-300">
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-3">
                      {dayEvents.map((event) => (
                        <Card key={`${event.type}-${event.id}`} hover>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              {event.type === 'milestone' ? (
                                <button
                                  onClick={() => handleToggleMilestoneStatus(event.id, event.status)}
                                  className="mt-1"
                                >
                                  <CheckCircle
                                    className={`w-5 h-5 ${
                                      event.status === 'done'
                                        ? 'text-green-500 fill-green-500'
                                        : 'text-gray-500'
                                    }`}
                                  />
                                </button>
                              ) : (
                                <div className="w-5 h-5 mt-1">
                                  <CalendarIcon className="w-5 h-5 text-[var(--color-cyan-accent)]" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      event.type === 'milestone'
                                        ? 'bg-[var(--color-ai-purple)]/20 text-[var(--color-ai-purple)]'
                                        : 'bg-[var(--color-cyan-accent)]/20 text-[var(--color-cyan-accent)]'
                                    }`}
                                  >
                                    {event.type === 'milestone' ? 'Milestone' : event.channel || event.contentType}
                                  </span>
                                  {event.priority && (
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        event.priority === 'high'
                                          ? 'bg-red-500/20 text-red-500'
                                          : event.priority === 'medium'
                                          ? 'bg-yellow-500/20 text-yellow-500'
                                          : 'bg-gray-500/20 text-gray-500'
                                      }`}
                                    >
                                      {event.priority}
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      event.status === 'done' || event.status === 'published'
                                        ? 'bg-green-500/20 text-green-500'
                                        : event.status === 'in_progress'
                                        ? 'bg-blue-500/20 text-blue-500'
                                        : 'bg-gray-500/20 text-gray-500'
                                    }`}
                                  >
                                    {event.status}
                                  </span>
                                </div>
                                <h4 className="font-medium">{event.title}</h4>
                              </div>
                            </div>
                            {event.type === 'milestone' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMilestone(event.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {view === 'month' && (
            <Card>
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">Month View</h3>
                <p className="text-gray-400">
                  Full calendar view coming soon. Use Upcoming view for now.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
