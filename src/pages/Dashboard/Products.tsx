import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../contexts/ToastContext';

interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  price: string | null;
  target_segment: string | null;
  unique_value_proposition: string | null;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export function Products() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    target_segment: '',
    unique_value_proposition: '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    const [projectResult, productsResult] = await Promise.all([
      supabase.from('projects').select('id, name').eq('id', projectId).maybeSingle(),
      supabase.from('products').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ]);

    if (projectResult.data) setProject(projectResult.data);
    if (productsResult.data) setProducts(productsResult.data);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const productData = {
      project_id: projectId,
      name: formData.name,
      description: formData.description,
      price: formData.price || null,
      target_segment: formData.target_segment || null,
      unique_value_proposition: formData.unique_value_proposition || null,
      status: formData.status,
    };

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingId);

      if (error) {
        showToast('Failed to update product. Please try again.', 'error');
      } else {
        showToast('Product updated successfully!', 'success');
        resetForm();
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        showToast('Failed to create product. Please try again.', 'error');
      } else {
        showToast('Product created successfully!', 'success');
        resetForm();
        loadData();
      }
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price || '',
      target_segment: product.target_segment || '',
      unique_value_proposition: product.unique_value_proposition || '',
      status: product.status,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? All associated content and visuals will be unlinked.')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Failed to delete product. Please try again.', 'error');
    } else {
      showToast('Product deleted successfully!', 'success');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      target_segment: '',
      unique_value_proposition: '',
      status: 'active',
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
                  placeholder="What does this product offer?"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <Input
                  label="Price"
                  placeholder="e.g., $99/month or Free"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                <Textarea
                  label="Target Segment"
                  placeholder="Who is this product specifically for?"
                  rows={2}
                  value={formData.target_segment}
                  onChange={(e) => setFormData({ ...formData, target_segment: e.target.value })}
                />
                <Textarea
                  label="Unique Value Proposition"
                  placeholder="What makes this product unique?"
                  rows={2}
                  value={formData.unique_value_proposition}
                  onChange={(e) => setFormData({ ...formData, unique_value_proposition: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit">
                    {editingId ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {products.length === 0 ? (
              <Card className="md:col-span-2">
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first product to organize content and visuals
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-5 h-5" />
                    Add Product
                  </Button>
                </div>
              </Card>
            ) : (
              products.map((product) => (
                <Card key={product.id} hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                        {product.price && (
                          <p className="text-[var(--color-cyan-accent)] font-medium mb-2">
                            {product.price}
                          </p>
                        )}
                        <p className="text-gray-400 text-sm">{product.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {product.unique_value_proposition && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Unique Value</p>
                        <p className="text-sm">{product.unique_value_proposition}</p>
                      </div>
                    )}
                    {product.target_segment && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target Segment</p>
                        <p className="text-sm">{product.target_segment}</p>
                      </div>
                    )}
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : product.status === 'draft'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
