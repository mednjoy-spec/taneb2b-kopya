import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { 
  Users, UserPlus, Building, Package, ShoppingCart, BarChart3, 
  Search, Filter, Edit3, Eye, Trash2, Plus, Save, X, LogOut,
  Menu, Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, Clock, Star
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useUser();
  const { signUp } = useSupabaseAuth();
  const {
    products,
    orders,
    profiles,
    customers,
    suppliers,
    loading,
    fetchProfiles,
    fetchCustomers,
    fetchSuppliers,
    fetchOrders,
    createSupplier,
    createCustomer,
    updateOrderStatus
  } = useSupabaseData();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    address: '',
    city: '',
    tax_number: '',
    commission_rate: '0',
    min_order_amount: '0',
    delivery_days: '3'
  });

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    address: '',
    city: '',
    tax_number: '',
    credit_limit: '0',
    payment_terms: '30',
    discount_rate: '0'
  });

  const menuItems = [
    { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
    { id: 'suppliers', name: 'Tedarikçiler', icon: Building },
    { id: 'customers', name: 'Müşteriler', icon: Users },
    { id: 'orders', name: 'Siparişler', icon: ShoppingCart },
    { id: 'products', name: 'Ürünler', icon: Package },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchProfiles();
    fetchCustomers();
    fetchSuppliers();
    fetchOrders();
  }, [fetchProfiles, fetchCustomers, fetchSuppliers, fetchOrders]);

  const handleAddSupplier = async () => {
    if (!newSupplierForm.name || !newSupplierForm.email || !newSupplierForm.password || !newSupplierForm.company_name) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      console.log('Creating supplier with data:', newSupplierForm);
      
      // 1. Create auth user and profile
      const authResult = await signUp(newSupplierForm.email, newSupplierForm.password, {
        name: newSupplierForm.name,
        role: 'supplier',
        company: newSupplierForm.company_name,
        phone: newSupplierForm.phone || '',
        address: newSupplierForm.address || '',
        city: newSupplierForm.city || ''
      });

      if (!authResult.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      console.log('Auth user created:', authResult.user.id);

      // 2. Create supplier record
      const supplierData = {
        id: authResult.user.id,
        company_name: newSupplierForm.company_name,
        tax_number: newSupplierForm.tax_number || null,
        commission_rate: parseFloat(newSupplierForm.commission_rate) || 0,
        min_order_amount: parseFloat(newSupplierForm.min_order_amount) || 0,
        delivery_days: parseInt(newSupplierForm.delivery_days) || 3,
        is_verified: false,
        is_active: true
      };

      console.log('Creating supplier record with:', supplierData);
      await createSupplier(supplierData);

      // Reset form and close modal
      setNewSupplierForm({
        name: '',
        email: '',
        password: '',
        company_name: '',
        phone: '',
        address: '',
        city: '',
        tax_number: '',
        commission_rate: '0',
        min_order_amount: '0',
        delivery_days: '3'
      });
      setShowAddSupplier(false);
      
      // Refresh data
      await fetchSuppliers();
      alert('Tedarikçi başarıyla eklendi!');
    } catch (error) {
      console.error('Tedarikçi ekleme hatası:', error);
      alert(`Tedarikçi eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerForm.name || !newCustomerForm.email || !newCustomerForm.password || !newCustomerForm.company_name) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      console.log('Creating customer with data:', newCustomerForm);
      
      // 1. Create auth user and profile
      const authResult = await signUp(newCustomerForm.email, newCustomerForm.password, {
        name: newCustomerForm.name,
        role: 'customer',
        company: newCustomerForm.company_name,
        phone: newCustomerForm.phone || '',
        address: newCustomerForm.address || '',
        city: newCustomerForm.city || ''
      });

      if (!authResult.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      console.log('Auth user created:', authResult.user.id);

      // 2. Create customer record
      const customerData = {
        id: authResult.user.id,
        company_name: newCustomerForm.company_name,
        tax_number: newCustomerForm.tax_number || null,
        credit_limit: parseFloat(newCustomerForm.credit_limit) || 0,
        payment_terms: parseInt(newCustomerForm.payment_terms) || 30,
        discount_rate: parseFloat(newCustomerForm.discount_rate) || 0,
        delivery_address: newCustomerForm.address || null,
        billing_address: newCustomerForm.address || null,
        is_active: true
      };

      console.log('Creating customer record with:', customerData);
      await createCustomer(customerData);

      // Reset form and close modal
      setNewCustomerForm({
        name: '',
        email: '',
        password: '',
        company_name: '',
        phone: '',
        address: '',
        city: '',
        tax_number: '',
        credit_limit: '0',
        payment_terms: '30',
        discount_rate: '0'
      });
      setShowAddCustomer(false);
      
      // Refresh data
      await fetchCustomers();
      alert('Müşteri başarıyla eklendi!');
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      alert(`Müşteri eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const stats = [
    { title: 'Toplam Tedarikçi', value: suppliers.length.toString(), icon: Building, color: 'blue' },
    { title: 'Toplam Müşteri', value: customers.length.toString(), icon: Users, color: 'green' },
    { title: 'Toplam Sipariş', value: orders.length.toString(), icon: ShoppingCart, color: 'purple' },
    { title: 'Toplam Ürün', value: products.length.toString(), icon: Package, color: 'orange' }
  ];

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'preparing': return 'Hazırlanıyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
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
                    {user?.profile?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.profile?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.profile?.role || 'admin'}</p>
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
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
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
            
            {(activeTab === 'suppliers' || activeTab === 'customers') && (
              <button 
                onClick={() => activeTab === 'suppliers' ? setShowAddSupplier(true) : setShowAddCustomer(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'suppliers' ? 'Yeni Tedarikçi Ekle' : 'Yeni Müşteri Ekle'}
              </button>
            )}
          </div>
        </header>

        {/* Add Supplier Modal */}
        {showAddSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Yeni Tedarikçi Ekle</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      value={newSupplierForm.name}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tedarikçi adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      value={newSupplierForm.email}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre *
                    </label>
                    <input
                      type="password"
                      value={newSupplierForm.password}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket Adı *
                    </label>
                    <input
                      type="text"
                      value={newSupplierForm.company_name}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, company_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Şirket adı"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={newSupplierForm.phone}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vergi Numarası
                    </label>
                    <input
                      type="text"
                      value={newSupplierForm.tax_number}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, tax_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şehir
                    </label>
                    <input
                      type="text"
                      value={newSupplierForm.city}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İstanbul"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Komisyon Oranı (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSupplierForm.commission_rate}
                      onChange={(e) => setNewSupplierForm({...newSupplierForm, commission_rate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={newSupplierForm.address}
                    onChange={(e) => setNewSupplierForm({...newSupplierForm, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Tam adres"
                  />
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddSupplier(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Yeni Müşteri Ekle</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      value={newCustomerForm.name}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Müşteri adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre *
                    </label>
                    <input
                      type="password"
                      value={newCustomerForm.password}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Firma Adı *
                    </label>
                    <input
                      type="text"
                      value={newCustomerForm.company_name}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, company_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Firma adı"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vergi Numarası
                    </label>
                    <input
                      type="text"
                      value={newCustomerForm.tax_number}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, tax_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şehir
                    </label>
                    <input
                      type="text"
                      value={newCustomerForm.city}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İstanbul"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kredi Limiti (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCustomerForm.credit_limit}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, credit_limit: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={newCustomerForm.address}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Tam adres"
                  />
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
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

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.customer?.name || 'Müşteri'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">₺{order.total_amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Tedarikçi Listesi</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tedarikçi ara..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tedarikçi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şirket</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {supplier.profile?.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{supplier.profile?.name || 'İsim yok'}</p>
                              <p className="text-sm text-gray-500">{supplier.profile?.city || 'Şehir belirtilmemiş'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.company_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.profile?.email || 'E-posta yok'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.profile?.phone || 'Telefon yok'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {supplier.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Görüntüle">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Düzenle">
                              <Edit3 className="w-4 h-4" />
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
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Müşteri Listesi</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Müşteri ara..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kredi Limiti</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {customer.profiles?.name?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{customer.profiles?.name || 'İsim yok'}</p>
                              <p className="text-sm text-gray-500">{customer.profiles?.city || 'Şehir belirtilmemiş'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{customer.company_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{customer.profiles?.email || 'E-posta yok'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{customer.profiles?.phone || 'Telefon yok'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">₺{customer.credit_limit.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Görüntüle">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Düzenle">
                              <Edit3 className="w-4 h-4" />
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
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Sipariş Listesi</h3>
                  <div className="flex items-center space-x-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>Tüm Durumlar</option>
                      <option>Bekliyor</option>
                      <option>Onaylandı</option>
                      <option>Hazırlanıyor</option>
                      <option>Tamamlandı</option>
                      <option>İptal Edildi</option>
                    </select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Sipariş ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tedarikçi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.customer?.name || 'Müşteri'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.supplier?.name || 'Tedarikçi'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">₺{order.total_amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Görüntüle">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Düzenle">
                              <Edit3 className="w-4 h-4" />
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

          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Ürün Listesi</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Ürün ara..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tedarikçi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raf Fiyatı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satış Fiyatı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
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
                              <p className="text-sm text-gray-500">{product.brand?.name || 'Marka yok'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || 'Kategori yok'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.supplier?.name || 'Tedarikçi yok'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">₺{product.shelf_price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">₺{product.sale_price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.stock_quantity < 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {product.stock_quantity} adet
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Görüntüle">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 transition-colors" title="Düzenle">
                              <Edit3 className="w-4 h-4" />
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
          )}
        </main>
      </div>
    </div>
  );
}