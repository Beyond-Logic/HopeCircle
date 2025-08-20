"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Clock, Users, UserPlus } from "lucide-react";
import { CreatePostForm } from "@/components/create-post-form";
import { PostCard } from "@/components/post-card";


// Mock data for posts
const mockPosts = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Amara Johnson",
      genotype: "SS",
      country: "Nigeria",
      avatar: null,
    },
    content:
      "Just had my monthly check-up and my hemoglobin levels are stable! Feeling grateful for this community's support during my tough days. Remember, we're stronger together! 💪",
    image: null,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    likes: 24,
    comments: 8,
    isLiked: false,
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "Marcus Williams",
      genotype: "SC",
      country: "USA",
      avatar: null,
    },
    content:
      "Sharing my pain management routine that's been working well: staying hydrated, gentle yoga, and meditation. What works for you all?",
    image: null,
    createdAt: new Date("2024-01-14T15:45:00Z"),
    likes: 18,
    comments: 12,
    isLiked: true,
  },
  {
    id: "3",
    author: {
      id: "user3",
      name: "Sarah Mitchell",
      genotype: "Caregiver",
      country: "UK",
      avatar: null,
    },
    content:
      "As a caregiver to my daughter with SCD, I want to thank this community for all the insights and emotional support. You've helped me become a better advocate for her.",
    image: null,
    createdAt: new Date("2024-01-13T09:20:00Z"),
    likes: 31,
    comments: 15,
    isLiked: false,
  },
  {
    id: "4",
    author: {
      id: "user4",
      name: "Dr. Kemi Adebayo",
      genotype: "Healthcare Provider",
      country: "Nigeria",
      avatar: null,
    },
    content:
      "Reminder: Cold weather can trigger sickle cell crises. Stay warm, dress in layers, and don't hesitate to seek medical attention if you feel a crisis coming on. Prevention is key! 🩺",
    image: null,
    createdAt: new Date("2024-01-12T14:20:00Z"),
    likes: 42,
    comments: 6,
    isLiked: false,
  },
  {
    id: "5",
    author: {
      id: "user5",
      name: "Fatima Al-Rashid",
      genotype: "SS",
      country: "UAE",
      avatar: null,
    },
    content:
      "Started a new job this week and was nervous about disclosing my condition. My manager was so understanding and supportive! There are good people out there. 🌟",
    image: null,
    createdAt: new Date("2024-01-11T11:15:00Z"),
    likes: 28,
    comments: 9,
    isLiked: true,
  },
  {
    id: "6",
    author: {
      id: "user6",
      name: "James Thompson",
      genotype: "SC",
      country: "Jamaica",
      avatar: null,
    },
    content:
      "Celebrating 6 months crisis-free! My secret: consistent medication, regular exercise (swimming is my favorite), and this amazing community for mental support. Keep fighting! 🏊‍♂️",
    image: null,
    createdAt: new Date("2024-01-10T16:30:00Z"),
    likes: 35,
    comments: 11,
    isLiked: false,
  },
  {
    id: "7",
    author: {
      id: "user7",
      name: "Maria Santos",
      genotype: "Caregiver",
      country: "Brazil",
      avatar: null,
    },
    content:
      "My son just got accepted to university! He was worried about managing his SCD while studying, but we've created a great support plan. Dreams don't have to stop because of sickle cell! 🎓",
    image: null,
    createdAt: new Date("2024-01-09T13:45:00Z"),
    likes: 47,
    comments: 18,
    isLiked: false,
  },
  {
    id: "8",
    author: {
      id: "user8",
      name: "David Okafor",
      genotype: "SS",
      country: "Ghana",
      avatar: null,
    },
    content:
      "Nutrition tip: I've been adding more leafy greens and fruits rich in folate to my diet. My energy levels have improved significantly! What foods help you feel your best?",
    image: null,
    createdAt: new Date("2024-01-08T08:20:00Z"),
    likes: 22,
    comments: 14,
    isLiked: true,
  },
];

// Mock data for user's joined groups and followed users
const userJoinedGroups = [
  "Nigeria Warriors",
  "Caregivers Support",
  "Young Adults with SCD",
];
const userFollowing = ["user1", "user4", "user6"]; // Following Amara, Dr. Kemi, and James

export function Feed() {
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState("recent");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNewPost = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  // Filtering logic for different tabs
  const getFilteredPosts = () => {
    let filteredPosts = posts;

    switch (activeTab) {
      case "my-groups":
        // Filter posts from users in groups the current user has joined
        filteredPosts = posts.filter((post) =>
          userJoinedGroups.some(
            (group) =>
              group.toLowerCase().includes(post.author.country.toLowerCase()) ||
              (post.author.genotype === "Caregiver" &&
                group.includes("Caregivers")) ||
              (post.author.genotype !== "Healthcare Provider" &&
                post.author.genotype !== "Caregiver" &&
                group.includes("Young Adults"))
          )
        );
        break;
      case "following":
        // Filter posts from users the current user follows
        filteredPosts = posts.filter((post) =>
          userFollowing.includes(post.author.id)
        );
        break;
      case "popular":
        filteredPosts = [...posts].sort((a, b) => b.likes - a.likes);
        break;
      default: // recent
        filteredPosts = [...posts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return filteredPosts;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                Welcome to your community feed!
              </h2>
              <p className="text-muted-foreground text-sm">
                Share your journey and connect with fellow warriors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Form */}
      <CreatePostForm onPostCreated={handleNewPost} />

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger
            value="recent"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Recent</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-groups"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">My Groups</span>
            <span className="sm:hidden">Groups</span>
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Following</span>
            <span className="sm:hidden">Follow</span>
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4 mt-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts to show yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-4 mt-6">
          {filteredPosts.length > 0 ? (
            <>
              <Card className="p-4 bg-secondary/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing posts from your groups: {userJoinedGroups.join(", ")}
                </p>
              </Card>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
              ))}
            </>
          ) : (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                No posts from your groups yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Join more groups to see posts here!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-4 mt-6">
          {filteredPosts.length > 0 ? (
            <>
              <Card className="p-4 bg-secondary/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing posts from people you follow
                </p>
              </Card>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
              ))}
            </>
          ) : (
            <Card className="p-8 text-center">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                No posts from people you follow yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Follow more community members to see their posts here!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts to show yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline">Load More Posts</Button>
      </div>
    </div>
  );
}
