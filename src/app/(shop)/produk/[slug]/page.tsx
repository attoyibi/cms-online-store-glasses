import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { QuantityPicker } from "@/components/product/quantity-picker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/queries";
import { discountPercent, formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(
  props: PageProps<"/produk/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };

  return {
    title: product.name,
    description:
      product.description?.slice(0, 155) ??
      `${product.name} — ${formatPrice(product.price)}. Pesan lewat WhatsApp.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailPage(
  props: PageProps<"/produk/[slug]">,
) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const discount = discountPercent(product.price, product.compare_at_price);
  const soldOut = product.stock <= 0;
  const specs = Object.entries(product.specs);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-7">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Beranda
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li>
            <Link
              href="/produk"
              className="transition-colors hover:text-foreground"
            >
              Produk
            </Link>
          </li>
          {product.category && (
            <>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <li>
                <Link
                  href={`/kategori/${product.category.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <div className="space-y-3">
            {product.brand && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </p>
            )}

            <h1 className="text-2xl font-semibold sm:text-3xl">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-semibold tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-base text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
              {discount && <Badge variant="destructive">Hemat {discount}%</Badge>}
            </div>

            <p className="text-sm text-muted-foreground">
              {soldOut ? (
                <span className="text-destructive">
                  Stok habis — tanyakan perkiraan restock lewat WhatsApp.
                </span>
              ) : product.stock <= 5 ? (
                <>Tinggal {product.stock} pcs</>
              ) : (
                <>Stok tersedia</>
              )}
            </p>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <Separator />

          <div className="space-y-3">
            <QuantityPicker product={product} />
            <WhatsAppButton
              size="lg"
              className="w-full sm:w-auto"
              message={`Halo {store}, saya tertarik dengan "${product.name}" (${formatPrice(product.price)}). Apakah stoknya masih ada?\n${siteConfig.url}/produk/${product.slug}`}
              label="Tanya Dulu Lewat WhatsApp"
            />
            <p className="text-xs text-muted-foreground">
              Pembayaran tidak diproses di situs ini. Setelah pesanan masuk,
              kami konfirmasi stok, ongkir, dan cara bayar lewat WhatsApp.
            </p>
          </div>

          <Separator />

          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Kirim ke seluruh Indonesia" },
              { icon: ShieldCheck, label: "Garansi 1 tahun" },
              { icon: PackageCheck, label: "Termasuk hard case" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-xl border bg-card p-3"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-xs leading-snug">{label}</span>
              </li>
            ))}
          </ul>

          {specs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Spesifikasi</h2>
              <dl className="divide-y rounded-xl border bg-card">
                {specs.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm"
                  >
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold sm:text-2xl">
            Produk serupa lainnya
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 sm:gap-x-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
