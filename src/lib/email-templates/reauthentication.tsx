import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, \'Times New Roman\', serif', margin: 0, padding: '24px 0' }
const text = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '15px',
  color: '#4A4A4A',
  lineHeight: '1.65',
  margin: '0 0 22px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '30px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.18em',
  color: '#C89F4F',
  backgroundColor: '#FFFFFF',
  border: '1px solid #EDE8DE',
  borderRadius: '10px',
  padding: '16px 20px',
  textAlign: 'center' as const,
  margin: '0 0 26px',
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
