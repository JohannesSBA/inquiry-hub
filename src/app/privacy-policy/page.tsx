import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import styles from "@/components/public/PublicLayout.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — InquiryHub",
  description: "How InquiryHub handles account, inquiry, Gmail, AI, and analytics data.",
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <main className={`${styles.main} ${styles.legalShell}`}>
        <section className={styles.legalHero}>
          <span className={styles.eyebrow}>Privacy Policy</span>
          <h1 className={styles.legalTitle}>How InquiryHub handles data.</h1>
          <p className={styles.heroText}>
            Last updated: May 6, 2026. This policy describes the information
            InquiryHub collects, how it is used, and the choices available to
            teams using the service. It is provided for product use and should
            be reviewed by legal counsel before production launch.
          </p>
        </section>

        <LegalSection title="Information we collect">
          <p>
            We collect account information from sign-in providers, including
            name, email address, authentication identifier, and team role. We
            also store inquiry data such as sender names, email addresses,
            phone numbers, company names, subjects, message bodies, channel
            source, status, assignment, AI classifications, draft replies, and
            follow-up history.
          </p>
          <p>
            If a team connects Gmail, we receive OAuth tokens, mailbox profile
            email, message identifiers, thread identifiers, headers needed for
            replies, and unread inbox message content selected by the sync
            process.
          </p>
        </LegalSection>

        <LegalSection title="How we use information">
          <p>
            We use information to authenticate users, create team member
            records, ingest and organize inquiries, classify messages, draft
            replies, route work, send replies and follow-ups, provide realtime
            dashboard updates, show analytics, maintain security, troubleshoot
            errors, and improve the product.
          </p>
        </LegalSection>

        <LegalSection title="AI processing">
          <p>
            Inquiry subject, body, sender name, and channel may be sent to
            OpenAI to generate classifications, intent summaries, sentiment,
            suggested assignments, draft replies, and follow-up copy. AI output
            may be inaccurate and should be reviewed before sending externally.
          </p>
        </LegalSection>

        <LegalSection title="Gmail and connected channels">
          <p>
            Gmail OAuth tokens are encrypted at rest before storage. InquiryHub
            uses Gmail access to poll unread inbox messages, mark ingested
            messages as read where possible, and send replies or follow-ups from
            connected team inboxes. Telegram, WhatsApp, Instagram, form, and API
            payloads are normalized into the same inquiry pipeline.
          </p>
        </LegalSection>

        <LegalSection title="Cookies, sessions, and analytics">
          <p>
            InquiryHub uses authentication cookies and session data through
            Neon Auth to keep users signed in and protect private routes. The
            app also stores operational analytics derived from inquiry records,
            including volume, category breakdown, response time, and follow-up
            conversion.
          </p>
        </LegalSection>

        <LegalSection title="Sharing and subprocessors">
          <p>
            We share data with service providers needed to run the product,
            including hosting, database, authentication, AI, and email
            providers. These providers process information only as needed to
            provide their services. We do not sell customer inquiry data.
          </p>
        </LegalSection>

        <LegalSection title="Security and retention">
          <p>
            InquiryHub uses authenticated access, encrypted Gmail token storage,
            signed OAuth state, and protected cron endpoints. Customer data is
            retained for as long as needed to provide the service, comply with
            obligations, resolve disputes, and maintain business records unless
            deletion is requested or required.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <p>
            Teams may request access, correction, export, or deletion of their
            data, subject to legal and operational requirements. Gmail access
            can be revoked through Google account settings or by removing the
            connected account from the product when that feature is available.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            For privacy questions, contact the InquiryHub team at
            privacy@inquiryhub.com. Replace this address with the production
            support or legal contact before launch.
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
