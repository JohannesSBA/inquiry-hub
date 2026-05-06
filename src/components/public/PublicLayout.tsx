"use client";

import Link from "next/link";
import styles from "@/components/public/PublicLayout.module.css";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>IH</span>
          InquiryHub
        </Link>
        <div className={styles.links}>
          <Link href="/" className={styles.navLink}>
            Features
          </Link>
          <Link href="/pricing" className={styles.navLink}>
            Pricing
          </Link>
          <Link href="/privacy-policy" className={styles.navLink}>
            Privacy
          </Link>
          <Link href="/terms-of-service" className={styles.navLink}>
            Terms
          </Link>
          <Link href="/sign-in" className={styles.navButton}>
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>© {new Date().getFullYear()} InquiryHub. All rights reserved.</div>
        <div className={styles.footerLinks}>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
