import React, { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import CategorySidebar from '@/components/sidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { HeaderSearch } from '@/components/header-search'
import { HeaderTitle } from '@/components/header-title'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUserAccounts } from '@/actions/dashboard'
import { AccountSwitcher } from '@/components/account-switcher'
import { AiChatButton } from '@/components/ai-chat-button'

export const dynamic = "force-dynamic";

async function SwitcherContainer() {
  const accounts = await getUserAccounts();
  return <AccountSwitcher accounts={accounts} />;
}

const MainLayout = async ({ children }) => {
  const session = await auth();
  const user = session?.user;

  return (
    <SidebarProvider defaultOpen={true}>
      <CategorySidebar user={user} />
      <SidebarInset className="flex flex-col h-full min-w-0 bg-background overflow-hidden">
        {/* Dynamic Header Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-4 md:px-6 backdrop-blur-md shrink-0 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <SidebarTrigger className="h-8 w-8 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-all shadow-xs" />
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            {/* Dynamic Section & Title Breadcrumb */}
            <HeaderTitle />
          </div>

          {/* Global Header Search Bar */}
          <HeaderSearch />

          <div className="flex items-center gap-3 shrink-0">
            <Suspense fallback={<div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-md border border-zinc-200 dark:border-zinc-800"></div>}>
              <SwitcherContainer />
            </Suspense>

            <Link href="/transaction/create">
              <Button size="sm" className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">New Transaction</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Main Content Body - Smooth Vertical Scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
      <AiChatButton />
    </SidebarProvider>
  )
}

export default MainLayout
