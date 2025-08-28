/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Clock, User, Share, Bookmark, Heart } from "lucide-react";

// Mock resource content
const mockResourceContent = {
  "living-with-scd": {
    id: "living-with-scd",
    title: "Living Well with Sickle Cell Disease: A Complete Guide",
    excerpt:
      "Comprehensive guide covering daily management strategies, lifestyle tips, and emotional support for thriving with sickle cell disease.",
    category: "Living with SCD",
    author: "Dr. Sarah Mitchell",
    authorBio:
      "Hematologist specializing in sickle cell disease with over 15 years of experience.",
    readTime: "8 min read",
    publishedAt: new Date("2024-01-10"),
    image: "/placeholder.svg?height=400&width=800",
    content: `
# Living Well with Sickle Cell Disease: A Complete Guide

Living with sickle cell disease (SCD) presents unique challenges, but with the right knowledge and strategies, you can lead a fulfilling and healthy life. This comprehensive guide covers essential aspects of daily management and thriving with SCD.

## Understanding Your Condition

Sickle cell disease is a genetic condition that affects the shape and function of red blood cells. While it requires ongoing management, understanding your condition empowers you to make informed decisions about your health.

### Key Points to Remember:
- SCD affects everyone differently
- Regular medical care is essential
- Prevention is often more effective than treatment
- You are not alone in this journey

## Daily Management Strategies

### 1. Hydration is Key
Staying well-hydrated is one of the most important things you can do. Aim for:
- 8-10 glasses of water daily
- More during hot weather or physical activity
- Avoid excessive caffeine and alcohol

### 2. Maintain a Healthy Diet
Focus on:
- Iron-rich foods (but consult your doctor about iron supplements)
- Plenty of fruits and vegetables
- Whole grains and lean proteins
- Foods rich in folic acid

### 3. Regular Exercise
Safe physical activity can:
- Improve circulation
- Boost energy levels
- Enhance mood
- Strengthen bones and muscles

**Important:** Always consult your healthcare team before starting new exercise routines.

## Managing Pain Crises

Pain crises are a reality for many people with SCD. Having a plan helps:

### Prevention Strategies:
- Stay hydrated
- Avoid extreme temperatures
- Manage stress
- Get adequate sleep
- Take medications as prescribed

### During a Crisis:
- Use prescribed pain medications
- Apply heat or cold as recommended
- Practice relaxation techniques
- Seek medical attention when needed

## Building Your Support Network

Living with SCD is easier with support:
- Connect with other warriors
- Join support groups
- Communicate openly with family and friends
- Work with a healthcare team you trust

## Mental Health Matters

Managing the emotional aspects of SCD is just as important as physical care:
- Acknowledge your feelings
- Seek professional help when needed
- Practice stress management techniques
- Celebrate your victories, no matter how small

## Looking Forward

Remember that research is constantly advancing, and new treatments are being developed. Stay informed, stay hopeful, and most importantly, remember that you are more than your diagnosis.

Your journey with sickle cell disease is unique, but you don't have to walk it alone. With proper management, support, and self-care, you can live a full and meaningful life.

---

*This article is for educational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for personalized guidance.*
    `,
  },
  "nutrition-guide": {
    id: "nutrition-guide",
    title: "Nutrition and Hydration for Sickle Cell Warriors",
    excerpt:
      "Essential nutrition guidelines, hydration tips, and meal planning strategies to support your health and energy levels.",
    category: "Nutrition",
    author: "Nutritionist Maria Santos",
    authorBio:
      "Registered Dietitian with specialization in chronic disease management and sickle cell nutrition.",
    readTime: "6 min read",
    publishedAt: new Date("2024-01-08"),
    image: "/placeholder.svg?height=400&width=800",
    content: `
# Nutrition and Hydration for Sickle Cell Warriors

Proper nutrition and hydration are fundamental pillars of sickle cell disease management. What you eat and drink can significantly impact your energy levels, pain frequency, and overall quality of life.

## The Foundation: Hydration

### Why Hydration Matters
- Prevents red blood cells from sickling
- Reduces risk of pain crises
- Supports kidney function
- Maintains healthy circulation

### Daily Hydration Goals:
- **Minimum:** 8-10 glasses of water daily
- **Active days:** 12-14 glasses
- **Hot weather:** Increase by 2-4 glasses
- **During illness:** Follow medical guidance

### Best Hydration Choices:
- Plain water (best option)
- Herbal teas
- Diluted fruit juices
- Coconut water (natural electrolytes)

### Limit These:
- Caffeinated beverages
- Alcohol
- High-sugar drinks
- Energy drinks

## Essential Nutrients for SCD

### 1. Folic Acid
**Why it's important:** Supports red blood cell production
**Daily goal:** 400-800 mcg
**Best sources:**
- Leafy green vegetables
- Fortified cereals
- Beans and lentils
- Citrus fruits

### 2. Vitamin D
**Why it's important:** Bone health and immune function
**Daily goal:** 1000-2000 IU (consult your doctor)
**Best sources:**
- Fatty fish (salmon, mackerel)
- Fortified milk and cereals
- Egg yolks
- Supplements if needed

### 3. Zinc
**Why it's important:** Wound healing and immune support
**Daily goal:** 8-11 mg
**Best sources:**
- Lean meats
- Nuts and seeds
- Whole grains
- Dairy products

## Iron: A Special Consideration

**Important:** People with SCD often have too much iron, not too little. Always consult your healthcare team before taking iron supplements.

### Managing Iron Levels:
- Regular blood tests to monitor iron
- Avoid iron supplements unless prescribed
- Focus on vitamin C to help iron absorption from food
- Consider iron chelation therapy if recommended

## Meal Planning Strategies

### Daily Meal Structure:
**Breakfast:** Include protein, whole grains, and fruit
**Lunch:** Balance protein, vegetables, and complex carbs
**Dinner:** Lean protein, plenty of vegetables, moderate portions
**Snacks:** Nutrient-dense options like nuts, fruits, yogurt

### Sample Day Menu:

**Breakfast:**
- Oatmeal with berries and nuts
- Glass of fortified orange juice
- Water

**Lunch:**
- Grilled chicken salad with mixed greens
- Whole grain roll
- Water with lemon

**Snack:**
- Greek yogurt with fruit
- Water

**Dinner:**
- Baked salmon
- Steamed broccoli
- Brown rice
- Water

## Foods to Emphasize

### Anti-Inflammatory Foods:
- Fatty fish (omega-3s)
- Colorful fruits and vegetables
- Nuts and seeds
- Olive oil
- Turmeric and ginger

### Energy-Boosting Foods:
- Complex carbohydrates
- Lean proteins
- Iron-rich foods (with medical guidance)
- B-vitamin rich foods

## Foods to Limit

### Pro-Inflammatory Foods:
- Processed meats
- Fried foods
- Refined sugars
- Trans fats

### Dehydrating Foods:
- High-sodium processed foods
- Excessive caffeine
- Alcohol

## Special Considerations

### During Pain Crises:
- Focus on easy-to-digest foods
- Maintain hydration
- Consider liquid nutrition if eating is difficult
- Avoid foods that might cause nausea

### For Children with SCD:
- Ensure adequate calories for growth
- Make healthy foods appealing
- Involve kids in meal planning
- Work with a pediatric nutritionist

## Supplements: When and What

**Always consult your healthcare team before starting supplements.**

### Commonly Recommended:
- Folic acid
- Vitamin D
- Multivitamin (iron-free)

### Potentially Harmful:
- Iron supplements (unless prescribed)
- High-dose vitamin C (can increase iron absorption)
- Herbal supplements (may interact with medications)

## Practical Tips for Success

### Meal Prep Ideas:
- Batch cook proteins on weekends
- Pre-cut vegetables for easy snacking
- Keep healthy snacks visible and accessible
- Prepare hydration reminders

### Eating Out:
- Choose grilled over fried
- Ask for dressings and sauces on the side
- Opt for water or unsweetened beverages
- Don't skip meals to "save calories"

### Budget-Friendly Nutrition:
- Buy seasonal produce
- Use frozen fruits and vegetables
- Buy proteins in bulk and freeze portions
- Cook at home more often

## Working with Your Healthcare Team

### Questions to Ask:
- Do I need any specific supplements?
- Are there foods I should avoid with my medications?
- How can I maintain proper nutrition during hospitalizations?
- Should I see a registered dietitian?

Remember, good nutrition is a powerful tool in managing sickle cell disease. Small, consistent changes can make a big difference in how you feel and function every day.

---

*This information is for educational purposes only. Always consult with your healthcare provider and a registered dietitian for personalized nutrition advice.*
    `,
  },
  "pain-management": {
    id: "pain-management",
    title: "Effective Pain Management Strategies",
    excerpt:
      "Evidence-based approaches to managing sickle cell pain, including medical treatments and complementary therapies.",
    category: "Pain Management",
    author: "Dr. James Wilson",
    authorBio:
      "Pain management specialist with expertise in sickle cell disease and chronic pain conditions.",
    readTime: "10 min read",
    publishedAt: new Date("2024-01-05"),
    image: "/placeholder.svg?height=400&width=800",
    content: `
# Effective Pain Management Strategies

Pain is one of the most challenging aspects of living with sickle cell disease. Understanding your options and developing a comprehensive pain management plan can significantly improve your quality of life.

## Understanding Sickle Cell Pain

### Types of Pain:
**Acute Pain (Vaso-occlusive Crisis):**
- Sudden onset
- Severe intensity
- Usually requires medical attention
- Can last hours to days

**Chronic Pain:**
- Persistent, ongoing pain
- May be related to organ damage
- Requires long-term management strategies
- Can affect daily functioning

### Common Pain Locations:
- Chest
- Back
- Arms and legs
- Abdomen
- Joints

## Medical Pain Management

### Acute Pain Treatment:
**Mild to Moderate Pain:**
- Over-the-counter pain relievers (acetaminophen, ibuprofen)
- Prescription NSAIDs
- Topical pain relievers

**Severe Pain:**
- Prescription opioids (short-term use)
- IV pain medications (hospital setting)
- Patient-controlled analgesia (PCA)

### Chronic Pain Management:
- Long-acting pain medications
- Nerve blocks
- Antidepressants (for nerve pain)
- Anticonvulsants (for nerve pain)

### Important Medication Guidelines:
- Take medications as prescribed
- Don't wait until pain is severe
- Keep a pain diary
- Communicate with your healthcare team
- Be aware of side effects

## Non-Medical Pain Management

### Heat and Cold Therapy:
**Heat Therapy:**
- Heating pads
- Warm baths
- Hot water bottles
- Improves circulation

**Cold Therapy:**
- Ice packs (wrapped in cloth)
- Cold compresses
- Reduces inflammation
- Use for 15-20 minutes at a time

### Physical Techniques:
**Gentle Exercise:**
- Walking
- Swimming
- Stretching
- Yoga (modified as needed)

**Massage Therapy:**
- Improves circulation
- Reduces muscle tension
- Promotes relaxation
- Consider professional massage

### Mind-Body Techniques:
**Deep Breathing:**
- 4-7-8 breathing technique
- Diaphragmatic breathing
- Helps reduce anxiety and pain perception

**Progressive Muscle Relaxation:**
- Systematic tensing and relaxing of muscles
- Reduces overall tension
- Can be done anywhere

**Meditation and Mindfulness:**
- Focused attention techniques
- Body scan meditation
- Mindfulness apps
- Regular practice improves pain tolerance

## Complementary Therapies

### Acupuncture:
- May help reduce pain intensity
- Consult with healthcare team first
- Choose licensed practitioners
- May complement medical treatment

### TENS Units:
- Transcutaneous electrical nerve stimulation
- Blocks pain signals
- Portable and easy to use
- Discuss with your doctor

### Biofeedback:
- Learn to control body responses
- Reduces muscle tension
- Helps with stress management
- Requires training and practice

## Lifestyle Strategies

### Sleep Hygiene:
- Maintain regular sleep schedule
- Create comfortable sleep environment
- Avoid caffeine before bedtime
- Address sleep disorders

### Stress Management:
- Identify stress triggers
- Develop coping strategies
- Consider counseling
- Practice relaxation techniques

### Activity Pacing:
- Balance activity and rest
- Break tasks into smaller parts
- Listen to your body
- Plan activities around energy levels

## Creating Your Pain Management Plan

### Work with Your Healthcare Team:
- Pain management specialist
- Hematologist
- Primary care physician
- Mental health counselor
- Physical therapist

### Document Your Pain:
**Pain Diary Should Include:**
- Pain intensity (1-10 scale)
- Location and quality of pain
- Triggers and relieving factors
- Medications taken
- Activities affected

### Emergency Pain Plan:
**When to Seek Medical Care:**
- Pain score 7/10 or higher
- Pain not responding to usual treatments
- Fever with pain
- Difficulty breathing
- Signs of stroke or other complications

### Home Pain Kit:
- Prescribed medications
- Heating pad
- Ice packs
- Comfortable pillows
- Relaxation music or apps
- Emergency contact numbers

## Special Considerations

### Pain During Pregnancy:
- Limited medication options
- Increased monitoring needed
- Work closely with obstetric team
- Focus on non-medication strategies

### Pediatric Pain Management:
- Age-appropriate pain scales
- Distraction techniques
- Parent/caregiver involvement
- School accommodation plans

### Chronic Pain and Mental Health:
- Depression and anxiety are common
- Seek mental health support
- Consider support groups
- Address both physical and emotional aspects

## Avoiding Common Pitfalls

### Medication Misuse:
- Follow prescribed dosages
- Don't share medications
- Store medications safely
- Dispose of unused medications properly

### Undertreating Pain:
- Don't "tough it out"
- Communicate pain levels honestly
- Advocate for adequate treatment
- Seek second opinions if needed

### Overreliance on One Strategy:
- Use multiple approaches
- Adapt strategies as needed
- Stay open to new treatments
- Regular plan reviews

## Looking Ahead: New Treatments

### Emerging Therapies:
- Gene therapy
- New medications
- Advanced pain management techniques
- Improved understanding of pain mechanisms

### Research Participation:
- Clinical trials may be available
- Discuss with your doctor
- Potential access to new treatments
- Contribute to advancing care

Remember, effective pain management is highly individual. What works for one person may not work for another. Be patient with yourself as you develop your personalized pain management strategy, and don't hesitate to advocate for the care you need.

---

*This information is for educational purposes only and should not replace professional medical advice. Always work with your healthcare team to develop a safe and effective pain management plan.*
    `,
  },
};

