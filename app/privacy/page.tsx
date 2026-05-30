import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — thankyoucards.au',
  description: 'Privacy Policy for thankyoucards.au',
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
  table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: 20, fontSize: '.9rem' },
  th: { background: '#EAF4FB', padding: '10px 12px', textAlign: 'left' as const, fontWeight: 800, color: '#2A2A2A', border: '1px solid #D4E8F0', fontSize: '.85rem' },
  td: { padding: '10px 12px', border: '1px solid #E8E2F0', color: '#4A4A4A', fontWeight: 600, verticalAlign: 'top' as const },
  divider: { border: 'none', borderTop: '1px solid #E8E2F0', margin: '40px 0' } as React.CSSProperties,
  contact: { background: '#EAF4FB', borderRadius: 14, padding: '20px 22px', marginTop: 36 } as React.CSSProperties,
  highlight: { background: '#F0ECFB', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: '.9rem', color: '#4A4A4A', fontWeight: 600, lineHeight: 1.7 } as React.CSSProperties,
};

export default function PrivacyPage() {
  return (
    <div style={S.page}>
      <a href="/" style={S.logo}>
        thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '1rem' }}>.au</span>
      </a>

      <h1 style={S.h1}>Privacy Policy</h1>
      <p style={S.updated}>Last updated: 30 May 2026</p>

      <div style={S.highlight}>
        <strong>Plain English summary:</strong> We collect the minimum information needed to run the service — your name, email, messages, and optional photos. We never sell your data. We use Stripe for payments (they handle your card details — we never see them). You can ask us to delete your data at any time.
      </div>

      <p style={S.p}>
        thankyoucards.au is operated by Tim Atkinson (ABN to be provided), an Australian sole trader ("we", "us", "our"). This Privacy Policy explains how we handle personal information collected through thankyoucards.au. We comply with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
      </p>

      <h2 style={S.h2}>1. What Information We Collect</h2>

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Information</th>
            <th style={S.th}>Who provides it</th>
            <th style={S.th}>Why we collect it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Name</td>
            <td style={S.td}>Organisers &amp; contributors</td>
            <td style={S.td}>To display on the card and in the organiser dashboard</td>
          </tr>
          <tr>
            <td style={S.td}>Email address</td>
            <td style={S.td}>Organisers (required); contributors (optional)</td>
            <td style={S.td}>To send the organiser their management link and card updates; contributors optionally receive the card link</td>
          </tr>
          <tr>
            <td style={S.td}>Card message</td>
            <td style={S.td}>Contributors</td>
            <td style={S.td}>To display on the group card sent to the recipient</td>
          </tr>
          <tr>
            <td style={S.td}>Photos</td>
            <td style={S.td}>Contributors (optional)</td>
            <td style={S.td}>To display as photo cards within the group card</td>
          </tr>
          <tr>
            <td style={S.td}>Payment information</td>
            <td style={S.td}>Organisers (via Stripe)</td>
            <td style={S.td}>To process the $15 send fee. We never see or store your card details — Stripe handles this entirely.</td>
          </tr>
          <tr>
            <td style={S.td}>IP address &amp; browser data</td>
            <td style={S.td}>All visitors</td>
            <td style={S.td}>Standard server logs used to detect abuse and maintain security. Not used for tracking or advertising.</td>
          </tr>
        </tbody>
      </table>

      <p style={S.p}>We do not collect data we don't need. We do not run advertising, sell data, or build profiles.</p>

      <h2 style={S.h2}>2. How We Use Your Information</h2>
      <ul style={S.ul}>
        <li style={S.li}>To create, display, and deliver digital group cards</li>
        <li style={S.li}>To send the organiser their management link by email</li>
        <li style={S.li}>To send transactional emails (e.g. payment confirmation, card sent notification)</li>
        <li style={S.li}>To process payments securely via Stripe</li>
        <li style={S.li}>To resolve disputes, investigate abuse, and comply with legal obligations</li>
        <li style={S.li}>To improve the service (using aggregated, anonymised data only)</li>
      </ul>
      <p style={S.p}>We will never use your personal information for direct marketing without your explicit consent, consistent with the Spam Act 2003 (Cth).</p>

      <h2 style={S.h2}>3. Who We Share Information With</h2>
      <p style={S.p}>We do not sell or rent personal information to third parties. We share data only with the following service providers, who are bound by their own privacy commitments:</p>

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Provider</th>
            <th style={S.th}>Purpose</th>
            <th style={S.th}>Data shared</th>
            <th style={S.th}>Privacy policy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Stripe</strong></td>
            <td style={S.td}>Payment processing</td>
            <td style={S.td}>Payment details, email (for receipts)</td>
            <td style={S.td}><a href="https://stripe.com/au/privacy" style={{ color: '#3A8FA0' }}>stripe.com/au/privacy</a></td>
          </tr>
          <tr>
            <td style={S.td}><strong>Supabase</strong></td>
            <td style={S.td}>Database &amp; file storage</td>
            <td style={S.td}>All card data, messages, photos</td>
            <td style={S.td}><a href="https://supabase.com/privacy" style={{ color: '#3A8FA0' }}>supabase.com/privacy</a></td>
          </tr>
          <tr>
            <td style={S.td}><strong>Resend</strong></td>
            <td style={S.td}>Transactional email</td>
            <td style={S.td}>Email address, card link</td>
            <td style={S.td}><a href="https://resend.com/privacy" style={{ color: '#3A8FA0' }}>resend.com/privacy</a></td>
          </tr>
          <tr>
            <td style={S.td}><strong>Vercel</strong></td>
            <td style={S.td}>Web hosting</td>
            <td style={S.td}>IP address, request logs</td>
            <td style={S.td}><a href="https://vercel.com/legal/privacy-policy" style={{ color: '#3A8FA0' }}>vercel.com/legal/privacy-policy</a></td>
          </tr>
        </tbody>
      </table>

      <p style={S.p}>Supabase and Vercel may store data in data centres outside Australia (including the United States). Where data is transferred overseas, we take reasonable steps to ensure it receives comparable protection to that required under the Australian Privacy Act.</p>

      <p style={S.p}>We may also disclose information where required by law, court order, or to protect the safety of any person.</p>

      <h2 style={S.h2}>4. Photos and User Content</h2>
      <p style={S.p}>
        Photos uploaded by contributors are stored in Supabase Storage and are accessible via a public URL embedded in the card. Anyone with the card link can view these photos. Please only upload photos of people who have consented to appearing on the card.
      </p>
      <p style={S.p}>
        We do not use contributor photos for any purpose other than displaying them on the card. We do not apply facial recognition or any form of AI analysis to uploaded images.
      </p>

      <h2 style={S.h2}>5. Cookies and Tracking</h2>
      <p style={S.p}>
        We use browser localStorage (not cookies) to remember your organiser token and contributor status on a given card. This data stays on your device and is not transmitted to us or any third party. We do not use tracking cookies, advertising pixels, or analytics services that identify individual users.
      </p>
      <p style={S.p}>
        Stripe may set cookies during the payment process in accordance with their own policy.
      </p>

      <h2 style={S.h2}>6. Data Security</h2>
      <p style={S.p}>
        We take reasonable steps to protect personal information from misuse, loss, and unauthorised access. These include:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>HTTPS encryption for all data in transit</li>
        <li style={S.li}>Access controls on the database (Supabase row-level security)</li>
        <li style={S.li}>Organiser dashboards protected by unique, unguessable tokens</li>
        <li style={S.li}>Payment data handled entirely by Stripe (PCI DSS compliant) — we never touch card details</li>
      </ul>
      <p style={S.p}>No system is perfectly secure. If you believe there has been a breach affecting your data, please contact us immediately.</p>

      <h2 style={S.h2}>7. Data Retention</h2>
      <p style={S.p}>
        Cards and their associated data (messages, photos, contributor names) are retained for as long as the card is reasonably expected to be in use. We may delete cards that have not been accessed in 12 months. If you ask us to delete your data, we will do so within 30 days, except where we are required to retain it by law (e.g. tax records for payment transactions, which are kept for 7 years as required by Australian taxation law).
      </p>

      <h2 style={S.h2}>8. Your Rights</h2>
      <p style={S.p}>Under the Australian Privacy Principles, you have the right to:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Access</strong> the personal information we hold about you</li>
        <li style={S.li}><strong>Correct</strong> information that is inaccurate, out of date, or incomplete</li>
        <li style={S.li}><strong>Request deletion</strong> of your personal information (subject to legal retention requirements)</li>
        <li style={S.li}><strong>Complain</strong> about how we have handled your personal information</li>
      </ul>
      <p style={S.p}>To exercise any of these rights, contact us at <a href="mailto:hello@thankyoucards.au" style={{ color: '#3A8FA0' }}>hello@thankyoucards.au</a>. We will respond within 30 days. We may need to verify your identity before actioning a request.</p>

      <h2 style={S.h2}>9. Complaints</h2>
      <p style={S.p}>
        If you have a complaint about how we have handled your personal information and are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC):
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Website: <a href="https://www.oaic.gov.au" style={{ color: '#3A8FA0' }}>oaic.gov.au</a></li>
        <li style={S.li}>Phone: 1300 363 992</li>
      </ul>

      <h2 style={S.h2}>10. Children's Privacy</h2>
      <p style={S.p}>
        Our service is not directed at children under 13. We do not knowingly collect personal information from children under 13 without parental consent. If you believe a child has provided us with personal information without appropriate consent, please contact us and we will delete it promptly.
      </p>

      <h2 style={S.h2}>11. Changes to This Policy</h2>
      <p style={S.p}>
        We may update this Privacy Policy from time to time. We will post the updated version on this page with a revised date. For significant changes, we will notify organisers by email where we have their address on file.
      </p>

      <hr style={S.divider} />

      <div style={S.contact}>
        <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#2A2A2A', marginBottom: 6 }}>Privacy enquiries</div>
        <p style={{ ...S.p, marginBottom: 4 }}>
          Contact: <a href="mailto:hello@thankyoucards.au" style={{ color: '#3A8FA0' }}>hello@thankyoucards.au</a>
        </p>
        <p style={{ ...S.p, marginBottom: 0, fontSize: '.85rem', color: '#7A7585' }}>
          We aim to respond to all privacy enquiries within 30 days as required by the Australian Privacy Act.
        </p>
      </div>
    </div>
  );
}
