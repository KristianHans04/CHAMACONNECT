import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="bg-white py-16 md:py-20">
      <article className="mx-auto max-w-3xl px-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Last updated: April 2025
          </p>
        </header>

        <div className="mt-10 space-y-10 text-slate-700 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-relaxed">
          {/* Acceptance of Terms */}
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ChamaConnect platform
              (&quot;Service&quot;), you agree to be bound by these Terms of
              Service (&quot;Terms&quot;). If you do not agree to these Terms, do
              not use the Service. These Terms constitute a legally binding
              agreement between you and ChamaConnect.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2>2. Description of Service</h2>
            <p>
              ChamaConnect is a web-based platform that enables chama groups
              (informal savings and investment groups) to track member
              contributions, manage group finances, and maintain transparent
              financial records. The Service provides tools for contribution
              recording, member management, statement generation, and payment
              processing integration.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2>3. User Accounts and Responsibilities</h2>
            <p>
              To use ChamaConnect, you must create an account using a valid email
              address. You are responsible for:
            </p>
            <ul>
              <li>
                Providing accurate and current information during registration.
              </li>
              <li>
                Maintaining the security of your account credentials, including
                one-time login codes sent to your email.
              </li>
              <li>
                All activity that occurs under your account, whether authorized
                by you or not.
              </li>
              <li>
                Notifying us immediately if you suspect unauthorized access to
                your account.
              </li>
            </ul>
            <p>
              You must be at least 18 years old to create an account and use the
              Service.
            </p>
          </section>

          {/* Chama Management */}
          <section>
            <h2>4. Chama Management</h2>
            <p>
              Users who create a chama group on the platform are designated as
              group administrators. Administrators are responsible for:
            </p>
            <ul>
              <li>
                Managing group membership, including inviting and removing
                members.
              </li>
              <li>
                Assigning appropriate roles (admin, treasurer, member) to group
                participants.
              </li>
              <li>
                Ensuring that group records accurately reflect actual
                contributions and transactions.
              </li>
              <li>
                Complying with any applicable laws governing informal savings
                groups in their jurisdiction.
              </li>
            </ul>
            <p>
              ChamaConnect is a tool for record-keeping and does not participate
              in the governance or decision-making of any chama group.
            </p>
          </section>

          {/* Contribution Tracking */}
          <section>
            <h2>5. Contribution Tracking</h2>
            <p>
              ChamaConnect provides tools to record and track member
              contributions. It is important to understand the following:
            </p>
            <ul>
              <li>
                ChamaConnect is a record-keeping and tracking tool. It does not
                provide financial advice, investment recommendations, or
                fiduciary services.
              </li>
              <li>
                The accuracy of contribution records depends on the data entered
                by authorized group members. ChamaConnect does not independently
                verify the accuracy of manually entered records.
              </li>
              <li>
                Users should not rely solely on ChamaConnect records for
                financial, tax, or legal purposes without independent
                verification.
              </li>
            </ul>
          </section>

          {/* Payment Processing */}
          <section>
            <h2>6. Payment Processing</h2>
            <p>
              ChamaConnect integrates with Paystack to facilitate online
              contributions. By using the payment features, you acknowledge that:
            </p>
            <ul>
              <li>
                Payment processing is handled by Paystack, a third-party payment
                service provider. Paystack&apos;s terms of service and privacy
                policy apply to all transactions processed through their
                platform.
              </li>
              <li>
                ChamaConnect does not store credit card numbers, bank account
                details, or other sensitive payment credentials.
              </li>
              <li>
                Transaction fees may apply as determined by Paystack. These fees
                are separate from ChamaConnect&apos;s services.
              </li>
              <li>
                ChamaConnect is not responsible for payment failures, delays, or
                errors caused by Paystack or your financial institution.
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2>7. Intellectual Property</h2>
            <p>
              The ChamaConnect platform, including its design, code, and
              content, is the intellectual property of ChamaConnect. You may not
              copy, modify, distribute, or create derivative works of any part of
              the Service without prior written consent.
            </p>
            <p>
              You retain ownership of any data you enter into the platform,
              including chama records and contribution data. By using the
              Service, you grant ChamaConnect a limited license to store,
              process, and display your data as necessary to provide the Service.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, ChamaConnect and its
              operators shall not be liable for:
            </p>
            <ul>
              <li>
                Any indirect, incidental, special, consequential, or punitive
                damages arising from your use of the Service.
              </li>
              <li>
                Loss of data, profits, or goodwill resulting from service
                interruptions, errors, or unauthorized access.
              </li>
              <li>
                Financial losses arising from decisions made based on records
                maintained in ChamaConnect.
              </li>
              <li>
                Actions or omissions of chama group members, administrators, or
                treasurers using the platform.
              </li>
            </ul>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, whether express or
              implied.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2>9. Termination</h2>
            <p>
              You may terminate your account at any time by contacting us. We
              reserve the right to suspend or terminate accounts that violate
              these Terms or engage in fraudulent, abusive, or harmful activity.
            </p>
            <p>
              Upon termination, your access to the Service will cease. Data
              associated with your account may be retained for a reasonable
              period to comply with legal obligations or resolve disputes.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. When we make material
              changes, we will update the &quot;Last updated&quot; date at the
              top of this page and may notify you through the platform. Your
              continued use of the Service after changes are posted constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2>11. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the Republic of Kenya. Any disputes arising from these
              Terms or your use of the Service shall be subject to the exclusive
              jurisdiction of the courts of Kenya.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2>12. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <p>
              Email:{' '}
              <a
                href="mailto:legal@chamaconnect.co.ke"
                className="text-brand-700 hover:underline"
              >
                legal@chamaconnect.co.ke
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
        </div>
      </article>
    </div>
  );
}
