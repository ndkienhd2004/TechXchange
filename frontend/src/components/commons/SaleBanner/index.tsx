"use client";

import Image from "next/image";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import { SaleBannerProps } from "@/types/saleBanner";



export default function SaleBanner({
  tag,
  title,
  subtitle,
  price,
  imageSrc,
  imageAlt = "Promotion",
  background,
  textTone = "default",
}: SaleBannerProps) {
  const { themed } = useAppTheme();
  const inverse = textTone === "inverse";

  return (
    <article style={{ ...themed(styles.card), background }}>
      <div style={themed(styles.content)}>
        <span style={themed(inverse ? styles.tagInverse : styles.tag)}>{tag}</span>
        <h3 style={themed(inverse ? styles.titleInverse : styles.title)}>{title}</h3>
        <p style={themed(inverse ? styles.subtitleInverse : styles.subtitle)}>{subtitle}</p>
        {price ? (
          <span style={themed(inverse ? styles.priceTextInverse : styles.priceText)}>
            {price}
          </span>
        ) : null}
      </div>
      <div style={themed(styles.imageWrap)}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={120}
            height={120}
            style={themed(styles.image)}
          />
        ) : (
          <div style={themed(styles.image)} />
        )}
      </div>
    </article>
  );
}
