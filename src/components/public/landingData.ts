export const landingFeatures = [
  {
    label: "Ingestion",
    title: "Collect every inquiry in one queue",
    text: "Bring Gmail, forms, API submissions, Telegram, WhatsApp, and Instagram messages into a shared inquiry workflow.",
  },
  {
    label: "AI classification",
    title: "Know what needs attention first",
    text: "OpenAI classifies category, priority, intent, and sentiment so teams can focus on the highest-value conversations.",
  },
  {
    label: "Draft replies",
    title: "Respond with context",
    text: "Generate concise draft replies that acknowledge the sender's ask and give your team a strong starting point.",
  },
  {
    label: "Team routing",
    title: "Send work to the right owner",
    text: "Route sales, support, partnerships, talent, investment, and onboarding inquiries by suggested team role.",
  },
  {
    label: "Gmail",
    title: "Reply from connected inboxes",
    text: "Connect Gmail accounts, sync unread inbox messages, preserve thread context, and send replies from the assignee.",
  },
  {
    label: "Follow-ups",
    title: "Keep conversations moving",
    text: "Schedule and send AI-generated follow-ups when an inquiry needs another touch after the first response.",
  },
  {
    label: "Realtime",
    title: "See updates as they happen",
    text: "Dashboard streams refresh when inquiries are created, classified, updated, or followed up.",
  },
  {
    label: "Analytics",
    title: "Review team performance",
    text: "Track inquiry volume, category mix, response time, and follow-up conversion from the analytics dashboard.",
  },
  {
    label: "Security",
    title: "Designed around private workflows",
    text: "Use authenticated team access, encrypted Gmail token storage, signed OAuth state, and protected cron routes.",
  },
];

export const landingWorkflow = [
  ["01", "Capture", "Normalize messages from email, forms, social DMs, and API submissions."],
  ["02", "Classify", "Detect intent, category, priority, sentiment, and recommended owner."],
  ["03", "Reply", "Edit AI drafts and send through the assigned Gmail account."],
  ["04", "Follow up", "Schedule reminders and review outcomes from the dashboard."],
] as const;
