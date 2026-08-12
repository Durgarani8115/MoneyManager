import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PenBoxIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const Header = () => {
  return (
    <div className='fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-200/80 dark:border-zinc-800/80'>
      <nav className='container mx-auto flex py-3.5 px-4 justify-between items-center'>
        {/* Stylish Trakex Text Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-xl shadow-md tracking-tighter group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Trak<span className="text-zinc-400 dark:text-zinc-500">ex</span>
          </span>
        </Link>

        <div className='flex items-center space-x-3 md:space-x-4'>
          {/* Day / Night Theme Toggle */}
          <ThemeToggle />

          <SignedIn>
            <Link href={"/dashboard"} className='text-zinc-600 hover:text-zinc-900 flex items-center gap-2'>
              <Button variant='outline' className='border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'>
                <LayoutDashboard size={18}/>
                <span className='hidden md:inline'> Dashboard</span>
              </Button>
            </Link>
            <Link href={"/transaction/create"} className='text-zinc-600 hover:text-zinc-900 flex items-center gap-2'>
              <Button className='bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white border border-zinc-800 shadow-sm'>
                <PenBoxIcon size={18}/>
                <span className='hidden md:inline'> Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          
          <SignedOut>
            <SignInButton forceRedirectUrl='/dashboard'>
              <Button variant="outline" className='border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 hover:bg-zinc-100'>Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{
              elements : {
                avatarBox : "w-10 h-10",
              },
            }} />
          </SignedIn>
        </div>
      </nav>
    </div>
  )
}

export default Header
