import CreateAccountDrawer from '@/components/create-account-drawer'
import {DashboardOverview} from './_component/transaction-overview'
import { Card,CardContent } from '@/components/ui/card'
import React, { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { getDashboardData, getUserAccounts } from '@/actions/dashboard'
import AccountCard from './_component/account-card'
import { getCurrentBudget } from '@/actions/budget'
import {BudgetProgress} from './_component/budget-progress'

export const dynamic = "force-dynamic";

async function DashboardPage() {

let accounts = [];
let defaultAccount = null;
let budgetData = null;
let transactions = [];

try {
  accounts = (await getUserAccounts()) || [];
  defaultAccount = Array.isArray(accounts) ? accounts.find(account => account.isDefault) : null;

  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  transactions = (await getDashboardData()) || [];
} catch (e) {
  console.error('[dashboard] data fetch error:', e && e.message ? e.message : e);
  return (
    <div className="px-5">
      <h2 className="text-xl font-semibold">Could not load dashboard data</h2>
      <p className="text-muted-foreground">Please check your database connection or try again later.</p>
    </div>
  );
}


  return (
    <div className='px-5'>
{/* Budget Progress */}
{defaultAccount && <BudgetProgress
initialBudget ={budgetData?.budget}
currentExpenses={budgetData?.currentExpenses ||0}
/>}

{/* overview */}
<Suspense fallback={"LoadingOverView..."}>
<DashboardOverview 
accounts={accounts}
transactions={transactions || []}

/>
</Suspense>

    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <CreateAccountDrawer>
        <Card className='hover:shadow-md transition-shadow cursor-pointer border-dashed'>
          <CardContent className=' flex flex-col items-center justify-center text-muted-foreground h-full pt-5'>
            <Plus className='h-10 w-10 mb-2 '/>
            <p className='text-sm font-medium'>add new account</p>
          </CardContent>
        </Card>
      </CreateAccountDrawer>

      {accounts && accounts.length > 0 &&
            accounts.map((account) =>{
              return <AccountCard key={account.id} account={account} /> ;
            })}
    </div>
         </div>
  
  )
}

export default DashboardPage