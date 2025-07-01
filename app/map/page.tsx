"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Star,
  Navigation,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface SunsetSpot {
  id: number;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  description: string;
  tags: string[];
  coordinates: { lat: number; lng: number };
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [spots] = useState<SunsetSpot[]>([
    {
      id: 1,
      name: "Sunset Beach",
      distance: "0.8 mi",
      rating: 4.8,
      reviews: 124,
      description: "Popular beach with unobstructed ocean views",
      tags: ["Beach", "Ocean", "Popular"],
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    {
      id: 2,
      name: "Hilltop Park",
      distance: "1.2 mi",
      rating: 4.6,
      reviews: 89,
      description: "Elevated park with panoramic city views",
      tags: ["Park", "City View", "Hiking"],
      coordinates: { lat: 37.7849, lng: -122.4094 },
    },
    {
      id: 3,
      name: "Ocean Pier",
      distance: "2.1 mi",
      rating: 4.9,
      reviews: 203,
      description: "Historic pier extending into the ocean",
      tags: ["Pier", "Historic", "Ocean"],
      coordinates: { lat: 37.7649, lng: -122.4294 },
    },
    {
      id: 4,
      name: "Mountain Lookout",
      distance: "3.5 mi",
      rating: 4.7,
      reviews: 156,
      description: "Scenic mountain viewpoint accessible by car",
      tags: ["Mountain", "Scenic", "Drive"],
      coordinates: { lat: 37.7949, lng: -122.3994 },
    },
  ]);

  const filteredSpots = spots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

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
            <h1 className="text-xl font-bold text-gray-900">Sunset Spots</h1>
            <p className="text-sm text-gray-600">
              Find the perfect viewing location
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search spots or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Map Placeholder */}
        <Card className="h-48 bg-gradient-to-br from-blue-100 to-green-100">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Interactive map view</p>
              <p className="text-xs text-gray-500">
                Showing {filteredSpots.length} nearby spots
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spots List */}
        <div className="space-y-3">
          {filteredSpots.map((spot) => (
            <Card key={spot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{spot.name}</h3>
                    <p className="text-sm text-gray-600">{spot.description}</p>
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

                <div className="flex flex-wrap gap-1 mb-3">
                  {spot.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {spot.distance}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Directions
                    </Button>
                    <Button size="sm">Check In</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Spot */}
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <h3 className="font-medium mb-1">Know a great sunset spot?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Help the community by adding new locations
            </p>
            <Button variant="outline">Add New Spot</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
