import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Library, Send, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { UpgradePrompt } from '../../components/UpgradePrompt';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { ExportModal } from '../../components/ExportModal';
import { ConnectPlatformModal } from '../../components/ConnectPlatformModal';

interface ContentAsset {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface ProjectContext {
  name: string;
  description: string;
  target_audience: string;
  brand_tone: string | null;
  positioning_statement: string | null;
  core_promise: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
}

export function ContentAgents() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const { canGenerateContent, generationsLeft, incrementUsage, isTrial } = useSubscription();
  const [contentType, setContentType] = useState('email');
  const [angle, setAngle] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAssets, setSavedAssets] = useState<ContentAsset[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('global');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'email' | 'instagram' | 'youtube' | 'landing' | null>(null);

  useEffect(() => {
    loadProjectContext();
    loadProducts();
    loadSavedAssets();
  }, [projectId]);

  const loadProjectContext = async () => {
    if (!projectId) return;

    const { data } = await supabase
      .from('projects')
      .select('name, description, target_audience, brand_tone, positioning_statement, core_promise')
      .eq('id', projectId)
      .maybeSingle();

    if (data) {
      setProjectContext(data);
      setTone(data.brand_tone || 'professional');
    }
  };

  const loadProducts = async () => {
    if (!projectId) return;

    const { data } = await supabase
      .from('products')
      .select('id, name, description')
      .eq('project_id', projectId)
      .eq('status', 'active');

    if (data) {
      setProducts(data);
    }
  };

  const loadSavedAssets = async () => {
    if (!projectId) return;

    const { data } = await supabase
      .from('content_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setSavedAssets(data);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerateContent(contentType)) {
      showToast('You have reached your generation limit or this content type is not available on your plan.', 'error');
      return;
    }

    if (generationsLeft === 0) {
      showToast('You have used all your generations for this month. Upgrade to continue.', 'error');
      return;
    }

    setLoading(true);

    const productName = projectContext?.name || 'Our Product';
    const audience = projectContext?.target_audience || 'our customers';
    const promise = projectContext?.core_promise || 'transformative results';
    const positioning = projectContext?.positioning_statement || 'innovative solution';

    const demoContent = {
      email: `Subject: Introducing ${productName} ${angle ? '- ' + angle : ''}\n\nHi there,\n\nWe built ${productName} specifically for ${audience}. ${promise}\n\n${positioning}\n\nKey benefits:\n- Save time with intelligent automation\n- Boost productivity dramatically\n- Seamless integration with your existing tools\n\nReady to get started?\n\nBest regards,\nThe Team`,
      post: `Exciting news for ${audience}! 🚀\n\nWe're launching ${productName}. ${angle || promise}\n\nHere's what makes it special:\n✓ ${positioning}\n✓ Built specifically for you\n✓ Proven results\n\nReady to see it in action? Link in bio.`,
      script: `Hey everyone! Today I want to talk about ${productName}.\n\n[Opening Hook]\nIf you're ${audience}, you know the struggle.\n\n[Problem]\nYou're not alone. Thousands face this challenge daily.\n\n[Solution]\nThat's why we created ${productName}. ${promise}\n\n[Unique Value]\n${positioning}\n\n[Call to Action]\nClick the link below to learn more!`,
      landing_copy: `# ${productName}\n\n## ${promise}\n\n${positioning}\n\nBuilt for ${audience} who demand excellence.\n\n### Why Choose ${productName}?\n\n**Fast** - Get results in minutes, not hours\n**Simple** - No learning curve required\n**Powerful** - ${angle || 'Enterprise-grade features'}\n\n### Ready to get started?\n\nJoin thousands of happy customers today.`,
    };

    setTimeout(async () => {
      setGeneratedContent(demoContent[contentType as keyof typeof demoContent]);
      await incrementUsage('content');
      setLoading(false);
      showToast('Content generated successfully!', 'success');
    }, 1500);
  };

  const handleSave = async () => {
    if (!projectId || !generatedContent) return;

    const channelMap: { [key: string]: string } = {
      email: 'email',
      post: 'instagram',
      script: 'youtube',
      landing_copy: 'landing',
    };

    const { error } = await supabase
      .from('content_assets')
      .insert({
        project_id: projectId,
        product_id: selectedProduct === 'global' ? null : selectedProduct,
        type: contentType,
        content: generatedContent,
        angle: angle || null,
        tone: tone || null,
        channel: channelMap[contentType] || null,
        status: 'draft',
        title: `${contentType} - ${angle || 'Content'}`,
      });

    if (error) {
      showToast('Failed to save content. Please try again.', 'error');
    } else {
      loadSavedAssets();
      showToast('Content saved successfully!', 'success');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    showToast('Copied to clipboard!', 'success');
  };

  const handleConnectPlatform = (platform: 'email' | 'instagram' | 'youtube' | 'landing') => {
    setSelectedPlatform(platform);
    setIsConnectModalOpen(true);
  };

  const getPlatformForContentType = (type: string): 'email' | 'instagram' | 'youtube' | 'landing' => {
    const platformMap: { [key: string]: 'email' | 'instagram' | 'youtube' | 'landing' } = {
      email: 'email',
      post: 'instagram',
      script: 'youtube',
      landing_copy: 'landing',
    };
    return platformMap[type] || 'email';
  };

  return (
    <DashboardLayout>
      <SubscriptionGate feature="AI Content Agents">
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
                <h1 className="text-4xl mb-2">Content Agents</h1>
                <p className="text-gray-400">Generate marketing content with AI</p>
              </div>
              <Link to={`/dashboard/project/${projectId}/content-library`}>
                <Button variant="outline">
                  <Library className="w-5 h-5" />
                  View Library
                </Button>
              </Link>
            </div>
          </div>

          {projectContext && (
            <Card>
              <div className="flex items-start gap-4">
                <Sparkles className="w-5 h-5 text-[var(--color-ai-purple)] mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">AI Context Active</h3>
                  <p className="text-sm text-gray-400">
                    Content will be generated using: <span className="text-white">{projectContext.name}</span> targeting{' '}
                    <span className="text-white">{projectContext.target_audience}</span>
                    {projectContext.positioning_statement && (
                      <> with positioning: <span className="text-white">{projectContext.positioning_statement}</span></>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Apply to
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                    >
                      <option value="global">Entire Launch (Global)</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Type
                      {isTrial && generationsLeft !== -1 && (
                        <span className="ml-2 text-xs text-yellow-400">
                          ({generationsLeft} generations left)
                        </span>
                      )}
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                    >
                      <option value="email">Email{isTrial ? ' (Trial - Available)' : ''}</option>
                      <option value="post" disabled={isTrial}>Social Post{isTrial ? ' (Upgrade Required)' : ''}</option>
                      <option value="script" disabled={isTrial}>Video Script{isTrial ? ' (Upgrade Required)' : ''}</option>
                      <option value="landing_copy" disabled={isTrial}>Landing Page Copy{isTrial ? ' (Upgrade Required)' : ''}</option>
                    </select>
                  </div>

                  {isTrial && contentType !== 'email' && (
                    <UpgradePrompt
                      feature={contentType === 'post' ? 'Social Post Generation' : contentType === 'script' ? 'Video Script Generation' : 'Landing Page Copy'}
                      description="This content type is available on Starter plan and above."
                      requiredPlan="starter"
                      inline
                    />
                  )}

                  <Input
                    label="Marketing Angle"
                    placeholder="e.g., Problem-solution, Before-after, Feature highlight"
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="bold">Bold</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>

                  <Button onClick={handleGenerate} isLoading={loading} className="w-full">
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Assets</h3>
                <div className="space-y-3">
                  {savedAssets.length === 0 ? (
                    <p className="text-gray-400 text-sm">No saved content yet</p>
                  ) : (
                    savedAssets.map((asset) => (
                      <div key={asset.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{asset.type}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(asset.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div>
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Generated Content</h3>
                    {generatedContent && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCopy}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleGenerate}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {generatedContent ? (
                    <>
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Button onClick={handleSave} className="flex-1">
                            <Library className="w-4 h-4" />
                            Save to Library
                          </Button>
                          <Button onClick={() => setIsExportModalOpen(true)} variant="outline" className="flex-1">
                            <Send className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleConnectPlatform(getPlatformForContentType(contentType))}
                          variant="outline"
                          className="w-full"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Connect to {contentType === 'email' ? 'Email Platform' : contentType === 'post' ? 'Instagram' : contentType === 'script' ? 'YouTube' : 'Landing Page'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Click "Generate Content" to create your first asset</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </SubscriptionGate>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        content={generatedContent}
        contentType={contentType as 'email' | 'post' | 'script' | 'landing_copy'}
      />

      <ConnectPlatformModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        platform={selectedPlatform}
      />
    </DashboardLayout>
  );
}
