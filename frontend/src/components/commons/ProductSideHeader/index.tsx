"use client";

import { useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import { useAppSelector } from "@/store/hooks";
import {
  selectCatalogCategoriesTree,
} from "@/features/catalog/store/catalogSelectors";
import type { CatalogCategory } from "@/features/catalog/store/catalogSlice";
import sideCss from "./productSideHeader.module.css";

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
  const categoriesTree = useAppSelector(selectCatalogCategoriesTree);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([]);

  const isControlled = controlledFilters !== undefined;
  const newArrivalsOnly = isControlled
    ? controlledFilters.newArrivalsOnly
    : internalNew;
  const onSale = isControlled ? controlledFilters.onSale : internalSale;
  const categoryId = isControlled
    ? controlledFilters.categoryId
    : internalCategoryId;

  const categoryRoots = useMemo(() => {
    if (
      categoriesTree.length === 1 &&
      Array.isArray(categoriesTree[0]?.children) &&
      categoriesTree[0].children.length > 0
    ) {
      return categoriesTree[0].children;
    }
    return categoriesTree;
  }, [categoriesTree]);

  const updateFilters = (patch: Partial<ProductSideHeaderFilters>) => {
    const next = {
      newArrivalsOnly: patch.newArrivalsOnly ?? newArrivalsOnly,
      onSale: patch.onSale ?? onSale,
      categoryId:
        patch.categoryId !== undefined ? patch.categoryId : categoryId,
    };
    if (!isControlled) {
      setInternalNew(next.newArrivalsOnly);
      setInternalSale(next.onSale);
      setInternalCategoryId(next.categoryId);
    }
    onFiltersChange?.(next);
  };

  const toggleCategoryExpand = (id: number) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderCategoryNode = (node: CatalogCategory, depth = 0): React.ReactNode => {
    const id = Number(node.id);
    const children = Array.isArray(node.children) ? node.children : [];
    const hasChildren = children.length > 0;
    const expanded = expandedCategoryIds.includes(id);
    const isSelected = categoryId === id;

    return (
      <div key={id} style={themed(styles.categoryNode)}>
        <div
          style={{
            ...themed(styles.checkboxRow),
            ...styles.categoryNodeRow(),
            ...styles.categoryDepthIndent(depth),
          }}
        >
          <button
            type="button"
            style={themed(styles.optionRow)}
            onClick={() => updateFilters({ categoryId: id })}
            aria-label={node.name}
          >
            <span style={themed(styles.optionLabel)}>{node.name}</span>
            {isSelected && <span style={themed(styles.optionSelectedCheck)}>✓</span>}
          </button>

          {hasChildren && (
            <button
              type="button"
              style={themed(styles.categoryExpandButton)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCategoryExpand(id);
              }}
              aria-label={expanded ? "Thu gọn danh mục con" : "Mở danh mục con"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </div>

        {hasChildren && expanded && (
          <div style={themed(styles.categoryChildren)}>
            {children.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
            <button
              type="button"
              style={themed(styles.optionRow)}
              onClick={() =>
                updateFilters({ newArrivalsOnly: !newArrivalsOnly })
              }
              aria-label="Chỉ sản phẩm mới"
            >
              <span style={themed(styles.optionLabel)}>New arrivals only</span>
              {newArrivalsOnly && (
                <span style={themed(styles.optionSelectedCheck)}>✓</span>
              )}
            </button>
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
            <button
              type="button"
              style={themed(styles.optionRow)}
              onClick={() => updateFilters({ onSale: !onSale })}
              aria-label="Đang giảm giá"
            >
              <span style={themed(styles.optionLabel)}>On sale</span>
              {onSale && <span style={themed(styles.optionSelectedCheck)}>✓</span>}
            </button>
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
          <div
            style={themed(styles.categoriesTreeContainer)}
            className={sideCss.hideScrollbar}
          >
            <button
              key="all"
              type="button"
              style={themed(styles.optionRow)}
              onClick={() => updateFilters({ categoryId: null })}
              aria-label="Tất cả"
            >
              <span style={themed(styles.optionLabel)}>Tất cả</span>
              {categoryId == null && (
                <span style={themed(styles.optionSelectedCheck)}>✓</span>
              )}
            </button>
            {categoryRoots.map((cat) => renderCategoryNode(cat, 0))}
          </div>
        )}
      </div>
    </aside>
  );
}
