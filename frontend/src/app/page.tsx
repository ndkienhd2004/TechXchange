"use client";

import type { CSSProperties } from "react";
import ItemCard from "@/components/commons/ItemCard";
import SaleBanner from "@/components/commons/SaleBanner";
import HeroCarousel from "@/components/commons/HeroCarousel";
import { useAppTheme } from "@/theme/ThemeProvider";
import { getGradients } from "@/theme";

export default function Home() {
  const { theme } = useAppTheme();
  const gradients = getGradients(theme.colors);
  const sansStack = theme.typography.fontFamily.sans.join(", ");
  const monoStack = theme.typography.fontFamily.mono.join(", ");

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100%',
    minWidth: '100%',
    background: theme.colors.palette.backgrounds.primary,
    color: theme.colors.palette.text.primary,
    fontFamily: sansStack,
  },
  backdrop: {
    background: `radial-gradient(70% 50% at 10% 10%, ${theme.colors.palette.brand.purple[800]}33 0%, transparent 60%), radial-gradient(60% 50% at 85% 15%, ${theme.colors.palette.brand.pink[700]}22 0%, transparent 55%)`,
  },
  shell: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `${theme.spacing["3xl"]} ${theme.spacing.lg} ${theme.spacing["3xl"]}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing["2xl"],
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: theme.spacing.xl,
    alignItems: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: "999px",
    fontSize: theme.typography.fontSize.sm.size,
    letterSpacing: theme.typography.letterSpacing.wide,
    background: theme.colors.palette.backgrounds.card,
    color: theme.colors.palette.text.secondary,
    border: `1px solid ${theme.colors.palette.borders.dark}`,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize["5xl"].size,
    lineHeight: theme.typography.fontSize["5xl"].lineHeight,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.tight,
    margin: 0,
  },
  heroText: {
    fontSize: theme.typography.fontSize.lg.size,
    lineHeight: theme.typography.fontSize.lg.lineHeight,
    color: theme.colors.palette.text.secondary,
    margin: 0,
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing[3],
  },
  primaryButton: {
    border: "none",
    borderRadius: "999px",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    fontSize: theme.typography.fontSize.sm.size,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.wide,
    color: theme.colors.palette.text.primary,
    boxShadow: theme.shadows.lg,
    cursor: "pointer",
  },
  ghostButton: {
    borderRadius: "999px",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    fontSize: theme.typography.fontSize.sm.size,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.wide,
    background: "transparent",
    color: theme.colors.palette.text.secondary,
    border: `1px solid ${theme.colors.palette.borders.default}`,
    cursor: "pointer",
  },
  heroCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.lg,
    background: theme.colors.palette.backgrounds.card,
    border: `1px solid ${theme.colors.palette.borders.dark}`,
    boxShadow: theme.shadows["2xl"],
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.xl.size,
    fontWeight: theme.typography.fontWeight.semibold,
    margin: 0,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: theme.spacing.md,
  },
  statCard: {
    padding: theme.spacing.md,
    borderRadius: theme.spacing.md,
    background: theme.colors.palette.backgrounds.secondary,
    border: `1px solid ${theme.colors.palette.borders.default}`,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs.size,
    letterSpacing: theme.typography.letterSpacing.widest,
    textTransform: "uppercase",
    color: theme.colors.palette.text.muted,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize["2xl"].size,
    fontWeight: theme.typography.fontWeight.bold,
    margin: 0,
  },
  statNote: {
    fontSize: theme.typography.fontSize.sm.size,
    color: theme.colors.palette.text.secondary,
    margin: 0,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize["2xl"].size,
    fontWeight: theme.typography.fontWeight.bold,
    margin: 0,
  },
  monoLabel: {
    fontFamily: monoStack,
    fontSize: theme.typography.fontSize.sm.size,
    color: theme.colors.palette.text.muted,
  },
  panel: {
    padding: theme.spacing[5],
    borderRadius: theme.spacing[4],
    background: theme.colors.palette.backgrounds.secondary,
    border: `1px solid ${theme.colors.palette.borders.default}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.md,
  },
  paletteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: theme.spacing.md,
  },
  swatch: {
    borderRadius: theme.spacing[4],
    padding: theme.spacing[4],
    border: `1px solid ${theme.colors.palette.borders.dark}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2],
    minHeight: "110px",
    justifyContent: "space-between",
  },
  swatchLabel: {
    fontSize: theme.typography.fontSize.sm.size,
    color: theme.colors.palette.text.secondary,
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  badge: {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: "999px",
    fontSize: theme.typography.fontSize.xs.size,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.wider,
  },
  footer: {
    padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
    borderRadius: theme.spacing.md,
    background: theme.colors.palette.backgrounds.card,
    border: `1px solid ${theme.colors.palette.borders.dark}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.sm,
  },
  footerText: {
    margin: 0,
    fontSize: theme.typography.fontSize.sm.size,
    color: theme.colors.palette.text.secondary,
  },
  saleBannerList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: theme.spacing[4],
  },
  };

  const palette = [
    { name: "Primary", color: theme.colors.palette.backgrounds.primary },
    { name: "Secondary", color: theme.colors.palette.backgrounds.secondary },
    { name: "Card", color: theme.colors.palette.backgrounds.card },
    { name: "Hover", color: theme.colors.palette.backgrounds.hover },
    { name: "Purple 600", color: theme.colors.palette.brand.purple[600] },
    { name: "Pink 600", color: theme.colors.palette.brand.pink[600] },
  ];

  const statuses = [
    { label: "Pending", ...theme.colors.palette.status.pending },
    { label: "Confirmed", ...theme.colors.palette.status.confirmed },
    { label: "Shipping", ...theme.colors.palette.status.shipping },
    { label: "Delivered", ...theme.colors.palette.status.delivered },
  ];

  const categories = [
    { label: "Work", ...theme.colors.palette.category.work },
    { label: "Personal", ...theme.colors.palette.category.personal },
    { label: "Shopping", ...theme.colors.palette.category.shopping },
    { label: "Health", ...theme.colors.palette.category.health },
    { label: "Learning", ...theme.colors.palette.category.learning },
  ];

  const saleBanners = [
    {
      tag: "Black Friday",
      title: "Special Sale",
      subtitle: "Up to 50% Off",
      background:
        "linear-gradient(120deg, rgba(17, 24, 39, 1) 0%, rgba(30, 41, 59, 1) 100%)",
      imageAlt: "Lifestyle room",
    },
    {
      tag: "VR Headset",
      title: "New Arrival",
      subtitle: "$299.00",
      background: "linear-gradient(120deg, #5B21B6 0%, #7C3AED 100%)",
      imageAlt: "VR headset",
    },
    {
      tag: "Special Offer",
      title: "Gaming Gear",
      subtitle: "Up to 30% Off",
      background: "linear-gradient(120deg, #831843 0%, #DB2777 100%)",
      imageAlt: "Gaming controller",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.backdrop}>
        <main style={styles.shell}>
          {/* Hero Carousel */}
          <HeroCarousel />

          <section style={styles.hero}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: theme.spacing[5] }}
            >
              <span style={styles.heroBadge}>
                <span
                  style={{
                    width: theme.spacing[2],
                    height: theme.spacing[2],
                    borderRadius: "999px",
                    background: gradients.primary,
                    boxShadow: theme.shadows.md,
                  }}
                />
                TechXchange UI Theme
              </span>
              <h1 style={styles.heroTitle}>
                Marketplace visuals with a focused purple-pink identity.
              </h1>
              <p style={styles.heroText}>
                A shared token system for colors, typography, and status signals
                that stays crisp across dashboards, listings, and seller tools.
              </p>
              <div style={styles.heroActions}>
                <button
                  type="button"
                  style={{
                    ...styles.primaryButton,
                    background: gradients.primary,
                  }}
                >
                  Use theme tokens
                </button>
                <button type="button" style={styles.ghostButton}>
                  Explore typography
                </button>
              </div>
            </div>
            <div style={styles.heroCard}>
              <h2 style={styles.cardTitle}>Marketplace pulse</h2>
              <div style={styles.statGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>ACTIVE STORES</div>
                  <p style={styles.statValue}>2,480</p>
                  <p style={styles.statNote}>+12% this month</p>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>NEW LISTINGS</div>
                  <p style={styles.statValue}>310</p>
                  <p style={styles.statNote}>Top categories trending</p>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>FULFILLMENT</div>
                  <p style={styles.statValue}>94%</p>
                  <p style={styles.statNote}>On-time deliveries</p>
                </div>
              </div>
              <div style={styles.badges}>
                {statuses.map((status) => (
                  <span
                    key={status.label}
                    style={{
                      ...styles.badge,
                      background: status.bg,
                      color: status.text,
                    }}
                  >
                    {status.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gap: theme.spacing.lg }}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Core palette</h2>
              <span style={styles.monoLabel}>Hex-driven tokens</span>
            </div>
            <div style={styles.paletteGrid}>
              {palette.map((swatch) => (
                <div key={swatch.name} style={styles.swatch}>
                  <div
                    style={{
                      height: theme.spacing[12],
                      borderRadius: theme.spacing[3],
                      background: swatch.color,
                      border: `1px solid ${theme.colors.buttonDisabled}`,
                    }}
                  />
                  <div style={styles.swatchLabel}>{swatch.name}</div>
                  <div style={styles.monoLabel}>{swatch.color}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Category signals</h2>
              <span style={styles.monoLabel}>
                Use for tags, chips, and filters
              </span>
            </div>
            <div style={styles.badges}>
              {categories.map((category) => (
                <span
                  key={category.label}
                  style={{
                    ...styles.badge,
                    background: category.bg,
                    color: category.text,
                  }}
                >
                  {category.label}
                </span>
              ))}
            </div>
          </section>

          <section style={{ display: "grid", gap: theme.spacing.lg }}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Sale banners</h2>
              <span style={styles.monoLabel}>Rotating promotions</span>
            </div>
            <div style={styles.saleBannerList}>
              {saleBanners.map((banner) => (
                <SaleBanner key={banner.title} {...banner} />
              ))}
            </div>
          </section>

          <section style={{ display: "grid", gap: theme.spacing.lg }}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Item card</h2>
              <span style={styles.monoLabel}>Commerce-ready component</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.lg }}>
              <ItemCard
                title="iPhone 15 Pro Max 256GB"
                price="$1,199"
                compareAtPrice="$1,299"
                rating={4}
                reviewCount={120}
                badgeText="-8%"
              />
            </div>
          </section>

          <section style={styles.footer}>
            <p style={styles.footerText}>
              Typography scale: 16px base, 36px page title, 48px hero.
            </p>
            <p style={styles.footerText}>
              Use gradients for primary actions and keep borders subtle on dark
              surfaces.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
