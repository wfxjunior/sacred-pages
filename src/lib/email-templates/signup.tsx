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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
