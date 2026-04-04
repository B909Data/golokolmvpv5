

# Send Kiosk Agreement Copy to Signers

## Overview
After a store owner signs the Kiosk Placement Agreement on `/lls-us/terms`, automatically send them a confirmation email containing the full agreement text. This mirrors what already exists for the Music Release Agreement.

## Approach
Use Lovable's built-in email infrastructure (verified domain: `notify.golokol.app`) to send a branded transactional email triggered after each signature.

## Steps

### 1. Set up email infrastructure
Run the email infrastructure setup tool to create the necessary database tables, queues, and Edge Functions for transactional email sending.

### 2. Scaffold transactional email system
Create the `send-transactional-email` Edge Function, unsubscribe handler, and suppression handler. This is a one-time setup since the project doesn't have transactional emails yet.

### 3. Create the email template
Create a React Email template (`kiosk-agreement-confirmation.tsx`) that includes:
- Branded header matching existing GoLokol email style (yellow #FFD400 buttons, black text, Roboto font)
- Greeting with the signer's name
- Confirmation that the agreement was signed, with store name and date
- The full agreement text (formatted as plain text in a styled container)
- Agreement version reference

### 4. Create unsubscribe page
Add a `/email-unsubscribe` page (or similar available path) to handle one-click unsubscribe from transactional emails, matching the project's existing design.

### 5. Wire up the email trigger
After the successful insert into `lls_kiosk_agreement_signatures` in `src/pages/LLSUsTerms.tsx`, invoke the `send-transactional-email` Edge Function with:
- Template: `kiosk-agreement-confirmation`
- Recipient: the signer's email (`contact_email`)
- Template data: `store_name`, `contact_name`, `city`, `signed_date`
- Idempotency key derived from the signature record

### 6. Deploy Edge Functions
Deploy all new and updated Edge Functions.

## Technical Details
- Email domain `notify.golokol.app` is already verified and active
- The project already uses branded auth emails with the same visual style
- The `sign-music-release` function uses MailerLite for its confirmation; this new flow will use the built-in Lovable email system instead
- No new database tables needed beyond what the email infrastructure tool creates
- No new secrets needed

