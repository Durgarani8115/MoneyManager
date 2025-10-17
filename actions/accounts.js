"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import { Select } from "react-day-picker";
// import { include } from "zod";


const serializeTransaction = (obj) => { 
  const serialized = {...obj};
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance =parseFloat(obj.balance);
  }

   if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = parseFloat(obj.amount);
  }
  return serialized;
};

export async function updateDefaultAccount(accountId) {
  
    try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Unset any existing default accounts for this user
    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Ensure the account exists and belongs to the user
    const existing = await db.account.findUnique({ where: { id: accountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    const account = await db.account.update({
      where: { id: accountId },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransaction(accountId){
  const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where:{id:accountId, userId: user.id },
      include :{
      transactions :{
        orderBy :{ date :"desc"},
      },
      _count :{
        select :{transactions : true},
      },
      },
    });

    if (!account) return null;

    return {
      ...serializeTransaction(account),
      transactions : account.transactions.map(serializeTransaction),
    }
}

export async function bulkDeleteTransactions(transactionIds){
  try{
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

const transactions = await db.transaction.findMany({
  where :{ 
    id :{ in : transactionIds}, 
  userId : user.id},
});
const accountBalanceChanges = transactions.reduce((acc,transaction) => {
  const change = transaction.type === 'EXPENSE'
  ? transaction.amount: -transaction.amount;
  acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
 return acc;
},{})

// delete transactionsand update account balances in a transaction

await db.$transaction(async (tx) =>{
  //delete transactions
  await tx.transaction.deleteMany({
    where :
    { id : { in : transactionIds},
     userId : user.id},
  });
  for(const [accountId, balanaceChange] of Object.entries(accountBalanceChanges)){
    await tx.account.update({
      where :{ id : accountId, userId : user.id},
      data :{ 
        balance : {
           increment : balanaceChange}},
    });
  }
});
revalidatePath("/dashboard");
revalidatePath("/account/[id]");
return { success : true};

  } catch(error){
return { success : false, error : error.message};
  }
}