export function ResourceDetail() {
  const params = useParams();
  const resourceId = params.id as string;

  // Get resource data (in real app, this would be fetched from API)
  const resource =
    mockResourceContent[resourceId as keyof typeof mockResourceContent];

  if (!resource) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Resource not found</h1>
        <Link href="/resources">
          <Button>Back to Resources</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/resources">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
      </Link>

      {/* Article Header */}
      <Card>
        <div className="aspect-[2/1] relative">
          <img
            src={resource.image || "/placeholder.svg"}
            alt={resource.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge>{resource.category}</Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">
              {resource.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {resource.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src="/placeholder.svg?height=48&width=48"
                    alt={resource.author}
                  />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{resource.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {resource.authorBio}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{resource.readTime}</span>
                </div>
                <span>{resource.publishedAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Content */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-gray max-w-none">
            <div
              className="leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: resource.content
                  .split("\n")
                  .map((line) => {
                    if (line.startsWith("# ")) {
                      return `<h1 class="text-3xl font-bold mt-8 mb-4">${line.substring(
                        2
                      )}</h1>`;
                    }
                    if (line.startsWith("## ")) {
                      return `<h2 class="text-2xl font-semibold mt-6 mb-3">${line.substring(
                        3
                      )}</h2>`;
                    }
                    if (line.startsWith("### ")) {
                      return `<h3 class="text-xl font-semibold mt-4 mb-2">${line.substring(
                        4
                      )}</h3>`;
                    }
                    if (line.startsWith("- ")) {
                      return `<li class="ml-4">${line.substring(2)}</li>`;
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return `<p class="font-semibold mt-4 mb-2">${line.slice(
                        2,
                        -2
                      )}</p>`;
                    }
                    if (line.startsWith("*") && line.endsWith("*")) {
                      return `<p class="italic text-muted-foreground text-sm mt-4">${line.slice(
                        1,
                        -1
                      )}</p>`;
                    }
                    if (line === "---") {
                      return `<hr class="my-6 border-border" />`;
                    }
                    if (line.trim() === "") {
                      return "<br />";
                    }
                    return `<p class="mb-4">${line}</p>`;
                  })
                  .join(""),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Related Resources */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceId === "living-with-scd" && (
              <>
                <Link href="/resources/nutrition-guide" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Nutrition and Hydration for Sickle Cell Warriors
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Essential nutrition guidelines and meal planning
                      strategies
                    </p>
                  </div>
                </Link>
                <Link href="/resources/pain-management" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Effective Pain Management Strategies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Evidence-based approaches to managing sickle cell pain
                    </p>
                  </div>
                </Link>
                <Link href="/resources/exercise-fitness" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Safe Exercise and Fitness for Sickle Cell
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Guidelines for staying active safely with SCD
                    </p>
                  </div>
                </Link>
                <Link href="/resources/mental-health" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Mental Health and Emotional Wellbeing
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Addressing emotional challenges of living with SCD
                    </p>
                  </div>
                </Link>
              </>
            )}
            {resourceId === "nutrition-guide" && (
              <>
                <Link href="/resources/living-with-scd" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Living Well with Sickle Cell Disease
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Complete guide to daily management and thriving with SCD
                    </p>
                  </div>
                </Link>
                <Link href="/resources/exercise-fitness" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Safe Exercise and Fitness for Sickle Cell
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Guidelines for staying active safely with SCD
                    </p>
                  </div>
                </Link>
              </>
            )}
            {resourceId === "pain-management" && (
              <>
                <Link href="/resources/living-with-scd" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Living Well with Sickle Cell Disease
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Complete guide to daily management and thriving with SCD
                    </p>
                  </div>
                </Link>
                <Link
                  href="/resources/emergency-preparedness"
                  className="block"
                >
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Emergency Preparedness for Sickle Cell Crises
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Essential guide to preparing for SCD emergencies
                    </p>
                  </div>
                </Link>
              </>
            )}
            {![
              "living-with-scd",
              "nutrition-guide",
              "pain-management",
            ].includes(resourceId) && (
              <>
                <Link href="/resources/living-with-scd" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Living Well with Sickle Cell Disease
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Complete guide to daily management and thriving with SCD
                    </p>
                  </div>
                </Link>
                <Link href="/resources/nutrition-guide" className="block">
                  <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium mb-2">
                      Nutrition and Hydration for Sickle Cell Warriors
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Essential nutrition guidelines and meal planning
                      strategies
                    </p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
