/*
  Warnings:

  - The values [bug,feature,task,refactor,chore,spike,techDebt] on the enum `TaskLabel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskLabel_new" AS ENUM ('BUG', 'FEATURE', 'TASK', 'REFACTOR', 'CHORE', 'SPIKE', 'TECH_DEBT');
ALTER TABLE "tasks" ALTER COLUMN "label" TYPE "TaskLabel_new" USING ("label"::text::"TaskLabel_new");
ALTER TYPE "TaskLabel" RENAME TO "TaskLabel_old";
ALTER TYPE "TaskLabel_new" RENAME TO "TaskLabel";
DROP TYPE "public"."TaskLabel_old";
COMMIT;
