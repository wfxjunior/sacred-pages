import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./EmailFooter";

interface CompanionInviteEmailProps {
  siteName: string;
  siteUrl: string;
  inviterName: string;
  relationship: string;
  personalMessage?: string;
  inviteUrl: string;
}

export const CompanionInviteEmail = ({
  siteName,
  siteUrl,
  inviterName,
  relationship,
  personalMessage,
  inviteUrl,
}: CompanionInviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{inviterName} invited you to walk together on {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You&apos;re invited to walk together</Heading>
        <Text style={text}>
          <strong>{inviterName}</strong> ({relationship}) invited you to join a
          Scripture journey on{" "}
          <Link href={siteUrl} style={link}>
            {siteName}
          </Link>
          .
        </Text>
        {personalMessage && (
          <Text style={messageBox}>&ldquo;{personalMessage}&rdquo;</Text>
        )}
        <Button style={button} href={inviteUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren&apos;t expecting this invitation, you can safely ignore
          this email.
        </Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
);

export default CompanionInviteEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Georgia, 'Times New Roman', serif",
  margin: 0,
  padding: "24px 0",
};
const container = {
  backgroundColor: "#FCFBF8",
  border: "1px solid #EDE8DE",
  borderRadius: "14px",
  padding: "36px 34px",
  maxWidth: "560px",
  margin: "0 auto",
};
const h1 = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "26px",
  fontWeight: "bold" as const,
  color: "#202124",
  letterSpacing: "-0.01em",
  margin: "0 0 14px",
};
const text = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "15px",
  color: "#4A4A4A",
  lineHeight: "1.65",
  margin: "0 0 22px",
};
const messageBox = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic" as const,
  fontSize: "15px",
  color: "#5A5A5A",
  backgroundColor: "#F8F6F2",
  borderLeft: "3px solid #B88A3B",
  padding: "14px 18px",
  margin: "0 0 22px",
  lineHeight: "1.55",
};
const link = { color: "#2E5C9E", textDecoration: "underline" };
const button = {
  backgroundColor: "#2E5C9E",
  color: "#FFFFFF",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "bold" as const,
  borderRadius: "10px",
  padding: "14px 26px",
  textDecoration: "none",
  display: "inline-block",
};
const footer = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "12px",
  color: "#8A8A8A",
  margin: "22px 0 0",
};
