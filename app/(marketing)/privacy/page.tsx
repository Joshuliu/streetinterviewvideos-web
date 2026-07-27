import type { Metadata } from 'next';
import { Section, Eyebrow, Lead, Breadcrumb } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | StreetInterviewVideos.com',
  description:
    'How StreetInterviewVideos.com collects, uses, and shares information, including the Meta Pixel, Calendly bookings, cookies, and your privacy rights under CCPA/CPRA and GDPR.',
  alternates: { canonical: '/privacy/' },
};

const EFFECTIVE_DATE = 'June 10, 2026';
const PRIVACY_EMAIL = 'brandlaunchmediaagency@gmail.com';

// Section heading used throughout the policy. id powers the in-page table of
// contents links.
function PolicyH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl lg:text-2xl font-extrabold tracking-tight text-ink-900 mt-12 mb-4 scroll-mt-28">
      {children}
    </h2>
  );
}

function PolicyH3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base lg:text-lg font-bold text-ink-900 mt-7 mb-2">{children}</h3>;
}

const TOC: { id: string; label: string }[] = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'information-we-collect', label: 'Information we collect' },
  { id: 'cookies', label: 'Cookies and tracking technologies' },
  { id: 'how-we-use', label: 'How we use information' },
  { id: 'how-we-share', label: 'How we share information' },
  { id: 'retention', label: 'How long we keep information' },
  { id: 'security', label: 'How we protect information' },
  { id: 'your-rights', label: 'Your privacy rights' },
  { id: 'california', label: 'California privacy rights (CCPA/CPRA)' },
  { id: 'eu-uk', label: 'EU and UK privacy rights (GDPR)' },
  { id: 'children', label: "Children's privacy" },
  { id: 'transfers', label: 'International data transfers' },
  { id: 'changes', label: 'Changes to this policy' },
  { id: 'contact', label: 'Contact us' },
];

