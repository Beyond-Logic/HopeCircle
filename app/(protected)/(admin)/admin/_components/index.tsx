"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  BookOpen,
  Shield,
  Search,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Plus,
} from "lucide-react";

// Mock data for admin dashboard
const mockStats = {
  totalUsers: 1247,
  totalPosts: 3892,
  totalResources: 156,
  pendingReports: 23,
};

const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    genotype: "SS",
    country: "Nigeria",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@example.com",
    genotype: "SC",
    country: "USA",
    status: "active",
    joinDate: "2024-01-20",
  },
  {
    id: 3,
    name: "Amara Okafor",
    email: "amara@example.com",
    genotype: "AS",
    country: "Nigeria",
    status: "banned",
    joinDate: "2024-02-01",
  },
];

const mockPosts = [
  {
    id: 1,
    author: "Sarah Johnson",
    content:
      "Just had my monthly checkup and everything looks good! Staying hydrated and taking my medications regularly really helps.",
    likes: 24,
    comments: 8,
    reports: 0,
    status: "approved",
  },
  {
    id: 2,
    author: "Michael Chen",
    content:
      "Does anyone have tips for managing pain during cold weather? The winter months are always tough for me.",
    likes: 15,
    comments: 12,
    reports: 1,
    status: "pending",
  },
  {
    id: 3,
    author: "Amara Okafor",
    content: "Inappropriate content that violates community guidelines...",
    likes: 2,
    comments: 1,
    reports: 5,
    status: "flagged",
  },
];

const mockResources = [
  {
    id: 1,
    title: "Understanding Sickle Cell Disease",
    category: "Living with SCD",
    author: "Dr. Smith",
    status: "published",
    views: 1250,
  },
  {
    id: 2,
    title: "Nutrition Guidelines for SCD Patients",
    category: "Nutrition",
    author: "Dr. Johnson",
    status: "draft",
    views: 0,
  },
  {
    id: 3,
    title: "Pain Management Techniques",
    category: "Pain Management",
    author: "Dr. Williams",
    status: "published",
    views: 890,
  },
];

export function Admin() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage users, moderate content, and oversee the HopeCircle community
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.totalPosts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalResources}</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reports
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockStats.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="posts">Post Moderation</TabsTrigger>
          <TabsTrigger value="resources">Resource Management</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex sm:flex-row flex-col gap-4 sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.genotype}</Badge>
                          <Badge variant="outline">{user.country}</Badge>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {user.status === "active" ? (
                        <Button variant="outline" size="sm">
                          <UserX className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post Moderation */}
        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Moderation</CardTitle>
              <CardDescription>
                Review and moderate community posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPosts.map((post) => (
                  <div key={post.id} className="p-4 border rounded-lg">
                    <div className="flex sm:flex-row flex-col gap-4 items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{post.author}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={
                              post.status === "approved"
                                ? "default"
                                : post.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {post.status}
                          </Badge>
                          {post.reports > 0 && (
                            <Badge variant="destructive">
                              {post.reports} reports
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-auto">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Management */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Management</CardTitle>
              <CardDescription>
                Manage educational resources and articles
              </CardDescription>
              <Button className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Add New Resource
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex sm:flex-row flex-col gap-4 sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-gray-600">
                        by {resource.author}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{resource.category}</Badge>
                        <Badge
                          variant={
                            resource.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {resource.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {resource.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
