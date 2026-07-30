import { createFileRoute } from "@tanstack/react-router";
import { TrustH2, TrustList, TrustPageLayout } from "@/components/site/TrustPageLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Lumen Verse" },
      { name: "description", content: "How Lumen Verse uses cookies and similar technologies." },
      { property: "og:title", content: "Cookie Policy — Lumen Verse" },
      { property: "og:description", content: "Cookie and local storage usage on Lumen Verse." },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <TrustPageLayout
      eyebrow="Cookies"
      title="Cookie Policy"
      lastUpdated="July 30, 2026"
    >
      <p>
        This Cookie Policy explains how Lumen Verse uses cookies and similar technologies to recognize you when you visit our website or use our app. It describes what these technologies are, why we use them, and your choices.
      </p>

      <TrustH2>1. What are cookies?</TrustH2>
      <p>
        Cookies are small data files stored on your device when you visit a website. They help the site remember your preferences and improve your experience. We also use similar technologies such as local storage and session storage for app data.
      </p>

      <TrustH2>2. Why we use cookies</TrustH2>
      <p>We use cookies and related technologies for the following purposes:</p>
      <TrustList
        items={[
          "Essential functions: keeping you signed in, remembering your language and theme preferences, and enabling core app features.",
          "Preferences and progress: storing your journey progress, favorites, and settings so your experience is consistent across sessions.",
          "Analytics: understanding how users interact with the service so we can improve performance, features, and content.",
          "Security: detecting suspicious activity and protecting your account.",
        ]}
      />

      <TrustH2>3. Types of cookies we use</TrustH2>
      <p>
        <strong>Essential cookies</strong> are required for the service to work. They include authentication tokens and session identifiers. Without them, you cannot sign in or use the app.
      </p>
      <p>
        <strong>Preference cookies</strong> remember your choices, such as language, theme, and notification settings.
      </p>
      <p>
        <strong>Analytics cookies</strong> help us understand how visitors use the site. We may use third-party analytics providers for this purpose.
      </p>

      <TrustH2>4. Third-party services</TrustH2>
      <p>
        We may use trusted third-party services that set their own cookies or process data on our behalf. These providers are bound by confidentiality and data protection obligations. We do not allow them to use your data for their own independent purposes.
      </p>

      <TrustH2>5. Your choices</TrustH2>
      <p>
        You can manage or delete cookies through your browser settings. Most browsers let you refuse all cookies or alert you when a cookie is being set. Keep in mind that disabling essential cookies may prevent parts of the service from working.
      </p>
      <p>
        For analytics and preference cookies, you can adjust your settings in the app or through your browser. We do not currently respond to "Do Not Track" signals in a uniform way.
      </p>

      <TrustH2>6. Changes to this policy</TrustH2>
      <p>
        We may update this Cookie Policy from time to time. We will post the revised version with a new "Last updated" date. Continued use of the service after changes means you accept the updated policy.
      </p>

      <TrustH2>7. Contact us</TrustH2>
      <p>
        If you have questions about our use of cookies, email us at hello@journeys.app.
      </p>
    </TrustPageLayout>
  );
}
