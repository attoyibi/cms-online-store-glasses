"use client";

import { createContext, useContext, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_LABELS, ICON_NAMES } from "@/lib/blocks/icon-names";
import type { Field } from "@/lib/blocks/schema";
import {
  buildCategoryRows,
  serializeCategoryRows,
} from "@/lib/blocks/select-categories";
import { cn } from "@/lib/utils";

const textareaClass =
  "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const selectClass =
  "h-9 w-full rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Daftar kategori toko, untuk kolom pengatur urutan kategori di editor */
export const CategoryOptionsContext = createContext<
  { slug: string; name: string }[]
>([]);

/** Pindahkan satu elemen daftar ke atas (-1) atau bawah (+1) */
function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function NumberInput({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  // Teks diketik bebas (termasuk kosong sementara); nilai sah baru dikirim ke atas
  const [text, setText] = useState(String(value));

  return (
    <Input
      id={id}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        const number = Number(event.target.value);
        if (event.target.value !== "" && Number.isFinite(number)) {
          onChange(Math.min(max, Math.max(min, Math.round(number))));
        }
      }}
      onBlur={() => setText(String(value))}
      className="max-w-28"
    />
  );
}

/**
 * Satu kolom form, dibuat dari deskripsi `Field`. `idPrefix` menjaga id
 * input tetap unik walau ada banyak blok dan item berulang.
 */
export function FieldInput({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  idPrefix: string;
}) {
  const id = `${idPrefix}-${field.name}`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{field.label}</Label>
      <FieldControl
        field={field}
        value={value}
        onChange={onChange}
        id={id}
      />
      {field.help && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  id,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  id: string;
}) {
  switch (field.kind) {
    case "text":
      return (
        <Input
          id={id}
          value={String(value ?? "")}
          maxLength={field.max}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          id={id}
          rows={field.rows ?? 3}
          value={String(value ?? "")}
          maxLength={field.max}
          onChange={(event) => onChange(event.target.value)}
          className={textareaClass}
        />
      );

    case "link":
      return (
        <Input
          id={id}
          value={String(value ?? "")}
          placeholder="/produk  atau  https://…"
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "image":
      return (
        <ImageUploader
          name={id}
          single
          defaultValue={value ? [String(value)] : []}
          onChange={(images) => onChange(images[0] ?? "")}
        />
      );

    case "select":
      return (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={selectClass}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "number":
      return (
        <NumberInput
          id={id}
          value={Number(value ?? field.min)}
          min={field.min}
          max={field.max}
          onChange={onChange}
        />
      );

    case "category-order":
      return (
        <CategoryOrderControl
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );

    case "icon":
      return (
        <select
          id={id}
          value={String(value ?? "star")}
          onChange={(event) => onChange(event.target.value)}
          className={selectClass}
        >
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {ICON_LABELS[name]}
            </option>
          ))}
        </select>
      );

    case "strings": {
      const items = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <Input
                id={index === 0 ? id : undefined}
                value={item}
                maxLength={200}
                aria-label={`${field.itemLabel} ${index + 1}`}
                onChange={(event) =>
                  onChange(
                    items.map((current, i) =>
                      i === index ? event.target.value : current,
                    ),
                  )
                }
              />
              <RowButtons
                label={`${field.itemLabel} ${index + 1}`}
                onUp={index > 0 ? () => onChange(move(items, index, -1)) : undefined}
                onDown={
                  index < items.length - 1
                    ? () => onChange(move(items, index, 1))
                    : undefined
                }
                onRemove={() => onChange(items.filter((_, i) => i !== index))}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={items.length >= field.max}
            onClick={() => onChange([...items, ""])}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Tambah {field.itemLabel.toLowerCase()}
          </Button>
        </div>
      );
    }

    case "list": {
      const items = Array.isArray(value)
        ? (value as Record<string, unknown>[])
        : [];
      return (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border bg-muted/30 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {field.itemLabel} {index + 1}
                </p>
                <RowButtons
                  label={`${field.itemLabel} ${index + 1}`}
                  onUp={index > 0 ? () => onChange(move(items, index, -1)) : undefined}
                  onDown={
                    index < items.length - 1
                      ? () => onChange(move(items, index, 1))
                      : undefined
                  }
                  onRemove={() => onChange(items.filter((_, i) => i !== index))}
                />
              </div>

              {field.fields.map((sub) => (
                <FieldInput
                  key={sub.name}
                  field={sub}
                  idPrefix={`${id}-${index}`}
                  value={item[sub.name]}
                  onChange={(next) =>
                    onChange(
                      items.map((current, i) =>
                        i === index ? { ...current, [sub.name]: next } : current,
                      ),
                    )
                  }
                />
              ))}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={items.length >= field.max}
            onClick={() => onChange([...items, { ...field.blank }])}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Tambah {field.itemLabel.toLowerCase()}
          </Button>
          {items.length >= field.max && (
            <p className="text-xs text-muted-foreground">
              Maksimal {field.max} {field.itemLabel.toLowerCase()}.
            </p>
          )}
        </div>
      );
    }
  }
}

function CategoryOrderControl({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: unknown) => void;
}) {
  const categories = useContext(CategoryOptionsContext);
  const rows = buildCategoryRows(categories, value);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada kategori. Tambahkan dulu di menu Kategori.
      </p>
    );
  }

  const update = (next: typeof rows) => onChange(serializeCategoryRows(next));
  const arrow =
    "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

  return (
    <ul className="divide-y rounded-xl border">
      {rows.map((row, index) => (
        <li key={row.slug} className="flex items-center gap-2 px-3 py-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={row.visible}
              onChange={(event) =>
                update(
                  rows.map((item) =>
                    item.slug === row.slug
                      ? { ...item, visible: event.target.checked }
                      : item,
                  ),
                )
              }
              className="size-4 rounded border-input accent-primary"
            />
            <span
              className={cn("truncate", !row.visible && "text-muted-foreground line-through")}
            >
              {row.name}
            </span>
          </label>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => update(move(rows, index, -1))}
            aria-label={`Naikkan ${row.name}`}
            className={arrow}
          >
            <ArrowUp className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={index === rows.length - 1}
            onClick={() => update(move(rows, index, 1))}
            aria-label={`Turunkan ${row.name}`}
            className={arrow}
          >
            <ArrowDown className="size-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function RowButtons({
  label,
  onUp,
  onDown,
  onRemove,
}: {
  label: string;
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}) {
  const base =
    "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={onUp}
        disabled={!onUp}
        aria-label={`Naikkan ${label}`}
        className={base}
      >
        <ArrowUp className="size-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={!onDown}
        aria-label={`Turunkan ${label}`}
        className={base}
      >
        <ArrowDown className="size-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Hapus ${label}`}
        className={cn(base, "hover:bg-destructive/10 hover:text-destructive")}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
