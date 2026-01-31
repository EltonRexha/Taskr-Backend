/*
  Warnings:

  - You are about to drop the column `scrum_Project_id` on the `DraftSprint` table. All the data in the column will be lost.
  - You are about to drop the column `usersClerkId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `Project_id` on the `project_members` table. All the data in the column will be lost.
  - You are about to drop the column `Project_type` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `scrum_Project_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `scrum_Project_id` on the `sprints` table. All the data in the column will be lost.
  - Added the required column `scrum_project_id` to the `DraftSprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userClerkId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `project_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_type` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scrum_project_id` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scrum_project_id` to the `sprints` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DraftSprint" DROP CONSTRAINT "DraftSprint_scrum_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_usersClerkId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_scrum_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "sprints" DROP CONSTRAINT "sprints_scrum_Project_id_fkey";

-- AlterTable
ALTER TABLE "DraftSprint" DROP COLUMN "scrum_Project_id",
ADD COLUMN     "scrum_project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "usersClerkId",
ADD COLUMN     "userClerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_members" DROP COLUMN "Project_id",
ADD COLUMN     "project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "Project_type",
DROP COLUMN "scrum_Project_id",
ADD COLUMN     "project_type" "ProjectType" NOT NULL,
ADD COLUMN     "scrum_project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sprints" DROP COLUMN "scrum_Project_id",
ADD COLUMN     "scrum_project_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userClerkId_fkey" FOREIGN KEY ("userClerkId") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_scrum_project_id_fkey" FOREIGN KEY ("scrum_project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftSprint" ADD CONSTRAINT "DraftSprint_scrum_project_id_fkey" FOREIGN KEY ("scrum_project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_scrum_project_id_fkey" FOREIGN KEY ("scrum_project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
