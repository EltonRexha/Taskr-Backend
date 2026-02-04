/*
  Warnings:

  - A unique constraint covering the columns `[user_clerk_id,project_id]` on the table `project_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "project_members_user_clerk_id_project_id_key" ON "project_members"("user_clerk_id", "project_id");
