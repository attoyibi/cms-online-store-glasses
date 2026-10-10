export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AttributeType = "bentuk" | "material" | "warna";

/** Nilai filter yang boleh dipakai — daftarnya dikelola dari /admin/atribut */
export type ProductAttribute = {
  id: string;
  type: AttributeType;
  slug: string;
  name: string;
  /** Hanya untuk warna: kode hex bulatan warna di filter */
  swatch_hex: string | null;
  sort_order: number;
  /**
   * Opsional karena query katalog sudah menyaring yang aktif saja —
   * hanya halaman admin yang membaca nilainya.
   */
  is_active?: boolean;
};

/**
 * Pilihan dari satu produk dengan harga & stok sendiri — mis. lensa minus
 * 0,25–4,00 vs 6,25–8,00. Produk tanpa varian (kebanyakan frame) memakai
 * harga & stok miliknya sendiri.
 */
export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sort_order: number;
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
  /** Atribut terstruktur — dipakai untuk filter katalog */
  attributes: ProductAttribute[];
  /**
   * Pilihan ukuran/jenis. Kosong untuk produk biasa. Bila terisi, `price`
   * berisi harga termurah dan `stock` total stok semua varian, supaya
   * pengurutan, filter harga, dan kartu produk tetap bekerja apa adanya.
   */
  variants: ProductVariant[];
  /** Lebar satu lensa dalam mm. Null untuk produk non-frame seperti lensa. */
  lens_width_mm: number | null;
  /** Detail bebas yang hanya ditampilkan, tidak difilter */
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
  /** Terisi bila produknya punya varian; harga di atas sudah harga varian itu */
  variantId?: string | null;
  variantLabel?: string | null;
};
