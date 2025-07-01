"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sun,
  Flame,
  MapPin,
  Bell,
  Clock,
  Moon,
  Sunrise,
  Navigation,
  Camera,
  Star,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InstallPrompt from "@/components/install-prompt";
import UserProfile from "@/components/user-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SunsetData {
  sunset: string;
  goldenHour: string;
  blueHour: string;
  visibility: string;
}

interface Location {
  name: string;
  distance: string;
  rating: number;
  reviews: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sunsetData, setSunsetData] = useState<SunsetData | null>(null);
  const [currentLocation, setCurrentLocation] = useState("Getting location...");
  const [streak, setStreak] = useState(0);
  const [totalSunsets, setTotalSunsets] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const [nearbySpots] = useState<Location[]>([
    { name: "Sunset Beach", distance: "0.8 mi", rating: 4.8, reviews: 124 },
    { name: "Hilltop Park", distance: "1.2 mi", rating: 4.6, reviews: 89 },
    { name: "Ocean Pier", distance: "2.1 mi", rating: 4.9, reviews: 203 },
  ]);

  // Geo + sunset times
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          const { latitude, longitude } = position.coords;
          setCurrentLocation(
            `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`,
          );

          const now = new Date();
          const sunset = new Date(now);
          sunset.setHours(19, 30, 0); // mock time — ideally replace with actual API call

          const goldenHour = new Date(sunset);
          goldenHour.setMinutes(sunset.getMinutes() - 60);

          const blueHour = new Date(sunset);
          blueHour.setMinutes(sunset.getMinutes() + 30);

          setSunsetData({
            sunset: sunset.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            goldenHour: goldenHour.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            blueHour: blueHour.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            visibility: "Excellent",
          });
        },
        () => setCurrentLocation("Location unavailable"),
      );
    }

    if ("Notification" in window) Notification.requestPermission();
  }, []);

  // Fetch streak & sunset count
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setStreak(data.streak || 0);
        setTotalSunsets(data.totalSunsets || 0);
      } catch (e) {
        console.error("Failed to fetch user stats", e);
      }
    };

    if (status === "authenticated") {
      fetchUserStats();
    }
  }, [status]);

  const scheduleNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      setTimeout(() => {
        new Notification("🌇 Sunset Alert!", {
          body: "Sunset visible in 45 mins. Time to head out!",
          icon: "/icon-192x192.png",
        });
      }, 1000); // demo
    }
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">sunseek</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {currentLocation}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {streak} day streak
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={session?.user?.image || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {session?.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/auth" })}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sunset Info */}
        <Card className="bg-gradient-to-r from-orange-400 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Today's Golden Hour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sunsetData ? (
              <>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Sunrise className="mx-auto mb-1" />
                    <p className="text-xs">Golden Hour</p>
                    <p className="font-semibold">{sunsetData.goldenHour}</p>
                  </div>
                  <div>
                    <Sun className="mx-auto mb-1" />
                    <p className="text-xs">Sunset</p>
                    <p className="font-semibold">{sunsetData.sunset}</p>
                  </div>
                  <div>
                    <Moon className="mx-auto mb-1" />
                    <p className="text-xs">Blue Hour</p>
                    <p className="font-semibold">{sunsetData.blueHour}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Visibility: {sunsetData.visibility}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={scheduleNotification}
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    Notify Me
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Loading sunset data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/map">
            <Button className="w-full h-16 flex flex-col items-center gap-1">
              <Navigation className="w-5 h-5" />
              <span className="text-xs">Find Spots</span>
            </Button>
          </Link>
          <Link href="/camera">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-1"
            >
              <Camera className="w-5 h-5" />
              <span className="text-xs">Capture</span>
            </Button>
          </Link>
        </div>

        {/* Nearby Spots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nearby Sunset Spots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbySpots.map((spot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{spot.name}</h3>
                  <p className="text-sm text-gray-600">{spot.distance} away</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{spot.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {spot.reviews} reviews
                  </p>
                </div>
              </div>
            ))}
            <Link href="/map">
              <Button variant="outline" className="w-full bg-transparent">
                View All Spots
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Community Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sunset Lover's Network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Mock activity */}
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>John</strong> shared a sunset at Hilltop Park
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <Link href="/social">
              <Button variant="outline" className="w-full bg-transparent">
                View Community Feed
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-md mx-auto flex justify-around">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 text-orange-500"
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link
              href="/map"
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Map</span>
            </Link>
            <Link
              href="/camera"
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <Camera className="w-5 h-5" />
              <span className="text-xs">Camera</span>
            </Link>
            <Link
              href="/social"
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <Star className="w-5 h-5" />
              <span className="text-xs">Social</span>
            </Link>
          </div>
        </div>

        <InstallPrompt />
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      </div>
    </div>
  );
}
