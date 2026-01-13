/*
  Warnings:

  - You are about to drop the column `scrum_space_id` on the `DraftSprint` table. All the data in the column will be lost.
  - You are about to drop the column `scrum_space_id` on the `sprints` table. All the data in the column will be lost.
  - You are about to drop the `_EpicToSpaceMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SpaceMemberToTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scrum_spaces` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `space` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `space_members` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scrum_Project_id` to the `DraftSprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scrum_Project_id` to the `sprints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag_id` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('SCRUM', 'KANBAN');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('ADMIN', 'USER');

-- AlterEnum
ALTER TYPE "ScrumTaskStatus" ADD VALUE 'IN_REVIEW';

-- DropForeignKey
ALTER TABLE "DraftSprint" DROP CONSTRAINT "DraftSprint_scrum_space_id_fkey";

-- DropForeignKey
ALTER TABLE "_EpicToSpaceMember" DROP CONSTRAINT "_EpicToSpaceMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_EpicToSpaceMember" DROP CONSTRAINT "_EpicToSpaceMember_B_fkey";

-- DropForeignKey
ALTER TABLE "_SpaceMemberToTask" DROP CONSTRAINT "_SpaceMemberToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "_SpaceMemberToTask" DROP CONSTRAINT "_SpaceMemberToTask_B_fkey";

-- DropForeignKey
ALTER TABLE "scrum_spaces" DROP CONSTRAINT "scrum_spaces_backlog_id_fkey";

-- DropForeignKey
ALTER TABLE "space" DROP CONSTRAINT "space_scrum_space_id_fkey";

-- DropForeignKey
ALTER TABLE "space" DROP CONSTRAINT "space_user_clerk_id_fkey";

-- DropForeignKey
ALTER TABLE "space_members" DROP CONSTRAINT "space_members_space_id_fkey";

-- DropForeignKey
ALTER TABLE "space_members" DROP CONSTRAINT "space_members_user_clerk_id_fkey";

-- DropForeignKey
ALTER TABLE "sprints" DROP CONSTRAINT "sprints_scrum_space_id_fkey";

-- AlterTable
ALTER TABLE "DraftSprint" DROP COLUMN "scrum_space_id",
ADD COLUMN     "scrum_Project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sprints" DROP COLUMN "scrum_space_id",
ADD COLUMN     "scrum_Project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "tag_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "_EpicToSpaceMember";

-- DropTable
DROP TABLE "_SpaceMemberToTask";

-- DropTable
DROP TABLE "scrum_spaces";

-- DropTable
DROP TABLE "space";

-- DropTable
DROP TABLE "space_members";

-- DropEnum
DROP TYPE "SpaceMemberRole";

-- DropEnum
DROP TYPE "SpaceType";

-- CreateTable
CREATE TABLE "scrum_Projects" (
    "id" TEXT NOT NULL,
    "backlog_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrum_Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "scrum_Project_id" TEXT NOT NULL,
    "Project_type" "ProjectType" NOT NULL,
    "user_clerk_id" TEXT,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project_members" (
    "id" TEXT NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL,
    "Project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EpicToProjectMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EpicToProjectMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectMemberToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectMemberToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EpicToProjectMember_B_index" ON "_EpicToProjectMember"("B");

-- CreateIndex
CREATE INDEX "_ProjectMemberToTask_B_index" ON "_ProjectMemberToTask"("B");

-- AddForeignKey
ALTER TABLE "scrum_Projects" ADD CONSTRAINT "scrum_Projects_backlog_id_fkey" FOREIGN KEY ("backlog_id") REFERENCES "backlogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftSprint" ADD CONSTRAINT "DraftSprint_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_members" ADD CONSTRAINT "Project_members_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_members" ADD CONSTRAINT "Project_members_Project_id_fkey" FOREIGN KEY ("Project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpicToProjectMember" ADD CONSTRAINT "_EpicToProjectMember_A_fkey" FOREIGN KEY ("A") REFERENCES "epics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpicToProjectMember" ADD CONSTRAINT "_EpicToProjectMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMemberToTask" ADD CONSTRAINT "_ProjectMemberToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMemberToTask" ADD CONSTRAINT "_ProjectMemberToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