export default function PrivacyPage() {
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
        <Eyebrow>Legal</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Privacy Policy</h1>
        <Lead className="max-w-3xl mb-2">
          This policy explains what information {SITE.name} collects when you visit our site or book a call, how we use
          it, who we share it with, and the rights you have over it.
        </Lead>
        <p className="text-text-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
      </Section>

      <Section className="bg-paper-soft">
        <div className="max-w-3xl">
          {/* Table of contents */}
          <nav aria-label="On this page" className="rounded-3xl bg-white border border-border p-6 lg:p-8 mb-4">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-text-400 mb-4">On this page</div>
            <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-text-700 hover:text-accent transition-colors">
                    {i + 1}. {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="text-[15px] leading-relaxed text-text-700 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:decoration-text-400 hover:[&_a]:text-accent [&_strong]:text-ink-900">
            <PolicyH2 id="who-we-are">1. Who we are</PolicyH2>
            <p>
              {SITE.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) produces street interview videos
              that work as UGC-style ads in an authentic short-form content format for brands. This policy applies to {SITE.domain} and the
              booking and contact options we offer through it. We are the party responsible for the personal information
              described here.
            </p>
            <p>
              If you have questions about this policy or how we handle your information, contact us at{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            </p>

            <PolicyH2 id="information-we-collect">2. Information we collect</PolicyH2>
            <PolicyH3>Information you give us</PolicyH3>
            <p>
              When you complete our qualification form, book a call through our scheduling tool (Calendly), or email us,
              we collect what you choose to share. That typically includes your name, work email address, optional phone
              number, company and website, your monthly ad spend, and any details you put in your message or brief. If you
              give us a phone number, you agree we may contact you about your inquiry by phone or text message; message and
              data rates may apply, and you can opt out at any time.
            </p>
            <PolicyH3>Information we collect automatically</PolicyH3>
            <p>
              When you visit the site, we and our providers collect limited technical information automatically through
              cookies and similar technologies. This can include your IP address, device and browser type, the pages you
              view, the links you click, the page that referred you, and general location inferred from your IP. We use
              this to understand site traffic and to measure and improve our advertising.
            </p>
            <p>
              We do not collect payment information on this website.
            </p>

            <PolicyH2 id="cookies">3. Cookies and tracking technologies</PolicyH2>
            <p>
              Cookies are small files stored on your device. We use them, together with similar technologies such as
              pixels, for two purposes: to keep the site working and to measure and optimize our advertising.
            </p>
            <p>
              <strong>Meta Pixel.</strong> We use the Meta (Facebook) Pixel to understand how visitors arrive from our
              ads and to measure conversions, such as when someone books a call. The pixel sets cookies and sends Meta
              information about your visit, including your IP address, the pages you view, and certain actions you take.
              Meta may combine this with information it already holds about you and use it to deliver and measure ads.
              Meta&rsquo;s handling of that information is governed by its own privacy policy.
            </p>
            <p>You can limit or opt out of this kind of tracking in several ways:</p>
            <ul>
              <li>Adjust your cookie and tracking settings in your browser, or use private/incognito browsing.</li>
              <li>
                Manage ad personalization in your{' '}
                <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer">
                  Meta ad preferences
                </a>
                .
              </li>
              <li>
                Use an industry opt-out tool such as the{' '}
                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">
                  Digital Advertising Alliance
                </a>{' '}
                or{' '}
                <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">
                  Your Online Choices (EU)
                </a>
                .
              </li>
            </ul>
            <p>
              We do not currently use a cookie consent banner, so the Meta Pixel may load when you arrive on the site. If
              you are in a region that requires prior consent, please use the browser and opt-out controls above to
              prevent tracking.
            </p>

            <PolicyH2 id="how-we-use">4. How we use information</PolicyH2>
            <ul>
              <li>Respond to your inquiries and schedule and conduct discovery calls.</li>
              <li>Provide, scope, and deliver our video production services.</li>
              <li>Measure, optimize, and report on our advertising, including conversions from Meta ads.</li>
              <li>Understand how the site is used and improve its content and performance.</li>
              <li>Keep the site secure and prevent fraud or abuse.</li>
              <li>Comply with our legal obligations and enforce our agreements.</li>
            </ul>

            <PolicyH2 id="how-we-share">5. How we share information</PolicyH2>
            <p>We do not sell your personal information for money. We share information only as described below:</p>
            <ul>
              <li>
                <strong>Service providers.</strong> Companies that run parts of our operation on our behalf, including{' '}
                <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">
                  Calendly
                </a>{' '}
                (scheduling) and{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Vercel
                </a>{' '}
                (website hosting).
              </li>
              <li>
                <strong>Advertising and analytics partners.</strong> We share online activity with{' '}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
                  Meta
                </a>{' '}
                through the Meta Pixel to measure and optimize our ads. Under some laws this counts as
                &ldquo;sharing&rdquo; for cross-context behavioral advertising. See the California section below for your
                opt-out rights.
              </li>
              <li>
                <strong>Legal and safety.</strong> When we believe disclosure is needed to comply with the law, enforce
                our terms, or protect the rights, safety, and property of anyone.
              </li>
              <li>
                <strong>Business transfers.</strong> In connection with a merger, acquisition, financing, or sale of
                assets, information may be transferred as part of that transaction.
              </li>
            </ul>

            <PolicyH2 id="retention">6. How long we keep information</PolicyH2>
            <p>
              We keep personal information only as long as we need it for the purposes described here: to respond to you,
              deliver and support our services, meet legal and accounting obligations, and resolve disputes. When we no
              longer need it, we delete it or remove what identifies you. Information held by our providers, such as
              Calendly booking records, is retained under their own policies.
            </p>

            <PolicyH2 id="security">7. How we protect information</PolicyH2>
            <p>
              We use reasonable technical and organizational measures to protect personal information against loss,
              misuse, and unauthorized access. The site is served over HTTPS. No method of transmission or storage is
              completely secure, so we cannot guarantee absolute security.
            </p>

            <PolicyH2 id="your-rights">8. Your privacy rights</PolicyH2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, or receive a copy of your
              personal information, and to opt out of certain uses. You can exercise any of these by emailing us at{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We will respond as required by applicable law and
              will not discriminate against you for exercising your rights.
            </p>

            <PolicyH2 id="california">9. California privacy rights (CCPA/CPRA)</PolicyH2>
            <p>
              If you are a California resident, you have the right to know what personal information we collect, to
              request access to or deletion of it, to correct it, and to opt out of its &ldquo;sale&rdquo; or
              &ldquo;sharing.&rdquo;
            </p>
            <p>
              In the past 12 months we have collected identifiers (such as name, email, and IP address), internet and
              network activity (such as pages viewed and ad interactions), and inferences drawn from that activity. We
              collect it from you directly and automatically through cookies and pixels, as described above.
            </p>
            <p>
              <strong>Sale or sharing.</strong> We do not sell personal information for money. However, our use of the
              Meta Pixel for advertising may be considered &ldquo;sharing&rdquo; for cross-context behavioral
              advertising, and in some cases a &ldquo;sale,&rdquo; under California law. To opt out, use the browser
              controls and Meta ad settings listed in the cookies section, or email us at{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> with the subject &ldquo;Do Not Sell or Share My
              Personal Information.&rdquo; We honor Global Privacy Control (GPC) browser signals where required.
            </p>
            <p>
              You may make an authorized agent request, and we will not discriminate against you for exercising any of
              these rights.
            </p>

            <PolicyH2 id="eu-uk">10. EU and UK privacy rights (GDPR)</PolicyH2>
            <p>
              If you are in the European Economic Area or the United Kingdom, you have rights to access, correct, delete,
              restrict, and port your personal data, to object to certain processing, and to withdraw consent at any
              time. You may also lodge a complaint with your local supervisory authority.
            </p>
            <p>
              <strong>Legal bases.</strong> We process your data based on: your consent (for advertising cookies and the
              Meta Pixel); our legitimate interests (to operate, secure, and improve the site and measure our marketing);
              and the performance of a contract or steps taken at your request (to respond to and schedule calls with
              you).
            </p>
            <p>
              To exercise these rights, email us at <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. Because we
              are based in the United States, your data may be processed there, as described under International data
              transfers below.
            </p>

            <PolicyH2 id="children">11. Children&rsquo;s privacy</PolicyH2>
            <p>
              Our site and services are intended for businesses and adults. We do not knowingly collect personal
              information from children under 16. If you believe a child has provided us information, contact us and we
              will delete it.
            </p>

            <PolicyH2 id="transfers">12. International data transfers</PolicyH2>
            <p>
              We operate from the United States, and our providers may process information in the United States and other
              countries. These countries may have different data protection laws than your own. Where required, we rely
              on appropriate safeguards, such as standard contractual clauses, for transfers of personal data out of the
              EEA or the UK.
            </p>

            <PolicyH2 id="changes">13. Changes to this policy</PolicyH2>
            <p>
              We may update this policy from time to time. When we do, we will revise the effective date at the top of
              the page. Material changes will be reflected here, so please check back periodically.
            </p>

            <PolicyH2 id="contact">14. Contact us</PolicyH2>
            <p>
              For any privacy question or request, email us at{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We respond within one business day.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
