import BackButton from "@/components/BackButton";

export default function CookiePolicyPage() {
  const updated = new Date().toLocaleDateString();

  return (
    <main className="bg-(--background) min-h-dvh">
      <header className="p-4 mb-2 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Cookie Policy
          </h1>
          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      <section className="w-11/12 mx-auto max-w-3xl pb-16">
        <div className="rounded-sm border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-sm text-black/55">Last updated: {updated}</p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            1. What Are Cookies?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            Cookies are small text files stored by your browser. We may also use
            similar technologies like local storage to remember preferences.
          </p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            2. How We Use Cookies
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-black/70 space-y-2">
            <li>
              <span className="font-medium text-black/80">Essential:</span>{" "}
              required for core functionality (e.g., remembering consent
              choices).
            </li>
            <li>
              <span className="font-medium text-black/80">Analytics (optional):</span>{" "}
              helps us understand usage to improve the Service.
            </li>
            <li>
              <span className="font-medium text-black/80">Marketing (optional):</span>{" "}
              used to personalize ads and measure campaigns (if enabled).
            </li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            3. Managing Your Preferences
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            If the Service shows a cookie banner, you can accept, reject, or
            manage optional categories. You can also delete cookies and local
            storage through your browser settings at any time.
          </p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            4. OpenAI Notice (Not a Cookie)
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            When you submit text for translation, the text and request settings
            are sent to OpenAI for processing to generate translations. This is
            separate from cookie usage and is described in the Privacy Policy.
          </p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            5. Contact
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            For questions about this Cookie Policy, contact the site owner.
          </p>
        </div>
      </section>
    </main>
  );
}