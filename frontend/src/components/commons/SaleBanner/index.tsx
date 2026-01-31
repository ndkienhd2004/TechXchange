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
}: SaleBannerProps) {
  const { themed } = useAppTheme();

  return (
    <article style={{ ...themed(styles.card), background }}>
      <div style={themed(styles.content)}>
        <span style={themed(styles.tag)}>{tag}</span>
        <h3 style={themed(styles.title)}>{title}</h3>
        <p style={themed(styles.subtitle)}>{subtitle}</p>
        {price ? <span style={themed(styles.priceText)}>{price}</span> : null}
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
