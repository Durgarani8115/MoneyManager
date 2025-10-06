"use client";
import { useRef ,useEffect} from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

const HeroSection = () => {

    const imageref = useRef();
    useEffect(() =>{
        const imageElement = imageref.current;
        const handleScroll = ()=>{
            const scrollPostion = window.scrollY;
            const scrollThreshold = 100;
            if(scrollPostion > scrollThreshold){
                imageElement.classList.add("scrolled");
            }else{
                imageElement.classList.remove("scrolled");
            }
        };
        window.addEventListener("scroll",handleScroll);

        return() =>  window.removeEventListener("scroll",handleScroll);
    },[])
    return (
        <div className="pb-20 px-4">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-7xl lg:text-[105px] pb-6 gradient-title font-bold mb-4">
                    Manage your Finances <br /> with Fintech
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, unde
                    delectus quam deleniti Lorem ipsum dolor sit amet.lorem10lorem10 lorem8
                </p>

                <div className="flex justify-center space-x-4 ">
                    <Link href="/dashboard">
                        <Button size="lg" className="px-8">
                            Get started
                        </Button>
                    </Link>

                    <Link href="google.com">
                        <Button size="lg" variant="outline" className="px-8">
                            Learn more
                        </Button>
                    </Link>
                </div>
                <div className="hero-image-wrapper mt-16">
                    <div ref={imageref} className="hero-image">
                        <Image src='/banner.jpeg'
                            width={1280}
                            height={720}
                            alt="Dashboard Preview"
                            className="rounded-lg shadow-2xl border mx-auto"
                            priority />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
