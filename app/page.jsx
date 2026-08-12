import Header from "@/components/header";
import HeroSection from "@/components/hero";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
    return (
        <div>
            <Header />
            <div className="pt-32">
                <HeroSection />
                <section className="py-20 bg-zinc-50/80 dark:bg-zinc-900/50 border-y border-zinc-200/60 dark:border-zinc-800">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {statsData.map((statsData, index) => {
                                return (
                                    <div key={index} className="text-center">
                                        <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">{statsData.value}</div>
                                        <div className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{statsData.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-extrabold text-center mb-12 text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Everything you need to manage your finances
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuresData.map((feature, index) => (
                                <Card key={index} className='p-6 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 transition-colors shadow-xs'>
                                    <CardContent className="space-y-4 pt-4">
                                        <div className="p-3 w-fit rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-zinc-50/80 dark:bg-zinc-900/50 border-y border-zinc-200/60 dark:border-zinc-800">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-extrabold text-center mb-16 text-zinc-900 dark:text-zinc-100 tracking-tight">
                            How It Works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {howItWorksData.map((step, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-16 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-extrabold text-center mb-12 text-zinc-900 dark:text-zinc-100 tracking-tight">
                            What Our Users Say
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {testimonialsData.map((testimonial, index) => (
                                <Card key={index} className='p-6 border-zinc-200/80 dark:border-zinc-800 shadow-xs'>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center mb-4">
                                            <Image
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                width={50} height={50}
                                                className="rounded-full border border-zinc-200 dark:border-zinc-700" />
                                            <div className="ml-4">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{testimonial.name}</div>
                                                <div className="text-sm text-zinc-500 dark:text-zinc-400">{testimonial.role}</div>
                                            </div>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-zinc-950 text-white border-t border-zinc-800">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">
                            Ready to take control of your finances?
                        </h2>
                        <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
                            Join thousands of satisfied users who are already managing their finances smarter with Trakex.
                        </p>
                        <Link href="/dashboard">
                            <Button size="lg"
                                className="mt-8 px-8 bg-zinc-100 text-zinc-900 hover:bg-white border border-zinc-200 shadow-lg font-semibold transition-all">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </section>

                <footer className="bg-zinc-950 border-t border-zinc-800 py-12 text-zinc-400">
                    <div className="container mx-auto text-center px-4">
                        <p className="text-sm tracking-wide">Made with ❤️ by Durga</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
