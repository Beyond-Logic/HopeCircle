/* eslint-disable react/no-unescaped-entities */

export default function TermsPage() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using HopeCircle, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Community Guidelines
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Respectful Communication
                </h3>
                <p className="text-muted-foreground">
                  All interactions must be respectful, supportive, and
                  appropriate for a health community.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Medical Advice
                </h3>
                <p className="text-muted-foreground">
                  HopeCircle is not a substitute for professional medical
                  advice. Always consult with healthcare providers for medical
                  decisions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Privacy and Confidentiality
                </h3>
                <p className="text-muted-foreground">
                  Respect the privacy of other community members. Do not share
                  personal information without consent.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Prohibited Activities
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Harassment, bullying, or discriminatory behavior</li>
              <li>Sharing false or misleading medical information</li>
              <li>Spam or promotional content unrelated to sickle cell</li>
              <li>Violation of others' privacy or intellectual property</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Account Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to terminate accounts that violate these
              terms or engage in behavior harmful to the community.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact
              us at{" "}
              <a
                href="mailto:legal@hopecircle.com"
                className="text-primary hover:underline"
              >
                legal@hopecircle.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
