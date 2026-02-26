import BackButton from "@/components/BackButton";

export default function PrivacyPolicyPage() {
  const updated = new Date().toLocaleDateString();

  return (
    <main className="bg-(--background) min-h-dvh">
      <header className="p-4 mb-2 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Privacy Policy
          </h1>
          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      <section className="w-11/12 mx-auto max-w-3xl pb-16">
        <div className="rounded-sm border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-sm text-black/55">Last updated: {updated}</p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            1. What We Collect
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-black/70 space-y-2">
            <li>
              <span className="font-medium text-black/80">Translation input:</span>{" "}
              text you submit for translation and selected options (language,
              dialect, tone, plurality, gender).
            </li>
            <li>
              <span className="font-medium text-black/80">Basic technical data:</span>{" "}
              standard logs that may include device/browser info and IP address
              (to operate and secure the Service).
            </li>
            <li>
              <span className="font-medium text-black/80">Local preferences (optional):</span>{" "}
              if enabled in the app, we may store non-sensitive preferences on
              your device (e.g., recent selections) using local storage.
            </li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            2. OpenAI Data Sharing Notice
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            To provide translations, your input text and request settings are
            shared with and processed by OpenAI. OpenAI acts as a service
            provider for generating the translation output. Do not submit
            sensitive personal data (e.g., financial, medical, passwords) or
            confidential information.
          </p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            3. How We Use Data
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-black/70 space-y-2">
            <li>To generate translations and display results.</li>
            <li>To maintain, secure, and troubleshoot the Service.</li>
            <li>
              To improve the Service (for example, understanding aggregate usage
              patterns), if analytics are enabled.
            </li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            4. Data Retention
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            Translation inputs and outputs may be processed transiently to
            provide the Service. If we store any server logs, we retain them
            only as long as necessary for security and operational purposes.
            Data stored in local storage remains on your device unless you clear
            it.
          </p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            5. Cookies and Local Storage
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            We may use cookies or local storage for essential functionality and,
            if enabled, analytics. See the Cookie Policy for details and
            controls.
          </p>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            6. Your Choices
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-black/70 space-y-2">
            <li>Do not submit sensitive or confidential content.</li>
            <li>
              You can clear cookies/local storage in your browser settings.
            </li>
            <li>
              If a cookie banner is shown, you can manage analytics/marketing
              preferences there.
            </li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            7. Contact
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            For privacy questions, contact the site owner.
          </p>
        </div>
      </section>
    </main>
  );
}