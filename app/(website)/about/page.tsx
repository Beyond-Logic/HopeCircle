/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, Shield, MessageCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | HopeCircle",
  description:
    "Learn about HopeCircle's mission to create a supportive community where people connect through shared experiences and find hope together.",
  keywords:
    "about HopeCircle, community mission, support network, our story, team",
};

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">About HopeCircle</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A supportive community where people connect through shared
          experiences, offer emotional support, and find hope together.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Community Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Connect with others who understand your journey and can offer
              genuine support.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Safe Space</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Share your story in a judgment-free zone with community guidelines
              that protect everyone.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Authentic Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Build meaningful relationships based on empathy, understanding,
              and shared experiences.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HopeCircle was founded in 2025 with a simple mission: to create a
            social platform focused on support rather than popularity.
          </p>
          <p className="text-muted-foreground">
            Unlike traditional social networks that often emphasize curated
            perfection, we believe in the power of vulnerability, authentic
            connection, and mutual support during life's challenges.
          </p>
          <p className="text-muted-foreground">
            Our community brings together people facing similar life
            circumstances—whether dealing with health issues, personal loss,
            career transitions, or other challenges—to share experiences,
            resources, and hope.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join Our Community</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Whether you're seeking support or offering it, there's a place for
            you in HopeCircle.
          </p>
          <Button asChild>
            <Link href="/signup">Create an Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
