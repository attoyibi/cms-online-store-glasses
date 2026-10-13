import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import {
  getSeoPages,
  getSeoSettings,
  getSiteIdentity,
} from "@/lib/data/queries";
import {
  auditSeo,
  type Issue,
  type IssueArea,
  type IssueLevel,
} from "@/lib/seo-audit";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Category, Product } from "@/lib/types";

const LEVEL: Record<
  IssueLevel,
  { label: string; icon: typeof Info; tone: string }
> = {
  error: { label: "Perlu diperbaiki", icon: AlertCircle, tone: "text-destructive" },
  warn: { label: "Sebaiknya diperbaiki", icon: AlertTriangle, tone: "text-amber-700" },
  info: { label: "Saran", icon: Info, tone: "text-muted-foreground" },
};

const AREA: Record<IssueArea, string> = {
  situs: "Situs dan bisnis lokal",
  halaman: "Halaman",
  produk: "Produk",
  kategori: "Kategori",
};

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-700";
  if (score >= 60) return "text-amber-700";
  return "text-destructive";
}

export default async function AdminSeoCheckPage() {
  const { supabase } = await requireAdmin();

  const [identity, seo, pages, productsRes, categoriesRes] = await Promise.all([
    getSiteIdentity(),
    getSeoSettings(),
    getSeoPages(),
    supabase.from("products").select("*"),
    supabase.from("categories").select("*"),
  ]);

  const result = auditSeo({
    identity,
    seo,
    pages,
    products: (productsRes.data ?? []) as Product[],
    categories: (categoriesRes.data ?? []) as Category[],
  });

  const byArea = (Object.keys(AREA) as IssueArea[])
    .map((area) => ({
      area,
      issues: result.issues.filter((issue) => issue.area === area),
    }))
    .filter((group) => group.issues.length > 0);

  return (
    <div className="max-w-3xl space-y-6">
      <section className="flex flex-wrap items-center gap-5 rounded-xl border bg-card p-5">
        <div className="text-center">
          <p
            className={`text-4xl font-semibold tabular-nums ${scoreTone(result.score)}`}
          >
            {result.score}
          </p>
          <p className="text-xs text-muted-foreground">dari 100</p>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-medium">
            {result.issues.length === 0
              ? "Tidak ada yang perlu diperbaiki."
              : `${result.counts.error} perlu diperbaiki, ${result.counts.warn} sebaiknya diperbaiki, ${result.counts.info} saran.`}
          </p>
          <p className="text-muted-foreground">
            Angka ini hanya penunjuk arah dari pemeriksaan di bawah, bukan
            nilai dari Google dan tidak menjamin peringkat.
          </p>
        </div>
      </section>

      {result.issues.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Semua pemeriksaan lolos.
        </p>
      )}

      {byArea.map(({ area, issues }) => (
        <section key={area} className="space-y-3">
          <h2 className="text-base font-semibold">
            {AREA[area]}{" "}
            <span className="font-normal text-muted-foreground">
              ({issues.length})
            </span>
          </h2>
          <ul className="divide-y rounded-xl border bg-card">
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  const { icon: Icon, tone, label } = LEVEL[issue.level];
  return (
    <li className="flex items-start gap-3 p-4">
      <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-label={label} />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium">
          {issue.subject && (
            <span className="text-muted-foreground">{issue.subject} — </span>
          )}
          {issue.title}
        </p>
        <p className="text-sm text-muted-foreground">{issue.fix}</p>
      </div>
      <Link
        href={issue.href}
        className="shrink-0 text-sm font-medium underline underline-offset-4"
      >
        Perbaiki
      </Link>
    </li>
  );
}
