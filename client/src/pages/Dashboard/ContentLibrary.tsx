import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, Trash2, Calendar as CalendarIcon, Eye, Save, X } from 'lucide-react';
import { generatedContentsApi, projectsApi } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';

interface ContentAsset {
  id: string;
  type: string;
  content: string;
  title: string | null;
  channel: string | null;
  status: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
  angle: string | null;
  tone: string | null;
  product_id: string | null;
  products?: {
    name: string;
  };
}

export function ContentLibrary() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<ContentAsset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, [projectId]);

  useEffect(() => {
    filterAssets();
  }, [assets, searchQuery, selectedType, selectedChannel, selectedStatus]);

  const loadAssets = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { project } = await projectsApi.get(projectId);
      const loadedAssets = (await Promise.all(
        project.products.map(async (product) => {
          const { generatedContents } = await generatedContentsApi.list(product.id);
          return generatedContents.map((asset) => ({
            id: asset.id,
            type: asset.type,
            content: asset.content,
            title: asset.title,
            channel: asset.type === 'EMAIL' ? 'email' : asset.type === 'SOCIAL_POST' ? 'instagram' : asset.type === 'LANDING_PAGE' ? 'landing' : 'offer',
            status: 'draft',
            publish_at: null,
            created_at: asset.createdAt,
            updated_at: asset.updatedAt,
            angle: asset.promptUsed,
            tone: null,
            product_id: asset.productId,
            products: { name: product.name },
          }));
        }),
      )).flat();
      setAssets(loadedAssets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch {
      showToast('Failed to load content assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    if (searchQuery) {
      filtered = filtered.filter(
        (asset) =>
          asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.angle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((asset) => asset.type === selectedType);
    }

    if (selectedChannel !== 'all') {
      filtered = filtered.filter((asset) => asset.channel === selectedChannel);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((asset) => asset.status === selectedStatus);
    }

    setFilteredAssets(filtered);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;

    showToast('Deleting generated content is not available in the current backend MVP.', 'error');
    setAssetToDelete(null);
    setDeleteModalOpen(false);
  };

  const openDeleteModal = (id: string) => {
    setAssetToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleExport = (asset: ContentAsset) => {
    const blob = new Blob([asset.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title || asset.type}-${new Date(asset.created_at).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Content exported successfully', 'success');
  };

  const handleEdit = (asset: ContentAsset) => {
    setSelectedAsset(asset);
    setEditedContent(asset.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAsset) return;

    showToast('Editing generated content is not available in the current backend MVP.', 'error');
    setIsEditing(false);
    setSelectedAsset({ ...selectedAsset, content: editedContent });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(selectedAsset?.content || '');
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      EMAIL: '📧',
      SOCIAL_POST: '📱',
      OFFER: '🎁',
      LANDING_PAGE: '🌐',
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status: string | null) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-gray-500/20 text-gray-300',
      scheduled: 'bg-blue-500/20 text-blue-300',
      published: 'bg-green-500/20 text-green-300',
    };
    return colors[status || 'draft'] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <Link to={`/dashboard/project/${projectId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Project
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl mb-2">Content Library</h1>
                <p className="text-gray-400">
                  {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
                </p>
              </div>
              <Link to={`/dashboard/project/${projectId}/content`}>
                <Button>Generate New Content</Button>
              </Link>
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by title, content, or angle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                  >
                    <option value="all">All Types</option>
                    <option value="EMAIL">Email</option>
                    <option value="SOCIAL_POST">Social Post</option>
                    <option value="OFFER">Offer</option>
                    <option value="LANDING_PAGE">Landing Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Channel</label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                  >
                    <option value="all">All Channels</option>
                    <option value="email">Email</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {loading ? (
            <Card>
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-ai-purple)]"></div>
                <p className="mt-4 text-gray-400">Loading content...</p>
              </div>
            </Card>
          ) : filteredAssets.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <p className="text-gray-400 mb-4">
                  {searchQuery || selectedType !== 'all' || selectedChannel !== 'all' || selectedStatus !== 'all'
                    ? 'No content matches your filters'
                    : 'No content created yet'}
                </p>
                <Link to={`/dashboard/project/${projectId}/content`}>
                  <Button>Generate Your First Content</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getTypeIcon(asset.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {asset.title || `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} Content`}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap text-sm text-gray-400">
                            <span className="capitalize">{asset.type}</span>
                            {asset.channel && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{asset.channel}</span>
                              </>
                            )}
                            {asset.products && (
                              <>
                                <span>•</span>
                                <span>{asset.products.name}</span>
                              </>
                            )}
                            {asset.angle && (
                              <>
                                <span>•</span>
                                <span>{asset.angle}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                            {asset.status || 'draft'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{asset.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Created {new Date(asset.created_at).toLocaleDateString()}</span>
                          {asset.publish_at && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(asset.publish_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedAsset(asset); setIsEditing(false); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleExport(asset)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteModal(asset.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedAsset.title || `${selectedAsset.type.charAt(0).toUpperCase() + selectedAsset.type.slice(1)}`}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap text-sm text-gray-400">
                    <span className="capitalize">{selectedAsset.type}</span>
                    {selectedAsset.channel && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{selectedAsset.channel}</span>
                      </>
                    )}
                    {selectedAsset.tone && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{selectedAsset.tone} tone</span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                  ✕
                </Button>
              </div>

{isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[300px] p-4 rounded-lg bg-white/5 border border-[var(--color-gray-medium)] text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)] font-sans resize-y"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSaveEdit}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button variant="ghost" onClick={handleCancelEdit}>
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-white/5 border border-[var(--color-gray-medium)]">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{selectedAsset.content}</pre>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-gray-medium)]">
                    <div className="text-sm text-gray-400">
                      <p>Created: {new Date(selectedAsset.created_at).toLocaleString()}</p>
                      {selectedAsset.updated_at !== selectedAsset.created_at && (
                        <p>Updated: {new Date(selectedAsset.updated_at).toLocaleString()}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => { setEditedContent(selectedAsset.content); setIsEditing(true); }}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => handleExport(selectedAsset)}>
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
