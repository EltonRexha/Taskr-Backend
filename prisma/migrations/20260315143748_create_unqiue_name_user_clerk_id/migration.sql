/*
  Warnings:

  - A unique constraint covering the columns `[name,user_clerk_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "projects_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_user_clerk_id_key" ON "projects"("name", "user_clerk_id");
