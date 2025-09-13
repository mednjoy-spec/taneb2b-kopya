import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { 
  Search, Filter, Grid3x3, List, ShoppingCart, Heart, 
  LogOut, Menu, X, Star, Tag, Clock, ChevronDown, Eye,
  Plus, Minus, Trash2, Package, CheckCircle
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxOrder: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: CartItem[];
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Bekliyor';
    case 'confirmed': return 'Onaylandı';
    case 'preparing': return 'Hazırlanıyor';
    case 'completed': return 'Tamamlandı';
    case 'cancelled': return 'İptal Edildi';
    default: return status;
  }
}

export default function CustomerPanel() {
  const { user, logout } = useUser();
  const { 
    products: supabaseProducts, 
    categories: supabaseCategories,
    orders: supabaseOrders,
    loading: dataLoading,
    createOrder,
    fetchProducts,
    fetchCategories,
    fetchOrders
  } = useSupabaseData();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [activeView, setActiveView] = useState<'products' | 'orders'>('products');
  const [activeOrderTab, setActiveOrderTab] = useState('current');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Convert Supabase orders to component format
  const currentOrders: Order[] = supabaseOrders
    .filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status))
    .map(order => ({
      id: order.order_number,
      date: new Date(order.created_at).toISOString().split('T')[0],
      status: getStatusText(order.status),
      total: order.total_amount,
      items: order.items?.map(item => ({
        id: item.product_id || '',
        name: item.product?.name || 'Ürün',
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product?.main_image_url || 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        maxOrder: item.product?.max_order_quantity || 100
      })) || []
    }));

  const pastOrders: Order[] = supabaseOrders
    .filter(order => ['completed', 'cancelled'].includes(order.status))
    .map(order => ({
      id: order.order_number,
      date: new Date(order.created_at).toISOString().split('T')[0],
      status: getStatusText(order.status),
      total: order.total_amount,
      items: order.items?.map(item => ({
        id: item.product_id || '',
        name: item.product?.name || 'Ürün',
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product?.main_image_url || 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        maxOrder: item.product?.max_order_quantity || 100
      })) || []
    }));

  // Convert Supabase categories to component format
  const categories = [
    { id: 'all', name: 'Tüm Ürünler', icon: '🏪', count: supabaseProducts.length },
    ...supabaseCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '🥤',
      count: supabaseProducts.filter(p => p.category_id === cat.id).length
    }))
  ];

  // Load categories on component mount
  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Convert Supabase products to component format
  const products = supabaseProducts.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category_id || 'other',
    brand: product.brand?.name || 'Marka',
    shelfPrice: product.shelf_price,
    salePrice: product.sale_price,
    discount: Math.round(((product.shelf_price - product.sale_price) / product.shelf_price) * 100),
    image: product.main_image_url || 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    secondImage: product.hover_image_url || product.main_image_url || 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    stock: product.stock_quantity,
    minOrder: product.min_order_quantity,
    maxOrder: product.max_order_quantity,
    isOpportunity: product.is_opportunity,
    opportunityEnd: product.opportunity_end_date
  }));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity < product.maxOrder) {
        setCart(cart.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        image: product.image,
        maxOrder: product.maxOrder
      };
      setCart([...cart, newItem]);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        customer_id: user?.id,
        total_amount: getCartTotal(),
        status: 'pending' as const,
        delivery_address: user?.profile?.address,
        delivery_phone: user?.profile?.phone,
        delivery_email: user?.profile?.email
      };

      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      await createOrder(orderData, orderItems);
      setCart([]);
      setShowCart(false);
      alert('Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      alert('Sipariş oluşturulurken bir hata oluştu.');
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalCartItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Süresi doldu';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}g ${hours}s kaldı`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <ShoppingCart className="w-5 h-5 text-white" />
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
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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

          {/* Categories */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Kategoriler</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ürün, marka ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Cart */}
              <button 
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalCartItems()}
                  </span>
                )}
              </button>

              {/* Orders Button */}
              <button 
                onClick={() => setActiveView(activeView === 'orders' ? 'products' : 'orders')}
                className={`p-2 transition-colors ${
                  activeView === 'orders' 
                    ? 'text-blue-600 bg-blue-50 rounded-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Siparişlerim"
              >
                <Package className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Campaign Banner - Only show on products view */}
        {activeView === 'products' && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
            <div className="flex items-center justify-center">
              <Tag className="w-5 h-5 mr-2" />
              <span className="font-semibold">Yılbaşı Kampanyası: Tüm içeceklerde %20'ye varan indirim!</span>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Sepetim ({getTotalCartItems()} ürün)
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sepetiniz boş</h3>
                    <p className="text-gray-600">Ürün eklemek için alışverişe başlayın.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-blue-600 font-semibold">₺{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxOrder}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                        <span className="text-xl font-bold text-blue-600">₺{getCartTotal().toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handlePlaceOrder}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        Siparişi Tamamla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeView === 'products' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.find(cat => cat.id === selectedCategory)?.name} 
                  <span className="text-gray-500 text-lg font-normal ml-2">
                    ({filteredProducts.length} ürün)
                  </span>
                </h2>
                
                <div className="flex items-center space-x-4">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Varsayılan Sıralama</option>
                    <option>Fiyat: Düşükten Yükseğe</option>
                    <option>Fiyat: Yüksekten Düşüğe</option>
                    <option>A'dan Z'ye</option>
                    <option>Z'den A'ya</option>
                  </select>
                </div>
              </div>

              {/* Products Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300"
                        />
                        <img
                          src={product.secondImage}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col space-y-1">
                          {product.discount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              %{product.discount}
                            </span>
                          )}
                          {product.isOpportunity && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Fırsat
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-2">
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                            <Heart className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            {product.discount > 0 && (
                              <span className="text-sm text-gray-400 line-through mr-2">
                                ₺{product.shelfPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold text-blue-600">
                              ₺{product.salePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {product.isOpportunity && (
                          <div className="text-xs text-orange-600 mb-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeRemaining(product.opportunityEnd!)}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>Min: {product.minOrder} adet</span>
                          <span>Stok: {product.stock}</span>
                        </div>

                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Marka</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Raf Fiyatı</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Satış Fiyatı</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">İndirim</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-lg overflow-hidden mr-4">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                  {product.isOpportunity && (
                                    <p className="text-xs text-orange-600 flex items-center mt-1">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTimeRemaining(product.opportunityEnd!)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.brand}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">₺{product.shelfPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-blue-600">₺{product.salePrice.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              {product.discount > 0 ? (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  %{product.discount}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.stock} adet</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => addToCart(product.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                              >
                                Sepete Ekle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün bulunamadı</h3>
                  <p className="text-gray-600">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
                </div>
              )}
            </>
          )}

          {activeView === 'orders' && (
            <div className="space-y-6">
              {/* Orders Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Siparişlerim</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveOrderTab('current')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeOrderTab === 'current'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mevcut Siparişler ({currentOrders.length})
                  </button>
                  <button
                    onClick={() => setActiveOrderTab('past')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeOrderTab === 'past'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Geçmiş Siparişler ({pastOrders.length})
                  </button>
                </div>
              </div>

              {/* Current Orders */}
              {activeOrderTab === 'current' && (
                <div className="space-y-4">
                  {currentOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Mevcut siparişiniz yok</h3>
                      <p className="text-gray-600 mb-6">Yeni sipariş vermek için alışverişe başlayın.</p>
                      <button
                        onClick={() => setActiveView('products')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Alışverişe Başla
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {currentOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{order.id}</h4>
                              <p className="text-sm text-gray-600">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                order.status === 'Hazırlanıyor' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'Onaylandı' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {order.status}
                              </span>
                              <p className="text-xl font-bold text-gray-900 mt-1">₺{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <h5 className="font-medium text-gray-900 mb-3">Sipariş Ürünleri</h5>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">{item.quantity} adet × ₺{item.price.toFixed(2)}</p>
                                  </div>
                                  <p className="font-semibold text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Past Orders */}
              {activeOrderTab === 'past' && (
                <div className="space-y-4">
                  {pastOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Geçmiş siparişiniz yok</h3>
                      <p className="text-gray-600">Henüz tamamlanmış siparişiniz bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pastOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{order.id}</h4>
                              <p className="text-sm text-gray-600">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {order.status}
                              </span>
                              <p className="text-xl font-bold text-gray-900 mt-1">₺{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <h5 className="font-medium text-gray-900 mb-3">Sipariş Ürünleri</h5>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">{item.quantity} adet × ₺{item.price.toFixed(2)}</p>
                                  </div>
                                  <p className="font-semibold text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Tekrar Sipariş Ver
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          )}
        </main>
      </div>
    </div>
  );
}