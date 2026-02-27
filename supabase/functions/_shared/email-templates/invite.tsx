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
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

const LOGO_URL =
  'https://qtduseiexmhssdkzjwbn.supabase.co/storage/v1/object/public/email-assets/golokol-logo.svg'

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to GoLokol</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="GoLokol" width="48" height="48" style={logoStyle} />
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>GoLokol</strong>
          </Link>
          . Click below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const link = { color: 'inherit', textDecoration: 'underline' }
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
