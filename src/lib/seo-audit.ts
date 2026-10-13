import {
  SEO_DESC_GOOD,
  SEO_DESC_MIN,
  SEO_TITLE_GOOD,
  fullTitle,
} from "@/lib/seo-meta";
import type { SiteIdentity } from "@/lib/site-identity";
import type { Category, Product, SeoPage, SeoSettings } from "@/lib/types";

export type IssueLevel = "error" | "warn" | "info";
export type IssueArea = "situs" | "halaman" | "produk" | "kategori";

export type Issue = {
  id: string;
  level: IssueLevel;
  area: IssueArea;
  /** Yang bermasalah: nama produk/kategori/halaman. Kosong untuk masalah situs. */
  subject?: string;
  title: string;
  /** Cara memperbaiki */
  fix: string;
  /** Halaman admin tempat memperbaikinya */
  href: string;
};

export type AuditInput = {
  identity: SiteIdentity;
  /** Baris seo_settings mentah; null bila belum diisi atau tabelnya belum ada */
  seo: SeoSettings | null;
  products: Pick<
    Product,
    "id" | "name" | "slug" | "description" | "images" | "category_id" | "is_active" | "seo_title" | "seo_description" | "image_alts"
  >[];
  categories: Pick<
    Category,
    "id" | "name" | "slug" | "description" | "is_active" | "seo_title" | "seo_description"
  >[];
  pages: SeoPage[];
};

export type AuditResult = {
  issues: Issue[];
  counts: Record<IssueLevel, number>;
  /** 0–100. Hanya penunjuk arah, bukan angka yang dijanjikan Google. */
  score: number;
};

const norm = (text: string | null | undefined) =>
  (text ?? "").replace(/\s+/g, " ").trim();

const isSvg = (src: string) => /\.svg($|\?)/i.test(src);

const PAGE_LABEL: Record<string, string> = {
  beranda: "Beranda",
  produk: "Semua Produk",
  tentang: "Tentang Kami",
  "cara-pesan": "Cara Pesan",
};

