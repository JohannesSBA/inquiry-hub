import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.followUp.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.teamMember.deleteMany();

  // Create team members
  const team = await Promise.all([
    prisma.teamMember.create({
      data: {
        name: "Johannes",
        email: "johannes@inquiryhub.com",
        role: "FOUNDER",
      },
    }),
    prisma.teamMember.create({
      data: {
        name: "Sales Team",
        email: "sales@inquiryhub.com",
        role: "SALES",
      },
    }),
    prisma.teamMember.create({
      data: {
        name: "Support Team",
        email: "support@inquiryhub.com",
        role: "SUPPORT",
      },
    }),
    prisma.teamMember.create({
      data: {
        name: "Engineering",
        email: "eng@inquiryhub.com",
        role: "ENGINEERING",
      },
    }),
  ]);

  console.log(`Created ${team.length} team members`);

  // Create contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: "Amanuel Bekele",
        email: "amanuel@techcorp.et",
        company: "TechCorp Ethiopia",
        channel: "EMAIL",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Sara Williams",
        email: "sara@startupx.com",
        company: "StartupX",
        channel: "FORM",
      },
    }),
    prisma.contact.create({
      data: {
        name: "David Chen",
        email: "david@investco.com",
        company: "InvestCo",
        channel: "EMAIL",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Liya Tadesse",
        email: "liya@greenorg.org",
        company: "GreenOrg",
        channel: "SOCIAL",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Marcus Johnson",
        email: "marcus@devstudio.io",
        company: "DevStudio",
        channel: "EMAIL",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Nardos Hailu",
        email: "nardos@pitchowners.et",
        channel: "FORM",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Elena Rodriguez",
        email: "elena@marketingpro.com",
        company: "MarketingPro",
        channel: "EMAIL",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Tesfaye Girma",
        email: "tesfaye@addisfc.et",
        company: "Addis FC",
        channel: "FORM",
      },
    }),
  ]);

  console.log(`Created ${contacts.length} contacts`);

  // Create inquiries
  const inquiries = await Promise.all([
    prisma.inquiry.create({
      data: {
        subject: "Partnership opportunity for Meda platform",
        body: "Hi, I represent TechCorp Ethiopia and we're interested in exploring a partnership with your Meda platform. We manage 12 soccer pitches across Addis Ababa and would love to discuss integration possibilities. Can we schedule a call this week?",
        channel: "EMAIL",
        contactId: contacts[0].id,
        receivedAt: new Date(Date.now() - 2 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Pricing for enterprise features",
        body: "We're a growing startup and interested in your enterprise tier. What are the pricing options for teams of 50+? Also, do you offer custom integrations with Slack and Notion?",
        channel: "FORM",
        contactId: contacts[1].id,
        receivedAt: new Date(Date.now() - 5 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Investment inquiry — Series A",
        body: "I'm a partner at InvestCo and we've been tracking your progress. We'd like to discuss a potential Series A investment. Our fund focuses on African tech startups with strong marketplace dynamics. Please share your latest pitch deck.",
        channel: "EMAIL",
        contactId: contacts[2].id,
        receivedAt: new Date(Date.now() - 8 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Bug report: can't create events",
        body: "I've been trying to create a new event on the platform for the past 2 hours but keep getting a 500 error. This is blocking our weekend tournament setup. Please fix ASAP!",
        channel: "SOCIAL",
        contactId: contacts[3].id,
        receivedAt: new Date(Date.now() - 1 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Freelance developer available",
        body: "Hey, I'm a full-stack developer specializing in Next.js and I noticed you're building some cool stuff. I'd love to contribute as a freelancer if you need extra hands. Here's my portfolio: devstudio.io/marcus",
        channel: "EMAIL",
        contactId: contacts[4].id,
        receivedAt: new Date(Date.now() - 24 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Pitch owner onboarding question",
        body: "Selam! I own a pitch in Bole and want to register on Meda. How does the ERP system work? Can I manage bookings and payments through the platform? Also interested in the trust/ratings system.",
        channel: "FORM",
        contactId: contacts[5].id,
        receivedAt: new Date(Date.now() - 3 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Social media marketing collaboration",
        body: "We specialize in sports marketing across East Africa and would love to help grow Meda's social presence. We've worked with similar platforms and can deliver 5x engagement growth in 3 months. Interested in a proposal?",
        channel: "EMAIL",
        contactId: contacts[6].id,
        receivedAt: new Date(Date.now() - 12 * 3600000),
      },
    }),
    prisma.inquiry.create({
      data: {
        subject: "Team registration for weekly league",
        body: "We're Addis FC and we want to register our team for weekly league play on Meda. We have 22 players and need a pitch every Saturday from 3-5pm. What's the process for team registration and recurring bookings?",
        channel: "FORM",
        contactId: contacts[7].id,
        receivedAt: new Date(Date.now() - 6 * 3600000),
      },
    }),
  ]);

  console.log(`Created ${inquiries.length} inquiries`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
