import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { 
  Package, Plus, Edit3, Eye, Search, Filter, BarChart3, 
  ShoppingCart, TrendingUp, AlertCircle, LogOut, Menu, X,
  Save, Upload, Image as ImageIcon, Trash2, Tag, MapPin, Phone, Mail
} from 'lucide-react';



interface OrderDetail {
  id: string;
  customer: string;
  products: string;
  amount: string;
  status: string;
  date: string;
  address: string;
  phone: string;
  email: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function SupplierPanel() {
  const { user, logout } = useUser();
  const { 
    products, 
    categories, 
    orders,
    loading,
    createProduct,
    updateProduct,
    createCategory,
    updateCategory,
    fetchProducts,
    fetchCategories,
    fetchOrders
  } = useSupabaseData();
  
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category_id: '',
    shelfPrice: '',
    salePrice: '',
    stock: ''
  });

  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    icon: '🥤'
  });

  const menuItems = [
    { id: 'products', name: 'Ürünlerim', icon: Package },
    { id: 'categories', name: 'Kategorilerim', icon: Tag },
    { id: 'orders', name: 'Siparişlerim', icon: ShoppingCart },
    { id: 'analytics', name: 'İstatistikler', icon: BarChart3 },
  ];

  // Filter products to show only supplier's own products
  const supplierProducts = products.filter(product => product.supplier_id === user?.id);

  // Filter orders to show only orders containing supplier's products
  const myOrders: OrderDetail[] = orders
    .map(order => {
      // Filter order items to only include this supplier's products
      const supplierItems = order.items?.filter(item => 
        supplierProducts.some(product => product.id === item.product_id)
      ) || [];
      
      // Only include orders that have items from this supplier
      if (supplierItems.length === 0) return null;
      
      // Calculate total amount for supplier's items only
      const supplierTotal = supplierItems.reduce((sum, item) => sum + item.total_price, 0);
      
      return {
        id: order.order_number,
        customer: order.customer?.company || order.customer?.name || 'Müşteri',
        products: supplierItems
          .map(item => `${item.product?.name} (${item.quantity} adet)`)
          .join(', '),
        amount: `₺${supplierTotal.toFixed(2)}`,
        status: order.status === 'pending' ? 'Beklemede' :
                order.status === 'confirmed' ? 'Onaylandı' :
                order.status === 'preparing' ? 'Hazırlanıyor' :
                order.status === 'completed' ? 'Tamamlandı' :
                order.status === 'cancelled' ? 'İptal Edildi' : order.status,
        date: new Date(order.created_at).toISOString().split('T')[0],
        address: order.delivery_address || 'Adres belirtilmemiş',
        phone: order.delivery_phone || 'Telefon belirtilmemiş',
        email: order.delivery_email || order.customer?.email || 'E-posta belirtilmemiş',
        items: supplierItems.map(item => ({
          productName: item.product?.name || 'Ürün',
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        }))
      };
    })
    .filter((order): order is OrderDetail => order !== null); // Remove null entries

  const stats = [
    { title: 'Toplam Ürün', value: supplierProducts.length.toString(), icon: Package, color: 'blue' },
    { title: 'Toplam Sipariş', value: myOrders.length, icon: ShoppingCart, color: 'green' },
    { title: 'Aylık Satış', value: '₺12,450', icon: TrendingUp, color: 'purple' },
    { title: 'Düşük Stok', value: '2', icon: AlertCircle, color: 'red' }
  ];

  // Load supplier's data on component mount
  React.useEffect(() => {
    if (user?.id) {
      fetchProducts({ supplier_id: user.id });
      fetchOrders({ supplier_id: user.id });
      fetchCategories();
    }
  }, [user?.id, fetchProducts, fetchOrders, fetchCategories]);

  const handleAddProduct = async () => {
    if (!newProductForm.name || !newProductForm.shelfPrice || !newProductForm.salePrice || !newProductForm.stock) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    const productData = {
      name: newProductForm.name,
      category_id: newProductForm.category_id || null,
      supplier_id: user?.id,
      shelf_price: parseFloat(newProductForm.shelfPrice),
      sale_price: parseFloat(newProductForm.salePrice),
      stock_quantity: parseInt(newProductForm.stock),
      status: 'active' as const,
      min_order_quantity: 1,
      max_order_quantity: 100
    };

    try {
      await createProduct(productData);
      await fetchProducts({ supplier_id: user?.id }); // Refresh supplier's products only
      setNewProductForm({
        name: '',
        category_id: '',
        shelfPrice: '',
        salePrice: '',
        stock: ''
      });
      setShowAddProduct(false);
      alert('Ürün başarıyla eklendi!');
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      alert(`Ürün eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductForm({
      name: product.name,
      category_id: product.category_id || '',
      shelfPrice: product.shelf_price?.toString() || '',
      salePrice: product.sale_price?.toString() || '',
      stock: product.stock_quantity?.toString() || ''
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !newProductForm.name || !newProductForm.shelfPrice || !newProductForm.salePrice || !newProductForm.stock) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    const updates = {
      name: newProductForm.name,
      category_id: newProductForm.category_id || null,
      shelf_price: parseFloat(newProductForm.shelfPrice),
      sale_price: parseFloat(newProductForm.salePrice),
      stock_quantity: parseInt(newProductForm.stock)
    };

    try {
      await updateProduct(editingProduct.id, updates);
      await fetchProducts({ supplier_id: user?.id }); // Refresh supplier's products only
      setEditingProduct(null);
      setNewProductForm({
        name: '',
        category_id: '',
        shelfPrice: '',
        salePrice: '',
        stock: ''
      });
      setShowAddProduct(false);
      alert('Ürün başarıyla güncellendi!');
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      alert(`Ürün güncellenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryForm.name) {
      alert('Lütfen kategori adını girin.');
      return;
    }

    const categoryData = {
      name: newCategoryForm.name,
      icon: newCategoryForm.icon,
      is_active: true,
      sort_order: 0
    };

    try {
      await createCategory(categoryData);
      await fetchCategories(); // Refresh categories list
      setNewCategoryForm({ name: '', icon: '🥤' });
      setShowAddCategory(false);
      alert('Kategori başarıyla eklendi!');
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      alert(`Kategori eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryForm({
      name: category.name,
      icon: category.icon
    });
    setShowAddCategory(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryForm.name) {
      alert('Lütfen kategori adını girin.');
      return;
    }

    const updates = {
      name: newCategoryForm.name,
      icon: newCategoryForm.icon
    };

    try {
      await updateCategory(editingCategory.id, updates);
      await fetchCategories(); // Refresh categories list
      setEditingCategory(null);
      setNewCategoryForm({ name: '', icon: '🥤' });
      setShowAddCategory(false);
      alert('Kategori başarıyla güncellendi!');
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      alert(`Kategori güncellenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const handleOrderClick = (order: OrderDetail) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const filteredProducts = supplierProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TanePro B2B</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.profile?.name?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.profile?.name}</p>
                  <p className="text-xs text-gray-500">{user?.profile?.company}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.name}
              </h2>
            </div>
            
            {activeTab === 'products' && (
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setNewProductForm({
                    name: '',
                    category_id: '',
                    shelfPrice: '',
                    salePrice: '',
                    stock: ''
                  });
                  setShowAddProduct(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün Ekle
              </button>
            )}
            
            {activeTab === 'categories' && (
              <button 
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategoryForm({ name: '', icon: '🥤' });
                  setShowAddCategory(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kategori Ekle
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Add/Edit Product Modal */}
          {showAddProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ürün Adı *
                      </label>
                      <input
                        type="text"
                        value={newProductForm.name}
                        onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ürün adını girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori *
                      </label>
                      <select
                        value={newProductForm.category_id}
                        onChange={(e) => setNewProductForm({...newProductForm, category_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Kategori seçin</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raf Fiyatı (₺) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProductForm.shelfPrice}
                        onChange={(e) => setNewProductForm({...newProductForm, shelfPrice: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Satış Fiyatı (₺) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProductForm.salePrice}
                        onChange={(e) => setNewProductForm({...newProductForm, salePrice: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stok Adedi *
                      </label>
                      <input
                        type="number"
                        value={newProductForm.stock}
                        onChange={(e) => setNewProductForm({...newProductForm, stock: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingProduct ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Category Modal */}
          {showAddCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm({...newCategoryForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Kategori adını girin"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İkon
                    </label>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{newCategoryForm.icon}</span>
                      <input
                        type="text"
                        value={newCategoryForm.icon}
                        onChange={(e) => setNewCategoryForm({...newCategoryForm, icon: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="🥤"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Emoji kullanabilirsiniz (🥤, 💧, 🧃, ⚡, ☕)
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddCategory(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCategory ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Detail Modal */}
          {showOrderDetail && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Sipariş Detayı - {selectedOrder.id}
                    </h3>
                    <button
                      onClick={() => setShowOrderDetail(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      selectedOrder.status === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'Hazırlanıyor' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                    <span className="text-sm text-gray-500">{selectedOrder.date}</span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Müşteri Bilgileri</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 w-20">Firma:</span>
                        <span className="text-gray-600">{selectedOrder.customer}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedOrder.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedOrder.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedOrder.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Sipariş Ürünleri</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adet</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">₺{item.unitPrice.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">₺{item.totalPrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Toplam Tutar:</span>
                      <span className="text-xl font-bold text-green-600">{selectedOrder.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ürün ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Ürün Listesi</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raf Fiyatı</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satış Fiyatı</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={product.main_image_url || 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover mr-4"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || 'Kategori yok'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">₺{product.shelf_price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">₺{product.sale_price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.stock_quantity < 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {product.stock_quantity} adet
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                title="Düzenle"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Görüntüle">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800 transition-colors" title="Sil">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Kategori Listesi</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İkon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Sayısı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                        <td className="px-6 py-4 text-2xl">{category.icon}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {supplierProducts.filter(p => p.category_id === category.id).length} ürün
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditCategory(category)}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
                                  // TODO: Implement delete category
                                  alert('Kategori silme özelliği yakında eklenecek');
                                }
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Sipariş Listesi</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürünler</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.products}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{order.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                            order.status === 'Hazırlanıyor' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <p className="text-sm text-gray-600">
                  💡 Sipariş detaylarını görmek için satıra tıklayın
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                          <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Satış Grafiği</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Grafik burada görünecek</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Dağılımı</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Grafik burada görünecek</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}