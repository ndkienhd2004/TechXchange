"use client";

import { useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import { useAppSelector } from "@/store/hooks";
import { selectCatalogCategoriesFlat } from "@/features/catalog/store/catalogSelectors";

export interface ProductSideHeaderFilters {
  newArrivalsOnly: boolean;
  onSale: boolean;
  categoryId: number | null;
}

interface ProductSideHeaderProps {
  filters?: ProductSideHeaderFilters;
  onFiltersChange?: (filters: ProductSideHeaderFilters) => void;
}

export default function ProductSideHeader({
  filters: controlledFilters,
  onFiltersChange,
}: ProductSideHeaderProps) {
  const { themed } = useAppTheme();
  const [internalNew, setInternalNew] = useState(false);
  const [internalSale, setInternalSale] = useState(false);
  const [internalCategoryId, setInternalCategoryId] = useState<number | null>(null);
  const [openNew, setOpenNew] = useState(true);
  const [openSale, setOpenSale] = useState(true);
  const [openCategories, setOpenCategories] = useState(true);
  const categories = useAppSelector(selectCatalogCategoriesFlat);

  const isControlled = controlledFilters !== undefined;
  const newArrivalsOnly = isControlled
    ? controlledFilters.newArrivalsOnly
    : internalNew;
  const onSale = isControlled ? controlledFilters.onSale : internalSale;
  const categoryId = isControlled
    ? controlledFilters.categoryId
    : internalCategoryId;

  const updateFilters = (patch: Partial<ProductSideHeaderFilters>) => {
    const next = {
      newArrivalsOnly: patch.newArrivalsOnly ?? newArrivalsOnly,
      onSale: patch.onSale ?? onSale,
      categoryId: patch.categoryId ?? categoryId,
    };
    if (!isControlled) {
      setInternalNew(next.newArrivalsOnly);
      setInternalSale(next.onSale);
      setInternalCategoryId(next.categoryId);
    }
    onFiltersChange?.(next);
  };

  return (
    <aside
      style={themed(styles.sidebar)}
      role="complementary"
      aria-label="Bộ lọc sản phẩm"
    >
      <h2 style={themed(styles.filterTitle)}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
      </h2>

      <div style={themed(styles.section)}>
        <button
          type="button"
          style={themed(styles.sectionHeader)}
          onClick={() => setOpenNew((v) => !v)}
          aria-expanded={openNew}
        >
          NEW IN
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: openNew ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {openNew && (
          <div style={themed(styles.sectionContent)}>
            <label style={themed(styles.checkboxRow)}>
              <input
                type="checkbox"
                checked={newArrivalsOnly}
                onChange={(e) =>
                  updateFilters({ newArrivalsOnly: e.target.checked })
                }
                style={themed(styles.checkbox)}
                aria-label="Chỉ sản phẩm mới"
              />
              <span style={themed(styles.checkboxLabel)}>
                New arrivals only
              </span>
            </label>
          </div>
        )}
      </div>

      <div style={themed(styles.section)}>
        <button
          type="button"
          style={themed(styles.sectionHeader)}
          onClick={() => setOpenSale((v) => !v)}
          aria-expanded={openSale}
        >
          SALE
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: openSale ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {openSale && (
          <div style={themed(styles.sectionContent)}>
            <label style={themed(styles.checkboxRow)}>
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => updateFilters({ onSale: e.target.checked })}
                style={themed(styles.checkbox)}
                aria-label="Đang giảm giá"
              />
              <span style={themed(styles.checkboxLabel)}>On sale</span>
            </label>
          </div>
        )}
      </div>

      <div style={themed(styles.section)}>
        <button
          type="button"
          style={themed(styles.sectionHeader)}
          onClick={() => setOpenCategories((v) => !v)}
          aria-expanded={openCategories}
        >
          CATEGORIES
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: openCategories ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {openCategories && (
          <div style={themed(styles.sectionContent)}>
            <label key="all" style={themed(styles.checkboxRow)}>
              <input
                type="radio"
                name="category"
                checked={categoryId == null}
                onChange={() => updateFilters({ categoryId: null })}
                style={themed(styles.checkbox)}
                aria-label="Tất cả"
              />
              <span style={themed(styles.checkboxLabel)}>Tất cả</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} style={themed(styles.checkboxRow)}>
                <input
                  type="radio"
                  name="category"
                  checked={categoryId === Number(cat.id)}
                  onChange={() => updateFilters({ categoryId: Number(cat.id) })}
                  style={themed(styles.checkbox)}
                  aria-label={cat.name}
                />
                <span style={themed(styles.checkboxLabel)}>{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
