export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  /** Harga jual aktif, dalam rupiah penuh (bukan sen) */
  price: number;
  /** Harga coret. Null bila produk tidak sedang diskon. */
  compare_at_price: number | null;
  stock: number;
  images: string[];
  category_id: string | null;
  category?: Pick<Category, "id" | "slug" | "name"> | null;
  is_active: boolean;
  is_featured: boolean;
  /** Atribut bebas: material, bentuk, warna, ukuran, dst. */
  specs: Record<string, string>;
  created_at: string;
};

export type StoreSettings = {
  id: string;
  store_name: string;
  whatsapp_number: string;
  address: string | null;
  email: string | null;
  instagram_url: string | null;
  open_hours: string | null;
  announcement: string | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};
