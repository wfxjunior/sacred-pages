import * as React from 'react'

import { Hr, Link, Text } from '@react-email/components'
import { EmailLogo } from './EmailLogo'

const SITE_URL = 'https://lumenadaily.com'

/** Shared footer used by every Lumena email. */
export const EmailFooter = ({ siteName = 'Lumena' }: { siteName?: string }) => (
  <>
    <Hr style={rule} />
    <Text style={brand}>
      <Link href={SITE_URL} style={brandLink}>
        {siteName}
      </Link>
      {' — '}
      Your daily journey through God&apos;s Word.
    </Text>
    <Text style={links}>
      <Link href={`${SITE_URL}/terms`} style={footerLink}>
        Terms &amp; Conditions
      </Link>
      {'  ·  '}
      <Link href={`${SITE_URL}/privacy`} style={footerLink}>
        Privacy Policy
      </Link>
      {'  ·  '}
      <Link href={`${SITE_URL}/cookies`} style={footerLink}>
        Cookies
      </Link>
    </Text>

    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} width="100%">
      <tbody>
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <Text style={legal}>
              You are receiving this email because an account action was requested for this
              address on {siteName}. © {new Date().getFullYear()} {siteName}. All rights reserved.
            </Text>
          </td>
          <td width="18" style={{ width: '18px' }} />
          <td style={{ verticalAlign: 'middle', textAlign: 'right' as const }}>
            <EmailLogo size={18} monochrome topSpacing={0} />
          </td>
        </tr>
      </tbody>
    </table>
  </>
)

export default EmailFooter

const rule = { borderColor: '#EDE8DE', margin: '32px 0 18px' }
const brand = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '13px',
  color: '#6B6659',
  margin: '0 0 8px',
}
const brandLink = { color: '#2E5C9E', textDecoration: 'none', fontWeight: 'bold' as const }
const links = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '12px',
  color: '#8A8578',
  margin: '0 0 10px',
}
const footerLink = { color: '#6B6659', textDecoration: 'underline' }
const legal = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '11px',
  color: '#A09A8C',
  lineHeight: '1.6',
  margin: 0,
}
