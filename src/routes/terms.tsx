import { createFileRoute } from "@tanstack/react-router";
import { TrustH2, TrustList, TrustPageLayout } from "@/components/site/TrustPageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Lumen Verse" },
      { name: "description", content: "The terms and conditions for using Lumen Verse." },
      { property: "og:title", content: "Terms of Service — Lumen Verse" },
      { property: "og:description", content: "Terms and conditions for using Lumen Verse." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <TrustPageLayout
      eyebrow="Terms"
      title="Terms of Service"
      lastUpdated="July 30, 2026"
    >
      <p>
        These Terms of Service govern your access to and use of Lumen Verse. By creating an account or using the service, you agree to these terms. If you do not agree, please do not use the service.
      </p>

      <TrustH2>1. Your account</TrustH2>
      <p>
        You must provide accurate information when creating an account. You are responsible for keeping your password secure and for all activity that happens under your account. If you suspect unauthorized access, notify us immediately.
      </p>

      <TrustH2>2. Acceptable use</TrustH2>
      <p>You agree not to use the service to:</p>
      <TrustList
        items={[
          "Violate any applicable law or regulation.",
          "Harass, abuse, or harm other users.",
          "Attempt to access another user's account without permission.",
          "Distribute malware, spam, or other harmful content.",
          "Reverse engineer, scrape, or interfere with the platform's operation.",
          "Upload content that infringes on intellectual property or privacy rights.",
        ]}
      />

      <TrustH2>3. Content and intellectual property</TrustH2>
      <p>
        The Bible text, devotionals, artwork, puzzles, and other materials on Lumen Verse are licensed to you for personal, non-commercial use through the service. You may not reproduce, sell, or redistribute them outside the platform without permission.
      </p>
      <p>
        You retain ownership of any content you create, such as notes, reflections, or prayer requests. By posting or sharing content, you grant us a limited license to host and display it as needed to operate the service.
      </p>

      <TrustH2>4. Subscriptions and payments</TrustH2>
      <p>
        Some features may require payment or a subscription. Fees are described at the time of purchase. Subscriptions renew automatically unless canceled before the renewal date. All purchases are final unless otherwise required by law.
      </p>

      <TrustH2>5. Termination</TrustH2>
      <p>
        You may delete your account at any time. We may suspend or terminate your access if you violate these terms or if we need to stop providing the service. Upon termination, your right to use the service ends immediately, but certain provisions of these terms will survive.
      </p>

      <TrustH2>6. Disclaimers</TrustH2>
      <p>
        The service is provided "as is" and "as available." We do not guarantee that the service will always be available, error-free, or uninterrupted. We are not responsible for theological interpretation, counseling, or any decisions you make based on content in the app.
      </p>

      <TrustH2>7. Limitation of liability</TrustH2>
      <p>
        To the extent permitted by law, Lumen Verse and its team will not be liable for indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability will not exceed the amount you paid to us in the twelve months before the claim.
      </p>

      <TrustH2>8. Changes to these terms</TrustH2>
      <p>
        We may update these Terms of Service from time to time. We will post the revised version with a new "Last updated" date. Continued use of the service after changes means you accept the updated terms.
      </p>

      <TrustH2>9. Governing law</TrustH2>
      <p>
        These terms are governed by the laws of the jurisdiction where Lumen Verse operates, without regard to conflict of law principles. Any dispute will be resolved in the courts of that jurisdiction.
      </p>

      <TrustH2>10. Contact us</TrustH2>
      <p>
        If you have questions about these Terms of Service, email us at hello@journeys.app.
      </p>
    </TrustPageLayout>
  );
}
