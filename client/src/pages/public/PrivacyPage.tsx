import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16 md:py-20">
      <article className="mx-auto max-w-3xl px-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: April 2025
          </p>
        </header>

        <div className="mt-10 space-y-10 text-slate-700 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-relaxed">
          {/* Introduction */}
          <section>
            <p className="text-base leading-relaxed">
              ChamaConnect (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
              is committed to protecting the privacy of our users. This Privacy
              Policy explains how we collect, use, store, and protect your
              personal information when you use the ChamaConnect platform.
            </p>
            <p>
              By using ChamaConnect, you agree to the collection and use of
              information as described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2>Information We Collect</h2>
            <p>
              We collect information that you provide directly when you create an
              account and use our services:
            </p>
            <ul>
              <li>
                <strong>Account information:</strong> Your name and email
                address, provided during registration.
              </li>
              <li>
                <strong>Chama data:</strong> Group names, member lists, and
                contribution plan configurations that you create within the
                platform.
              </li>
              <li>
                <strong>Contribution records:</strong> Payment amounts, dates,
                and associated metadata recorded by group administrators and
                treasurers.
              </li>
              <li>
                <strong>Usage data:</strong> Basic information about how you
                interact with the platform, including login times and pages
                visited, collected automatically to improve service quality.
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve the ChamaConnect platform.</li>
              <li>
                Authenticate your identity and manage access to your account.
              </li>
              <li>
                Display contribution records, statements, and group data to
                authorized members of your chama.
              </li>
              <li>
                Send transactional communications such as one-time login codes
                and account notifications.
              </li>
              <li>
                Respond to support requests and inquiries submitted through our
                contact form.
              </li>
              <li>
                Detect and prevent fraud, abuse, and security incidents.
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2>Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              information, including encryption of data in transit using TLS,
              secure storage of authentication tokens, and role-based access
              controls within the application.
            </p>
            <p>
              While we take reasonable precautions to safeguard your data, no
              method of electronic transmission or storage is completely secure.
              We cannot guarantee absolute security of your information.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2>Data Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information to third
              parties. We may share data only in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Within your chama:</strong> Contribution records and
                member information are visible to authorized members of your
                group based on their assigned roles.
              </li>
              <li>
                <strong>Payment processing:</strong> When you make a payment
                through the platform, transaction details are shared with
                Paystack, our payment processing partner, solely to complete the
                transaction.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information
                if required by law, regulation, or valid legal process.
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2>Cookies</h2>
            <p>
              ChamaConnect uses essential cookies and local storage to maintain
              your authentication session. We do not use third-party advertising
              or tracking cookies. The only cookies stored are those strictly
              necessary for the platform to function.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2>Your Rights</h2>
            <p>
              You have the following rights regarding your personal information:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> You can request a copy of the personal
                data we hold about you.
              </li>
              <li>
                <strong>Correction:</strong> You can update or correct your
                account information at any time through the platform settings.
              </li>
              <li>
                <strong>Deletion:</strong> You can request deletion of your
                account and associated personal data by contacting us. Note that
                some records may be retained where required for legal compliance
                or audit purposes.
              </li>
              <li>
                <strong>Data portability:</strong> You can request your data in a
                structured, machine-readable format.
              </li>
            </ul>
          </section>

          {/* Contact for Privacy Concerns */}
          <section>
            <h2>Contact for Privacy Concerns</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or how
              your data is handled, please contact us:
            </p>
            <p>
              Email:{' '}
              <a
                href="mailto:privacy@chamaconnect.co.ke"
                className="text-brand-700 hover:underline"
              >
                privacy@chamaconnect.co.ke
              </a>
            </p>
            <p>
              You can also reach us through our{' '}
              <Link to="/contact" className="text-brand-700 hover:underline">
                contact form
              </Link>
              .
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or applicable laws. When we make material
              changes, we will update the &quot;Last updated&quot; date at the
              top of this page. We encourage you to review this policy
              periodically.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
