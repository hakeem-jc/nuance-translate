"use client";

import { useEffect, useState } from "react";

type CookieChoice = "accepted" | "rejected" | "custom";

const STORAGE_KEY = "cookie_consent_v1";

export default function CookiePopup() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!saved) setOpen(true);
  }, []);

  function saveChoice(choice: CookieChoice, preferences?: Record<string, boolean>) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        choice,
        preferences: preferences ?? null,
        ts: Date.now(),
      })
    );
    setOpen(false);
    setShowPrefs(false);
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-5 left-5 z-70 w-[min(520px,calc(100%-2.5rem))]">
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Cookie preferences"
        className="rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
      >
        <div className="p-5 sm:p-6">
          <h2 className="text-[20px] font-semibold tracking-tight text-zinc-900">
            How about some cookies? 🍪
          </h2>

          <p className="mt-2 text-[14px] leading-relaxed text-zinc-600">
            I use cookies for essential website functions and to better understand how you use the app, so I can create the best possible experience for you{" "}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowPrefs((v) => !v)}
              className="h-10 rounded-3xl cursor-pointer bg-zinc-100 px-4 text-[14px] font-medium text-zinc-800 hover:bg-zinc-200 focus:outline-none"
            >
              Manage preferences
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => saveChoice("rejected")}
                className="h-10 rounded-3xl cursor-pointer bg-white px-4 text-[14px] font-medium text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                Reject all
              </button>

              <button
                type="button"
                onClick={() => saveChoice("accepted")}
                className="h-10 rounded-3xl cursor-pointer bg-(--foreground) px-4 text-[14px] font-semibold text-white shadow-sm hover:bg-(--accent) focus:outline-none"
              >
                Accept all
              </button>
            </div>
          </div>

          {showPrefs && (
            <div className="mt-4 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <p className="text-[13px] font-semibold text-zinc-900">Cookie categories</p>

              <div className="mt-3 space-y-3">
                <ToggleRow label="Essential" description="Required for core functionality." locked defaultChecked />
                <ToggleRow label="Analytics" description="Helps us improve by understanding usage." />
                <ToggleRow label="Marketing" description="Used to personalize ads and measure campaigns." />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrefs(false)}
                  className="h-9 rounded-3xl cursor-pointer bg-white px-4 text-[13px] font-medium text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveChoice("custom", {
                      essential: true,
                      analytics:
                        (document.getElementById("cookie-analytics") as HTMLInputElement | null)?.checked ?? false,
                      marketing:
                        (document.getElementById("cookie-marketing") as HTMLInputElement | null)?.checked ?? false,
                    })
                  }
                  className="h-9 rounded-3xl cursor-pointer bg-(--foreground) px-4 text-[13px] font-semibold text-white hover:bg-(--accent)"
                >
                  Save preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  locked = false,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  locked?: boolean;
  defaultChecked?: boolean;
}) {
  const id =
    label.toLowerCase() === "analytics"
      ? "cookie-analytics"
      : label.toLowerCase() === "marketing"
      ? "cookie-marketing"
      : "cookie-essential";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="pr-2">
        <p className="text-[13px] font-semibold text-zinc-900">{label}</p>
        <p className="mt-1 text-[13px] leading-snug text-zinc-600">{description}</p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          defaultChecked={defaultChecked}
          disabled={locked}
        />
        <span
          className={[
            "relative h-5 w-9 rounded-full transition",
            "bg-zinc-300 peer-checked:bg-(--foreground)",
            "peer-disabled:opacity-60 peer-disabled:cursor-not-allowed",
            "after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition",
            "peer-checked:after:translate-x-4",
          ].join(" ")}
        />
      </label>
    </div>
  );
}