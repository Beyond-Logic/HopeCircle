import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>Account information (name, email address)</li>
              <li>Content you post (stories, comments, support messages)</li>
              <li>Communications with other members</li>
              <li>Technical information about your device and usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground">We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and maintain your account</li>
              <li>Connect you with supportive communities</li>
              <li>Ensure a safe environment for all members</li>
              <li>Communicate with you about updates and support resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. Information Sharing
            </h2>
            <p className="text-muted-foreground">
              We do not sell your personal data. We may share information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>With your consent</li>
              <li>With service providers who assist our operations</li>
              <li>When required by law or to protect rights and safety</li>
              <li>In anonymous, aggregated form for research purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Your Choices</h2>
            <p className="text-muted-foreground">You can:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>Update your account information</li>
              <li>Control your privacy settings</li>
              <li>Delete your account at any time</li>
              <li>Opt-out of promotional communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement security measures to protect your information, but no
              system is completely secure.
            </p>
          </section>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              For privacy concerns, contact us at privacy@hopecircle.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
