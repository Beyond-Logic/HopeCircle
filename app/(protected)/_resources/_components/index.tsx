/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Clock, User } from "lucide-react";

// Mock resources data
const mockResources = [
  {
    id: "living-with-scd",
    title: "Living Well with Sickle Cell Disease: A Complete Guide",
    excerpt:
      "Comprehensive guide covering daily management strategies, lifestyle tips, and emotional support for thriving with sickle cell disease.",
    category: "Living with SCD",
    author: "Dr. Sarah Mitchell",
    readTime: "8 min read",
    publishedAt: new Date("2024-01-10"),
    image: "/placeholder.svg?height=200&width=300",
    featured: true,
  },
  {
    id: "nutrition-guide",
    title: "Nutrition and Hydration for Sickle Cell Warriors",
    excerpt:
      "Essential nutrition guidelines, hydration tips, and meal planning strategies to support your health and energy levels.",
    category: "Nutrition",
    author: "Nutritionist Maria Santos",
    readTime: "6 min read",
    publishedAt: new Date("2024-01-08"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "pain-management",
    title: "Effective Pain Management Strategies",
    excerpt:
      "Evidence-based approaches to managing sickle cell pain, including medical treatments and complementary therapies.",
    category: "Pain Management",
    author: "Dr. James Wilson",
    readTime: "10 min read",
    publishedAt: new Date("2024-01-05"),
    image: "/placeholder.svg?height=200&width=300",
    featured: true,
  },
  {
    id: "exercise-fitness",
    title: "Safe Exercise and Fitness for Sickle Cell",
    excerpt:
      "Guidelines for staying active safely, including recommended exercises and activities to avoid with sickle cell disease.",
    category: "Living with SCD",
    author: "Physical Therapist Alex Johnson",
    readTime: "7 min read",
    publishedAt: new Date("2024-01-03"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "mental-health",
    title: "Mental Health and Emotional Wellbeing",
    excerpt:
      "Addressing the emotional challenges of living with sickle cell disease and strategies for maintaining mental health.",
    category: "Mental Health",
    author: "Psychologist Dr. Lisa Chen",
    readTime: "9 min read",
    publishedAt: new Date("2023-12-28"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "hydroxyurea-guide",
    title: "Understanding Hydroxyurea Treatment",
    excerpt:
      "Complete guide to hydroxyurea therapy, including benefits, side effects, and what to expect during treatment.",
    category: "Treatment",
    author: "Dr. Michael Brown",
    readTime: "12 min read",
    publishedAt: new Date("2023-12-25"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "workplace-advocacy",
    title: "Advocating for Yourself in the Workplace",
    excerpt:
      "Know your rights, communicate effectively with employers, and create a supportive work environment while managing SCD.",
    category: "Living with SCD",
    author: "Career Counselor Jennifer Davis",
    readTime: "8 min read",
    publishedAt: new Date("2023-12-20"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "family-planning",
    title: "Family Planning and Genetic Counseling",
    excerpt:
      "Important considerations for family planning, genetic testing, and counseling resources for individuals with SCD.",
    category: "Treatment",
    author: "Genetic Counselor Dr. Patricia Lee",
    readTime: "11 min read",
    publishedAt: new Date("2023-12-15"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "emergency-preparedness",
    title: "Emergency Preparedness for Sickle Cell Crises",
    excerpt:
      "Essential guide to preparing for and managing sickle cell emergencies, including what to pack and when to seek help.",
    category: "Pain Management",
    author: "Emergency Medicine Dr. Robert Kim",
    readTime: "6 min read",
    publishedAt: new Date("2023-12-10"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "sleep-wellness",
    title: "Sleep and Rest for Better Health",
    excerpt:
      "The importance of quality sleep for sickle cell management and practical tips for improving sleep hygiene.",
    category: "Living with SCD",
    author: "Sleep Specialist Dr. Amanda Foster",
    readTime: "7 min read",
    publishedAt: new Date("2023-12-05"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "stress-management",
    title: "Stress Management Techniques That Work",
    excerpt:
      "Proven stress reduction techniques specifically beneficial for people with sickle cell disease, including mindfulness and relaxation.",
    category: "Mental Health",
    author: "Mindfulness Coach Sarah Williams",
    readTime: "8 min read",
    publishedAt: new Date("2023-11-30"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "travel-tips",
    title: "Traveling Safely with Sickle Cell Disease",
    excerpt:
      "Essential travel planning tips, medication management, and precautions for safe and enjoyable trips with SCD.",
    category: "Living with SCD",
    author: "Travel Health Nurse Mary Thompson",
    readTime: "9 min read",
    publishedAt: new Date("2023-11-25"),
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
];

const categories = [
  "All",
  "Living with SCD",
  "Nutrition",
  "Pain Management",
  "Mental Health",
  "Treatment",
];

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = mockResources.filter(
    (resource) => resource.featured
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Resources</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Trusted educational content and resources to empower better daily
          living with sickle cell disease
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Featured Resources */}
      {!searchQuery && activeCategory === "All" && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredResources.map((resource) => (
              <Card
                key={resource.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative">
                  <img
                    src={resource.image || "/placeholder.svg"}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge>{resource.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {resource.title}
                  </CardTitle>
                  <p className="text-muted-foreground line-clamp-3">
                    {resource.excerpt}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{resource.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.readTime}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/resources/${resource.id}`}>Read Article</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-8">
            <ResourceGrid resources={filteredResources} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ResourceGridProps {
  resources: typeof mockResources;
}

function ResourceGrid({ resources }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No resources found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or browse different categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card
          key={resource.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="aspect-video relative">
            <img
              src={resource.image || "/placeholder.svg"}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="secondary">{resource.category}</Badge>
            </div>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg line-clamp-2">
              {resource.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {resource.excerpt}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>{resource.author}</span>
              <span>{resource.readTime}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full bg-transparent"
            >
              <Link href={`/resources/${resource.id}`}>Read More</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
