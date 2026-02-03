"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const SOCIAL_ICONS = {
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

export default function Footer() {
  const { themed } = useAppTheme();
  const [email, setEmail] = useState("");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: integrate with API
      setEmail("");
    }
  };

  return (
    <>
      <footer style={themed(styles.footer)}>
        <div style={themed(styles.topSection)}>
          {/* STAY CONNECTED */}
          <div style={themed(styles.column)}>
            <h3 style={themed(styles.columnTitle)}>STAY CONNECTED</h3>
            <p style={themed(styles.contactText)}>Innotek Tech Ltd.</p>
            <p style={themed(styles.contactText)}>sales@techxchange.com</p>
            <p style={themed(styles.contactText)}>0123456789</p>
            <div style={themed(styles.socialRow)}>
              {(["facebook", "twitter", "instagram", "linkedin"] as const).map((key) => (
                <a
                  key={key}
                  href="#"
                  style={{
                    ...themed(styles.socialLink),
                    ...(hoveredSocial === key ? themed(styles.linkHover) : {}),
                  }}
                  onMouseEnter={() => setHoveredSocial(key)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  aria-label={key}
                >
                  {SOCIAL_ICONS[key]}
                </a>
              ))}
            </div>
          </div>

          {/* ACCOUNT */}
          <div style={themed(styles.column)}>
            <h3 style={themed(styles.columnTitle)}>ACCOUNT</h3>
            <ul style={themed(styles.linkList)}>
              {[
                { label: "Wishlist", href: "/wishlist" },
                { label: "Cart", href: "/cart" },
                { label: "Track Order", href: "/track-order" },
                { label: "Shipping Details", href: "/shipping" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      ...themed(styles.link),
                      ...(hoveredLink === label ? themed(styles.linkHover) : {}),
                    }}
                    onMouseEnter={() => setHoveredLink(label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* USEFUL LINKS */}
          <div style={themed(styles.column)}>
            <h3 style={themed(styles.columnTitle)}>USEFUL LINKS</h3>
            <ul style={themed(styles.linkList)}>
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "Our Location", href: "/location" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      ...themed(styles.link),
                      ...(hoveredLink === label ? themed(styles.linkHover) : {}),
                    }}
                    onMouseEnter={() => setHoveredLink(label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HELP CENTER */}
          <div style={themed(styles.column)}>
            <h3 style={themed(styles.columnTitle)}>HELP CENTER</h3>
            <ul style={themed(styles.linkList)}>
              {[
                { label: "Payment", href: "/help/payment" },
                { label: "Refund", href: "/help/refund" },
                { label: "EMI Change", href: "/help/emi" },
                { label: "Exchange", href: "/help/exchange" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      ...themed(styles.link),
                      ...(hoveredLink === label ? themed(styles.linkHover) : {}),
                    }}
                    onMouseEnter={() => setHoveredLink(label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div style={themed(styles.column)}>
            <h3 style={themed(styles.columnTitle)}>NEWSLETTER</h3>
            <p style={themed(styles.newsletterText)}>
              Đăng ký để nhận thông tin khuyến mãi mới nhất
            </p>
            <form style={themed(styles.newsletterForm)} onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                style={themed(styles.newsletterInput)}
                aria-label="Email đăng ký newsletter"
              />
              <button type="submit" style={themed(styles.newsletterButton)} aria-label="Đăng ký">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={themed(styles.bottomSection)}>
          <p style={themed(styles.copyright)}>
            Copyright © 2024. All rights reserved.
          </p>
          <div style={themed(styles.paymentRow)}>
            <span style={themed(styles.paymentBadge)}>VISA</span>
            <span style={themed(styles.paymentBadge)}>Mastercard</span>
          </div>
        </div>
      </footer>

      {/* FLOATING CHAT */}
      <button
        type="button"
        style={themed(styles.chatButton)}
        aria-label="Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
}
