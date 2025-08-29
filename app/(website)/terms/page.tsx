import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | HopeCircle",
  description:
    "Read HopeCircle's Terms of Service to understand the guidelines and rules for using our supportive community platform.",
  keywords:
    "terms of service, user agreement, community guidelines, rules, policy",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing or using HopeCircle, you agree to be bound by these
              Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              2. Community Guidelines
            </h2>
            <p className="text-muted-foreground">
              HopeCircle is a supportive community. We require all members to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>Show respect and empathy to others</li>
              <li>Provide supportive, constructive communication</li>
              <li>Respect different opinions and experiences</li>
              <li>Maintain confidentiality of shared personal stories</li>
              <li>Not engage in harassment, hate speech, or bullying</li>
              <li>No promotional or commercial content</li>
              <li>
                Use your authentic identity to build trust within the community
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. Content Responsibility
            </h2>
            <p className="text-muted-foreground">
              You are responsible for the content you post on HopeCircle. By
              posting content, you grant us a license to display and distribute
              that content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              4. Account Termination
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate
              our community guidelines or terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              5. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              HopeCircle is not liable for any indirect, incidental, or
              consequential damages arising from your use of our service.
            </p>
          </section>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              For questions about these terms, please contact us at
              terms@hopecircle.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
