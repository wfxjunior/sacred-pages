import * as React from 'react'

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
} from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, \'Times New Roman\', serif', margin: 0, padding: '24px 0' }
const text = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '15px',
  color: '#4A4A4A',
  lineHeight: '1.65',
  margin: '0 0 22px',
}
const link = { color: '#2E5C9E', textDecoration: 'underline' }
const footer = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '12px',
  color: '#8A8578',
  lineHeight: '1.6',
  borderTop: '1px solid #EDE8DE',
  paddingTop: '18px',
  margin: '32px 0 0',
}
