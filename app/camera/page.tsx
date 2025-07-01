"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  ArrowLeft,
  Upload,
  Star,
  MapPin,
  Calendar,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function CameraPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    setIsUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save to local storage for demo
    const sunsetPost = {
      id: Date.now(),
      image: capturedImage,
      caption,
      rating,
      location: "Current Location",
      timestamp: new Date().toISOString(),
      user: "You",
    };

    const existingPosts = JSON.parse(
      localStorage.getItem("sunsetPosts") || "[]",
    );
    localStorage.setItem(
      "sunsetPosts",
      JSON.stringify([sunsetPost, ...existingPosts]),
    );

    setIsUploading(false);
    setCapturedImage(null);
    setCaption("");
    setRating(0);

    // Show success message
    alert("Sunset shared with the community! 🌅");
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
            <h1 className="text-xl font-bold text-gray-900">Capture Sunset</h1>
            <p className="text-sm text-gray-600">Share your sunset moment</p>
          </div>
        </div>

        {/* Camera/Upload Section */}
        {!capturedImage ? (
          <Card className="h-64 bg-gradient-to-br from-orange-100 to-pink-100">
            <CardContent className="h-full flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 mb-4 text-orange-500" />
              <h3 className="font-medium mb-2">Capture the moment</h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Take a photo or upload from your gallery
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured sunset"
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Sunset Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Current Location
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sunset Time</span>
              <span className="text-sm font-medium">7:30 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weather</span>
              <Badge variant="secondary">Clear Skies</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Share Form */}
        {capturedImage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rate this sunset
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Caption
                </label>
                <Textarea
                  placeholder="Describe this beautiful sunset..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Share Button */}
              <Button
                onClick={handleShare}
                disabled={isUploading || rating === 0}
                className="w-full flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share with Community
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Streak Info */}
        <Card className="bg-gradient-to-r from-orange-400 to-pink-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sunset Streak</h3>
                <p className="text-sm opacity-90">
                  Keep capturing daily sunsets!
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">7</div>
                <div className="text-xs opacity-90">days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
