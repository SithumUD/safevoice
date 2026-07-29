import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — SafeVoice",
  description: "Learn how SafeVoice collects, protects, and handles your personal data and thread-scoped anonymity.",
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: July 29, 2026 • Effective Date: July 29, 2026</p>
        </div>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">1. Introduction</h2>
          <p>
            Welcome to SafeVoice (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). SafeVoice is a privacy-first civic discussion and polling platform designed to allow citizens to engage in public discourse, share civic feedback, and participate in community polls safely.
          </p>
          <p>
            Your privacy is our core priority. This Privacy Policy explains what information we collect, how we protect your identity through thread-scoped anonymization, and your rights regarding your personal data.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">2. Thread-Scoped Anonymity Mechanism</h2>
          <p>
            SafeVoice utilizes a proprietary **Thread-Scoped Anonymization Engine**. When you post a topic or comment anonymously:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li>Your account identity is masked from all public feeds, API responses, and database projections.</li>
            <li>A cryptographically hashed, thread-scoped alias is generated per discussion thread. This ensures you maintain a consistent alias (e.g., &quot;Citizen #42&quot;) within a specific discussion without linking your activity across different threads.</li>
            <li>System administrators and moderators cannot view your real name or email address alongside your anonymous posts during standard community moderation.</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">3. Information We Collect</h2>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">a. Account &amp; Auth Information</h3>
            <p className="text-slate-400">When you register an account, we store your email address, hashed password (using BCrypt salted encryption), and chosen display nickname.</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">b. User Generated Content &amp; Media</h3>
            <p className="text-slate-400">Topics, comments, poll responses, and media attachments (images and short videos uploaded securely via Cloudinary) created on the platform.</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">c. Technical Telemetry &amp; Device Tokens</h3>
            <p className="text-slate-400">We store push notification tokens (Firebase Cloud Messaging) when you opt in to receive activity notifications on your device. Technical audit logs record IP addresses only for security rate-limiting and preventing automated abuse.</p>
          </div>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">4. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li>To authenticate your sessions and maintain secure access to your account.</li>
            <li>To deliver real-time poll results and targeted notification alerts.</li>
            <li>To enforce community safety guidelines and prevent spam, hate speech, or harassment through our moderation queue.</li>
            <li>To aggregate civic analytics and display trending community topics.</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">5. Data Retention &amp; Deletion Rights</h2>
          <p>
            You have the right to request deletion of your account and personal data at any time. Upon account deletion:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li>Your account credentials, email address, and profile data are permanently removed.</li>
            <li>Your published topics and comments are unlinked from your account (`ON DELETE SET NULL`), preserving community discussion context while completely disassociating them from your identity.</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-white tracking-tight pt-4 border-t border-slate-800">6. Contact Us</h2>
          <p>
            If you have questions or concerns regarding this Privacy Policy or wish to exercise your data rights, please contact our Data Protection Officer at:
          </p>
          <p className="font-mono text-rose-400 bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 w-fit">
            privacy@safevoice.lk
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
