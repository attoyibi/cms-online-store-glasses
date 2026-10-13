"use client";

import { useEffect, useMemo, useState } from "react";

import { BlockView, priorityShowcaseId } from "@/components/blocks/block-view";
import { normalizeBlocks } from "@/lib/blocks/normalize";
import {
  isEditorMessage,
  type PreviewMessage,
} from "@/lib/blocks/preview-protocol";
import { BLOCK_DEFS } from "@/lib/blocks/registry";
import { pickProducts } from "@/lib/blocks/select-products";
import type { Block } from "@/lib/blocks/types";
import { resolveVarsDeep, type TextVars } from "@/lib/site-identity";
import type { Category, Product } from "@/lib/types";

function post(message: PreviewMessage) {
  if (window.parent === window) return; // dibuka langsung, bukan di dalam editor
  window.parent.postMessage(message, window.location.origin);
}

/** Produk untuk satu blok, dipilih dari daftar produk yang sudah dimuat */
function productsFor(block: Block, all: Product[]): Product[] {
  if (block.type === "product-showcase") return pickProducts(block.props, all);
  if (block.type === "lens") {
    return pickProducts(
      { source: "kategori", categorySlug: block.props.categorySlug, limit: block.props.limit },
      all,
    );
  }
  return [];
}

/**
 * Isi iframe pratinjau di editor: halaman depan dirender dari blok yang
 * sedang diedit (diterima lewat postMessage), memakai komponen yang sama
 * dengan situs publik. Semua interaksi dimatikan — mengeklik bagian mana
 * pun hanya MEMILIH blok itu di editor, tidak membuka tautan atau
 * menambah ke keranjang.
 */
export function LivePreview({
  initialBlocks,
  products,
  categories,
  vars,
}: {
  initialBlocks: Block[];
  products: Product[];
  categories: Category[];
  /** Nilai {kota}/{toko}/{provinsi}, supaya pratinjau sama dengan situs asli */
  vars: TextVars;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dibersihkan dengan aturan yang sama seperti halaman sungguhan, supaya
  // pratinjau menampilkan persis apa yang akan dilihat pengunjung.
  const normalized = useMemo(
    () => resolveVarsDeep(normalizeBlocks(blocks), vars),
    [blocks, vars],
  );
  const priorityId = priorityShowcaseId(normalized);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;
      if (!isEditorMessage(event.data)) return;

      if (event.data.type === "state") {
        setBlocks(event.data.blocks);
        setSelectedId(event.data.selectedId);
      } else if (event.data.type === "scroll") {
        const element = document.querySelector(
          `[data-block-id="${CSS.escape(event.data.id)}"]`,
        );
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Semua klik hanya memilih blok; tidak ada tautan/tombol yang jalan
    function onClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      const target = event.target instanceof Element ? event.target : null;
      const id = target?.closest("[data-block-id]")?.getAttribute("data-block-id");
      if (id) post({ source: "lensara-preview", type: "select", id });
    }
    function block(event: Event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Pintasan undo/redo tetap berfungsi saat fokus ada di dalam pratinjau
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "z" || key === "y") {
        event.preventDefault();
        const redo = key === "y" || event.shiftKey;
        post({ source: "lensara-preview", type: redo ? "redo" : "undo" });
      }
    }

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", block, true);
    document.addEventListener("keydown", onKey, true);
    post({ source: "lensara-preview", type: "ready" });

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", block, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  if (normalized.length === 0) {
    return (
      <div className="container-page py-24 text-center text-sm text-muted-foreground">
        Halaman depan masih kosong. Tambahkan blok dari panel di sebelah kiri.
      </div>
    );
  }

  return (
    <>
      {normalized.map((block) => {
        const label = BLOCK_DEFS[block.type].label;
        const selected = block.id === selectedId;

        return (
          <div
            key={block.id}
            data-block-id={block.id}
            data-selected={selected}
            className="group/block relative cursor-pointer"
          >
            {block.hidden ? (
              <div className="container-page py-3">
                <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
                  {label} — disembunyikan, tidak tampil di situs. Klik untuk memilih.
                </div>
              </div>
            ) : (
              <BlockView
                block={block}
                products={productsFor(block, products)}
                categories={categories}
                priority={block.id === priorityId}
              />
            )}

            {/* Garis tepi dan label saat disorot atau dipilih */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 border-2 border-transparent transition-colors group-hover/block:border-primary/40 group-data-[selected=true]/block:border-primary"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-2 z-30 hidden rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground shadow group-hover/block:block group-data-[selected=true]/block:block"
            >
              {label}
            </span>
          </div>
        );
      })}
    </>
  );
}
