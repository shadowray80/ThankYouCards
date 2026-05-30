import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — thankyoucards.au',
  description: 'Terms of Service for thankyoucards.au',
};

const S = {
  page: { maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px', fontFamily: "'Nunito', sans-serif", color: '#2A2A2A' } as React.CSSProperties,
  logo: { fontWeight: 800, fontSize: '1.3rem', color: '#3A8FA0', textDecoration: 'none', display: 'inline-block', marginBottom: 32 } as React.CSSProperties,
  h1: { fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6, lineHeight: 1.2 } as React.CSSProperties,
  updated: { fontSize: '.82rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 40 } as React.CSSProperties,
  h2: { fontWeight: 800, fontSize: '1.05rem', color: '#2A2A2A', marginTop: 36, marginBottom: 8 } as React.CSSProperties,
  p: { fontSize: '.95rem', color: '#4A4A4A', lineHeight: 1.75, marginBottom: 14, fontWeight: 600 } as React.CSSProperties,
  ul: { paddingLeft: 20, marginBottom: 14 } as React.CSSProperties,
  li: { fontSize: '.95rem', color: '#4A4A4A', lineHeight: 1.75, fontWeight: 600, marginBottom: 6 } as React.CSSProperties,
  divider: { border: 'none', borderTop: '1px solid #E8E2F0', margin: '40px 0' } as React.CSSProperties,
  contact: { background: '#EAF4FB', borderRadius: 14, padding: '20px 22px', marginTop: 36 } as React.CSSProperties,
};

export default function TermsPage() {
  return (
    <div style={S.page}>
      <a href="/" style={S.logo}>
        thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '1rem' }}>.au</span>
      </a>

      <h1 style={S.h1}>Terms of Service</h1>
      <p style={S.updated}>Last updated: 30 May 2026</p>

      <p style={S.p}>
        These Terms of Service ("Terms") govern your use of thankyoucards.au ("we", "us", "our"), operated by Tim Atkinson, an Australian sole trader. By using our website or services, you agree to these Terms. If you do not agree, please do not use the service.
      </p>

      <h2 style={S.h2}>1. What We Provide</h2>
      <p style={S.p}>
        thankyoucards.au is a digital group greeting card service. It allows an organiser to create a digital card for a recipient, invite contributors to add messages and photos, and pay a one-time fee to send the completed card to the recipient.
      </p>
      <p style={S.p}>
        The service is provided "as is." We make no guarantees about uptime, availability, or suitability for any particular purpose beyond what is reasonably expected of the service as described.
      </p>

      <h2 style={S.h2}>2. Who Can Use the Service</h2>
      <p style={S.p}>You must be at least 13 years old to use this service. By using it, you confirm you meet this requirement. If you are under 18, you must have the consent of a parent or guardian.</p>

      <h2 style={S.h2}>3. Creating a Card</h2>
      <p style={S.p}>When you create a group card ("campaign"), you are the organiser. As organiser you:</p>
      <ul style={S.ul}>
        <li style={S.li}>Are responsible for the content, recipient, and purpose of the card</li>
        <li style={S.li}>Agree to keep your organiser link confidential — it provides full access to manage the card</li>
        <li style={S.li}>Are responsible for ensuring contributors have consented to their messages and photos being included</li>
        <li style={S.li}>Must not create cards intended to harass, defame, or harm the recipient</li>
      </ul>

      <h2 style={S.h2}>4. Contributing to a Card</h2>
      <p style={S.p}>Contributors add their own messages and optionally photos. By contributing, you:</p>
      <ul style={S.ul}>
        <li style={S.li}>Confirm the content you submit is your own or you have rights to use it</li>
        <li style={S.li}>Grant us a limited licence to store and display your contribution as part of the card</li>
        <li style={S.li}>Accept that your name, message, and photo (if uploaded) will be visible to the organiser and recipient</li>
        <li style={S.li}>Confirm your contribution does not infringe any third party's rights</li>
      </ul>

      <h2 style={S.h2}>5. Fees and Payment</h2>
      <p style={S.p}>
        Creating a card is free. To send the completed card to the recipient, the organiser pays a flat fee of AUD $15.00 (including GST). This fee covers the service and is processed securely through Stripe.
      </p>
      <p style={S.p}>
        By paying, you authorise us to charge the amount specified at checkout. All prices are in Australian dollars and include GST where applicable.
      </p>
      <p style={S.p}>
        Payment processing is handled by Stripe, Inc. We do not store your card details. Stripe's terms apply to the payment transaction: <a href="https://stripe.com/au/legal" style={{ color: '#3A8FA0' }}>stripe.com/au/legal</a>.
      </p>

      <h2 style={S.h2}>6. Refunds</h2>
      <p style={S.p}>
        Because the card is a digital product that is immediately delivered upon payment, we generally do not offer refunds once the send fee has been paid and the recipient link has been activated.
      </p>
      <p style={S.p}>
        However, nothing in these Terms limits your rights under the Australian Consumer Law. If the service fails to perform as described — for example, the card link is never activated despite payment — you are entitled to a remedy. Contact us at <a href="mailto:hello@thankyoucards.au" style={{ color: '#3A8FA0' }}>hello@thankyoucards.au</a> and we will resolve it promptly.
      </p>

      <h2 style={S.h2}>7. Prohibited Content</h2>
      <p style={S.p}>You must not submit content that:</p>
      <ul style={S.ul}>
        <li style={S.li}>Is defamatory, abusive, threatening, or harassing</li>
        <li style={S.li}>Contains nudity, sexual content, or graphic violence</li>
        <li style={S.li}>Infringes the intellectual property rights of any person</li>
        <li style={S.li}>Contains personal information about someone without their consent</li>
        <li style={S.li}>Is unlawful under Australian law or the laws of the recipient's jurisdiction</li>
        <li style={S.li}>Promotes discrimination on the basis of race, gender, religion, sexual orientation, disability, or any other protected characteristic</li>
      </ul>
      <p style={S.p}>We reserve the right to remove any content that violates these rules and to suspend or terminate access for users who breach them.</p>

      <h2 style={S.h2}>8. Intellectual Property</h2>
      <p style={S.p}>
        The thankyoucards.au platform, including its design, code, and branding, is owned by us. You may not copy, reproduce, or commercialise any part of it without written permission.
      </p>
      <p style={S.p}>
        You retain ownership of content you submit (messages, photos). By submitting, you grant us a non-exclusive, worldwide, royalty-free licence to store, display, and transmit that content solely for the purpose of operating the service. We will not use your content for any other purpose, including marketing, without your explicit consent.
      </p>

      <h2 style={S.h2}>9. Privacy</h2>
      <p style={S.p}>
        Your privacy matters to us. Please read our <a href="/privacy" style={{ color: '#3A8FA0' }}>Privacy Policy</a> to understand how we collect, use, and protect your personal information. Our Privacy Policy forms part of these Terms.
      </p>

      <h2 style={S.h2}>10. Data Retention and Deletion</h2>
      <p style={S.p}>
        Cards and their associated messages and photos are retained for a reasonable period to allow the recipient to access them. We may delete inactive cards (those that have not been accessed in 12 months) without notice. If you wish to have your data deleted sooner, contact us and we will action it within 30 days.
      </p>

      <h2 style={S.h2}>11. Limitation of Liability</h2>
      <p style={S.p}>
        To the maximum extent permitted by Australian law, our liability to you for any loss or damage arising from your use of the service is limited to the amount you paid us in the 12 months preceding the claim, or AUD $15.00, whichever is greater.
      </p>
      <p style={S.p}>
        We are not liable for: loss of data, indirect or consequential loss, loss of goodwill, or any loss arising from content submitted by other users. Nothing in this clause excludes any guarantee, right, or remedy you have under the Australian Consumer Law that cannot be lawfully excluded.
      </p>

      <h2 style={S.h2}>12. Third-Party Services</h2>
      <p style={S.p}>We use the following third-party services to operate the platform:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Stripe</strong> — payment processing</li>
        <li style={S.li}><strong>Supabase</strong> — database and file storage</li>
        <li style={S.li}><strong>Resend</strong> — transactional email</li>
        <li style={S.li}><strong>Vercel</strong> — hosting and delivery</li>
      </ul>
      <p style={S.p}>Each provider has their own terms and privacy policy. We choose reputable providers but are not responsible for their independent actions.</p>

      <h2 style={S.h2}>13. Changes to These Terms</h2>
      <p style={S.p}>
        We may update these Terms from time to time. We will post the updated version with a revised date. Continued use of the service after changes constitutes acceptance of the updated Terms. For material changes, we will endeavour to notify organisers by email.
      </p>

      <h2 style={S.h2}>14. Governing Law</h2>
      <p style={S.p}>
        These Terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of New South Wales, except where the Australian Consumer Law provides otherwise.
      </p>

      <h2 style={S.h2}>15. Australian Consumer Law</h2>
      <p style={S.p}>
        Our services come with guarantees under the Australian Consumer Law that cannot be excluded. You are entitled to a refund or resupply for major failures and compensation for any other reasonably foreseeable loss. These rights exist regardless of anything else in these Terms.
      </p>

      <hr style={S.divider} />

      <div style={S.contact}>
        <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#2A2A2A', marginBottom: 6 }}>Questions or concerns?</div>
        <p style={{ ...S.p, marginBottom: 0 }}>
          Contact us at <a href="mailto:hello@thankyoucards.au" style={{ color: '#3A8FA0' }}>hello@thankyoucards.au</a>. We aim to respond within 2 business days.
        </p>
      </div>
    </div>
  );
}
