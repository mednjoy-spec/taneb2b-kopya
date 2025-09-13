import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log the current configuration
console.log('🔍 Supabase Configuration Check:');
console.log('📍 URL:', supabaseUrl || 'NOT SET');
console.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'NOT SET');
console.log('✅ URL Status:', supabaseUrl && !supabaseUrl.includes('your-project') ? 'VALID' : 'INVALID');
console.log('✅ Key Status:', supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key') ? 'VALID' : 'INVALID');
console.log('🌐 Connection Status:', (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-anon-key')) ? 'READY' : 'NOT CONFIGURED');

// Provide fallback values for development
const defaultUrl = supabaseUrl || 'https://your-project.supabase.co';
const defaultKey = supabaseAnonKey || 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using fallback values for development.');
  console.log('To connect to Supabase, please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test connection
supabase.auth.onAuthStateChange((event, session) => {
  if (supabaseUrl && supabaseAnonKey) {
    console.log('Auth state changed:', event, session?.user?.id);
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'manager' | 'supplier' | 'customer';
          company: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'manager' | 'supplier' | 'customer';
          company?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'admin' | 'manager' | 'supplier' | 'customer';
          company?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          description: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          icon?: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          icon?: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          description: string | null;
          website: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category_id: string | null;
          brand_id: string | null;
          supplier_id: string | null;
          shelf_price: number;
          sale_price: number;
          stock_quantity: number;
          min_order_quantity: number;
          max_order_quantity: number;
          status: 'active' | 'inactive' | 'out_of_stock';
          is_opportunity: boolean;
          opportunity_end_date: string | null;
          discount_percentage: number;
          main_image_url: string | null;
          hover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          supplier_id?: string | null;
          shelf_price: number;
          sale_price: number;
          stock_quantity?: number;
          min_order_quantity?: number;
          max_order_quantity?: number;
          status?: 'active' | 'inactive' | 'out_of_stock';
          is_opportunity?: boolean;
          opportunity_end_date?: string | null;
          discount_percentage?: number;
          main_image_url?: string | null;
          hover_image_url?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          supplier_id?: string | null;
          shelf_price?: number;
          sale_price?: number;
          stock_quantity?: number;
          min_order_quantity?: number;
          max_order_quantity?: number;
          status?: 'active' | 'inactive' | 'out_of_stock';
          is_opportunity?: boolean;
          opportunity_end_date?: string | null;
          discount_percentage?: number;
          main_image_url?: string | null;
          hover_image_url?: string | null;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: {
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          supplier_id: string | null;
          status: 'pending' | 'confirmed' | 'preparing' | 'completed' | 'cancelled';
          total_amount: number;
          notes: string | null;
          delivery_address: string | null;
          delivery_phone: string | null;
          delivery_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_number?: string;
          customer_id?: string | null;
          supplier_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'completed' | 'cancelled';
          total_amount?: number;
          notes?: string | null;
          delivery_address?: string | null;
          delivery_phone?: string | null;
          delivery_email?: string | null;
        };
        Update: {
          order_number?: string;
          customer_id?: string | null;
          supplier_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'completed' | 'cancelled';
          total_amount?: number;
          notes?: string | null;
          delivery_address?: string | null;
          delivery_phone?: string | null;
          delivery_email?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      campaigns: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          image_url?: string | null;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          image_url?: string | null;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          sort_order?: number;
        };
      };
    };
    customers: {
      Row: {
        id: string;
        company_name: string;
        tax_number: string | null;
        credit_limit: number;
        payment_terms: number;
        discount_rate: number;
        delivery_address: string | null;
        billing_address: string | null;
        contact_person: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id: string;
        company_name: string;
        tax_number?: string | null;
        credit_limit?: number;
        payment_terms?: number;
        discount_rate?: number;
        delivery_address?: string | null;
        billing_address?: string | null;
        contact_person?: string | null;
        is_active?: boolean;
      };
      Update: {
        company_name?: string;
        tax_number?: string | null;
        credit_limit?: number;
        payment_terms?: number;
        discount_rate?: number;
        delivery_address?: string | null;
        billing_address?: string | null;
        contact_person?: string | null;
        is_active?: boolean;
      };
    };
    suppliers: {
      Row: {
        id: string;
        company_name: string;
        tax_number: string | null;
        bank_account: string | null;
        commission_rate: number;
        min_order_amount: number;
        delivery_days: number;
        service_areas: string[] | null;
        business_license: string | null;
        is_verified: boolean;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id: string;
        company_name: string;
        tax_number?: string | null;
        bank_account?: string | null;
        commission_rate?: number;
        min_order_amount?: number;
        delivery_days?: number;
        service_areas?: string[] | null;
        business_license?: string | null;
        is_verified?: boolean;
        is_active?: boolean;
      };
      Update: {
        company_name?: string;
        tax_number?: string | null;
        bank_account?: string | null;
        commission_rate?: number;
        min_order_amount?: number;
        delivery_days?: number;
        service_areas?: string[] | null;
        business_license?: string | null;
        is_verified?: boolean;
        is_active?: boolean;
      };
    };
  };
}