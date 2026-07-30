import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import { EmailFooter } from './EmailFooter'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click the button below to log in to {siteName}. This link will expire
          shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Log In
        </Button>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "Georgia, 'Times New Roman', serif",
  margin: 0,
  padding: '24px 0',
}
const container = {
  backgroundColor: '#FCFBF8',
  border: '1px solid #EDE8DE',
  borderRadius: '14px',
  padding: '36px 34px',
  maxWidth: '560px',
  margin: '0 auto',
}
const h1 = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '26px',
  fontWeight: 'bold' as const,
  color: '#202124',
  letterSpacing: '-0.01em',
  margin: '0 0 14px',
}
const text = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '15px',
  color: '#4A4A4A',
  lineHeight: '1.65',
  margin: '0 0 22px',
}
const button = {
  backgroundColor: '#2E5C9E',
  color: '#FFFFFF',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '14px 26px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '12px',
  color: '#8A8578',
  lineHeight: '1.6',
  borderTop: '1px solid #EDE8DE',
  paddingTop: '18px',
  margin: '32px 0 0',
}
