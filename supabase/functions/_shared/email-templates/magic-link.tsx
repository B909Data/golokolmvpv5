/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL =
  'https://qtduseiexmhssdkzjwbn.supabase.co/storage/v1/object/public/email-assets/golokol-logo.svg'

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Special link to submit your music</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="GoLokol" width="48" height="48" style={logoStyle} />
        <Heading style={h1}>
          One-time curator invite link to Lokol Listening Stations
        </Heading>
        <Text style={text}>
          Click the button below to securely submit your music for the next LLS.
          We will confirm via text.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Submit
        </Button>
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Roboto, Arial, sans-serif' }
const container = { padding: '32px 28px' }
const logoStyle = { marginBottom: '24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#111111',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#555555',
  lineHeight: '1.55',
  margin: '0 0 28px',
}
const button = {
  backgroundColor: '#FFD400',
  color: '#111111',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '13px', color: '#999999', margin: '32px 0 0' }
