import Link from "next/link";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import styles from "@/components/public/PublicLayout.module.css";

export const metadata: Metadata = {
  title: "Pricing — InquiryHub",
  description: "Feature-oriented InquiryHub pricing for AI inquiry management.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "month",
    text: "Start organizing a small flow of inbound messages before turning on automation.",
    cta: "Start free",
    featured: false,
    features: [
      "20 inquiries per month",
      "Manual classification only",
      "Single team workspace",
      "Dashboard, filters, and inquiry detail view",
      "Basic form/API inquiry intake",
    ],
  },
  {
    name: "Pro",
    price: "$39",
    cadence: "month",
    text: "For teams ready to pay for AI triage, reply drafting, and follow-up automation.",
    cta: "Choose Pro",
    featured: true,
    features: [
      "Unlimited AI classification",
      "AI-generated draft replies",
      "Automated follow-up scheduling",
      "Gmail connection, sync, and send",
      "Realtime dashboard updates",
      "Analytics for volume and response time",
    ],
  },
  {
    name: "Enterprise",
    price: "$99+",
    cadence: "month",
    text: "For larger teams with more inboxes, routing needs, and integration requirements.",
    cta: "Contact sales",
    featured: false,
    features: [
      "Team routing by role and workflow",
      "Multiple connected inboxes",
      "API access for custom channels",
      "Higher inquiry limits",
      "Priority support",
      "Custom onboarding and security review",
    ],
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <main className={styles.main}>
        <section className={styles.legalHero}>
          <span className={styles.eyebrow}>Pricing</span>
          <h1 className={styles.legalTitle}>
            Free to try. Pay for AI and automation when volume grows.
          </h1>
          <p className={styles.heroText}>
            InquiryHub pricing is designed around usage and automation depth.
            Stripe billing is planned for later; this page is presentation-only
            and does not start checkout.
          </p>
        </section>

        <section className={styles.pricingGrid} aria-label="Pricing plans">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.priceCard} ${
                plan.featured ? styles.highlightCard : ""
              }`}
            >
              <div>
                <h2 className={styles.planName}>{plan.name}</h2>
                <div className={styles.price}>
                  {plan.price} <span>/ {plan.cadence}</span>
                </div>
                <p className={styles.priceText}>{plan.text}</p>
              </div>

              <ul className={styles.list}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link href="/sign-in" className={styles.primaryButton}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What changes by tier?</h2>
            <p className={styles.sectionText}>
              The Free tier keeps the door open for evaluation. Pro unlocks
              the core AI and automation workflow. Enterprise adds scale,
              routing, support, and API flexibility for teams with more complex
              operations.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
