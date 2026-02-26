"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="h-12 w-12 cursor-pointer rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center"
      aria-label="Back"
      type="button"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-5 w-5 text-black/80" />
    </button>
  );
}