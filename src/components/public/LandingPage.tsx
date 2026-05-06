import Link from "next/link";
import styles from "@/components/public/PublicLayout.module.css";
import {
  landingFeatures,
  landingWorkflow,
} from "@/components/public/landingData";

export function LandingPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>AI-powered inquiry management</span>
          <h1 className={styles.heroTitle}>
            Turn scattered inbound messages into a managed reply workflow.
          </h1>
          <p className={styles.heroText}>
            InquiryHub helps teams collect inquiries across channels, classify
            them with AI, route ownership, draft replies, and keep follow-ups
            from slipping through.
          </p>
          <div className={styles.heroActions}>
            <Link href="/sign-in" className={styles.primaryButton}>
              Sign in
            </Link>
            <Link href="/pricing" className={styles.secondaryButton}>
              View pricing
            </Link>
          </div>
        </div>

        <div className={styles.productPanel} aria-label="Dashboard preview">
          <div className={styles.panelTop}>
            <div className={styles.panelTitle}>Live inquiry queue</div>
            <div className={styles.panelStatus}>SSE connected</div>
          </div>
          <div className={styles.inquiryPreview}>
            <PreviewRow
              source="Gmail"
              subject="Enterprise pricing and integrations"
              badges={[
                ["Sales", "#085041", "#e1f5ee"],
                ["High", "#791f1f", "#fcebeb"],
              ]}
            />
            <PreviewRow
              source="Form"
              subject="Partnership proposal for a new channel"
              badges={[
                ["Partnership", "#3c3489", "#eeedfe"],
                ["Medium", "#633806", "#faeeda"],
              ]}
            />
            <PreviewRow
              source="WhatsApp"
              subject="Blocking support issue before launch"
              badges={[
                ["Support", "#993c1d", "#faece7"],
                ["Urgent", "#791f1f", "#fcebeb"],
              ]}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.metricsGrid}>
          <Metric value="50" label="Latest inquiries loaded in dashboard" />
          <Metric value="3" label="Automated follow-up attempts supported" />
          <Metric value="5m" label="Default Gmail sync cadence on Vercel" />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Everything needed to triage, reply, and follow up.
          </h2>
          <p className={styles.sectionText}>
            The product is built around an operational dashboard: compact,
            searchable, realtime, and focused on helping a team move each
            inquiry to the next action.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {landingFeatures.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureLabel}>{feature.label}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>A simple operating loop.</h2>
          <p className={styles.sectionText}>
            Every channel feeds the same system, so teams can manage inquiry
            work without building separate processes for each inbox.
          </p>
        </div>
        <div className={styles.workflow}>
          {landingWorkflow.map(([number, title, text]) => (
            <article key={number} className={styles.step}>
              <div className={styles.stepNumber}>{number}</div>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.featureText}>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function PreviewRow({
  source,
  subject,
  badges,
}: {
  source: string;
  subject: string;
  badges: Array<[string, string, string]>;
}) {
  return (
    <div className={styles.previewRow}>
      <div className={styles.previewMeta}>
        <span>{source}</span>
        <span>Just now</span>
      </div>
      <div className={styles.previewSubject}>{subject}</div>
      <div className={styles.badgeRow}>
        {badges.map(([label, color, bg]) => (
          <span
            key={label}
            className={styles.badge}
            style={{ color, background: bg }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricValue}>{value}</div>
      <div className={styles.metricLabel}>{label}</div>
    </article>
  );
}
