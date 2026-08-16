-- Rename the "accounts" table to "bank_accounts"
ALTER TABLE "accounts" RENAME TO "bank_accounts";

-- Rename the primary key constraint
ALTER TABLE "bank_accounts" RENAME CONSTRAINT "accounts_pkey" TO "bank_accounts_pkey";

-- Rename foreign key on bank_accounts referencing users
ALTER TABLE "bank_accounts" RENAME CONSTRAINT "accounts_userId_fkey" TO "bank_accounts_userId_fkey";

-- Rename index on bank_accounts
ALTER INDEX "accounts_userId_idx" RENAME TO "bank_accounts_userId_idx";

-- Rename the foreign key constraint on transactions referencing accounts
ALTER TABLE "transactions" RENAME CONSTRAINT "transactions_accountId_fkey" TO "transactions_bankAccountId_fkey";

-- Rename the column in transactions
ALTER TABLE "transactions" RENAME COLUMN "accountId" TO "bankAccountId";

-- Rename the index on transactions
ALTER INDEX "transactions_accountId_idx" RENAME TO "transactions_bankAccountId_idx";
