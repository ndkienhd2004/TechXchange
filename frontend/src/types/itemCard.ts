export interface ItemCardProps {
  productId?: number;
  title: string;
  price: string;
  compareAtPrice?: string;
  rating?: number;
  reviewCount?: number;
  badgeText?: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaLabel?: string;
}
