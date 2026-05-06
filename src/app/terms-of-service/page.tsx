import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import styles from "@/components/public/PublicLayout.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — InquiryHub",
  description: "Terms governing access to and use of InquiryHub.",
};

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <main className={`${styles.main} ${styles.legalShell}`}>
        <section className={styles.legalHero}>
          <span className={styles.eyebrow}>Terms of Service</span>
          <h1 className={styles.legalTitle}>Terms for using InquiryHub.</h1>
          <p className={styles.heroText}>
            Last updated: May 6, 2026. These terms are a practical starting
            point for the product and should be reviewed by legal counsel before
            production launch.
          </p>
        </section>

        <LegalSection title="Use of the service">
          <p>
            InquiryHub provides software for collecting, classifying, routing,
            replying to, and following up on inbound inquiries. You may use the
            service only for lawful business purposes and in accordance with
            these terms.
          </p>
        </LegalSection>

        <LegalSection title="Accounts and team responsibility">
          <p>
            You are responsible for maintaining the confidentiality of your
            account, controlling team access, and ensuring that all users in
            your workspace follow these terms. You must provide accurate account
            information and promptly revoke access for users who should no
            longer use the service.
          </p>
        </LegalSection>

        <LegalSection title="Customer data">
          <p>
            You retain ownership of inquiry, contact, message, and workspace
            data submitted to InquiryHub. You grant InquiryHub permission to
            process that data to provide, secure, maintain, and improve the
            service. You are responsible for having the rights and notices
            needed to submit customer or sender data to the service.
          </p>
        </LegalSection>

        <LegalSection title="Acceptable use">
          <p>
            You may not use InquiryHub to send spam, unlawful messages,
            malicious content, or communications that violate third-party rights.
            You may not attempt to bypass security, overload the service,
            reverse engineer restricted functionality, or use the product in a
            way that harms other users or service providers.
          </p>
        </LegalSection>

        <LegalSection title="AI output">
          <p>
            AI classifications, draft replies, routing suggestions, sentiment,
            and follow-up copy are generated automatically and may be incomplete
            or inaccurate. You are responsible for reviewing AI output before
            relying on it or sending it externally.
          </p>
        </LegalSection>

        <LegalSection title="Gmail and channel integrations">
          <p>
            By connecting Gmail or another channel, you authorize InquiryHub to
            access and process messages as needed to provide ingestion, reply,
            and follow-up features. You are responsible for complying with
            Google, Meta, Telegram, and other third-party platform terms that
            apply to your connected accounts.
          </p>
        </LegalSection>

        <LegalSection title="Subscriptions and billing">
          <p>
            Pricing is expected to be managed through Stripe in a future
            implementation. Until billing is implemented, pricing pages are for
            product planning and presentation only and do not create a paid
            subscription. Future paid plans may include usage limits, renewal
            terms, taxes, cancellation rules, and payment obligations.
          </p>
        </LegalSection>

        <LegalSection title="Availability and changes">
          <p>
            We may update, suspend, or discontinue parts of the service. We aim
            to keep InquiryHub reliable, but we do not guarantee uninterrupted
            availability, error-free operation, or that every third-party
            integration will remain available.
          </p>
        </LegalSection>

        <LegalSection title="Disclaimers and limitation of liability">
          <p>
            InquiryHub is provided as is and as available, without warranties to
            the fullest extent permitted by law. To the fullest extent permitted
            by law, InquiryHub will not be liable for indirect, incidental,
            special, consequential, or punitive damages, or for lost profits,
            data, goodwill, or business opportunities.
          </p>
        </LegalSection>

        <LegalSection title="Termination">
          <p>
            You may stop using InquiryHub at any time. We may suspend or
            terminate access if you violate these terms, create security risk,
            misuse integrations, or use the service unlawfully. Upon
            termination, access to the workspace and connected integrations may
            be disabled.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            For questions about these terms, contact legal@inquiryhub.com.
            Replace this address with the production legal contact before
            launch.
          </p>
        </LegalSection>
      </main>
    </PublicLayout>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.legalCard}>
      <h2>{title}</h2>
      <div className={styles.legalText}>{children}</div>
    </section>
  );
}
