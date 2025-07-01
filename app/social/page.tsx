"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface SunsetPost {
  id: number;
  user: string;
  avatar: string;
  location: string;
  timestamp: string;
  image: string;
  caption: string;
  rating: number;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function SocialPage() {
  const [posts, setPosts] = useState<SunsetPost[]>([]);

  useEffect(() => {
    // Load posts from localStorage and combine with demo data
    const savedPosts = JSON.parse(localStorage.getItem("sunsetPosts") || "[]");
    const demoPosts: SunsetPost[] = [
      {
        id: 1,
        user: "John Doe",
        avatar: "/placeholder-user.jpg",
        location: "Hilltop Park",
        timestamp: "2 hours ago",
        image: "/placeholder.svg?height=300&width=400",
        caption:
          "Absolutely breathtaking sunset tonight! The colors were incredible 🌅",
        rating: 5,
        likes: 24,
        comments: 8,
        isLiked: false,
      },
      {
        id: 2,
        user: "Sarah Chen",
        avatar: "/placeholder-user.jpg",
        location: "Ocean Pier",
        timestamp: "4 hours ago",
        image: "/placeholder.svg?height=300&width=400",
        caption:
          "Perfect end to a perfect day. The reflection on the water was magical ✨",
        rating: 4,
        likes: 18,
        comments: 5,
        isLiked: true,
      },
      {
        id: 3,
        user: "Mike Johnson",
        avatar: "/placeholder-user.jpg",
        location: "Sunset Beach",
        timestamp: "1 day ago",
        image: "/placeholder.svg?height=300&width=400",
        caption:
          "First time at this spot and wow! Definitely coming back tomorrow 🏖️",
        rating: 5,
        likes: 31,
        comments: 12,
        isLiked: false,
      },
    ];

    // Combine saved posts with demo posts
    const allPosts = [
      ...savedPosts.map((post: any, index: number) => ({
        ...post,
        likes: Math.floor(Math.random() * 20) + 5,
        comments: Math.floor(Math.random() * 10) + 2,
        isLiked: false,
        avatar: "/placeholder-user.jpg",
        timestamp: index === 0 ? "Just now" : `${index + 1} hours ago`,
      })),
      ...demoPosts,
    ];

    setPosts(allPosts);
  }, []);

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sunset Network</h1>
            <p className="text-sm text-gray-600">Community sunset moments</p>
          </div>
        </div>

        {/* Community Stats */}
        <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">1.2k</div>
                <div className="text-xs opacity-90">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3.4k</div>
                <div className="text-xs opacity-90">Sunsets Shared</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-xs opacity-90">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {post.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{post.user}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                        <Clock className="w-3 h-3 ml-1" />
                        {post.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{post.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Sunset"
                  className="w-full h-64 object-cover"
                />

                <div className="p-4">
                  <p className="text-sm mb-3">{post.caption}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1 text-sm"
                      >
                        <Heart
                          className={`w-4 h-4 ${post.isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                        />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-500">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {post.rating}/5 ⭐
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <Button variant="outline" className="w-full bg-transparent">
          Load More Posts
        </Button>
      </div>
    </div>
  );
}
