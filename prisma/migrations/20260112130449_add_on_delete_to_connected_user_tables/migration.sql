-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_usersClerkId_fkey";

-- DropForeignKey
ALTER TABLE "space" DROP CONSTRAINT "space_user_clerk_id_fkey";

-- DropForeignKey
ALTER TABLE "space_members" DROP CONSTRAINT "space_members_user_clerk_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_user_clerk_id_fkey";

-- AlterTable
ALTER TABLE "space" ALTER COLUMN "user_clerk_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "user_clerk_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_usersClerkId_fkey" FOREIGN KEY ("usersClerkId") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space" ADD CONSTRAINT "space_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;