export function auditSeo(input: AuditInput): AuditResult {
  const { identity, seo, products, categories, pages } = input;
  const issues: Issue[] = [];
  const add = (issue: Issue) => issues.push(issue);

  // ------------------------------------------------------------ situs
  const SITE = "/admin/seo";

  if (/localhost|127\.0\.0\.1/.test(identity.siteUrl)) {
    add({
      id: "situs-url",
      level: "error",
      area: "situs",
      title: "Alamat situs belum diisi",
      fix: "Isi alamat situs (mis. https://namatoko.com). Tanpa ini sitemap dan canonical menunjuk ke localhost.",
      href: SITE,
    });
  }
  if (identity.noindexSite) {
    add({
      id: "situs-noindex",
      level: "error",
      area: "situs",
      title: "Seluruh situs disembunyikan dari Google",
      fix: "Matikan saklar “Sembunyikan seluruh situs dari Google” bila toko sudah siap tayang.",
      href: SITE,
    });
  }
  if (!norm(seo?.city)) {
    add({
      id: "situs-kota",
      level: "warn",
      area: "situs",
      title: "Kota belum diisi",
      fix: "Isi kota toko. Dipakai di judul, deskripsi, teks halaman, dan data bisnis lokal.",
      href: SITE,
    });
  }
  if (!norm(seo?.default_description)) {
    add({
      id: "situs-deskripsi",
      level: "warn",
      area: "situs",
      title: "Deskripsi situs masih bawaan",
      fix: "Tulis deskripsi 120–160 karakter yang menyebut kota dan jenis toko Anda.",
      href: SITE,
    });
  }
  if (!identity.ogImage) {
    add({
      id: "situs-og",
      level: "warn",
      area: "situs",
      title: "Belum ada gambar saat tautan dibagikan",
      fix: "Unggah gambar PNG/JPG 1200×630 (foto toko atau logo) supaya tautan di WhatsApp punya gambar.",
      href: SITE,
    });
  }
  if (!identity.streetAddress && !identity.address) {
    add({
      id: "situs-alamat",
      level: "warn",
      area: "situs",
      title: "Alamat toko belum diisi",
      fix: "Tanpa alamat, data bisnis lokal tidak dikirim ke Google dan toko sulit muncul di pencarian “optik di sekitar saya”.",
      href: SITE,
    });
  } else {
    if (!identity.postalCode) {
      add({
        id: "situs-pos",
        level: "info",
        area: "situs",
        title: "Kode pos belum diisi",
        fix: "Lengkapi kode pos agar alamat di data bisnis lokal utuh.",
        href: SITE,
      });
    }
    if (identity.latitude === null) {
      add({
        id: "situs-geo",
        level: "info",
        area: "situs",
        title: "Koordinat toko belum diisi",
        fix: "Salin koordinat dari Google Maps agar lokasi di data bisnis tepat.",
        href: SITE,
      });
    }
    if (identity.openDays.length === 0) {
      add({
        id: "situs-jam",
        level: "info",
        area: "situs",
        title: "Hari dan jam buka belum diisi",
        fix: "Isi jadwal buka agar Google bisa menampilkan “Buka sekarang”.",
        href: SITE,
      });
    }
  }
  if (!identity.googleVerification) {
    add({
      id: "situs-gsc",
      level: "warn",
      area: "situs",
      title: "Belum diverifikasi di Google Search Console",
      fix: "Tanpa verifikasi Anda tidak bisa melihat kata kunci yang membawa pengunjung, atau mengirim sitemap.",
      href: SITE,
    });
  }
  if (identity.sameAs.length === 0) {
    add({
      id: "situs-sameas",
      level: "info",
      area: "situs",
      title: "Belum ada profil resmi lain",
      fix: "Tambahkan tautan Instagram/Facebook/Google Maps agar Google mengenali semuanya sebagai satu bisnis.",
      href: SITE,
    });
  }

  // ---------------------------------------------------------- halaman
  for (const page of pages) {
    if (page.noindex) {
      add({
        id: `halaman-noindex-${page.slug}`,
        level: page.slug === "beranda" ? "error" : "warn",
        area: "halaman",
        subject: PAGE_LABEL[page.slug] ?? page.slug,
        title: "Halaman disembunyikan dari Google",
        fix: "Matikan “Sembunyikan dari Google” bila halaman ini seharusnya bisa ditemukan.",
        href: "/admin/seo/halaman",
      });
    }
  }

  // ----------------------------------------------------------- produk
  const active = products.filter((p) => p.is_active);
  const titleCount = new Map<string, number>();
  for (const p of active) {
    const key = (norm(p.seo_title) || norm(p.name)).toLowerCase();
    titleCount.set(key, (titleCount.get(key) ?? 0) + 1);
  }

  for (const p of active) {
    const href = `/admin/produk/${p.id}`;
    const subject = p.name;
    const title = norm(p.seo_title) || norm(p.name);
    const desc = norm(p.seo_description) || norm(p.description);

    if (p.images.length === 0) {
      add({
        id: `produk-foto-${p.id}`,
        level: "error",
        area: "produk",
        subject,
        title: "Produk belum punya foto",
        fix: "Tambahkan minimal satu foto. Produk tanpa foto tidak layak tampil di Google dan WhatsApp.",
        href,
      });
    } else if (p.images.every(isSvg)) {
      add({
        id: `produk-svg-${p.id}`,
        level: "warn",
        area: "produk",
        subject,
        title: "Semua fotonya SVG (gambar contoh)",
        fix: "Ganti dengan foto PNG/JPG. SVG tidak tampil saat tautan dibagikan di WhatsApp dan tidak masuk Google Gambar.",
        href,
      });
    }

    const usable = p.images.filter((src) => !isSvg(src));
    const described = usable.filter((src) => norm(p.image_alts?.[src]).length > 0);
    if (usable.length > 0 && described.length === 0) {
      add({
        id: `produk-alt-${p.id}`,
        level: "info",
        area: "produk",
        subject,
        title: "Foto belum diberi teks alternatif",
        fix: "Tulis satu kalimat tentang isi tiap foto (mis. “Frame persegi hitam tampak depan”). Dipakai pembaca layar dan Google Gambar; sekarang dipakai nama produk.",
        href,
      });
    }

    if (!desc) {
      add({
        id: `produk-deskripsi-${p.id}`,
        level: "warn",
        area: "produk",
        subject,
        title: "Belum ada deskripsi",
        fix: "Tulis deskripsi 1–2 kalimat: bahan, ukuran, kecocokan wajah. Ini yang Google tampilkan di bawah judul.",
        href,
      });
    } else if (desc.length < SEO_DESC_MIN) {
      add({
        id: `produk-pendek-${p.id}`,
        level: "info",
        area: "produk",
        subject,
        title: `Deskripsi terlalu pendek (${desc.length} karakter)`,
        fix: `Perpanjang hingga sekitar ${SEO_DESC_MIN}–${SEO_DESC_GOOD} karakter.`,
        href,
      });
    } else if (norm(p.seo_description).length > SEO_DESC_GOOD) {
      add({
        id: `produk-panjang-${p.id}`,
        level: "info",
        area: "produk",
        subject,
        title: `Deskripsi SEO terlalu panjang (${norm(p.seo_description).length} karakter)`,
        fix: `Google memotong sekitar ${SEO_DESC_GOOD} karakter. Ringkas agar kalimat penting tidak terpotong.`,
        href,
      });
    }

    if (fullTitle(title, identity.name).length > SEO_TITLE_GOOD) {
      add({
        id: `produk-judul-${p.id}`,
        level: "info",
        area: "produk",
        subject,
        title: "Judul akan terpotong di Google",
        fix: `Judul + “| ${identity.name}” lebih dari ${SEO_TITLE_GOOD} karakter. Isi “Judul untuk Google” yang lebih singkat.`,
        href,
      });
    }

    if ((titleCount.get(title.toLowerCase()) ?? 0) > 1) {
      add({
        id: `produk-kembar-${p.id}`,
        level: "warn",
        area: "produk",
        subject,
        title: "Judul sama dengan produk lain",
        fix: "Beri judul yang membedakan (mis. tambahkan warna atau ukuran). Judul kembar membuat halaman bersaing satu sama lain.",
        href,
      });
    }

    if (!p.category_id) {
      add({
        id: `produk-kategori-${p.id}`,
        level: "info",
        area: "produk",
        subject,
        title: "Belum masuk kategori",
        fix: "Pilih kategori supaya muncul di halaman kategori dan jejak breadcrumb di Google.",
        href,
      });
    }
  }

  // --------------------------------------------------------- kategori
  for (const c of categories.filter((c) => c.is_active)) {
    if (!norm(c.seo_description) && !norm(c.description)) {
      add({
        id: `kategori-deskripsi-${c.id}`,
        level: "warn",
        area: "kategori",
        subject: c.name,
        title: "Belum ada deskripsi",
        fix: "Tulis 1–2 kalimat tentang kategori ini. Halaman kategori sering jadi pintu masuk dari Google.",
        href: `/admin/kategori/${c.id}`,
      });
    }
  }

  const order: Record<IssueLevel, number> = { error: 0, warn: 1, info: 2 };
  issues.sort((a, b) => order[a.level] - order[b.level]);

  const counts = { error: 0, warn: 0, info: 0 };
  for (const i of issues) counts[i.level]++;

  // Penalti per jenis masalah (bukan per produk) supaya katalog besar tidak
  // otomatis nol: jumlah yang terkena dibatasi.
  // Per jenis masalah: yang pertama penuh, sisanya seperlima, dan total
  // satu jenis tidak lebih dari tiga kali bobotnya.
  const perKind = new Map<string, number>();
  for (const i of issues) {
    const kind = i.id.replace(/-[0-9a-f-]{8,}$/i, "");
    const weight = i.level === "error" ? 12 : i.level === "warn" ? 4 : 1;
    const seen = perKind.get(kind) ?? 0;
    perKind.set(kind, Math.min(weight * 3, seen + (seen === 0 ? weight : weight / 5)));
  }
  let penalty = 0;
  for (const value of perKind.values()) penalty += value;
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  return { issues, counts, score };
}
