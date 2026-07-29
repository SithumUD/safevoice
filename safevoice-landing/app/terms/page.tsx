import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — SafeVoice",
  description: "Read the Terms of Service and acceptable use policies for using the SafeVoice platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-rose-500" />
            <span className="font-bold text-white tracking-tight">SafeVoice</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: July 29, 2026 • Effective Date: July 29, 2026</p>
        </div>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the SafeVoice mobile application, website, or associated APIs (&quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Services.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">2. Community Standards &amp; Prohibited Conduct</h2>
          <p>
            SafeVoice is dedicated to fostering constructive, respectful civic dialogue. You agree NOT to post, upload, or transmit any content that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li>Promotes hate speech, violence, discrimination, or harassment against individuals or groups based on race, religion, ethnicity, gender, or disability.</li>
            <li>Contains false misinformation intended to cause public panic, civic disruption, or harm.</li>
            <li>Includes unauthorized personal identifiable information (&quot;doxxing&quot;) or violates individual privacy.</li>
            <li>Contains explicit sexual material, illegal activity, or commercial spam.</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">3. Moderation &amp; Enforcement</h2>
          <p>
            SafeVoice employs community reporting mechanisms and automated moderation tools. Content violating our Community Standards may be flagged, hidden, or deleted. Repeated violations may result in account suspension or permanent banning by platform administrators.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">4. Intellectual Property &amp; Content Ownership</h2>
          <p>
            You retain ownership of the original text and media content you submit to SafeVoice. By posting on SafeVoice, you grant us a non-exclusive, worldwide, royalty-free license to host, display, format, and distribute your content across our platform.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">5. Limitation of Liability</h2>
          <p>
            SafeVoice is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. SafeVoice disclaims all warranties of any kind. SafeVoice shall not be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the platform.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">6. Governing Law &amp; Contact</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Sri Lanka. For legal inquiries or terms enforcement questions, contact:
          </p>
          <p className="font-mono text-rose-400 bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 w-fit">
            legal@safevoice.lk
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} SafeVoice Platform. All rights reserved.
      </footer>
    </div>
  );
}
