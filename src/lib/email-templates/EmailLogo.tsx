import * as React from 'react'

import { Link, Section } from '@react-email/components'

/**
 * The Lumena logo for email — the same six letter tiles as the site header,
 * rebuilt with a table so it renders identically in every mail client.
 * Colours mirror BRAND_TILE_PALETTE in src/components/site/BrandMark.tsx.
 */
const BRAND_TILE_PALETTE = [
  { bg: '#F6F2E8', border: '#D6CFBE', fg: '#2B2B2B' },
  { bg: '#ECE6D8', border: '#CFC7B6', fg: '#2B2B2B' },
  { bg: '#DDD5C4', border: '#C4B9A7', fg: '#2B2B2B' },
  { bg: '#C8BAA6', border: '#B0A28C', fg: '#2B2B2B' },
  { bg: '#7A6C5B', border: '#5F5346', fg: '#F6F2E8' },
  { bg: '#E9DCC3', border: '#C8AC76', fg: '#3F3625' },
]

/** Subtle, single-tone palette used for the small footer mark. */
const MONOCHROME_TILE = { bg: '#F6F4EF', border: '#D6CFBE', fg: '#8A8578' }

const SITE_URL = 'https://lumenadaily.com'
const DEFAULT_SIZE = 30

interface EmailLogoProps {
  href?: string
  /** Tile size in px. */
  size?: number
  /** Renders a soft, one-colour version ideal for the footer corner. */
  monochrome?: boolean
  /** Extra breathing room above the mark. */
  topSpacing?: number
}

export const EmailLogo = ({
  href = SITE_URL,
  size = DEFAULT_SIZE,
  monochrome = false,
  topSpacing = 0,
}: EmailLogoProps) => {
  const palette = monochrome
    ? Array.from({ length: 6 }, () => MONOCHROME_TILE)
    : BRAND_TILE_PALETTE

  return (
    <Section style={{ margin: `${topSpacing}px 0 34px` }}>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={table}>
          <tbody>
            <tr>
              {'LUMENA'.split('').map((letter, i) => {
                const tone = palette[i]!
                return (
                  <td key={`${letter}-${i}`} style={{ padding: '0 3px 0 0' }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                              backgroundColor: tone.bg,
                              border: `2px solid ${tone.border}`,
                              borderRadius: '6px',
                              color: tone.fg,
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              fontSize: `${Math.round(size * 0.5)}px`,
                              fontWeight: 'bold' as const,
                              lineHeight: `${size}px`,
                              textAlign: 'center' as const,
                            }}
                          >
                            {letter}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  )
}

export default EmailLogo

const table = { borderCollapse: 'separate' as const }
