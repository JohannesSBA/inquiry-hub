import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InquiryHub — AI-Powered Inquiry Management",
  description: "Automatically organize, classify, and follow up with inquiries using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
