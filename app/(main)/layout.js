import React from 'react'
import { checkUser } from '@/lib/checkUser'
import CategorySidebar from '@/components/sidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = "force-dynamic";

const MainLayout = async ({ children }) => {
  await checkUser();

  return (
    <SidebarProvider defaultOpen={true}>
      <CategorySidebar />
      <SidebarInset className="flex flex-col h-full min-w-0 bg-background overflow-hidden">
        {/* Sticky Header Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-4 md:px-6 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-all shadow-xs" />
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-zinc-500">
              Workspace Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/transaction/create">
              <Button size="sm" className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">New Transaction</span>
              </Button>
            </Link>
            <ThemeToggle />
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            </SignedIn>
          </div>
        </header>

        {/* Dashboard Main Content Body - Smooth Vertical Scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
