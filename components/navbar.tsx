"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border-b border-white/20" />

      <div className="relative flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            miniAtoms
          </span>
        </Link>

        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Projects
            </Link>
            <UserButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors cursor-pointer">
                Get started
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </nav>
  );
}
