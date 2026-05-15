import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download } from 'lucide-react';
import { generatedVisualsApi, projectsApi, slugify } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface VisualGeneration {
  id: string;
  prompt: string;
  image_url: string;
  style: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  name: string;
  slug?: string;
}

export function VisualStudio() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const { canGenerateImage } = useSubscription();
  const [style, setStyle] = useState('studio');
  const [description, setDescription] = useState('');
  const [ambiance, setAmbiance] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [savedVisuals, setSavedVisuals] = useState<VisualGeneration[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('global');
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    const { project } = await projectsApi.get(projectId);
    const activeProducts = project.products.filter((product) => product.status === 'ACTIVE');
    setProject({ name: project.name });
    setProducts(activeProducts.map((product) => ({ id: product.id, name: product.name, slug: slugify(product.name) })));
    if (activeProducts.length > 0 && selectedProduct === 'global') {
      setSelectedProduct(activeProducts[0].id);
    }

    const visuals = (await Promise.all(
      activeProducts.map(async (product) => {
        const { generatedVisuals } = await generatedVisualsApi.list(product.id);
        return generatedVisuals.map((visual) => ({
          id: visual.id,
          prompt: visual.promptUsed,
          image_url: visual.imageUrl,
          style: visual.style,
          created_at: visual.createdAt,
        }));
      }),
    )).flat();
    setSavedVisuals(visuals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6));
  };

  const loadSavedVisuals = async () => {
    if (!projectId) return;

    await loadData();
  };

  const handleGenerate = async () => {
    if (!canGenerateImage) {
      showToast('Image generation is available on Starter plan and above.', 'error');
      return;
    }

    setLoading(true);

    const prompt = `A ${style} style product photo of ${description}, ${ambiance}, professional photography, high quality, ${ratio} aspect ratio`;

    const demoImages = {
      studio: 'https://images.pexels.com/photos/3584927/pexels-photo-3584927.jpeg?auto=compress&cs=tinysrgb&w=800',
      lifestyle: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
      luxe: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800',
      minimal: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
    };

    setTimeout(() => {
      setGeneratedPrompt(prompt);
      setGeneratedImage(demoImages[style as keyof typeof demoImages]);
      setLoading(false);
    }, 2000);
  };

  const handleSave = async () => {
    if (!projectId || !generatedImage) return;

    if (selectedProduct === 'global') {
      showToast('Please add and select a product before saving a visual.', 'error');
      return;
    }

    try {
      await generatedVisualsApi.create({
        productId: selectedProduct,
        promptUsed: generatedPrompt,
        imageUrl: generatedImage,
        style: `${style} (${ratio})`,
      });
      loadSavedVisuals();
      showToast('Visual saved successfully!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save visual. Please try again.', 'error');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'atelia-visual.jpg';
    link.click();
  };

  const styleOptions = [
    {
      value: 'studio',
      label: 'Studio',
      description: 'Clean, professional product shots',
      tooltip: 'Perfect for e-commerce and product catalogs. White/neutral backgrounds, controlled lighting.',
      preview: 'https://images.pexels.com/photos/3584927/pexels-photo-3584927.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      value: 'lifestyle',
      label: 'Lifestyle',
      description: 'Real-world usage scenarios',
      tooltip: 'Show your product in action. Natural environments, authentic moments, relatable contexts.',
      preview: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      value: 'luxe',
      label: 'Luxury',
      description: 'Premium, high-end aesthetic',
      tooltip: 'Elevate your brand. Sophisticated compositions, rich textures, premium feel.',
      preview: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      value: 'minimal',
      label: 'Minimal',
      description: 'Simple, focused compositions',
      tooltip: 'Less is more. Clean lines, negative space, product as hero.',
      preview: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  return (
    <DashboardLayout>
      <SubscriptionGate feature="AI Visual Studio">
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link to={`/dashboard/project/${projectId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-4xl mb-2">AI Visual Studio</h1>
            <p className="text-gray-400">Create stunning product visuals</p>
          </div>

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
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Visual Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {styleOptions.map((option) => (
                        <div key={option.value} className="relative group">
                          <button
                            onClick={() => setStyle(option.value)}
                            className={`
                              w-full p-4 rounded-xl text-left transition-all relative overflow-hidden
                              ${style === option.value
                                ? 'bg-[var(--color-ai-purple)] border-2 border-[var(--color-ai-purple)]'
                                : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                              }
                            `}
                          >
                            <div className="absolute inset-0 opacity-20">
                              <img
                                src={option.preview}
                                alt={option.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="relative z-10">
                              <p className="font-medium mb-1">{option.label}</p>
                              <p className="text-xs text-gray-400">{option.description}</p>
                            </div>
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 rounded-lg glass-effect text-sm z-20">
                            {option.tooltip}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Product Description"
                    placeholder="Describe your product in detail..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <Input
                    label="Ambiance"
                    placeholder="e.g., bright lighting, modern background, elegant"
                    value={ambiance}
                    onChange={(e) => setAmbiance(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Ratio
                    </label>
                    <select
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                    >
                      <option value="1:1">Square (1:1)</option>
                      <option value="16:9">Landscape (16:9)</option>
                      <option value="9:16">Portrait (9:16)</option>
                      <option value="4:5">Instagram (4:5)</option>
                    </select>
                  </div>

                  <Button onClick={handleGenerate} isLoading={loading} className="w-full">
                    <Sparkles className="w-5 h-5" />
                    Generate Visual
                  </Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Generated Visual</h3>
                    {generatedImage && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleDownload}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {generatedImage ? (
                    <>
                      <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={generatedImage}
                          alt="Generated visual"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-sm text-gray-400 mb-2">Generated Prompt:</p>
                        <p className="text-sm">{generatedPrompt}</p>
                      </div>

                      <Button onClick={handleSave} className="w-full">
                        Save Visual
                      </Button>
                    </>
                  ) : (
                    <div className="aspect-square rounded-xl bg-white/5 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Click "Generate Visual" to create your first image</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {savedVisuals.length > 0 && (
            <div>
              <h2 className="text-2xl mb-6">Saved Visuals</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {savedVisuals.map((visual) => (
                  <Card key={visual.id} hover>
                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                      <img
                        src={visual.image_url}
                        alt={visual.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{visual.style}</p>
                      <p className="text-sm line-clamp-2">{visual.prompt}</p>
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
