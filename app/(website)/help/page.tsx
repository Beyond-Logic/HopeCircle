/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | HopeCircle",
  description:
    "Get help with your HopeCircle account, learn how to use our features, and find answers to frequently asked questions.",
  keywords: "help, support, FAQ, contact, how to use HopeCircle",
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click the 'Sign Up' button on the homepage, enter your email address, create a password, and confirm your email through the verification link we send you.",
    },
    {
      question: "How do I find support groups?",
      answer:
        "After signing in, go to the 'Discover' page to browse communities by category or use the search function to find groups specific to your needs.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Click the three dots on any post or comment and select 'Report'. Our moderation team will review it within 24 hours.",
    },
    {
      question: "How do I delete my account?",
      answer:
        "For account deletion, please contact our support team. We'll assist you through the process.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take security seriously. All personal information is encrypted. We do not sell your personal data, and we only share information with your consent, with service providers who assist our operations, when required by law, or in anonymous, aggregated form for research purposes.",
    },
  ];

  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions and get support for your HopeCircle
          experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Browse our frequently asked questions to find quick answers to
              common questions about using HopeCircle.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:contact@hopecircle.net">Email Us</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="pb-4 border-b last:border-b-0 last:pb-0"
            >
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            To ensure HopeCircle remains a safe and supportive space for
            everyone, please review our community guidelines:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
            <li>Be respectful and empathetic toward others</li>
            <li>
              Respect privacy and confidentiality - don't share others' personal
              stories
            </li>
            <li>Offer support rather than unsolicited advice</li>
            <li>No harassment, hate speech, or bullying</li>
          </ul>
          <Button asChild variant="outline">
            <Link href="/terms">Read Full Guidelines</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="text-center mt-10 pt-6 border-t">
        <p className="text-muted-foreground text-sm">
          Need immediate help? If you're in crisis, please contact emergency
          services or a crisis helpline.
        </p>
      </div>
    </div>
  );
}
