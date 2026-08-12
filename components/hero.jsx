"use client";
import { useRef, useEffect } from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

const HeroSection = () => {
    const imageref = useRef();
    useEffect(() => {
        const imageElement = imageref.current;
        const handleScroll = () => {
            const scrollPostion = window.scrollY;
            const scrollThreshold = 100;
            if (scrollPostion > scrollThreshold) {
                imageElement.classList.add("scrolled");
            } else {
                imageElement.classList.remove("scrolled");
            }
        };
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="pb-20 px-4">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-7xl lg:text-[90px] pb-6 gradient-title font-extrabold mb-4 tracking-tight">
                    Take Control of Your Money <br /> with Money Manager
                </h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    A smart personal finance dashboard to track accounts, record income
                    and expenses, manage monthly budgets, and stay on top of recurring
                    transactions with AI-assisted receipt scanning.
                </p>

                <div className="flex justify-center space-x-4">
                    <Link href="/dashboard">
                        <Button size="lg" className="px-8 bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800 shadow-md transition-colors">
                            Get started
                        </Button>
                    </Link>

                    <Link href="#features">
                        <Button size="lg" variant="outline" className="px-8 border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200">
                            Learn more
                        </Button>
                    </Link>
                </div>
                <div className="hero-image-wrapper mt-16">
                    <div ref={imageref} className="hero-image">
                        <Image
                            src='/banner.jpeg'
                            width={1280}
                            height={720}
                            alt="Dashboard Preview"
                            className="rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 mx-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
