import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "GoLokol"

interface KioskAgreementConfirmationProps {
  contact_name?: string
  store_name?: string
  city?: string
  signed_date?: string
  agreement_text?: string
  agreement_version?: string
}

const KioskAgreementConfirmationEmail = ({
  contact_name,
  store_name,
  city,
  signed_date,
  agreement_text,
  agreement_version,
}: KioskAgreementConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your signed Kiosk Placement Agreement for {store_name || 'your store'}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={headerText}>Lokol Listening Stations</Heading>
        </Section>

        <Heading style={h1}>
          Kiosk Placement Agreement — Signed
        </Heading>

        <Text style={text}>
          {contact_name ? `Hi ${contact_name},` : 'Hello,'}
        </Text>

        <Text style={text}>
          Thank you for signing the Lokol Listening Stations Kiosk Placement Agreement
          {store_name ? ` for ${store_name}` : ''}
          {city ? ` in ${city}` : ''}.
          {signed_date ? ` Signed on ${signed_date}.` : ''}
        </Text>

        <Text style={text}>
          Below is a complete copy of the agreement for your records.
          {agreement_version ? ` (Version: ${agreement_version})` : ''}
        </Text>

        <Hr style={divider} />

        {/* Agreement text */}
        <Section style={agreementContainer}>
          <Text style={agreementText}>
            {agreement_text || 'Agreement text not available.'}
          </Text>
        </Section>

        <Hr style={divider} />

        <Text style={footer}>
          If you have any questions, reply to this email or contact us at hello@golokol.app.
        </Text>

        <Text style={footer}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: KioskAgreementConfirmationEmail,
  subject: 'Your signed Kiosk Placement Agreement',
  displayName: 'Kiosk Agreement Confirmation',
  previewData: {
    contact_name: 'Jane Doe',
    store_name: 'Vinyl Paradise',
    city: 'Austin',
    signed_date: 'January 15, 2026',
    agreement_text: 'LOKOL LISTENING SESSIONS KIOSK PLACEMENT AGREEMENT\n\nThis is a preview of the full agreement text...',
    agreement_version: 'LLS_KIOSK_PLACEMENT_V1',
  },
} satisfies TemplateEntry

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
}

const container = {
  padding: '20px 25px',
  maxWidth: '600px',
  margin: '0 auto',
}

const header = {
  backgroundColor: '#111111',
  padding: '20px 25px',
  borderRadius: '8px 8px 0 0',
  marginBottom: '0',
}

const headerText = {
  color: '#FFD400',
  fontSize: '18px',
  fontWeight: '700' as const,
  margin: '0',
  textAlign: 'center' as const,
}

const h1 = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#111111',
  margin: '24px 0 16px',
}

const text = {
  fontSize: '14px',
  color: '#555555',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const agreementContainer = {
  backgroundColor: '#f9f9f9',
  borderRadius: '6px',
  padding: '20px',
  border: '1px solid #e5e5e5',
}

const agreementText = {
  fontSize: '12px',
  color: '#333333',
  lineHeight: '1.7',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  fontFamily: "'Roboto Mono', 'Courier New', monospace",
}

const footer = {
  fontSize: '12px',
  color: '#999999',
  margin: '0 0 8px',
}
