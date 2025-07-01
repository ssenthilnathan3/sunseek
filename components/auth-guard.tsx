"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sun } from "lucide-react";
import type React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    if (status === "loading") return;

    const isAuthenticated = !!session;

    if (!isAuthenticated && !isAuthPage) {
      router.push("/auth");
    } else if (isAuthenticated && isAuthPage) {
      router.push("/");
    }
  }, [status, session, pathname, router, isAuthPage]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Sun className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Sunset Companion
          </h1>
          <p className="text-orange-100">Loading your sunset journey...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
