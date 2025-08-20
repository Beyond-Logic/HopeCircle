export default function PrivacyPage() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At HopeCircle, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our community platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Personal Information
                </h3>
                <p className="text-muted-foreground">
                  We collect information you provide directly, such as your
                  name, email address, genotype, and country when you create an
                  account.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Community Content
                </h3>
                <p className="text-muted-foreground">
                  Posts, comments, and other content you share within the
                  community are stored to provide the service.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our community platform</li>
              <li>To connect you with relevant groups and resources</li>
              <li>To send you important updates about the service</li>
              <li>To improve our platform and user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your
              personal information. However, no method of transmission over the
              internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:privacy@hopecircle.com"
                className="text-primary hover:underline"
              >
                privacy@hopecircle.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
