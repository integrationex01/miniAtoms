"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function PendingPromptRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const pending = sessionStorage.getItem("pendingPrompt");
    if (!pending) return;

    sessionStorage.removeItem("pendingPrompt");
    router.push(`/builder?prompt=${encodeURIComponent(pending)}`);
  }, [isLoaded, isSignedIn, router]);

  return null;
}
