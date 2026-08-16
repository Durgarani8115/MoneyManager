import Header from "@/components/header";
import HeroSection from "@/components/hero";
import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import { Card, CardContent } from "@/components/ui/card";

// Production React Bits Landing Components
import BentoFeatures from "@/components/landing/bento-features";
import BenefitsComparison from "@/components/landing/benefits-comparison";
import SavingsCalculator from "@/components/landing/savings-calculator";
import InteractiveDemoTabs from "@/components/landing/interactive-demo-tabs";
import FaqSection from "@/components/landing/faq-section";
import SpotlightCard from "@/components/ui/react-bits/spotlight-card";
import AnimatedCounter from "@/components/ui/react-bits/animated-counter";
import ShinyButton from "@/components/ui/react-bits/shiny-button";
import AnimatedGradientText from "@/components/ui/react-bits/animated-gradient-text";

export default async function Home() {
    const session = await auth();
    const user = session?.user;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500 selection:text-white">
            <Header />
            <div className="pt-24 md:pt-28">
                
                {/* 1. React Bits Enhanced Hero Section */}
                <HeroSection user={user} />

                {/* 2. Key Statistics Bar with Animated React Bits Counters */}
                <section className="py-16 bg-zinc-50/80 dark:bg-zinc-900/50 border-y border-zinc-200/80 dark:border-zinc-800">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center space-y-1">
                                <div className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                                    <AnimatedCounter value="50" suffix="K+" />
                                </div>
                                <div className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-semibold">Active Users</div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-3xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    <AnimatedCounter value="2" prefix="$" suffix="B+" />
                                </div>
                                <div className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-semibold">Transactions Tracked</div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                                    <AnimatedCounter value="99.9" suffix="%" />
                                </div>
                                <div className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-semibold">Uptime Guarantee</div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-3xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    <AnimatedCounter value="4.9" suffix="/5" />
                                </div>
                                <div className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-semibold">User Rating</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. React Bits Asymmetric Bento Features Grid */}
                <BentoFeatures />

                {/* 4. Interactive Try-Before-Sign-Up Demo Sandbox */}
                <InteractiveDemoTabs />

                {/* 5. Benefits Comparison (Traditional vs MoneyManager AI) */}
                <BenefitsComparison />

                {/* 6. Interactive ROI Savings Calculator */}
                <SavingsCalculator />

                {/* 7. How It Works Step-by-Step */}
                <section className="py-20 bg-zinc-50/80 dark:bg-zinc-900/50 border-y border-zinc-200/80 dark:border-zinc-800">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-extrabold text-center mb-16 text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Simple 3-Step Onboarding
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {howItWorksData.map((step, index) => (
                                <SpotlightCard key={index} className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg font-bold">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                                </SpotlightCard>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. User Testimonials Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-extrabold text-center mb-12 text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Loved by Finance Conscious Users
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonialsData.map((testimonial, index) => (
                                <SpotlightCard key={index} className="p-6">
                                    <CardContent className="p-0 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                width={48}
                                                height={48}
                                                className="rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                                            />
                                            <div>
                                                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{testimonial.name}</div>
                                                <div className="text-xs text-zinc-500">{testimonial.role}</div>
                                            </div>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                    </CardContent>
                                </SpotlightCard>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 9. FAQ Section */}
                <FaqSection />

                {/* 10. Final Call To Action Banner */}
                <section className="py-24 bg-zinc-950 text-white border-t border-zinc-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))]" />
                    <div className="container mx-auto px-4 text-center relative z-10 space-y-6 max-w-3xl">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                            Ready to Take Control of Your <AnimatedGradientText gradient="from-white via-emerald-400 to-zinc-300">Finances</AnimatedGradientText>?
                        </h2>
                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                            Join thousands of smart users managing accounts, scanning receipts, and saving money effortlessly with MoneyManager.
                        </p>
                        <div className="pt-4 flex justify-center">
                            <Link href="/sign-up">
                                <ShinyButton variant="primary" className="py-4 px-10 text-base">
                                    Start Free Trial Now
                                </ShinyButton>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-zinc-950 border-t border-zinc-800 py-12 text-zinc-400">
                    <div className="container mx-auto text-center px-4 space-y-2">
                        <div className="text-lg font-extrabold text-white">Trakex MoneyManager</div>
                        <p className="text-xs tracking-wide text-zinc-500">Made with ❤️ by Durga • Intelligent Financial Freedom</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
