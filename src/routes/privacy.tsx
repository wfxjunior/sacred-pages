import { createFileRoute } from "@tanstack/react-router";
import { TrustH2, TrustList, TrustPageLayout } from "@/components/site/TrustPageLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Lumen Verse" },
      { name: "description", content: "How Lumen Verse collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Lumen Verse" },
      { property: "og:description", content: "How Lumen Verse handles your personal data and privacy." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <TrustPageLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      lastUpdated="July 30, 2026"
    >
      <p>
        This Privacy Policy explains how Lumen Verse collects, uses, stores, and protects your information when you use our website and app. Please read it carefully. If you do not agree with this policy, you should not use the service.
      </p>

      <TrustH2>1. Information we collect</TrustH2>
      <p>We collect information you provide directly and some data automatically:</p>
      <TrustList
        items={[
          "Account information: name, email address, and password when you create an account.",
          "Profile details: display name, language preference, and optional avatar or photo.",
          "Usage data: journeys completed, words found, time spent, favorites, and progress.",
          "Device and log data: browser type, IP address, device identifiers, and crash logs.",
          "Communications: messages you send to our support team or feedback forms.",
        ]}
      />

      <TrustH2>2. How we use your information</TrustH2>
      <p>We use your information to operate, improve, and secure the service:</p>
      <TrustList
        items={[
          "Create and manage your account and preferences.",
          "Personalize your daily journey, devotional content, and reminders.",
          "Track progress and generate insights for your personal use.",
          "Send important service updates and, with your consent, marketing messages.",
          "Detect fraud, abuse, and technical problems.",
        ]}
      />

      <TrustH2>3. Sharing your information</TrustH2>
      <p>
        We do not sell your personal information. We share data only with service providers who help us run the platform (such as hosting, authentication, and analytics) and only under confidentiality obligations. We may also share information when required by law or to protect our rights and users.
      </p>

      <TrustH2>4. Cookies and similar technologies</TrustH2>
      <p>
        We use cookies and local storage to keep you signed in, remember your preferences, and understand how the app is used. You can manage cookies through your browser settings. Some features may not work if you disable essential cookies.
      </p>

      <TrustH2>5. Data retention</TrustH2>
      <p>
        We keep your account information and progress for as long as your account is active. If you delete your account, we will remove or anonymize your personal data within a reasonable time, unless we are required to keep it longer by law.
      </p>

      <TrustH2>6. Your rights</TrustH2>
      <p>Depending on where you live, you may have the right to:</p>
      <TrustList
        items={[
          "Access, correct, or delete your personal information.",
          "Export your data in a common format.",
          "Object to certain processing or withdraw consent.",
          "File a complaint with a data protection authority.",
        ]}
      />
      <p>
        To exercise these rights, contact us at hello@journeys.app. We will respond within the time required by applicable law.
      </p>

      <TrustH2>7. Children's privacy</TrustH2>
      <p>
        Lumen Verse is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us so we can delete it.
      </p>

      <TrustH2>8. International transfers</TrustH2>
      <p>
        Your information may be stored and processed in countries other than your own, where our service providers operate. We use appropriate safeguards to protect your data when it is transferred internationally.
      </p>

      <TrustH2>9. Changes to this policy</TrustH2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised version with a new "Last updated" date. Continued use of the service after changes means you accept the updated policy.
      </p>

      <TrustH2>10. Contact us</TrustH2>
      <p>
        If you have questions about this Privacy Policy or how we handle your data, email us at hello@journeys.app.
      </p>
    </TrustPageLayout>
  );
}
