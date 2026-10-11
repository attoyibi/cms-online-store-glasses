import type { IconName } from "@/lib/blocks/icon-names";

/**
 * Isi (props) tiap jenis blok halaman depan. Semuanya string/angka/daftar
 * biasa — tanpa HTML — supaya aman disimpan sebagai JSON dan dirender
 * React apa adanya (React sudah meng-escape teks).
 */

export type HeroProps = {
  eyebrow: string;
  titleLine1: string;
  /** Baris kedua judul, tampil berwarna */
  titleHighlight: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  whatsappLabel: string;
  whatsappMessage: string;
  stats: { value: string; label: string }[];
  imageA: string;
  imageAAlt: string;
  imageB: string;
  imageBAlt: string;
  imageC: string;
  imageCAlt: string;
  cardTitle: string;
  cardSubtitle: string;
};

export type TrustBarProps = {
  items: { icon: IconName; title: string; body: string }[];
};

export type CategoryGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export type ShowcaseSource = "unggulan" | "terbaru" | "kategori";
export type ShowcaseBackground = "polos" | "lembut";

export type ProductShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  source: ShowcaseSource;
  /** Dipakai bila `source` = "kategori" */
  categorySlug: string;
  limit: number;
  background: ShowcaseBackground;
};

export type AboutProps = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  image: string;
  imageAlt: string;
  imagePosition: "kiri" | "kanan";
  ctaLabel: string;
  ctaMessage: string;
};

export type LensProps = {
  eyebrow: string;
  title: string;
  body: string;
  types: { name: string; body: string }[];
  ctaLabel: string;
  ctaMessage: string;
  linkLabel: string;
  linkHref: string;
  categorySlug: string;
  limit: number;
};

export type HowToOrderProps = {
  eyebrow: string;
  title: string;
  description: string;
  steps: { icon: IconName; title: string; body: string }[];
};

export type TestimonialsProps = {
  eyebrow: string;
  title: string;
  reviews: { name: string; city: string; body: string }[];
};

export type FaqProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaMessage: string;
  items: { q: string; a: string }[];
};

export type CtaProps = {
  title: string;
  body: string;
  primaryLabel: string;
  primaryMessage: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type BlockPropsMap = {
  hero: HeroProps;
  "trust-bar": TrustBarProps;
  "category-grid": CategoryGridProps;
  "product-showcase": ProductShowcaseProps;
  about: AboutProps;
  lens: LensProps;
  "how-to-order": HowToOrderProps;
  testimonials: TestimonialsProps;
  faq: FaqProps;
  cta: CtaProps;
};

export type BlockType = keyof BlockPropsMap;

/** Satu blok di halaman: jenis + isi + apakah sedang disembunyikan */
export type Block = {
  [K in BlockType]: {
    id: string;
    type: K;
    hidden: boolean;
    props: BlockPropsMap[K];
  };
}[BlockType];

/** Blok dengan jenis tertentu, untuk komponen yang hanya menangani satu jenis */
export type BlockOf<K extends BlockType> = Extract<Block, { type: K }>;

/** Status halaman yang dibaca dari database, untuk editor admin */
export type PageSource = "draft" | "published" | "default";
