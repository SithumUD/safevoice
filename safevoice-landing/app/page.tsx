"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [counters, setCounters] = useState({ members: 0, discussions: 0, reactions: 0, rating: 0 });
  const [countersStarted, setCountersStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Counter animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const duration = 2000;
          const steps = 60;
          const targets = { members: 50000, discussions: 200000, reactions: 2000000, rating: 48 };
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3);
            setCounters({
              members: Math.floor(targets.members * ease),
              discussions: Math.floor(targets.discussions * ease),
              reactions: Math.floor(targets.reactions * ease),
              rating: Math.floor(targets.rating * ease),
            });
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersStarted]);

  const formatCounter = (key: string, val: number) => {
    if (key === "rating") return (val / 10).toFixed(1) + "★";
    if (key === "reactions") return (val / 1000000).toFixed(1) + "M+";
    if (key === "discussions") return (val / 1000).toFixed(0) + "K+";
    return (val / 1000).toFixed(0) + "K+";
  };

  const appFeatures = [
    {
      tab: "Discover",
      icon: "🔥",
      title: "What's Buzzing Right Now",
      desc: "Real-time trending algorithm surfaces the most discussed topics across Sri Lanka — from Colombo traffic to national policy debates.",
      points: ["Live trending scores updated every 5 minutes", "Filter by city, topic, or language", "Personalized feed based on your interests"],
      color: "#EF9F27",
      bg: "#FFF8EC",
    },
    {
      tab: "Discuss",
      icon: "💬",
      title: "Deep Threaded Conversations",
      desc: "Follow every angle of a debate with nested replies, reactions, and quote-threads. Never lose track of any part of the conversation.",
      points: ["Unlimited nesting depth", "Quote and respond to specific comments", "Markdown support for formatting"],
      color: "#D85A30",
      bg: "#FAECE7",
    },
    {
      tab: "Vote",
      icon: "🗳️",
      title: "Community Polls & Decisions",
      desc: "Create polls on anything that matters. See live breakdowns by region, age group, and more after you vote.",
      points: ["Real-time vote counting", "Demographic breakdowns", "Share results to social media"],
      color: "#0F6E56",
      bg: "#E1F5EE",
    },
    {
      tab: "Stay Safe",
      icon: "🛡️",
      title: "Privacy-First by Design",
      desc: "Multiple layers of anonymity with end-to-end encryption on private threads. Your data never gets sold.",
      points: ["Zero personal data required to sign up", "Full anonymous posting mode", "End-to-end encrypted private threads"],
      color: "#378ADD",
      bg: "#E8F3FF",
    },
  ];

  const faqs = [
    { q: "Is SafeVoice really anonymous?", a: "Yes. We use token-based anonymization — your identity is never stored alongside your posts. Even our team cannot link your account to your posts in anonymous mode." },
    { q: "Does SafeVoice support Sinhala and Tamil?", a: "Absolutely. The app has full Unicode support for both Sinhala and Tamil scripts, with keyboard switching built into the post editor." },
    { q: "How do you handle harmful content?", a: "We use a combination of AI moderation and a community reporting system. Posts are reviewed against our Community Guidelines within 24 hours of a report." },
    { q: "Is the app free to use?", a: "SafeVoice is completely free to download and use. We have no ads and no paywalls — our mission is open community conversation." },
    { q: "Which devices are supported?", a: "SafeVoice runs on iOS 14+ and Android 8+. A web app is coming soon." },
  ];

  return (
    <>
      {/* ─── SEO HEAD ─── */}
      <Head>
        <title>SafeVoice — Sri Lanka's Open Community Forum | Speak Freely, Stay Safe</title>
        <meta name="description" content="SafeVoice is Sri Lanka's free community forum for anonymous discussions, trending topics, community polls, and open conversations in Sinhala and English. Download now for iOS and Android." />
        <meta name="keywords" content="SafeVoice, Sri Lanka forum, anonymous forum Sri Lanka, community app Sri Lanka, Sinhala forum, trending topics Lanka, discussion app, safe voice Lanka" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="SafeVoice" />
        <link rel="canonical" href="https://safevoice.lk/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://safevoice.lk/" />
        <meta property="og:title" content="SafeVoice — Sri Lanka's Open Community Forum" />
        <meta property="og:description" content="Speak freely, stay safe, be heard. Sri Lanka's community forum for anonymous discussions, polls, and trending topics." />
        <meta property="og:image" content="https://safevoice.lk/og-image.png" />
        <meta property="og:locale" content="en_LK" />
        <meta property="og:site_name" content="SafeVoice" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@safevoicelk" />
        <meta name="twitter:title" content="SafeVoice — Sri Lanka's Open Community Forum" />
        <meta name="twitter:description" content="Speak freely, stay safe, be heard. Download now for iOS & Android." />
        <meta name="twitter:image" content="https://safevoice.lk/og-image.png" />

        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          "name": "SafeVoice",
          "description": "Sri Lanka's community forum for anonymous discussions, trending topics, and polls.",
          "operatingSystem": "iOS, Android",
          "applicationCategory": "SocialNetworkingApplication",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "LKR" },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "12400" },
          "url": "https://safevoice.lk"
        })}} />
      </Head>

      <div
        className="safevoice-root"
        style={{
          "--coral": "#D85A30",
          "--coral-dark": "#993C1D",
          "--coral-light": "#FAECE7",
          "--teal": "#0F6E56",
          "--teal-dark": "#085041",
          "--teal-light": "#E1F5EE",
          "--amber": "#EF9F27",
          "--green": "#639922",
          "--red": "#E24B4A",
          "--blue": "#378ADD",
          "--bg": "#FFFFFF",
          "--bg-2": "#F1EFE8",
          "--bg-3": "#EDEAE0",
          "--text-primary": "#2C2C2A",
          "--text-secondary": "#5F5E5A",
          "--text-tertiary": "#888780",
          fontFamily: "'Inter', 'Noto Sans Sinhala', system-ui, -apple-system, sans-serif",
          backgroundColor: "var(--bg)",
          color: "var(--text-primary)",
          minHeight: "100vh",
        } as React.CSSProperties}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;600;700&display=swap');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── CUSTOM SCROLLBAR ── */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: var(--bg-2); }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, var(--teal) 0%, var(--coral) 100%);
            border-radius: 100px;
            border: 2px solid var(--bg-2);
          }
          ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, var(--teal-dark) 0%, var(--coral-dark) 100%); }
          * { scrollbar-width: thin; scrollbar-color: var(--teal) var(--bg-2); }

          /* ── SMOOTH SCROLL ── */
          html { scroll-behavior: smooth; }

          /* ── SELECTION ── */
          ::selection { background: var(--teal-light); color: var(--teal-dark); }

          .nav-link {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
            letter-spacing: 0.01em;
          }
          .nav-link:hover { color: #fff; }

          .btn-primary {
            background: var(--coral);
            color: #fff;
            border: none;
            border-radius: 100px;
            padding: 12px 28px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
            letter-spacing: 0.01em;
          }
          .btn-primary:hover {
            background: var(--coral-dark);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(216,90,48,0.4);
          }

          .btn-outline {
            background: transparent;
            color: #fff;
            border: 2px solid rgba(255,255,255,0.4);
            border-radius: 100px;
            padding: 10px 26px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: border-color 0.2s, background 0.2s;
          }
          .btn-outline:hover {
            border-color: rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.08);
          }

          .store-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: var(--teal-dark);
            color: #fff;
            border-radius: 12px;
            padding: 12px 20px;
            text-decoration: none;
            transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
            border: 1.5px solid rgba(255,255,255,0.15);
          }
          .store-badge:hover {
            background: #063b30;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          }
          .store-badge-label { font-size: 0.7rem; opacity: 0.75; display: block; }
          .store-badge-name { font-size: 1rem; font-weight: 700; display: block; }

          .feature-card {
            background: #fff;
            border-radius: 20px;
            padding: 32px 28px;
            border: 1.5px solid #e8e5da;
            transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
            position: relative;
            overflow: hidden;
          }
          .feature-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--teal), var(--coral));
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s;
          }
          .feature-card:hover::before { transform: scaleX(1); }
          .feature-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 48px rgba(15,110,86,0.12);
            border-color: transparent;
          }

          .feature-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 18px;
            font-size: 1.4rem;
          }

          .phone-mock {
            width: 240px;
            height: 480px;
            background: var(--teal-dark);
            border-radius: 36px;
            border: 6px solid #063b30;
            position: relative;
            overflow: hidden;
            box-shadow: 0 30px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
          }
          .phone-notch {
            position: absolute;
            top: 10px; left: 50%;
            transform: translateX(-50%);
            width: 72px; height: 18px;
            background: #063b30;
            border-radius: 10px;
            z-index: 10;
          }

          .thread-item {
            background: rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 10px 12px;
            margin-bottom: 8px;
            border: 1px solid rgba(255,255,255,0.08);
            transition: background 0.2s;
          }
          .thread-item:hover { background: rgba(255,255,255,0.11); }

          .trending-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(239,159,39,0.2);
            color: var(--amber);
            border-radius: 100px;
            padding: 2px 8px;
            font-size: 0.65rem;
            font-weight: 600;
          }

          .anon-tag {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            background: rgba(55,138,221,0.15);
            color: var(--blue);
            border-radius: 100px;
            padding: 2px 7px;
            font-size: 0.6rem;
            font-weight: 600;
          }

          .testimonial-card {
            background: #fff;
            border-radius: 20px;
            padding: 28px;
            border: 1.5px solid #e8e5da;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .testimonial-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 36px rgba(15,110,86,0.1);
          }

          .section-eyebrow {
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--coral);
            margin-bottom: 12px;
          }

          .stat-card {
            background: #fff;
            border-radius: 20px;
            padding: 28px 24px;
            border: 1.5px solid #e8e5da;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
            flex: 1;
            min-width: 160px;
          }
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 36px rgba(15,110,86,0.1);
          }

          .how-step {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 24px;
            background: rgba(255,255,255,0.06);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.08);
            transition: background 0.2s;
          }
          .how-step:hover { background: rgba(255,255,255,0.10); }

          .tab-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 10px 18px;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s;
            white-space: nowrap;
          }
          .tab-btn.active {
            background: var(--teal-dark);
            color: #fff;
          }
          .tab-btn:not(.active) {
            color: var(--text-secondary);
          }
          .tab-btn:not(.active):hover { background: var(--bg-3); }

          .faq-item {
            border: 1.5px solid #e8e5da;
            border-radius: 16px;
            overflow: hidden;
            transition: border-color 0.2s;
          }
          .faq-item.open { border-color: var(--teal); }
          .faq-btn {
            width: 100%;
            background: #fff;
            border: none;
            cursor: pointer;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-align: left;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
            gap: 16px;
            transition: background 0.2s;
          }
          .faq-btn:hover { background: var(--bg-2); }
          .faq-chevron {
            width: 24px; height: 24px;
            border-radius: 50%;
            background: var(--teal-light);
            color: var(--teal);
            display: flex; align-items: center; justify-content: center;
            font-size: 0.75rem;
            flex-shrink: 0;
            transition: transform 0.3s, background 0.2s;
          }
          .faq-item.open .faq-chevron { transform: rotate(180deg); background: var(--teal); color: #fff; }
          .faq-body {
            padding: 0 24px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.35s ease, padding 0.35s ease;
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.7;
            background: #fff;
          }
          .faq-item.open .faq-body { max-height: 200px; padding: 0 24px 20px; }

          .lang-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-2);
            border: 1px solid var(--bg-3);
            border-radius: 100px;
            padding: 6px 14px;
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--text-secondary);
            transition: all 0.2s;
          }
          .lang-pill:hover { background: var(--teal-light); color: var(--teal-dark); border-color: var(--teal-light); }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(2deg); }
            50% { transform: translateY(-14px) rotate(2deg); }
          }
          .phone-float { animation: float 5s ease-in-out infinite; }

          @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .thread-scroll { animation: scroll-up 14s linear infinite; }

          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .pulse-dot {
            position: relative;
            width: 10px; height: 10px;
            background: var(--green);
            border-radius: 50%;
          }
          .pulse-dot::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: var(--green);
            animation: pulse-ring 1.8s ease-out infinite;
          }

          @keyframes fade-up {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-up { animation: fade-up 0.6s ease forwards; }

          .gradient-text {
            background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .hero-diagonal { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }

          @media (max-width: 768px) {
            .nav-desktop { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
            .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
            .hero-phones { display: none !important; }
            .features-grid { grid-template-columns: 1fr !important; }
            .testimonials-grid { grid-template-columns: 1fr !important; }
            .store-badges { justify-content: center !important; }
            .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
            .footer-links { flex-direction: column !important; }
            .stats-row { flex-wrap: wrap !important; }
            .how-grid { grid-template-columns: 1fr !important; }
            .tab-scroll { overflow-x: auto; }
          }
          @media (max-width: 480px) {
            .hero-headline { font-size: 2.2rem !important; }
            .section-title { font-size: 1.8rem !important; }
          }
        `}</style>

        {/* ─── NAVBAR ─── */}
        <header
          role="banner"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            background: scrolled ? "rgba(8,80,65,0.98)" : "rgba(8,80,65,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
            transition: "all 0.3s",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" aria-label="SafeVoice Home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <img src="/logo.png" alt="SafeVoice" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} />
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>SafeVoice</span>
            </a>

            <nav className="nav-desktop" aria-label="Main navigation" style={{ display: "flex", alignItems: "center", gap: 36 }}>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#testimonials" className="nav-link">Community</a>
              <a href="#faq" className="nav-link">FAQ</a>
              <a href="#contact" className="nav-link">Contact</a>
            </nav>

            <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }}>
                <div className="pulse-dot" />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>50K+ online</span>
              </div>
              <a href="#download" className="btn-primary" style={{ padding: "9px 22px", fontSize: "0.87rem" }}>Download Free</a>
            </div>

            <button
              className="mobile-menu-btn"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "none", background: "transparent", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 4 }}
            >
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, transition: "0.3s" }} />
              ))}
            </button>
          </div>

          {menuOpen && (
            <div style={{ background: "var(--teal-dark)", padding: "16px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {["Features", "How It Works", "Community", "FAQ", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="nav-link"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {item}
                </a>
              ))}
              <a href="#download" className="btn-primary" style={{ marginTop: 16, textAlign: "center", width: "100%", display: "block" }}>Download Free</a>
            </div>
          )}
        </header>

        {/* ─── HERO ─── */}
        <main>
          <section
            aria-label="Hero"
            className="hero-diagonal"
            style={{
              background: `linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 55%, #1a8a6a 100%)`,
              paddingTop: 140, paddingBottom: 130,
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 40, left: -80, width: 200, height: 200, borderRadius: "50%", background: "rgba(216,90,48,0.12)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "40%", left: "35%", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.015)", pointerEvents: "none" }} />

            <div className="hero-grid" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: 60 }}>
              <div className="fade-up">
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,159,39,0.18)", border: "1px solid rgba(239,159,39,0.3)", borderRadius: 100, padding: "5px 14px", marginBottom: 24 }}>
                  <div className="pulse-dot" />
                  <span style={{ color: "var(--amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>NOW AVAILABLE · 50K+ MEMBERS</span>
                </div>

                <h1 className="hero-headline" style={{ fontSize: "3.1rem", fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.035em", color: "#fff", marginBottom: 20 }}>
                  Speak freely.<br />
                  <span style={{ color: "var(--coral)" }}>Stay safe.</span><br />
                  Be heard.
                </h1>

                <p style={{ fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.72)", marginBottom: 36, maxWidth: 420 }}>
                  Sri Lanka's community forum where your voice matters. Discuss, vote, discover — anonymously or not — in Sinhala, English, or Tamil.
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                  {["🔒 Anonymous posting", "🌐 Sinhala & Tamil", "🗳️ Live polls", "🔥 Trending feed"].map((f) => (
                    <span key={f} className="lang-pill">{f}</span>
                  ))}
                </div>

                <div className="store-badges" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <a href="#download" className="store-badge" aria-label="Download on App Store">
                    <span style={{ fontSize: "1.5rem" }}>🍎</span>
                    <div><span className="store-badge-label">Download on the</span><span className="store-badge-name">App Store</span></div>
                  </a>
                  <a href="#download" className="store-badge" aria-label="Get it on Google Play">
                    <span style={{ fontSize: "1.5rem" }}>▶️</span>
                    <div><span className="store-badge-label">Get it on</span><span className="store-badge-name">Google Play</span></div>
                  </a>
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginTop: 14 }}>Free forever · No ads · No data selling</p>
              </div>

              {/* Phone mockup */}
              <div className="hero-phones" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="phone-float">
                  <div className="phone-mock">
                    <div className="phone-notch" />
                    <div style={{ padding: "36px 14px 14px", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}>SafeVoice</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <div className="pulse-dot" style={{ width: 8, height: 8 }} />
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {["Trending", "Recent", "Polls"].map((t, i) => (
                          <span key={t} style={{ fontSize: "0.6rem", fontWeight: 600, padding: "4px 10px", borderRadius: 100, background: i === 0 ? "var(--coral)" : "rgba(255,255,255,0.08)", color: i === 0 ? "#fff" : "rgba(255,255,255,0.5)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                        <div className="thread-scroll">
                          {[
                            { title: "Traffic in Colombo is unbearable", category: "City Life", likes: 247, trending: true, anon: false },
                            { title: "Best local food spots in Galle?", category: "Food", likes: 89, trending: false, anon: true },
                            { title: "University fee hikes — your thoughts?", category: "Education", likes: 512, trending: true, anon: true },
                            { title: "Night photography spots in Kandy", category: "Photography", likes: 134, trending: false, anon: false },
                            { title: "Power cuts in Matara — updates?", category: "Infrastructure", likes: 318, trending: true, anon: false },
                            { title: "Traffic in Colombo is unbearable", category: "City Life", likes: 247, trending: true, anon: false },
                            { title: "Best local food spots in Galle?", category: "Food", likes: 89, trending: false, anon: true },
                            { title: "University fee hikes — your thoughts?", category: "Education", likes: 512, trending: true, anon: true },
                            { title: "Night photography spots in Kandy", category: "Photography", likes: 134, trending: false, anon: false },
                            { title: "Power cuts in Matara — updates?", category: "Infrastructure", likes: 318, trending: true, anon: false },
                          ].map((item, i) => (
                            <div key={i} className="thread-item">
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{item.category}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {item.trending && <span className="trending-badge">🔥 Hot</span>}
                                  {item.anon && <span className="anon-tag">👤 Anon</span>}
                                </div>
                              </div>
                              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.68rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>{item.title}</p>
                              <div style={{ display: "flex", gap: 10 }}>
                                <span style={{ fontSize: "0.6rem", color: "var(--green)" }}>👍 {item.likes}</span>
                                <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>💬 42</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── ANIMATED STATS ─── */}
          <div ref={statsRef} style={{ background: "var(--bg-2)", padding: "48px 24px", borderBottom: "1px solid var(--bg-3)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div className="stats-row" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                {[
                  { key: "members", label: "Community Members", icon: "👥", color: "var(--teal)" },
                  { key: "discussions", label: "Discussions Created", icon: "💬", color: "var(--coral)" },
                  { key: "reactions", label: "Reactions Shared", icon: "❤️", color: "var(--red)" },
                  { key: "rating", label: "App Store Rating", icon: "⭐", color: "var(--amber)" },
                ].map((s) => (
                  <div key={s.key} className="stat-card">
                    <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {formatCounter(s.key, (counters as any)[s.key])}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── FEATURES ─── */}
          <section id="features" aria-label="Features" style={{ padding: "100px 24px", background: "var(--bg-2)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <p className="section-eyebrow">Why SafeVoice?</p>
                <h2 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>Your community, your rules</h2>
                <p style={{ color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                  Built for Sri Lankans who want real conversations — without worrying about who's watching.
                </p>
              </div>

              <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {[
                  { icon: "👤", iconBg: "#E8F3FF", title: "Post Anonymously", desc: "Share sensitive opinions and personal stories without fear. Your identity stays hidden — only you know it's you.", accent: "var(--blue)" },
                  { icon: "🔥", iconBg: "#FFF4E0", title: "Trending Topics", desc: "Real-time trending algorithm surfaces what Sri Lanka is buzzing about — from local drama to national policy.", accent: "var(--amber)" },
                  { icon: "🗳️", iconBg: "#E9F5ED", title: "Community Polls", desc: "Vote on issues that matter. See regional and demographic breakdowns after you cast your vote.", accent: "var(--green)" },
                  { icon: "💬", iconBg: "#FAECE7", title: "Threaded Discussions", desc: "Follow every angle of a debate with deep nested replies. Quote specific comments and never lose the thread.", accent: "var(--coral)" },
                  { icon: "🔔", iconBg: "#E1F5EE", title: "Smart Notifications", desc: "Get notified when someone replies, when your post trends, or when a topic you follow heats up.", accent: "var(--teal)" },
                  { icon: "🇱🇰", iconBg: "#F1EFE8", title: "Built for Lanka", desc: "Full Sinhala and Tamil script support with a built-in keyboard switcher, because your language is your identity.", accent: "var(--text-secondary)" },
                  { icon: "🔐", iconBg: "#E8F3FF", title: "E2E Encrypted DMs", desc: "Private messages are end-to-end encrypted. Even we can't read them. Share sensitive info with total peace of mind.", accent: "var(--blue)" },
                  { icon: "📍", iconBg: "#E9F5ED", title: "Hyperlocal Feed", desc: "Filter discussions by district, city, or neighborhood. See what's happening right where you are.", accent: "var(--green)" },
                  { icon: "🌙", iconBg: "#F1EFE8", title: "Dark Mode", desc: "Easy on your eyes at night. Fully accessible with high-contrast mode and adjustable text sizes.", accent: "var(--text-secondary)" },
                ].map((f) => (
                  <article key={f.title} className="feature-card">
                    <div className="feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>{f.title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ─── APP SHOWCASE TABS ─── */}
          <section aria-label="App showcase" style={{ padding: "100px 24px", background: "#fff" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <p className="section-eyebrow">Deep Dive</p>
                <h2 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Everything you need, nothing you don't</h2>
              </div>

              {/* Tab bar */}
              <div className="tab-scroll" style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40, background: "var(--bg-2)", borderRadius: 100, padding: 6, width: "fit-content", margin: "0 auto 40px" }}>
                {appFeatures.map((f, i) => (
                  <button key={f.tab} className={`tab-btn${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>{f.icon} {f.tab}</button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
                <div>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: appFeatures[activeTab].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", marginBottom: 20 }}>
                    {appFeatures[activeTab].icon}
                  </div>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>{appFeatures[activeTab].title}</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 24, fontSize: "1rem" }}>{appFeatures[activeTab].desc}</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                    {appFeatures[activeTab].points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--teal-light)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0 }}>✓</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: "linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)", borderRadius: 24, padding: 32, minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: "5rem" }}>{appFeatures[activeTab].icon}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", textAlign: "center" }}>{appFeatures[activeTab].tab}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", textAlign: "center", maxWidth: 200 }}>{appFeatures[activeTab].desc.split(".")[0]}.</div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── HOW IT WORKS ─── */}
          <section
            id="how-it-works"
            aria-label="How it works"
            style={{ padding: "100px 24px", background: "var(--teal-dark)", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(216,90,48,0.08)", pointerEvents: "none" }} />
            <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <p className="section-eyebrow" style={{ color: "var(--amber)" }}>Get Started</p>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: 12 }}>Up and running in 60 seconds</h2>
                <p style={{ color: "rgba(255,255,255,0.55)", maxWidth: 400, margin: "0 auto" }}>No email needed. No real name needed. Just download and start talking.</p>
              </div>

              <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { step: "01", icon: "📲", title: "Download the app", desc: "Available free on iOS App Store and Google Play." },
                  { step: "02", icon: "🎭", title: "Create your persona", desc: "Pick a username — no email or phone number required." },
                  { step: "03", icon: "🔍", title: "Explore your feed", desc: "Browse trending topics, local discussions, and live polls." },
                  { step: "04", icon: "✍️", title: "Join the conversation", desc: "Post, vote, react, or reply — anonymously or publicly." },
                ].map((s) => (
                  <div key={s.step} className="how-step" style={{ flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--coral)", letterSpacing: "0.1em" }}>{s.step}</span>
                      <span style={{ fontSize: "1.8rem" }}>{s.icon}</span>
                    </div>
                    <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: 8 }}>{s.title}</h3>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 48 }}>
                <a href="#download" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }}>Get Started for Free</a>
              </div>
            </div>
          </section>

          {/* ─── TESTIMONIALS ─── */}
          <section id="testimonials" aria-label="Community testimonials" style={{ padding: "100px 24px", background: "var(--bg-2)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <p className="section-eyebrow">Community Love</p>
                <h2 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Heard from our community</h2>
              </div>

              <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {[
                  { quote: "Finally an app where I can talk about local issues without everyone knowing it's me. The anonymous posting is a game changer.", name: "Chamara P.", role: "University Student, Colombo", avatar: "🧑‍🎓", stars: 5 },
                  { quote: "I use SafeVoice every day to check what's happening around me. The trending topics feature is spot on for Sri Lankan news.", name: "Nirmala S.", role: "Teacher, Kandy", avatar: "👩‍🏫", stars: 5 },
                  { quote: "The polls feature helped our community group make decisions together. Love that Sinhala works perfectly.", name: "Ruwan A.", role: "Community Organizer, Galle", avatar: "🧑‍💼", stars: 5 },
                  { quote: "The hyperlocal feed is brilliant — I can see exactly what's happening in my area of Colombo and nothing else clutters it.", name: "Dilini K.", role: "Software Engineer, Colombo 7", avatar: "👩‍💻", stars: 5 },
                  { quote: "Dark mode + Sinhala support + anonymity. SafeVoice ticked every box I didn't know I needed.", name: "Asanka R.", role: "Journalist, Negombo", avatar: "📰", stars: 5 },
                  { quote: "The E2E encrypted DMs gave me the confidence to share information that I otherwise couldn't. This is what Sri Lanka needed.", name: "Priya M.", role: "Activist, Jaffna", avatar: "✊", stars: 5 },
                ].map((t) => (
                  <article key={t.name} className="testimonial-card">
                    <div style={{ color: "var(--amber)", fontSize: "0.9rem", marginBottom: 14, letterSpacing: 2 }}>{"★".repeat(t.stars)}</div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.93rem", marginBottom: 20 }}>"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t.name}</div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "0.78rem" }}>{t.role}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ─── FAQ ─── */}
          <section id="faq" aria-label="Frequently asked questions" style={{ padding: "100px 24px", background: "#fff" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 56 }}>
                <p className="section-eyebrow">FAQ</p>
                <h2 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Common questions</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {faqs.map((faq, i) => (
                  <div key={i} className={`faq-item${faqOpen === i ? " open" : ""}`}>
                    <button className="faq-btn" onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}>
                      <span>{faq.q}</span>
                      <span className="faq-chevron">▼</span>
                    </button>
                    <div className="faq-body">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── DOWNLOAD CTA ─── */}
          <section
            id="download"
            aria-label="Download SafeVoice"
            style={{ padding: "100px 24px", background: "var(--coral)", textAlign: "center", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: -80, left: "10%", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, right: "8%", width: 180, height: 180, borderRadius: "50%", background: "rgba(0,0,0,0.08)", pointerEvents: "none" }} />

            <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🛡️</div>
              <h2 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.15 }}>
                Join the conversation today
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 40, fontSize: "1.05rem", lineHeight: 1.65 }}>
                Download SafeVoice for free and become part of Sri Lanka's most open, honest community forum.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                {[{ icon: "🍎", top: "Download on the", bottom: "App Store" }, { icon: "▶️", top: "Get it on", bottom: "Google Play" }].map((b) => (
                  <a
                    key={b.bottom}
                    href="#"
                    aria-label={b.bottom}
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: "var(--teal-dark)", borderRadius: 12, padding: "12px 22px", textDecoration: "none", fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", transition: "transform 0.15s, box-shadow 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>{b.icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 400, opacity: 0.7 }}>{b.top}</div>
                      <div style={{ fontSize: "0.95rem" }}>{b.bottom}</div>
                    </div>
                  </a>
                ))}
              </div>

              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginTop: 20 }}>Rated 4.8★ · Free forever · No ads</p>
            </div>
          </section>
        </main>

        {/* ─── FOOTER ─── */}
        <footer
          id="contact"
          role="contentinfo"
          style={{ background: "var(--teal-dark)", padding: "60px 24px 32px", color: "rgba(255,255,255,0.65)" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: "var(--coral)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🛡️</div>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>SafeVoice</span>
                </div>
                <p style={{ fontSize: "0.87rem", lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>
                  Sri Lanka's community forum for open, safe, and meaningful conversations.
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                  {[["𝕏", "Twitter"], ["f", "Facebook"], ["in", "LinkedIn"], ["📧", "Email"]].map(([icon, label]) => (
                    <a key={label} href="#" aria-label={label}
                      style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", textDecoration: "none", transition: "background 0.2s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}
                    >{icon}</a>
                  ))}
                </div>
                {/* Creator credit */}
                <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", display: "inline-block" }}>
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Designed & developed by</p>
                  <a
                    href="https://sithumud.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--amber)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--amber)")}
                  >
                    <span>⚡</span> Sithum Udayanga
                    <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>↗</span>
                  </a>
                </div>
              </div>

              {[
                { title: "Product", links: ["Features", "Download", "Changelog", "Roadmap"] },
                { title: "Community", links: ["Guidelines", "Moderation", "Report Abuse", "Help Center"] },
                { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.87rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>{col.title}</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "0.87rem", transition: "color 0.2s" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
                        >{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="footer-links" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <p style={{ fontSize: "0.82rem" }}>© 2024 SafeVoice. Made with ❤️ for Sri Lanka.</p>
              <div style={{ display: "flex", gap: 20 }}>
                {["Privacy Policy", "Terms of Service", "Sitemap"].map((link) => (
                  <a key={link} href="#" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
                  >{link}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}