"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import ShinyButton from "./ui/react-bits/shiny-button";
import TiltedCard from "./ui/react-bits/tilted-card";
import AnimatedGradientText from "./ui/react-bits/animated-gradient-text";
import BackgroundBeams from "./ui/react-bits/background-beams";
import {
  Sparkles,
  ArrowRight,
  Receipt,
  CheckCircle2,
  PieChart,
  Wallet,
  Play,
} from "lucide-react";

const HeroSection = ({ user }) => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative pt-12 pb-20 px-4 overflow-hidden">
      {/* React Bits Ambient Beams */}
      <BackgroundBeams />

      <div className="container mx-auto text-center relative z-10">
        

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-6 shadow-xs animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Powered Financial Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-7xl lg:text-[84px] pb-4 font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
          Master Your Money <br className="hidden sm:inline" />
          with <AnimatedGradientText>Intelligent Control</AnimatedGradientText>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
          A smart personal finance dashboard to track accounts, record income & expenses, manage monthly budgets, and stay on top of recurring transactions with AI receipt scanning.
        </p>

        {/* Hero Action CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <ShinyButton variant="primary" className="w-full sm:w-auto text-base py-3.5 px-8">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </ShinyButton>
            </Link>
          ) : (
            <Link href="/sign-up">
              <ShinyButton variant="primary" className="w-full sm:w-auto text-base py-3.5 px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </ShinyButton>
            </Link>
          )}

          <Link href="#features">
            <ShinyButton variant="secondary" className="w-full sm:w-auto text-base py-3.5 px-8">
              Explore Features
            </ShinyButton>
          </Link>
        </div>

        {/* 3D Tilted Hero Interactive Showcase */}
        <div className="hero-image-wrapper mt-16 max-w-5xl mx-auto">
          <TiltedCard maxTilt={8} scaleOnHover={1.01}>
            <div ref={imageRef} className="hero-image relative group rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-950">
              
              {/* Dashboard Preview Banner Image */}
              <Image
                src="/banner-inr.jpeg"
                width={1280}
                height={720}
                alt="MoneyManager Dashboard Preview"
                className="w-full h-auto object-cover rounded-2xl border border-zinc-800"
                priority
              />

              {/* Floating Pill 1: Top Right AI Receipt Badge */}
              <div className="absolute top-6 right-6 hidden md:flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/90 text-white border border-emerald-500/40 backdrop-blur-xl shadow-xl animate-bounce duration-[3000ms]">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold flex items-center gap-1 text-white">
                    Starbucks Coffee
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                    ₹4.75 • AI Scanned & Categorized
                  </div>
                </div>
              </div>

              {/* Floating Pill 2: Bottom Left Budget Alert Badge */}
              <div className="absolute bottom-6 left-6 hidden md:flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/90 text-white border border-zinc-800 backdrop-blur-xl shadow-xl">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <PieChart className="h-4 w-4" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white">Monthly Budget Safe</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    68% Used • ₹34,000 Remaining
                  </div>
                </div>
              </div>

              {/* Floating Pill 3: Bottom Right Account Balance Badge */}
              <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/90 text-white border border-zinc-800 backdrop-blur-xl shadow-xl">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white">Total Net Worth</div>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold">
                    ₹2,45,000 (+12.4%)
                  </div>
                </div>
              </div>

            </div>
          </TiltedCard>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
