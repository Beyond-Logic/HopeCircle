"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <Link href="/feed" className="flex items-center space-x-2 mb-6">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
          <Heart className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-2xl animate-pulse">HopeCircle</span>
      </Link>

      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
}
