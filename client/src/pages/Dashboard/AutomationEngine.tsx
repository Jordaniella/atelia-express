import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download, Mail, ShoppingCart, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useToast } from '../../contexts/ToastContext';

interface Automation {
  id: string;
  type: string;
  config_json: any;
  created_at: string;
}

export function AutomationEngine() {
  const { projectId } = useParams();
  const { canUseAutomation } = useSubscription();
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedFlow, setGeneratedFlow] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedAutomations, setSavedAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    loadSavedAutomations();
  }, [projectId]);

  const loadSavedAutomations = async () => {
    if (!projectId) return;

    setSavedAutomations([]);
  };

  const templates = [
    {
      id: 'email_launch',
      icon: Mail,
      name: 'Email Launch Sequence',
      description: 'Complete product launch email series',
      color: 'from-purple-500 to-pink-500',
      steps: 5,
    },
    {
      id: 'welcome_flow',
      icon: Users,
      name: 'Welcome Flow',
      description: 'Onboard new users effectively',
      color: 'from-blue-500 to-cyan-500',
      steps: 3,
    },
    {
      id: 'abandoned_cart',
      icon: ShoppingCart,
      name: 'Abandoned Cart Recovery',
      description: 'Win back potential customers',
      color: 'from-green-500 to-emerald-500',
      steps: 4,
    },
  ];

  const flowData = {
    email_launch: {
      name: 'Email Launch Sequence',
      emails: [
        {
          day: 0,
          subject: 'Get Ready: Something Big is Coming',
          content: 'Build anticipation with a teaser about your upcoming launch...',
        },
        {
          day: 3,
          subject: 'Sneak Peek: First Look Inside',
          content: 'Give exclusive early access to select features...',
        },
        {
          day: 7,
          subject: "We're Live! Introducing [Product Name]",
          content: 'Official launch announcement with key benefits...',
        },
        {
          day: 10,
          subject: 'Success Stories: See What Others Are Achieving',
          content: 'Share early customer testimonials and results...',
        },
        {
          day: 14,
          subject: 'Last Chance: Launch Special Ending Soon',
          content: 'Create urgency with limited-time launch offer...',
        },
      ],
    },
    welcome_flow: {
      name: 'Welcome Flow',
      emails: [
        {
          day: 0,
          subject: 'Welcome to [Product Name]!',
          content: 'Thank new users and guide first steps...',
        },
        {
          day: 2,
          subject: 'Getting Started Tips',
          content: 'Share helpful resources and best practices...',
        },
        {
          day: 7,
          subject: 'Your First Week Success',
          content: 'Celebrate progress and suggest next steps...',
        },
      ],
    },
    abandoned_cart: {
      name: 'Abandoned Cart Recovery',
      emails: [
        {
          day: 0,
          subject: 'You Left Something Behind',
          content: 'Gentle reminder about items in cart...',
        },
        {
          day: 1,
          subject: 'Still Thinking It Over?',
          content: 'Address common objections and concerns...',
        },
        {
          day: 3,
          subject: 'Special Offer: Complete Your Purchase',
          content: 'Incentivize with limited discount or bonus...',
        },
        {
          day: 7,
          subject: 'Last Call: Your Cart Expires Soon',
          content: 'Final reminder with urgency...',
        },
      ],
    },
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;

    if (!canUseAutomation) {
      showToast('Automation is available on Starter plan and above.', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setGeneratedFlow(flowData[selectedTemplate as keyof typeof flowData]);
      setLoading(false);
    }, 1500);
  };

  const handleSave = async () => {
    if (!projectId || !generatedFlow) return;

    showToast('Automation persistence is not available in the current backend MVP yet.', 'error');
  };

  const handleExport = () => {
    const json = JSON.stringify(generatedFlow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate}-automation.json`;
    link.click();
  };

  return (
    <DashboardLayout>
      <SubscriptionGate feature="Automation Engine">
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link to={`/dashboard/project/${projectId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-4xl mb-2">Automation Engine</h1>
            <p className="text-gray-400">Build marketing automation flows</p>
          </div>

          <div>
            <h2 className="text-2xl mb-6">Choose a Template</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`
                    text-left transition-all
                    ${selectedTemplate === template.id ? 'scale-105' : 'hover:scale-102'}
                  `}
                >
                  <Card hover>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                      <template.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{template.steps} steps</span>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="space-y-6">
              <Button onClick={handleGenerate} isLoading={loading}>
                <Sparkles className="w-5 h-5" />
                Generate Flow
              </Button>

              {generatedFlow && (
                <div className="space-y-6">
                  <Card>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-semibold">{generatedFlow.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={handleExport}>
                            <Download className="w-4 h-4" />
                            Export JSON
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {generatedFlow.emails.map((email: any, index: number) => (
                          <div key={index} className="relative">
                            {index > 0 && (
                              <div className="absolute left-6 -top-4 w-0.5 h-8 bg-gradient-to-b from-[var(--color-ai-purple)] to-transparent" />
                            )}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center font-bold shadow-lg shadow-purple-500/30">
                                  {index + 1}
                                </div>
                                <div className="mt-2 px-3 py-1 rounded-full bg-[var(--color-ai-purple)]/10 border border-[var(--color-ai-purple)]/30">
                                  <span className="text-xs font-medium text-[var(--color-ai-purple)]">
                                    Day {email.day}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 glass-effect rounded-xl p-6 border border-white/10 hover:border-[var(--color-ai-purple)]/30 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Mail className="w-4 h-4 text-[var(--color-ai-purple)]" />
                                      <span className="text-xs font-medium text-gray-500">EMAIL {index + 1}</span>
                                    </div>
                                    <p className="font-semibold text-lg mb-2">{email.subject}</p>
                                    <p className="text-gray-400 text-sm">{email.content}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button onClick={handleSave} className="w-full">
                        Save Automation
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {savedAutomations.length > 0 && (
            <div>
              <h2 className="text-2xl mb-6">Saved Automations</h2>
              <div className="space-y-4">
                {savedAutomations.map((automation) => (
                  <Card key={automation.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg mb-1">
                          {automation.config_json.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(automation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {automation.config_json.emails?.length || 0} steps
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </SubscriptionGate>
    </DashboardLayout>
  );
}
