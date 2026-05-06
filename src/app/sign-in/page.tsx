"use client";

/**
 * Google OAuth entry — delegates to Neon Auth via proxied Better Auth client.
 */

import { getAuthBrowserClient } from "@/lib/authBrowserClient";

export default function SignInPage() {
  async function signInGoogle() {
    const client = getAuthBrowserClient();
    await client.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1>InquiryHub</h1>
      <p style={{ color: "#666" }}>Sign in with your team Google account</p>
      <button
        type="button"
        onClick={() => void signInGoogle()}
        style={{
          padding: "12px 24px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Continue with Google
      </button>
    </div>
  );
}
