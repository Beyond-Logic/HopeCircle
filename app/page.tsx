/* eslint-disable react/no-unescaped-entities */

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, MessageCircle, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              A Safe Community for <span className="text-primary">Sickle Cell Warriors</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect with others who understand your journey. Share experiences, find support, and access resources
              that empower better daily living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Join the Community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose HopeCircle?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We focus on community and connection, not just symptom tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Connect</h3>
                <p className="text-muted-foreground">
                  Find others who understand your struggles and celebrate your victories.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Share</h3>
                <p className="text-muted-foreground">
                  Share experiences, tips, and encouragement in a supportive environment.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Support</h3>
                <p className="text-muted-foreground">Get emotional support and practical advice from your community.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Learn</h3>
                <p className="text-muted-foreground">
                  Access trusted educational content and resources for better living.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Stories from Our Community</h2>
            <p className="text-xl text-muted-foreground">Real experiences from sickle cell warriors like you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4 italic">
                  "Finding HopeCircle changed everything for me. I finally found people who truly understand what I'm
                  going through."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-foreground font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-semibold">Amara K.</p>
                    <p className="text-sm text-muted-foreground">SS Warrior, Nigeria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4 italic">
                  "The support I've received here has been incredible. It's more than an app - it's a family."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mr-3">
                    <span className="text-secondary-foreground font-semibold">M</span>
                  </div>
                  <div>
                    <p className="font-semibold">Marcus J.</p>
                    <p className="text-sm text-muted-foreground">SC Warrior, USA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4 italic">
                  "As a caregiver, this community has given me insights and support I couldn't find anywhere else."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                    <span className="text-accent-foreground font-semibold">S</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah M.</p>
                    <p className="text-sm text-muted-foreground">Caregiver, UK</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Take the first step towards connection, support, and hope.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

