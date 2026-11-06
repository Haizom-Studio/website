import React from "react";
import HeroSub from "@/components/SharedComponent/HeroSub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Haizom Studio",
  description:
    "Terms and conditions governing use of the Haizom Studio website and our professional engineering, design, and software services.",
};

export default function TermsAndConditionsPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/terms-and-conditions", text: "Terms & Conditions" },
  ];

  return (
    <>
      <HeroSub
        title="Terms & Conditions"
        description="Please read these terms carefully. They govern your use of this website and set out the legal framework for our professional services."
        breadcrumbLinks={breadcrumbLinks}
      />
      <section className="md:pb-24 pb-16 dark:bg-darkmode bg-section">
        <div className="container mx-auto max-w-6xl px-4">
          <article className="mx-auto max-w-3xl text-midnight_text dark:text-white/90">
            <p className="text-sm text-grey dark:text-white/50 pb-8 border-b border-dark_border/30">
              <strong className="text-midnight_text dark:text-white">
                Effective date:
              </strong>{" "}
              1 April 2026. We may update these terms from time to time; the
              version posted on this page is the one that applies.
            </p>

            <div className="pt-10 space-y-10 text-base leading-relaxed text-grey dark:text-white/70">
              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  1. Who we are
                </h2>
                <p>
                  This website is operated by{" "}
                  <strong className="text-midnight_text dark:text-white">
                    Haizom Studios (SMC-Private) Limited
                  </strong>
                  , a single member company incorporated in Pakistan and{" "}
                  <strong className="text-midnight_text dark:text-white">
                    registered with the Securities and Exchange Commission of
                    Pakistan (SECP)
                  </strong>
                  . In these terms, &quot;Haizom&quot;, &quot;we&quot;,
                  &quot;us&quot;, or &quot;our&quot; refers to Haizom Studios
                  (SMC-Private) Limited. &quot;You&quot; means the person or
                  entity accessing the site or engaging our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  2. Agreement to these terms
                </h2>
                <p>
                  By browsing or using this website, submitting an enquiry, or
                  entering into a commercial relationship with us, you agree to
                  these Terms &amp; Conditions. If you do not agree, you must not
                  use the site or our services. Specific projects may also be
                  governed by separate written agreements (for example
                  statements of work, master services agreements, or purchase
                  orders). If there is a conflict between those documents and
                  these terms, the written agreement for that engagement will
                  prevail for that engagement, unless it expressly states
                  otherwise.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  3. Our services (summary)
                </h2>
                <p className="mb-3">
                  Haizom provides professional technology and engineering
                  services, which may include, without limitation:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Hardware electronics: schematic capture, PCB design,
                    prototyping, bench bring-up, testing support, and related
                    documentation;
                  </li>
                  <li>
                    Embedded software: firmware development, sensor integration,
                    connectivity, and related embedded work;
                  </li>
                  <li>
                    Software: web development, mobile application development,
                    integrations, deployment support, and technical
                    handover;
                  </li>
                  <li>
                    Product design: UI/UX, dashboards, and design deliverables
                    intended for implementation by you or your developers;
                  </li>
                  <li>
                    Consulting, reviews, and advisory work related to the
                    above.
                  </li>
                </ul>
                <p className="mt-3">
                  The exact scope, milestones, deliverables, fees, and acceptance
                  criteria for any paid engagement are defined in the applicable
                  proposal, statement of work, or contract—not solely by
                  marketing descriptions on this website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  4. Website use licence
                </h2>
                <p>
                  We grant you a limited, non-exclusive, non-transferable right
                  to access and use this website for lawful purposes. You must
                  not: misuse the site; attempt to gain unauthorised access to
                  our systems or data; interfere with security; use automated
                  means to scrape or harvest content at a scale that impairs the
                  site; or use the site in any way that violates applicable law.
                  We may suspend or restrict access where reasonably necessary to
                  protect the site or our users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  5. Information on this website
                </h2>
                <p>
                  Content on this site (including case studies, portfolio
                  items, and descriptions) is provided for general information.
                  We aim to keep it accurate and up to date, but we do not
                  warrant that all information is complete, current, or free from
                  error. Nothing on the site constitutes engineering, legal,
                  financial, or regulatory advice for your specific situation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  6. Client responsibilities
                </h2>
                <p className="mb-3">
                  Where you engage us for professional services, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Provide complete, accurate requirements, constraints, and
                    safety or compliance context relevant to the work;
                  </li>
                  <li>
                    Supply timely feedback, approvals, credentials, test
                    hardware, and access reasonably needed to perform the work;
                  </li>
                  <li>
                    Ensure you have the rights and licences for any materials,
                    data, trademarks, or third-party components you ask us to
                    use or integrate;
                  </li>
                  <li>
                    Comply with applicable laws, including export, import,
                    sanctions, telecommunications, privacy, and sector-specific
                    regulations relating to your product or data;
                  </li>
                  <li>
                    Use deliverables responsibly and verify fitness for your
                    intended environment (including production, safety, and
                    certification) unless we have expressly agreed in writing to
                    assume specific certification or compliance obligations.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  7. Third parties (fabs, stores, hosting, APIs)
                </h2>
                <p>
                  Many projects rely on third parties (for example PCB
                  fabricators, component vendors, cloud or hosting providers,
                  Apple App Store, Google Play, payment processors, analytics, or
                  APIs). Their terms, fees, approval processes, and availability
                  are outside our control. You are responsible for your accounts,
                  fees, and compliance with those third-party terms unless we
                  have explicitly agreed in writing to manage a specific
                  relationship on your behalf.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  8. Intellectual property
                </h2>
                <p>
                  Unless otherwise agreed in writing, ownership and licensing of
                  deliverables, background IP, and client-supplied materials will
                  be governed by your project contract. Generally: (a) we retain
                  our pre-existing tools, methods, and know-how; (b) you retain
                  your pre-existing IP; and (c) assignment or licence of project
                  deliverables is as stated in the applicable agreement, often
                  upon full payment unless another arrangement is documented.
                  You must not remove proprietary notices where required.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  9. Confidentiality
                </h2>
                <p>
                  Each party may receive confidential information from the other
                  in the course of a project. Both parties agree to use such
                  information only for the purpose of the engagement and to
                  protect it using reasonable care. Specific confidentiality
                  obligations may be expanded in a separate non-disclosure or
                  services agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  10. Fees and payment
                </h2>
                <p>
                  Fees, taxes, invoicing schedules, expenses, and late-payment
                  consequences (if any) are set out in your quotation or
                  contract. Unless stated otherwise, amounts are exclusive of
                  applicable taxes. Failure to pay may result in suspension of
                  work or withholding of deliverables as permitted by law and
                  the governing agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  11. Warranties and disclaimers
                </h2>
                <p className="mb-3">
                  To the maximum extent permitted by applicable law:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    The website and its content are provided on an &quot;as
                    is&quot; and &quot;as available&quot; basis without
                    warranties of any kind, whether express or implied;
                  </li>
                  <li>
                    We disclaim implied warranties such as merchantability,
                    fitness for a particular purpose, and non-infringement,
                    except where such disclaimers are not legally permitted;
                  </li>
                  <li>
                    Engineering, software, and design work involves judgement
                    and trade-offs. We do not guarantee uninterrupted or
                    error-free operation of deliverables in every environment,
                    or that deliverables will meet every future platform rule or
                    third-party requirement unless expressly warranted in
                    writing;
                  </li>
                  <li>
                    Hardware and embedded systems may carry inherent risks if
                    misapplied. You are responsible for validation, testing,
                    certification, and safe use in your application—including
                    life-safety, medical, automotive, industrial, or regulated
                    uses—unless we have entered into a written agreement that
                    clearly defines those obligations and limits.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  12. Limitation of liability
                </h2>
                <p>
                  To the fullest extent permitted by applicable law, neither
                  Haizom Studios (SMC-Private) Limited nor its directors,
                  employees, or contractors shall be liable for any indirect,
                  incidental, special, consequential, exemplary, or punitive
                  damages, or for loss of profits, revenue, goodwill, data, or
                  business opportunities, arising out of or related to these
                  terms, the website, or our services.
                </p>
                <p className="mt-3">
                  Where liability cannot be excluded, our total aggregate
                  liability arising out of or relating to any engagement or these
                  terms (whether in contract, tort, or otherwise) shall not
                  exceed the total fees actually paid by you to us for that
                  specific engagement in the twelve (12) months preceding the
                  claim (or, for website-only use with no paid engagement, one
                  hundred US dollars (USD 100) or the equivalent in Pakistani
                  Rupees at the time of the claim, whichever is greater).
                </p>
                <p className="mt-3">
                  Some jurisdictions do not allow certain limitations; in those
                  cases, our liability is limited to the maximum extent permitted
                  by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  13. Indemnity
                </h2>
                <p>
                  You agree to indemnify and hold harmless Haizom Studios
                  (SMC-Private) Limited and its personnel from claims, damages,
                  losses, and expenses (including reasonable legal fees) arising
                  from your use of deliverables in breach of these terms, your
                  materials or instructions, your violation of law or third-party
                  rights, or your misuse of the website—except to the extent
                  finally judicially determined to have been caused by our wilful
                  misconduct or gross negligence where such exclusion is
                  permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  14. Force majeure
                </h2>
                <p>
                  We are not liable for delay or failure to perform caused by
                  events beyond our reasonable control, including natural
                  disasters, war, terrorism, riots, fire, epidemic or pandemic,
                  government actions, labour disputes, failures of utilities or
                  telecommunications, or supply-chain disruptions affecting
                  components or third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  15. Termination and suspension
                </h2>
                <p>
                  We may terminate or suspend access to the website or an
                  engagement where required by law or for material breach after
                  reasonable notice where practicable. Provisions that by their
                  nature should survive (including intellectual property,
                  confidentiality, limitation of liability, indemnity, and
                  governing law) will survive termination.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  16. Governing law and disputes
                </h2>
                <p>
                  These terms are governed by the laws of the Islamic Republic
                  of Pakistan, without regard to conflict-of-law principles that
                  would require application of another jurisdiction&apos;s laws.
                  Subject to any mandatory rights you may have under applicable
                  consumer or other laws, you agree that the courts of Pakistan
                  shall have exclusive jurisdiction over disputes arising out of
                  or relating to these terms or our services, unless we agree in
                  writing to a different mechanism for a particular contract.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  17. Privacy
                </h2>
                <p>
                  Personal data you submit through contact forms or otherwise may
                  be processed to respond to enquiries and provide services. Use
                  of such information will be handled in line with applicable law
                  and any privacy notice we publish on this site or provide to
                  you separately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  18. General
                </h2>
                <p className="mb-3">
                  If any provision of these terms is held invalid or
                  unenforceable, the remaining provisions remain in effect.
                  Failure to enforce a provision is not a waiver. You may not
                  assign these terms without our consent; we may assign them in
                  connection with a merger, acquisition, or sale of assets.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4">
                  19. Contact
                </h2>
                <p>
                  For questions about these Terms &amp; Conditions, please send
                  us a message on{" "}
                  <a
                    href="https://www.upwork.com/freelancers/bilaldawar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Upwork
                  </a>
                  .
                  {/* contact us at{" "}
                  <a
                    href="mailto:contact@haizomstudios.com"
                    className="text-primary hover:underline font-medium"
                  >
                    contact@haizomstudios.com
                  </a>
                  . */}
                </p>
              </section>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
