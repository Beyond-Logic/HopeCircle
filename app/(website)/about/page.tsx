/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Shield, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About HopeCircle
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We believe that living with sickle cell doesn't have to mean living
            alone. Our mission is to create a supportive community where
            warriors, caregivers, and supporters can connect, share, and thrive
            together.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Living with sickle cell can feel isolating. Many warriors face
                pain crises, stigma, and a lack of understanding from those
                around them. While medical apps often focus on tracking
                symptoms, what many truly need is connection, encouragement, and
                a safe space to share their journey.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                HopeCircle is designed to solve that. We're a community-first
                platform that reduces the burden of constant health tracking and
                instead focuses on belonging and support — the things that often
                make the biggest difference in a warrior's journey.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Hope</h3>
                  <p className="text-sm text-muted-foreground">
                    Fostering hope through shared experiences
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Building connections that matter
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Safety</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating a safe space for all
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Providing meaningful support
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-muted py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Our Vision
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We envision a world where no one living with sickle cell feels
            alone. A world where every warrior has access to a supportive
            community, trusted resources, and the encouragement they need to
            live their best life.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <p className="text-lg font-medium text-foreground italic">
              "Together, we are stronger. Together, we have hope. Together, we
              thrive."
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
