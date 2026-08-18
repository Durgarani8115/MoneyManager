import React from 'react'
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PenBoxIcon, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { auth, signOut } from '@/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = async () => {
  const session = await auth();
  const user = session?.user;

  return (
    <div className='fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-200/80 dark:border-zinc-800/80'>
      <nav className='container mx-auto flex py-3.5 px-4 justify-between items-center'>
        {/* Stylish Trakex Money Manager Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md tracking-tighter group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">
              Trak<span className="text-emerald-500">ex</span>
            </span>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
              Money Manager
            </span>
          </div>
        </Link>

        <div className='flex items-center space-x-3 md:space-x-4'>
          {/* Day / Night Theme Toggle */}
          <ThemeToggle />

          {user && (
            <>
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">{user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                    <form action={async () => {
                      "use server"
                      await signOut()
                    }} className="w-full">
                      <button type="submit" className="flex w-full items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!user && (
            <Link href="/sign-in">
              <Button variant="outline" className='border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 hover:bg-zinc-100'>Login</Button>
            </Link>
          )}

        </div>
      </nav>
    </div>
  )
}

export default Header
