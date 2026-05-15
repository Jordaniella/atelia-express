import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react';
import { Product, ProductStatus, productsApi, projectsApi, toProductStatus } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';

interface ProjectSummary {
  id: string;
  name: string;
}

export function Products() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    targetSegment: '',
    uniqueValueProposition: '',
    status: 'ACTIVE' as ProductStatus,
  });

  useEffect(() => {
    void loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      const { project } = await projectsApi.get(projectId);
      setProject({ id: project.id, name: project.name });
      setProducts(project.products || []);
    } catch {
      showToast('Failed to load products. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      if (editingId) {
        await productsApi.update(editingId, {
          name: formData.name,
          description: formData.description || null,
          price: formData.price || null,
          targetSegment: formData.targetSegment || null,
          uniqueValueProposition: formData.uniqueValueProposition || null,
          status: formData.status,
        });
        showToast('Product updated successfully!', 'success');
      } else {
        await productsApi.create({
          projectId,
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price || undefined,
          targetSegment: formData.targetSegment || undefined,
          uniqueValueProposition: formData.uniqueValueProposition || undefined,
          status: formData.status,
        });
        showToast('Product created successfully!', 'success');
      }

      resetForm();
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save product. Please try again.', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      targetSegment: product.targetSegment || '',
      uniqueValueProposition: product.uniqueValueProposition || '',
      status: product.status,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? Generated content and visuals linked to it will also be deleted.')) {
      return;
    }

    try {
      await productsApi.delete(id);
      showToast('Product deleted successfully!', 'success');
      await loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete product. Please try again.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      targetSegment: '',
      uniqueValueProposition: '',
      status: 'ACTIVE',
    });
    setEditingId(null);
    setShowForm(false);
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
                <h1 className="text-4xl mb-2">Products</h1>
                <p className="text-gray-400">
                  Manage products and offers for {project?.name}
                </p>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-5 h-5" />
                Add Product
              </Button>
            </div>
          </div>

          {showForm && (
            <Card>
              <h3 className="text-xl font-semibold mb-6">
                {editingId ? 'Edit Product' : 'New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Product Name"
                  placeholder="e.g., Premium Package"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Textarea
                  label="Description"
                  placeholder="Describe this product or offer..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    placeholder="e.g., $99, Free trial"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: toProductStatus(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
                <Textarea
                  label="Target Segment"
                  placeholder="Specific audience segment for this product..."
                  value={formData.targetSegment}
                  onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                  rows={2}
                />
                <Textarea
                  label="Unique Value Proposition"
                  placeholder="What makes this product unique?"
                  value={formData.uniqueValueProposition}
                  onChange={(e) => setFormData({ ...formData, uniqueValueProposition: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-3">
                  <Button type="submit">{editingId ? 'Update Product' : 'Create Product'}</Button>
                  <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {products.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-gray-400 mb-6">Add your first product or offer to organize generated assets.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-5 h-5" />
                  Add Product
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-300'
                              : product.status === 'DRAFT'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {product.status.toLowerCase()}
                          </span>
                        </div>
                        {product.description && <p className="text-gray-400 text-sm mb-3">{product.description}</p>}
                        {product.price && <p className="text-[var(--color-cyan-accent)] font-medium">{product.price}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    {product.targetSegment && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target Segment</p>
                        <p className="text-sm text-gray-300">{product.targetSegment}</p>
                      </div>
                    )}
                    {product.uniqueValueProposition && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Value Proposition</p>
                        <p className="text-sm text-gray-300">{product.uniqueValueProposition}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
