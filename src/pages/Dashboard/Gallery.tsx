import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, FolderOpen, Download, Copy, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';

interface Visual {
  id: string;
  title: string | null;
  prompt: string;
  style: string;
  ratio: string;
  image_url: string;
  product_id: string | null;
  storage_path: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  id: string;
  name: string;
}

interface FolderStructure {
  global: Visual[];
  products: {
    [productId: string]: {
      name: string;
      visuals: Visual[];
    };
  };
}

export function Gallery() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<'global' | string>('global');
  const [previewImage, setPreviewImage] = useState<Visual | null>(null);
  const [editingVisual, setEditingVisual] = useState<Visual | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    const [projectResult, productsResult, visualsResult] = await Promise.all([
      supabase.from('projects').select('id, name').eq('id', projectId).maybeSingle(),
      supabase.from('products').select('id, name, slug').eq('project_id', projectId),
      supabase.from('visual_generations').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ]);

    if (projectResult.data) setProject(projectResult.data);
    if (productsResult.data) setProducts(productsResult.data);
    if (visualsResult.data) setVisuals(visualsResult.data);

    setLoading(false);
  };

  const organizeVisuals = (): FolderStructure => {
    const structure: FolderStructure = {
      global: [],
      products: {},
    };

    visuals.forEach((visual) => {
      if (!visual.product_id) {
        structure.global.push(visual);
      } else {
        if (!structure.products[visual.product_id]) {
          const product = products.find((p) => p.id === visual.product_id);
          structure.products[visual.product_id] = {
            name: product?.name || 'Unknown Product',
            visuals: [],
          };
        }
        structure.products[visual.product_id].visuals.push(visual);
      }
    });

    return structure;
  };

  const handleDownload = async (visual: Visual) => {
    try {
      const response = await fetch(visual.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${visual.title || 'visual'}-${visual.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Image downloaded!', 'success');
    } catch (error) {
      showToast('Failed to download image. Please try again.', 'error');
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    showToast('Prompt copied to clipboard!', 'success');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visual?')) return;

    const { error } = await supabase
      .from('visual_generations')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Failed to delete visual. Please try again.', 'error');
    } else {
      showToast('Visual deleted!', 'success');
      loadData();
    }
  };

  const handleRename = async () => {
    if (!editingVisual || !newTitle.trim()) return;

    const { error } = await supabase
      .from('visual_generations')
      .update({ title: newTitle.trim() })
      .eq('id', editingVisual.id);

    if (error) {
      showToast('Failed to rename visual. Please try again.', 'error');
    } else {
      showToast('Visual renamed!', 'success');
      setEditingVisual(null);
      setNewTitle('');
      loadData();
    }
  };

  const startRename = (visual: Visual) => {
    setEditingVisual(visual);
    setNewTitle(visual.title || '');
  };

  const structure = organizeVisuals();
  const currentVisuals =
    selectedFolder === 'global'
      ? structure.global
      : structure.products[selectedFolder]?.visuals || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-ai-purple)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link to={`/dashboard/project/${projectId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-4xl mb-2">Visual Gallery</h1>
            <p className="text-gray-400">
              Browse and download all generated visuals for {project?.name}
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Folders</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedFolder('global')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      selectedFolder === 'global'
                        ? 'bg-[var(--color-ai-purple)]/20 text-white'
                        : 'hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span>Global</span>
                    <span className="ml-auto text-sm">({structure.global.length})</span>
                  </button>

                  {Object.keys(structure.products).length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 px-4 mb-2">Products</p>
                      {Object.entries(structure.products).map(([productId, data]) => (
                        <button
                          key={productId}
                          onClick={() => setSelectedFolder(productId)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            selectedFolder === productId
                              ? 'bg-[var(--color-ai-purple)]/20 text-white'
                              : 'hover:bg-white/5 text-gray-400'
                          }`}
                        >
                          <FolderOpen className="w-5 h-5" />
                          <span className="truncate">{data.name}</span>
                          <span className="ml-auto text-sm">({data.visuals.length})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="col-span-9">
              {currentVisuals.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">No visuals yet</h3>
                    <p className="text-gray-400 mb-6">
                      Generate visuals in AI Visual Studio to see them here
                    </p>
                    <Link to={`/dashboard/project/${projectId}/visuals`}>
                      <Button>Go to Visual Studio</Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {currentVisuals.map((visual) => (
                    <Card key={visual.id} hover className="group">
                      <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--color-gray-dark)]">
                          <img
                            src={visual.image_url}
                            alt={visual.title || 'Generated visual'}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setPreviewImage(visual)}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleDownload(visual)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyPrompt(visual.prompt)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startRename(visual)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(visual.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1 truncate">
                            {visual.title || 'Untitled'}
                          </h4>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400">
                              {visual.style}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400">
                              {visual.ratio}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage.image_url}
              alt={previewImage.title || 'Preview'}
              className="max-w-full max-h-[80vh] rounded-xl"
            />
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={() => handleDownload(previewImage)}>
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="ghost" onClick={() => handleCopyPrompt(previewImage.prompt)}>
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
              <Button variant="ghost" onClick={() => setPreviewImage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingVisual && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => {
            setEditingVisual(null);
            setNewTitle('');
          }}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Rename Visual</h3>
            <Input
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter a new title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditingVisual(null);
                  setNewTitle('');
                }
              }}
            />
            <div className="flex gap-3 mt-6">
              <Button onClick={handleRename} className="flex-1">
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingVisual(null);
                  setNewTitle('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
