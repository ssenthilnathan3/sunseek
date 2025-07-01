"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, Camera, MapPin, Star, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
  streak: number;
  totalSunsets: number;
}

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Auth error:", error);
        signOut({ callbackUrl: "/auth" }); // force logout on failure
      }
    };

    fetchUser();
  }, []);

  if (!user) return null;

  const joinDate = new Date(user.joinedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Member since {joinDate}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Camera className="mx-auto mb-1 w-4 h-4 text-orange-500" />
              <div className="text-lg font-bold text-orange-600">
                {user.totalSunsets}
              </div>
              <div className="text-xs text-gray-600">Sunsets</div>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg">
              <Calendar className="mx-auto mb-1 w-4 h-4 text-pink-500" />
              <div className="text-lg font-bold text-pink-600">
                {user.streak}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Star className="mx-auto mb-1 w-4 h-4 text-purple-500" />
              <div className="text-lg font-bold text-purple-600">4.8</div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="font-semibold mb-2">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                🔥 Week Streak
              </Badge>
              <Badge variant="secondary" className="text-xs">
                📸 First Sunset
              </Badge>
              <Badge variant="secondary" className="text-xs">
                🌟 Community Member
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings & Preferences
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <MapPin className="w-4 h-4 mr-2" />
              My Favorite Spots
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
