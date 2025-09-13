import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'] & {
  category?: Tables['categories']['Row'];
  brand?: Tables['brands']['Row'];
  supplier?: Tables['profiles']['Row'];
  images?: Tables['product_images']['Row'][];
};

type Order = Tables['orders']['Row'] & {
  customer?: Tables['profiles']['Row'];
  supplier?: Tables['profiles']['Row'];
  items?: (Tables['order_items']['Row'] & {
    product?: Tables['products']['Row'];
  })[];
};

type Category = Tables['categories']['Row'];
type Brand = Tables['brands']['Row'];
type Campaign = Tables['campaigns']['Row'];
type Profile = Tables['profiles']['Row'];
type Customer = Tables['customers']['Row'];
type Supplier = Tables['suppliers']['Row'];

export function useSupabaseData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products with relations
  const fetchProducts = async (filters?: {
    category_id?: string;
    supplier_id?: string;
    search?: string;
    status?: string;
  }) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty products');
        setProducts([]);
        return [];
      }

      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*),
            supplier:profiles(*),
            images:product_images(*)
          `);

        if (filters?.category_id) {
          query = query.eq('category_id', filters.category_id);
        }

        if (filters?.supplier_id) {
          query = query.eq('supplier_id', filters.supplier_id);
        }

        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProducts(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch products from Supabase, using empty array:', fetchError);
        setProducts([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      return [];
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty categories');
        setCategories([]);
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) {
          throw error;
        }

        setCategories(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch categories from Supabase, using empty array:', fetchError);
        setCategories([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      return [];
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty brands');
        setBrands([]);
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          throw error;
        }

        setBrands(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch brands from Supabase, using empty array:', fetchError);
        setBrands([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
      return [];
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty campaigns');
        setCampaigns([]);
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) {
          throw error;
        }

        setCampaigns(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch campaigns from Supabase, using empty array:', fetchError);
        setCampaigns([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
      return [];
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      console.log('🔍 Fetching customers...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty customers');
        setCustomers([]);
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            *,
            profiles!customers_id_fkey(*)
          `)
          .eq('is_active', true)
          .order('company_name');

        if (error) {
          console.error('❌ Error fetching customers:', error);
          throw error;
        }

        console.log('✅ Customers fetched:', data);
        setCustomers(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch customers from Supabase, using empty array:', fetchError);
        setCustomers([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      return [];
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      console.log('🔍 Fetching suppliers...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty suppliers');
        setSuppliers([]);
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('is_active', true)
          .order('company_name');

        if (error) {
          console.error('❌ Error fetching suppliers:', error);
          throw error;
        }

        console.log('✅ Suppliers fetched:', data);
        setSuppliers(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch suppliers from Supabase, using empty array:', fetchError);
        setSuppliers([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
      return [];
    }
  };

  // Fetch orders with relations
  const fetchOrders = async (filters?: {
    customer_id?: string;
    supplier_id?: string;
    status?: string;
  }) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty orders');
        setOrders([]);
        return [];
      }

      try {
        let query = supabase
          .from('orders')
          .select(`
            *,
            customer:profiles!orders_customer_id_fkey(*),
            supplier:profiles!orders_supplier_id_fkey(*),
            items:order_items(
              *,
              product:products(*)
            )
          `);

        if (filters?.customer_id) {
          query = query.eq('customer_id', filters.customer_id);
        }

        if (filters?.supplier_id) {
          query = query.eq('supplier_id', filters.supplier_id);
        }

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch orders from Supabase, using empty array:', fetchError);
        setOrders([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      return [];
    }
  };

  // Fetch profiles
  const fetchProfiles = async (role?: string) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        console.log('Supabase not configured, using empty profiles');
        setProfiles([]);
        return [];
      }

      try {
        let query = supabase.from('profiles').select('*');

        if (role) {
          query = query.eq('role', role);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProfiles(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('Failed to fetch profiles from Supabase, using empty array:', fetchError);
        setProfiles([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      return [];
    }
  };

  // Create product
  const createProduct = async (productData: Tables['products']['Insert']) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase bağlantısı kurulmamış. Lütfen veritabanı bağlantısını kurun.');
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select();

      if (error) {
        console.error('Supabase product creation error:', error);
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id: string, updates: Tables['products']['Update']) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase bağlantısı kurulmamış. Lütfen veritabanı bağlantısını kurun.');
      }

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase product update error:', error);
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Create category
  const createCategory = async (categoryData: Tables['categories']['Insert']) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase bağlantısı kurulmamış. Lütfen veritabanı bağlantısını kurun.');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select();

      if (error) {
        console.error('Supabase category creation error:', error);
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  // Update category
  const updateCategory = async (id: string, updates: Tables['categories']['Update']) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase bağlantısı kurulmamış. Lütfen veritabanı bağlantısını kurun.');
      }

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase category update error:', error);
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Create order
  const createOrder = async (orderData: Tables['orders']['Insert'], items: Tables['order_items']['Insert'][]) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      const orderItems = items.map(item => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      await fetchOrders();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Update order status
  const updateOrderStatus = async (id: string, status: Tables['orders']['Row']['status']) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // Create supplier
  const createSupplier = async (supplierData: Tables['suppliers']['Insert']) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase bağlantısı kurulmamış. Lütfen veritabanı bağlantısını kurun.');
      }

      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select();

      if (error) {
        console.error('Supabase supplier creation error:', error);
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  // Create customer
  const createCustomer = async (customerData: Tables['customers']['Insert']) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase bağlantısı kurulmamış. Lütfen veritabanı bağlantısını kurun.');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select();

      if (error) {
        console.error('Supabase customer creation error:', error);
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  // Initial data load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const loadInitialData = async () => {
      setLoading(true);
      
      // Set maximum loading time
      timeoutId = setTimeout(() => {
        console.log('Data loading timeout, setting loading to false');
        setLoading(false);
      }, 3000);
      
      try {
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchBrands(),
          fetchCampaigns(),
          fetchOrders(),
          fetchProfiles(),
          fetchCustomers(),
          fetchSuppliers(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    loadInitialData();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    // Data
    products,
    categories,
    brands,
    campaigns,
    orders,
    profiles,
    customers,
    suppliers,
    loading,
    
    // Fetch functions
    fetchProducts,
    fetchCategories,
    fetchBrands,
    fetchCampaigns,
    fetchOrders,
    fetchProfiles,
    fetchCustomers,
    fetchSuppliers,
    
    // CRUD functions
    createProduct,
    updateProduct,
    createCategory,
    updateCategory,
    createOrder,
    updateOrderStatus,
    createSupplier,
    createCustomer,
  };
}