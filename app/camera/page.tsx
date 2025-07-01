"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Share2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function CameraPage() {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasPostedToday, setHasPostedToday] = useState(false);
  const [isStreakLoaded, setIsStreakLoaded] = useState(false); // Add loading state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch streak data on component mount
  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const response = await fetch("/api/streak/status");
        const data = await response.json();
        setCurrentStreak(data.currentStreak || 0);
        setHasPostedToday(data.loggedToday || false);
      } catch (error) {
        console.error("Failed to fetch streak data:", error);
      } finally {
        setIsStreakLoaded(true); // Mark as loaded regardless of success/failure
      }
    };
    fetchStreakData();
  }, []);

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
    if (!capturedImage || rating === 0) return;

    setIsUploading(true);
    try {
      // 1. Convert base64 image to File
      const imageBlob = await fetch(capturedImage).then((res) => res.blob());
      const file = new File([imageBlob], "sunset.jpg", {
        type: imageBlob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      // 2. Upload the image
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Image upload failed");
      const { url: imageUrl } = await uploadResponse.json(); // Vercel Blob returns { url }

      // 3. Create the sunset post
      const postResponse = await fetch("/api/sunsets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          caption,
          rating,
          location: "Current Location",
        }),
      });

      if (!postResponse.ok) throw new Error("Failed to create post");

      // 4. Increment streak
      if (!hasPostedToday) {
        const streakResponse = await fetch("/api/streak/increment", {
          method: "POST",
        });
        const streakData = await streakResponse.json();
        setCurrentStreak(streakData.count);
        setHasPostedToday(true);
      }

      toast.success("Sunset shared with the community! 🌅");
      router.push("/social");
    } catch (error) {
      console.error("Error sharing sunset:", error);
      toast.error("Failed to share sunset. Please try again.");
    } finally {
      setIsUploading(false);
    }
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
              <Image
                src={capturedImage}
                alt="Captured sunset"
                width={400}
                height={256}
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
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
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

        {/* Streak Card - Only render after data is loaded */}
        {isStreakLoaded && (
          <Card className="bg-gradient-to-r from-orange-400 to-pink-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Sunset Streak</h3>
                  <p className="text-sm opacity-90">
                    {hasPostedToday
                      ? "You've logged today's sunset!"
                      : "Capture today's sunset to keep your streak!"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{currentStreak}</div>
                  <div className="text-xs opacity-90">
                    {currentStreak === 1 ? "day" : "days"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
